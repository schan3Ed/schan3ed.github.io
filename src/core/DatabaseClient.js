import { db, database, storage } from './firebase/firebase'
import { DealKeys } from './core';
import PictureHelper from './utilities/PictureHelper';
import { IMAGE_TYPES, MAX_IMAGE_SIZE } from './utilities/PictureHelper';
import async from 'async';
import joi from 'joi-browser';
import { Business, InventoryItem, Notification, Order, OrderBundle, User, UserSession } from './model'
import { businessSchema, inventoryItemSchema, orderSchema, orderBundleSchema, userSchema } from './schemas';
import { toJS } from 'mobx';

var unsubscribers = {};
var notificationUnsubscriber = null;

class DatabaseClient {

    async createUser(user) {
        // Create a regular JS Object from the user
        let _user = user.formatForDB();

        // Validate the user
        const result = joi.validate(_user, userSchema);
        if (result.error) {
            console.error(result.error);
            throw new Error(result.error.details[0].message);
        }
        await db.collection('users').doc(user.uid).set(_user);
    }

    async updateUser(user) {
        // Create a regular JS Object from the user
        let _user = user.formatForDB();

        // Validate the user
        const result = joi.validate(_user, userSchema);
        if (result.error) {
            console.error(result.error);
            throw new Error(result.error.details[0].message);
        }
        await db.collection('users').doc(user.uid).update(_user);
    }

    async getUser(uid) {
        let dataSnapshot = await db.collection('users').doc(uid).get(); 
        if (!dataSnapshot.exists) {
            return null;
        }
        let data = dataSnapshot.data();
        let user = new User(data.email, data.initialized, data.firstName, data.lastName, data.type, uid);
        return user;
    }
    
    async getBusiness(uid) {
        let dataSnapshot = await db.collection('businesses').doc(uid).get();
        if (!dataSnapshot.exists) {
            return null;
        }
        let data = dataSnapshot.data();
        let pictureID = data.picture;
        if (pictureID) {
            data.picture = await this.getProfilePictureURL(pictureID);
        }
        let business = new Business(data.city, data.closing, data.communicationOptions, data.description,
                                    data.email, data.foodOptions, data.name, data.opening, data.paymentOptions,
                                    data.picture, data.phone, data.state, data.streetAddress, uid, data.zipcode);
        return business;
    }

    async getProfilePictureURL(pictureID) {
        let pictureSnapshot = await db.collection('profile_pictures').doc(pictureID).get();
        if (!pictureSnapshot.exists) {
            return null;
        }
        return pictureSnapshot.data()['url'];
    }

    
    async getSeller(uid) {
        return this.getBusiness(uid); //TODO: Remove these functions
    }

    async getBuyer(uid) {
        return this.getBusiness(uid);
    }

    async createBusiness(uid, business, picture) {
        // Create a regular JS Object from the business
        let _business = business.formatForDB();

        // Validate the business
        const result = joi.validate(_business, businessSchema);
        if (result.error) {
            console.error(result.error);
            throw new Error(result.error.details[0].message);
        }
        
        if (picture) {
            let pictureID = await this.createProfilePicture(picture);
            _business.picture = pictureID;
        }
        
        let businessRef = db.collection('businesses').doc(uid);
        await businessRef.set(_business);
    }

    async createProfilePicture(picture) {
        // First validate and compress the picture
        if (!PictureHelper.validateImageType(picture)) {
            let errmsg = 'The file extension is must be one of the following: ';
            for (let i = 0; i < IMAGE_TYPES.length - 1; i++) {
                errmsg += IMAGE_TYPES[i] + ", "
            }
            errmsg += IMAGE_TYPES[IMAGE_TYPES.length - 1] + '.'
            throw new Error(errmsg);
        }
        let metadata = {
            contentType: picture.type,
        };
        let compressedPic = await PictureHelper.compressImage(picture);
        if (!PictureHelper.validateImageSize(compressedPic)) {
            throw new Error('Could not compress image below ' + MAX_IMAGE_SIZE + '. Please try a different image.');
        }
        let pictureRef = db.collection('profile_pictures').doc();
        let pictureID = pictureRef.id;
        let pictureStorageRef = storage.ref('profile_pictures').child(pictureID);
        await pictureStorageRef.put(compressedPic, metadata);
        let url = await pictureStorageRef.getDownloadURL();
        await pictureRef.set({url: url});
        return pictureID;
    }

    async createSeller(uid, business, picture) {
        await this.createBusiness(uid, business, picture);

        // Add seller specific info here in the future
    }

