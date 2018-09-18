import DatabaseClient from '../DatabaseClient'
import { Business, InventoryItem, User, Order, OrderBundle } from '../model';
import { db, auth } from '../firebase/firebase'

jest.mock('../firebase/firebase', () => {
    //Initialize everything in here
    const firebasemock = require('firebase-mock');
    const mockdatabase = new firebasemock.MockFirebase();
    const mockauth = new firebasemock.MockFirebase();
    const mocksdk = new firebasemock.MockFirebaseSdk(path => {
        return path ? mockdatabase.child(path) : mockdatabase;
    }, () => {
        return mockauth;
    });
  
    //Initialize app
    // can take a path arg to database url
    const firebaseApp = mocksdk.initializeApp(); 
  
    // return the mock to match your export signature
    return {
      fb: mocksdk,
      db: firebaseApp.firestore(), // mockdatabase
      auth: firebaseApp.auth(), // mockauth
    };
});

const uid_buyer1 = '7K8lnsJNdUa8xEvK9EUroTGUcAI2';
const uid_seller1 = '7K8lnsJNdUa8xEvK9EUroTGUcAI3';

const user_buyer1 = new User('buyer1@freshspire.io', true, 'First', 'Last', 'buyer', uid_buyer1);
const user_seller1 = new User('seller1@freshspire.io', true, 'First', 'Last', 'seller', uid_seller1);

const business_buyer1 = new Business('Chapel Hill', '18:00', ['Call'], 
                        "The best Pizza you'll ever taste!", 
                        'buyer1@freshspire.io', ['Fruit', 'Meat', 'Vegetables'], 
                        "Pete's Pizza", '08:00', ['Check'], undefined, '9199999999', 
                        'NC', '415 E. Franklin St.', uid_buyer1, '27705');
const business_seller1 = new Business('Raleigh', '17:00', ['Text'], 
                        "We're unique!", 
                        'seller1@freshspire.io', ['Fruit', 'Vegetables'], 
                        "Unique Food Company", '07:00', ['Check'], undefined, '9198888888', 
                        'NC', '808 W. Morgan St.', uid_seller1, '27606');

const deal1 = new InventoryItem(false, 'Fruits', undefined, true, true,
                'Bononos', 'Brown :(', true, undefined,
                4.99, 'case', true, 13, 'case', ['Imperfections'],
                business_seller1, uid_seller1, '2018-10-31', undefined);
const deal2 = new InventoryItem(false, 'Vegetables', undefined, true, true,
                'Broccoli', 'Brown :(', true, undefined,
                8.99, 'case', true, 13, 'case', ['Imperfections'],
                business_seller1, uid_seller1, '2018-10-31', undefined);

const order1 = new Order(undefined, business_buyer1, uid_buyer1, deal1, undefined,
                0, 'delivery', false, undefined, '2018-10-10', false,
                2, business_seller1, uid_seller1, 'created', 1024, deal1.price*2);
const order2 = new Order(undefined, business_buyer1, uid_buyer1, deal2, undefined,
                0, 'delivery', false, undefined, '2018-10-10', false,
                3, business_seller1, uid_seller1, 'created', 1023, deal2.price*3);

