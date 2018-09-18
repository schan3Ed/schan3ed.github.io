import { Business, User } from '../core/model';
import AuthManager from '../core/AuthManager';
import DatabaseClient from '../core/DatabaseClient';
import { auth, db } from '../core/firebase/firebase';


const password = 'freshspire'
const newUsers = [
    {  
        id: 'buyer1',
        firstName: 'Buyer1First',
        lastName: 'Buyer1Last',
        email: 'buyer1@freshspire.io',
        type: 'buyer',
    },
    {   
        id: 'seller1',
        firstName: 'Seller1First',
        lastName: 'Seller1Last',
        email: 'seller1@freshspire.io',
        type: 'seller',
    },
    {   
        id: 'seller2',
        firstName: 'Seller2First',
        lastName: 'Seller2Last',
        email: 'seller2@freshspire.io',
        type: 'seller',
    }
];

const businesses = {
    buyer1: new Business('Chapel Hill', '18:00', ['Call'], 
    "The best Pizza you'll ever taste!", 
    'buyer1@freshspire.io', ['Fruit', 'Meat', 'Vegetables'], 
    "Pete's Pizza", '08:00', ['Check'], undefined, '9199999999', 
    'NC', '415 E. Franklin St.', undefined, '27705'),
    seller1: new Business('Raleigh', '17:00', ['Text'], 
    "We're unique!", 
    'seller1@freshspire.io', ['Fruit', 'Vegetables'], 
    "Unique Food Company", '07:00', ['Check'], undefined, '9198888888', 
    'NC', '808 W. Morgan St.', undefined, '27606'),
    seller2: new Business('Raleigh', '19:00', ['Text'], 
    "We're cool!", 
    'seller2@freshspire.io', ['Vegetables'], 
    "Cool Food Company", '09:00', ['Money Order'], undefined, '9197777777', 
    'NC', '807 W. Morgan St.', undefined, '27606')

}

class TestUtils {
    businesses = {};

    
    async resetUsers() {
        // Sign up the new users
        this.users = {}
        await Promise.all(newUsers.map( async (newUser) => {
            var user;
            try {
                user = await AuthManager.signUp(newUser.firstName, newUser.lastName, newUser.email, password, newUser.type);
            }
            catch (e) {
                let userCredential = await AuthManager.login(newUser.email, password);
                user = new User(newUser.email, true, newUser.firstName, newUser.lastName, newUser.type, userCredential.uid);
                await DatabaseClient.createUser(user);
            }
            this.users[newUser.id] = user;
        }))
    }

    async createBusinesses() {
        await Promise.all(newUsers.map( async (newUser) => {
            // Get the corresponding uid
            let id = newUser.id;
            if (newUser.type === 'buyer') {
                return DatabaseClient.createBuyer(this.users[id].uid, businesses[id], undefined); // TODO: make a picture
            }
            else {
                return DatabaseClient.createSeller(this.users[id].uid, businesses[id], undefined); // TODO: make a picture
            }
        }))
    }

    async createClientRelationships() {
        // Delete everything in relationships
        let query = db.collection('client_relationships').limit(1000);
        let result = await query.get();
        await Promise.all(result.docs.map( (snapshot) => {
            return snapshot.ref.delete();
        }))

        // Create new relationships
        await DatabaseClient.createClientRelationship(this.users['buyer1'].uid, this.users['seller1'].uid);
        await DatabaseClient.createClientRelationship(this.users['buyer1'].uid, this.users['seller2'].uid);
    }

    async deleteDeals() {
        // Delete everything in deals
        let query = db.collection('deals').limit(1000);
        let result = await query.get();
        let dealPromise = Promise.all(result.docs.map( async (snapshot) => {
            let versionQuery = snapshot.ref.collection('versions').limit(1000);
            let versionResult = await versionQuery.get();
            await Promise.all(versionResult.docs.map((versionSnapshot) => {
                return versionSnapshot.ref.delete();
            }));
            return snapshot.ref.delete();
        }))

        let queryPics = db.collection('deal_pictures').limit(1000);
        let resultPics = await queryPics.get();
        let picPromise = Promise.all(resultPics.docs.map( (snapshot) => {
            return snapshot.ref.delete();
        }))
        await Promise.all([dealPromise, picPromise]);
    }

    async deleteOrders() {
        // Delete everything in orders
        let query = db.collection('orders').limit(1000);
        let result = await query.get();
        let orderPromise = Promise.all(result.docs.map( (snapshot) => {
            return snapshot.ref.delete();
        }))

        // Delete everything in orderBundles
        let bundleQuery = db.collection('order_bundles').limit(1000);
        let bundleResult = await bundleQuery.get();
        let bundlePromise = Promise.all(bundleResult.docs.map( (snapshot) => {
            return snapshot.ref.delete();
        }))
        await Promise.all([orderPromise, bundlePromise]);
    }

    async deleteSessions() {
        let query = db.collection('sessions').limit(1000);
        let result = await query.get();
        await Promise.all(result.docs.map( async (snapshot) => {
            let versionQuery = snapshot.ref.collection('notifications').limit(1000);
            let versionResult = await versionQuery.get();
            await Promise.all(versionResult.docs.map((versionSnapshot) => {
                return versionSnapshot.ref.delete();
            }));
            return snapshot.ref.delete();
        }))
    }

    async resetAll() {
        await this.resetUsers();
        await this.createBusinesses();
        await this.createClientRelationships();
        await Promise.all([this.deleteDeals(), this.deleteOrders()]);
    }
}

export default new TestUtils();