    async createBuyer(uid, business, picture) {
        await this.createBusiness(uid, business, picture);

        // Add buyer specific info here in the future
    }

    /**
     * Inserts a deal entity into the database, with the option of adding an array of pictures
     * corresponding to the deal.  Function may be called without the pictures parameter, in
     * which case any pictures must be added separately using {@link #createDealPictures}.
     * @param {InventoryItem} deal InventoryItem representing the deal
     * @param {Array<File>} pictures Optional.  Array of picture files.
     * @returns the auto-generated ID for the deal
     */
    async createDeal(deal, pictures) {
        // Create a regular JS Object from the deal
        let _deal = deal.formatForDB();

        // Validate the deal
        const result = joi.validate(_deal, inventoryItemSchema);
        if (result.error) {
            console.error(result.error);
            throw new Error(result.error.details[0].message);
        }

        let pictureIDs = [];
        if (pictures) {
            for (let i = 0; i < pictures.length; i++) {
                let pictureID = await this.createDealPicture(pictures[i]);
                pictureIDs.push(pictureID);
            }
        }

        if (pictureIDs.length > 0) {
            _deal.pictures = pictureIDs;
        }
        
        let newDeal = {
            uid: _deal['uid'],
            archived: false,
            currentVersion: 0,
            timestamp: +(new Date())
        };
        let ref = await db.collection('deals').add(newDeal);
        let id = ref.id;
        await ref.collection('versions').doc('0').set(_deal);
        
        return id;
    }

    async editDeal(dealID, deal, pictures) {
        // Create a regular JS Object from the deal
        let _deal = deal.formatForDB();

        // Validate the deal
        const result = joi.validate(_deal, inventoryItemSchema);
        if (result.error) {
            console.error(result.error);
            throw new Error(result.error.details[0].message);
        }

        let ref = db.collection('deals').doc(dealID);
        let snapshot = await ref.get();
        if (!snapshot.exists) {
            return;
        }
        let dealInfo = snapshot.data();
        if (pictures) {
            let pictureIDs = [];
            for (let i = 0; i < pictures.length; i++) {
                let pictureID = await this.createDealPicture(pictures[i]);
                pictureIDs.push(pictureID);
            }
            _deal['pictures'] = pictureIDs;
        }
        else {
            let snapshot = await db.collection('deals').doc(dealID).collection('versions').doc(dealInfo['currentVersion'] + '').get();
            if (!snapshot.exists) {
                _deal['pictures'] = [];
            }
            else {
                _deal['pictures'] = snapshot.data()['pictures'] || [];
            }
        }
        dealInfo['currentVersion']++;
        await ref.collection('versions').doc(dealInfo['currentVersion'] + '').set(_deal);
        await ref.update(dealInfo);
    }

    async createDealPicture(picture) {
        // First validate and compress the picture
        if (!PictureHelper.validateImageType(picture)) {
            let errmsg = 'The file extension is must be one of the following: ';
            for (let i = 0; i < IMAGE_TYPES.length - 1; i++) {
                errmsg += IMAGE_TYPES[i] + ", "
            }
            errmsg += IMAGE_TYPES[IMAGE_TYPES.length - 1] + '.'
            throw new Error(errmsg);
        }
        let metadata = {
            contentType: picture.type,
        };
        let compressedPic = await PictureHelper.compressImage(picture);
        if (!PictureHelper.validateImageSize(compressedPic)) {
            throw new Error('Could not compress image below ' + MAX_IMAGE_SIZE + '. Please try a different image.');
        }
        let pictureRef = db.collection('deal_pictures').doc();
        let pictureID = pictureRef.id;
        let pictureStorageRef = storage.ref('deal_pictures').child(pictureID);
        await pictureStorageRef.put(compressedPic, metadata);
        let url = await pictureStorageRef.getDownloadURL();
        await pictureRef.set({url: url});
        return pictureID;
    }

