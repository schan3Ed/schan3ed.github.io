import { action, observable, computed } from 'mobx'
import { userStore } from '..'
import DatabaseClient from '../../core/DatabaseClient'
import store from 'store'
import moment from 'moment'
import { Order, ShoppingCartItem } from '../../core/model'

const SHOPPING_CART = '__freshspire_shopping_cart';
// TODO: LINK SHOPPING_CART TO A UID
class ShoppingCartStore {

    /**
     * An element in the shopping cart array is specified as the following format:
     * {
     *      deal: Deal
     *      quantityRequested: number
     *      needByDate: string
     *      exchange: string (delivery or pickup)
     *      totalCost: number
     * }
     */
    @observable shoppingCart = []

    /**
     * The total running cost of all items in the shopping cart
     */
    @observable totalCost = 0

    // TODO: Get the notification sysem working correctly
    @observable latestChange = null;
    @observable hasSynced = {};

    @action
    initializeShoppingCart() {
        this.hasSynced = {};
        try {
            // Grab the shopping cart in local storage
            let localStorage = store.get(SHOPPING_CART);
            if (localStorage) {
                let shoppingCart = Object.values(localStorage);
                for (let i = 0; i < shoppingCart.length; i++) {
                    let data = shoppingCart[i];
                    let shoppingCartItem = new ShoppingCartItem(data.deal, data.quantityRequested, data.needByDate, data.exchange, data.totalCost);
                    if (!shoppingCartItem.validate()) {
                        this.resetShoppingCart();
                        return;
                    }
                }
                this.shoppingCart = shoppingCart;
                // Set listeners
                this.shoppingCart.forEach((item) => {
                    this.setDealListener(item['deal']['id']);
                });

                this.calculateTotalCost();
            }
            else {
                this.resetShoppingCart();
            }
        }
        catch (e) {
            // If the shopping cart is corrupted, reset it
            this.resetShoppingCart();
        }
    }

    @action
    async checkout() {
        if (!userStore.isAuthenticated) {
            throw new Error('No user is logged in.')
        }
        let buyerUID = userStore.user.uid;
        let orders = this.shoppingCart.map( (item) => {
            let order = new Order(undefined, undefined, buyerUID, undefined, item.deal.id, item.deal.version,
                                    item.exchange, false, undefined, item.needByDate, false, item.quantityRequested,
                                    undefined, item.deal.uid, 'created', +moment(), item.totalCost);
            return order;
        });
        await DatabaseClient.createOrderBundles(orders);
        this.resetShoppingCart();
    }

    @action
    calculateTotalCost() {
        let total = 0;
        this.shoppingCart.forEach( (item) => {
            total += item['totalCost'];
        })
        this.totalCost = total;
        return this.totalCost;
    }

    setDealListener(dealID) {
        DatabaseClient.setDealListener(dealID, 
            (deal) => {
                this.updateShoppingCart(deal);
                if (!this.hasSynced[dealID]) {
                    this.hasSynced[dealID] = true;
                    return; // Don't set latestChange if this is the first time syncing
                }
                this.latestChange = 'updated';
            },
            (dealID) => {
                this.removeFromShoppingCart(dealID);
                this.latestChange = 'removed';
            });
    }

    getShoppingCart() {
        return this.shoppingCart;
    }
  
    @action
    async editShoppingCart(dealID, quantityRequested, needByDate, exchange) {
        let index = this.getIndexOfDeal(dealID);
        if (index < 0) {
            // Probably meant to do an addToShoppingCart
            await this.addToShoppingCart(dealID, quantityRequested, needByDate, exchange);
        }
        else {
            let deal = await DatabaseClient.getDeal(dealID);
            for (var key in deal) {
                this.shoppingCart[index]['deal'][key] = deal[key];
            }
            this.shoppingCart[index]['quantityRequested'] = quantityRequested;
            this.shoppingCart[index]['needByDate'] = needByDate;
            this.shoppingCart[index]['exchange'] = exchange;
            this.shoppingCart[index]['totalCost'] = (quantityRequested * this.shoppingCart[index]['deal']['price']);
            store.set(SHOPPING_CART, this.shoppingCart);
            this.calculateTotalCost();
        }
    }
  
    @action
    async addToShoppingCart(dealID, quantityRequested, needByDate, exchange) {
        // If already in the store, edit it instead
        if (this.getIndexOfDeal(dealID) > -1) {
            await this.editShoppingCart(dealID, quantityRequested, needByDate, exchange);
        }
        else {
            let deal = await DatabaseClient.getDeal(dealID);
            if (quantityRequested < 1) {
                throw new Error('The amount requested must be a positive integer');
            }
            if (quantityRequested > deal['quantity']) {
            throw new Error('The amount requested is more than what is available.');
            }
            if (exchange === 'delivery' && !deal['delivery']) {
                throw new Error('Delivery is not available');
            }
            if (exchange === 'pickup' && !deal['pickup']) {
            throw new Error('Pickup is not available');
            }
            let item = new ShoppingCartItem(deal, quantityRequested, needByDate, exchange, this.totalCost);

            // Set an appropriate listener
            // Could fail (throw an error) if tried to add an invalid deal that
            // did not exist in the database
            this.setDealListener(item.deal.id);
            this.shoppingCart.push(item);
            store.set(SHOPPING_CART, this.shoppingCart);
            this.calculateTotalCost();
        }
    }
  
    @action
    removeFromShoppingCart(dealID) {
        let index = this.getIndexOfDeal(dealID);
        if (index > -1) {
            this.shoppingCart.splice(index, 1);
            store.set(SHOPPING_CART, this.shoppingCart);
            DatabaseClient.removeDealListener(dealID);
            this.calculateTotalCost();
        }
    }

    @action
    resetShoppingCart() {
        try {
            this.shoppingCart.forEach( (item) => {
                DatabaseClient.removeDealListener(item['deal']['id']);
            })
        }
        catch (e) {
            console.log('Error while removing deal listeners in shoppingCartStore');
            console.log(e.message);
            // Ignore, we'll just have a deadweight listener
            // but it shouldn't cause any problems
        }
        this.shoppingCart = [];
        store.remove(SHOPPING_CART);
        this.totalCost = 0;
        this.hasSynced = {};
    }

    @action
    updateShoppingCart(deal) {
        let dealID = deal['id'];
        let prevDealIdx = this.getIndexOfDeal(dealID);
        if (prevDealIdx < 0) {
            return;
        }
        for (var key in deal) {
            this.shoppingCart[prevDealIdx]['deal'][key] = deal[key];
        }
        this.shoppingCart[prevDealIdx]['totalCost'] = this.shoppingCart[prevDealIdx]['quantityRequested'] * this.shoppingCart[prevDealIdx]['deal']['price'];
        store.set(SHOPPING_CART, this.shoppingCart);
        this.calculateTotalCost(); 
    }

    getIndexOfDeal(dealID) {
        for (let i = 0; i < this.shoppingCart.length; i++) {
          if (this.shoppingCart[i]['deal']['id'] == dealID) {
            return i;
          }
        }
        return -1;
      }
    
    getItem(dealID) {
        let index = this.getIndexOfDeal(dealID);
        if (index > -1) {
            return this.shoppingCart[index];
        }
        else {
            return null;
        }
    } 
}
export default new ShoppingCartStore()