import { observable, toJS } from 'mobx'

export default class Order {
    @observable bundleID
    @observable buyer
    @observable buyerUID
    @observable deal
    @observable dealID
    @observable dealVersion
    @observable exchange
    @observable exchangeStatus
    @observable id
    @observable needByDate
    @observable paymentStatus
    @observable quantityRequested
    @observable seller
    @observable sellerUID
    @observable status
    @observable timestamp
    @observable totalCost
    
    constructor(bundleID = null, buyer = null, buyerUID = null, deal = null, dealID = null, dealVersion = 0, 
                exchange = null, exchangeStatus = false, id = null, needByDate = null, paymentStatus = false, 
                quantityRequested = 0, seller = null, sellerUID = null, status = null, timestamp = 0, 
                totalCost = 0) {
        this.bundleID = bundleID;
        this.buyer = buyer;
        this.buyerUID = buyerUID;
        this.deal = deal;
        this.dealID = dealID;
        this.dealVersion = dealVersion;
        this.exchange = exchange;
        this.exchangeStatus = exchangeStatus;
        this.id = id;
        this.needByDate = needByDate;
        this.paymentStatus = paymentStatus;
        this.quantityRequested = quantityRequested;
        this.seller = seller;
        this.sellerUID = sellerUID;
        this.status = status;
        this.timestamp = timestamp;
        this.totalCost = totalCost;
    }

    formatForDB() {
        let data = observable({
            buyerUID: this.buyerUID,
            dealID: this.dealID,
            dealVersion: this.dealVersion,
            exchange: this.exchange,
            exchangeStatus: this.exchangeStatus,
            needByDate: this.needByDate,
            paymentStatus: this.paymentStatus,
            quantityRequested: this.quantityRequested,
            sellerUID: this.sellerUID,
            status: this.status,
            timestamp: this.timestamp,
            totalCost: this.totalCost
        });
        return toJS(data);
    }
}