    /**
     * Retrieves the deal corresponding to the dealID
     * If a version is specified, that version is retrieved. Otherwise, the latest version
     * is retrieved.
     * @param {string} dealID The unique ID of the deal 
     * @param {number} version (Optional) The version of the deal to retrieve
     * @return the specified deal/version
     */
    async getDeal(dealID, version, allowArchived = false) {
        let dealInfoRef = await db.collection('deals').doc(dealID);
        let dealInfoSnapshot = await dealInfoRef.get();
        if (!dealInfoSnapshot.exists) {
            return null;
        }
        let dealInfo = dealInfoSnapshot.data();

        if (!allowArchived && dealInfo['archived'] === true) {
            return null;
        }
        let versionToRetrieve = (version !== undefined) ? version : dealInfo['currentVersion'];
        let dealSnapshot = await dealInfoRef.collection('versions').doc(versionToRetrieve + '').get();
        if (!dealSnapshot.exists) {
            return null;
        }
        let data = dealSnapshot.data();
        let seller = await this.getSeller(dealInfo['uid']);
        let deal = new InventoryItem(data.delivery, data.foodOption, dealID, data.isLocallyGrown, data.isOrganic,
                                    data.name, data.notes, data.pickup, data.pictures, data.price,
                                    data.priceUnit, data.public, data.quantity, data.quantityUnit,
                                    data.reasonForPost, seller, dealInfo['uid'], data.useByDate, versionToRetrieve);

        // TODO: allow multiple pictures
        if (deal.pictures.length > 0) {
            // Only gets the first picture in deal right now
            let pictureID = deal.pictures[0];
            let url = await this.getDealPictureURL(pictureID);
            deal['picture'] = url;
            // delete deal['pictures'];
        }
        return deal;
    }

    async getDealPictureURL(pictureID) {
        let pictureSnapshot = await db.collection('deal_pictures').doc(pictureID).get();
        if (!pictureSnapshot.exists) {
            return null;
        }
        return pictureSnapshot.data()['url'];
    }

    async archiveDeal(dealID) {
        await db.collection('deals').doc(dealID).update({archived: true});
    }

    /**
     * Gets the deals listed by a seller as specified by their UID
     * @param {string} uid 
     * @return an array of deals
     */
    async getDealsBySeller(uid) {
        let query = db.collection('deals').where("uid", "==", uid).where("archived", "==", false);
        let snapshot = await query.get();
        if (snapshot.empty) {
            return [];
        }
        let dealInfos = snapshot.docs;
        let deals = await Promise.all(dealInfos.map( async (dealInfoSnapshot) => {
            let deal = this.getDeal(dealInfoSnapshot.id);
            return deal;
        }));
        return deals;
    }
    
    /**
     * Retrieves all deals that should be shown to a given buyer
     * @param {*} uid 
     * @return an object that holds each deal as indexed by their dealID
     */
    async getDealsForBuyer(uid) {
        let sellerUIDs = await this.getSellerUIDsForBuyer(uid);
        let collectiveSellerDeals = await Promise.all(sellerUIDs.map( async (sellerUID) => {
            let sellerDeals = this.getDealsBySeller(sellerUID);
            return sellerDeals;
        }));
        var merged = [].concat.apply([], collectiveSellerDeals);
        return merged;
    }


    /**
     * Returns an array of all the uid's for sellers eligible to sell
     * to the specified buyer as specified by the clientList database
     * @param {string} uid UID of the buyer
     * @return an array of all the sellerUIDs, which may be empty if
     *  there are no sellers that have listed the buyer as a client
     */
    async getSellerUIDsForBuyer(uid) {
        let query = db.collection('client_relationships').where('buyerUID', '==', uid);
        let dataSnapshot = await query.get();
        if (dataSnapshot.empty) {
            return [];
        }
        let sellerUIDs = dataSnapshot.docs.map( (doc) => {
            return doc.data()['sellerUID'];
        });
        return sellerUIDs;
    }

    setDealListener(dealID, callbackFnEdited, callbackFnArchived) {
        this.removeDealListener(dealID);
        let dealInfoRef = db.collection('deals').doc(dealID);
        unsubscribers[dealID] = dealInfoRef.onSnapshot( async (snapshot) => {
            if (!snapshot.exists) {
                return;
            }
            let dealInfo = snapshot.data();
            if (dealInfo['archived'] === true) {
                callbackFnArchived(dealID);
                this.removeDealListener(dealID);
            }
            else {
                let deal = await this.getDeal(snapshot.id);
                callbackFnEdited(deal);
            }
        });
    }

    removeDealListener(dealID) {
        let unsubscriber = unsubscribers[dealID];
        if (unsubscriber) {
            unsubscriber();
            delete unsubscribers[dealID];
        }
    }