// TODO: failure paths and empty results
describe('Database client', () => {
    it('creates and gets a user', async () => {
        db.autoFlush(true);
        
        let user = new User('buyer@freshspire.io', false, 'First', 'Last', 'buyer', uid_buyer1);
        await DatabaseClient.createUser(user);
        let user_actual = await DatabaseClient.getUser(uid_buyer1);
        expect(user).toEqual(user_actual);

        await DatabaseClient.createUser(user_seller1);
        user_actual = await DatabaseClient.getUser(uid_seller1);
        expect(user_seller1).toEqual(user_actual);
    });
    
    it('updates a user', async () => {
        db.autoFlush(true);
        
        let user = user_buyer1;
        await DatabaseClient.updateUser(user);
        const user_actual = await DatabaseClient.getUser(uid_buyer1);
        expect(user).toEqual(user_actual);
    });

    it('creates and gets a business', async () => {
        db.autoFlush(true);
         
        await DatabaseClient.createBuyer(uid_buyer1, business_buyer1, undefined);
        let business_actual = await DatabaseClient.getBusiness(uid_buyer1);
        expect(business_buyer1).toEqual(business_actual);

        await DatabaseClient.createSeller(uid_seller1, business_seller1, undefined);
        business_actual = await DatabaseClient.getBusiness(uid_seller1);
        expect(business_seller1).toEqual(business_actual);
    });

    it('creates, edits, gets, and archives a deal', async () => {
        db.autoFlush(true);

        let deal = deal1;
        
        let seller = await DatabaseClient.getSeller(uid_seller1);
        let dealID = await DatabaseClient.createDeal(deal, undefined);
        deal.id = dealID;
        let deal_actual = await DatabaseClient.getDeal(dealID);
        expect(deal).toEqual(deal_actual);

        // Edit the deal
        deal.name = 'Bananas';
        deal.version = 1;
        await DatabaseClient.editDeal(dealID, deal, undefined);
        deal_actual = await DatabaseClient.getDeal(dealID);
        expect(deal_actual).toEqual(deal);

        // Archive the deal
        await DatabaseClient.archiveDeal(dealID);
        deal_actual = await DatabaseClient.getDeal(dealID);
        expect(deal_actual).toEqual(null);

        // Re-create the deal for later use
        dealID = await DatabaseClient.createDeal(deal);
        deal.version = 0;
        deal.id = dealID;
        deal_actual = await DatabaseClient.getDeal(dealID);
        expect(deal_actual).toEqual(deal);

        dealID = await DatabaseClient.createDeal(deal2);
        deal2.version = 0;
        deal2.id = dealID;
        deal_actual = await DatabaseClient.getDeal(dealID);
        expect(deal_actual).toEqual(deal2);
    });

    it('creates a client relationship', async () => {
        await DatabaseClient.createClientRelationship(uid_buyer1, uid_seller1);
        const sellerUIDs_expected = [uid_seller1];
        const sellerUIDs_actual = await DatabaseClient.getSellerUIDsForBuyer(uid_buyer1);
        expect(sellerUIDs_actual).toEqual(sellerUIDs_expected);
    });

    it('retrieves deals for a seller', async () => {
        let deals_expected = [deal1, deal2];
        let deals_actual = await DatabaseClient.getDealsBySeller(uid_seller1);
        expect(deals_actual.sort()).toEqual(deals_expected.sort());
    });

    it('retrieves deals for a buyer', async () => {
        let deals_expected = [deal1, deal2];
        let deals_actual = await DatabaseClient.getDealsForBuyer(uid_buyer1);
        expect(deals_actual.sort()).toEqual(deals_expected.sort());
    });

    it('creates and gets order bundle', async () => {
        order1.dealID = deal1.id;
        order2.dealID = deal2.id;
        let orders = [order1, order2];
        
        let bundles_expected = [new OrderBundle(business_buyer1, uid_buyer1, undefined, orders, business_seller1, uid_seller1, order1.timestamp, order1.totalCost + order2.totalCost)];
        await DatabaseClient.createOrderBundles(orders);
        let bundles_actual = await DatabaseClient.getOrderBundlesForBuyer(uid_buyer1, ['created', 'accepted']);
        order1.id = bundles_actual[0].orders[0].id;
        order1.bundleID = bundles_actual[0].orders[0].bundleID;
        order2.id = bundles_actual[0].orders[1].id;
        order2.bundleID = bundles_actual[0].orders[1].bundleID;
        bundles_expected[0].id = bundles_actual[0].id;
        expect(bundles_actual).toEqual(bundles_expected);

        bundles_actual = await DatabaseClient.getOrderBundlesForBuyer(uid_buyer1, ['accepted']);
        expect(bundles_actual.length).toEqual(0);
    });
});
