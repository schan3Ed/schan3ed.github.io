import joi from 'joi-browser';
import { MIN_STRING, MAX_STRING_SHORT } from '../schemas'
import { inventoryItemSchema } from '../model/InventoryItem'
import { observable, toJS } from 'mobx'

export const shoppingCartItemSchema = joi.object().keys({
    deal: inventoryItemSchema,
    quantityRequested: joi.number().required(),
    needByDate: joi.string().min(MIN_STRING).max(MAX_STRING_SHORT).required(),
    exchange: joi.string().valid(['pickup', 'delivery']).required(),
    totalCost: joi.number().required()
});

export default class ShoppingCartItem {
    @observable deal
    @observable quantityRequested
    @observable needByDate
    @observable exchange
    @observable totalCost

    constructor(deal = null, quantityRequested = 0, needByDate = null, exchange = null, totalCost = 0) {
        this.deal = deal;
        this.quantityRequested = quantityRequested;
        this.needByDate = needByDate;
        this.exchange = exchange;
        this.totalCost = totalCost;
    }

    validate() {
        const result = joi.validate(toJS(this), shoppingCartItemSchema);
        return (result.error ? false : true); // lol
    }
}