    async createOrderBundles(orders) {
        if (!orders || orders.length < 1) {
            return;
        }
        // First, separate the orders out into their respective sellers
        let bundlesMap = {}
        for (let i = 0; i < orders.length; i++) {
            let orderKey = await this.createOrder(orders[i]);
            let sellerUID = orders[i]['sellerUID'];
            if (bundlesMap[sellerUID]) {
                bundlesMap[sellerUID]['orders'].push(orderKey);
                bundlesMap[sellerUID]['totalCost'] += orders[i]['totalCost'];
            }
            else {
                bundlesMap[sellerUID] = new OrderBundle(undefined, orders[i]['buyerUID'], undefined,
                                        [orderKey], undefined, orders[i]['sellerUID'], orders[i]['timestamp'],
                                        orders[i]['totalCost']);
            }
        }
        let bundles = Object.values(bundlesMap);
        for (let i = 0; i < bundles.length; i++) {
            let bundle = bundles[i];
            // Validate the bundle
            // Create a regular JS Object from the bundle
            let _bundle = bundle.formatForDB();
            
            // Validate the bundle
            const result = joi.validate(_bundle, orderBundleSchema);
            if (result.error) {
                console.error(result.error);
                throw new Error(result.error.details[0].message);
            }

            let ref = await db.collection('order_bundles').add(_bundle);
            let bundleID = ref.id;
            let orderIDs = _bundle['orders'];
            for (let j = 0; j < orderIDs.length; j++) {
                await this.updateOrder(orderIDs[j], {bundleID: bundleID});
            }
        }
    }

    async getOrderBundlesHelper(uid, statuses, field) {
        let orderQueries;
        if (statuses) {
            orderQueries = statuses.map((status) => {
                return db.collection('orders').where(field, '==', uid).where('status', '==', status).orderBy("timestamp", "desc");
            })
        }
        else {
            orderQueries = [db.collection('orders').where(field, '==', uid).orderBy("timestamp", "desc")];
        }
        let querySnapshots = await Promise.all(orderQueries.map((query) => {
            return query.get();
        }))
        let orderSnapshots = [];
        for (let i = 0; i < querySnapshots.length; i++) {
            let querySnapshot = querySnapshots[i];
            if (!querySnapshot.empty) {
                orderSnapshots = orderSnapshots.concat(querySnapshot.docs);
            }
        }
        if (orderSnapshots.length == 0) {
            return [];
        }
        
        // First, resolve all orders in parallel
        let orders = await Promise.all(orderSnapshots.map( async (orderSnapshot) => {
            let order = this.getOrderFromSnapshot(orderSnapshot);
            return order;
        }))

        // Now, group into bundles
        let bundles = {};
        for (let i = 0; i < orders.length; i++) {
            let order = orders[i];
            let bundleID = order['bundleID'];
            // Apparently we don't have to worry about race conditions here
            if (bundles[bundleID]) {
                bundles[bundleID]['orders'].push(order);
                bundles[bundleID]['totalCost'] += order['totalCost'];
            }
            else {
                bundles[bundleID] = new OrderBundle(order['buyer'], order['buyer']['uid'], bundleID, 
                                                    [order], order['seller'], order['seller']['uid'], 
                                                    order['timestamp'], order['totalCost'])
            }
        }
        
        return Object.values(bundles);
    }

    async getOrderBundlesForBuyer(uid, statuses) {
        return this.getOrderBundlesHelper(uid, statuses, 'buyerUID');
    }

    async getOrderBundlesForSeller(uid, statuses) {
        return this.getOrderBundlesHelper(uid, statuses, 'sellerUID');
    }

    async createOrder(order) {
        // Create a regular JS Object from the order
        let _order = order.formatForDB();

        // Validate the order
        const result = joi.validate(_order, orderSchema);
        if (result.error) {
            console.error(result.error);
            throw new Error(result.error.details[0].message);
        }
        
        // Check that the quantity requested is okay
        let deal = await this.getDeal(order.dealID, order.dealVersion, true);
        if (deal.quantity < order.quantityRequested) {
            throw new Error('The quantity requested is greater than the quantity available.');
        }
        let ref = await db.collection('orders').add(_order);
        return ref.id;
    }

    async getOrder(orderID) {
        let ref = db.collection('orders').doc(orderID);
        let orderSnapshot = await ref.get();
        if (!orderSnapshot.exists) {
            return null;
        }
        let order = await this.getOrderFromSnapshot(orderSnapshot);
        return order;
    }

