import { observable, toJS } from 'mobx'

export default class OrderBundle {
    @observable buyer
    @observable buyerUID
    @observable id
    @observable orders
    @observable seller
    @observable sellerUID
    @observable timestamp
    @observable totalCost
    
    constructor(buyer = null, buyerUID = null, id = null, orders = [], seller = null, sellerUID = null, timestamp = 0, totalCost = 0) {
        this.buyer = buyer;
        this.buyerUID = buyerUID;
        this.id = id;
        this.orders = orders;
        this.seller = seller;
        this.sellerUID = sellerUID;
        this.timestamp = timestamp;
        this.totalCost = totalCost;
    }

    formatForDB() {
        let data = observable({
            buyerUID: this.buyerUID,
            orders: this.orders,
            sellerUID: this.sellerUID,
            timestamp: this.timestamp,
            totalCost: this.totalCost
        });
        return toJS(data);
    }
}