    async getOrderFromSnapshot(orderSnapshot) {
        if (!orderSnapshot.exists) {
            return null;
        }
        let data = orderSnapshot.data();
        let buyerPromise = this.getBuyer(data.buyerUID);
        let sellerPromise = this.getSeller(data.sellerUID);
        let dealPromise = this.getDeal(data.dealID, data.dealVersion, true);
        let [buyer, seller, deal] = await Promise.all([buyerPromise, sellerPromise, dealPromise]);
        let order = new Order(data.bundleID, buyer, data.buyerUID, deal, data.dealID, data.dealVersion,
                                data.exchange, data.exchangeStatus, orderSnapshot.id, data.needByDate,
                                data.paymentStatus, data.quantityRequested, seller, data.sellerUID,
                                data.status, data.timestamp, data.totalCost);
        return order;
    }

    async getOrdersForSeller(uid, status) {
        let orders = await this.getOrdersHelper(uid, status, 'sellerUID');
        return orders;
    }

    async getOrdersForBuyer(uid, status) {
        let orders = await this.getOrdersHelper(uid, status, 'buyerUID');
        return orders;
     }

    async getOrdersHelper(uid, status, field) {
        let query = null;
        if (status) {
            query = db.collection('orders').where(field, '==', uid).where('status', '==', status).orderBy('timestamp', 'desc');
        }
        else {
            query = db.collection('orders').where(field, '==', uid).orderBy('timestamp', 'desc');
        }
        let querySnapshot = await query.get();
        if (querySnapshot.empty) {
            return [];
        }
        let orderSnapshots = querySnapshot.docs;
        let orders = await Promise.all(orderSnapshots.map( async (orderSnapshot) => {
            let order = this.getOrderFromSnapshot(orderSnapshot);
            return order;
        }))
        return orders;
    }

    async acceptRequest(orderID) {
        let order = await this.getOrder(orderID);
        if (order.deal.quantity < order.quantityRequested) {
            throw new Error('The quantity requested is greater than the quantity available.');
        }
        else {
            await this.updateOrder(orderID, {status: "accepted"});
        }
    }
    async updateOrder(orderID, updates) {
        await db.collection('orders').doc(orderID).update(updates);
    }

    async setPushToken(uid, token) {
        let payload = {pushToken: token}
        try {
            await db.collection('sessions').doc(uid).update(payload);
        }
        catch (e) {
            await db.collection('sessions').doc(uid).set(payload);
        }
    }

    /*
    async getSession(uid) {
        let data = await db.collection('sessions').doc(uid).get();
        if ()
        let session = new UserSession(data.notifications, data.pushToken);
        return session;
    }

    async getPushToken(uid) {
        let session = await this.getSession(uid);
        return session['pushToken'];
    }
    */

    setNotificationListener(uid, callbackFnCreated = () => {}, callbackFnModified = () => {}, callbackFnRemoved = () => {}) {
        this.removeNotificationListener();
        notificationUnsubscriber = db.collection('sessions').doc(uid).collection('notifications').where('read', '==', false).onSnapshot( (querySnapshot) => {
            querySnapshot.docChanges.forEach( (change) => {
                let data = change.doc.data();
                let notification = new Notification(change.doc.id, data.link, data.message, data.pictureURL, data.read, data.subject, data.timestamp);
                if (change.type === "added") {
                    callbackFnCreated(notification);
                }
                else if (change.type === "modified") {
                    callbackFnModified(notification);
                }
                else if (change.type === "removed") {
                    callbackFnRemoved(notification);
                }
            })
        });
    }

    async markNotificationAsRead(uid,notificationID) {
        await db.collection('sessions').doc(uid).collection('notifications').doc(notificationID).delete();
    }

    removeNotificationListener() {
        if (notificationUnsubscriber) {
            notificationUnsubscriber();
        }
        notificationUnsubscriber = null;
    }

    removeAllDealListeners() {
        let unsubs = Object.values(unsubscribers);
        for (let i = 0; i < unsubs.length; i++) {
            let unsubscriber = unsubs[i];
            if (unsubscriber) {
                unsubscriber();
            }
        }
    }

    removeAllListeners() {
        this.removeAllDealListeners();
        this.removeNotificationListener();
    }

    async createClientRelationship(buyerUID, sellerUID) {
        await db.collection('client_relationships').add({buyerUID: buyerUID, sellerUID: sellerUID});
    }

    async reportError(uid, error, info) {
        let timestamp = +(new Date());
        try {
            await db.collection('errors').add({uid, message: error.message, stack: error.stack, info, timestamp});
        }
        catch (e) {
            console.error('Could not report error to the database', e);
        }
        
    }
}

export default new DatabaseClient()
