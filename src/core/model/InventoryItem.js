import joi from 'joi-browser';
import { MIN_STRING, MAX_STRING_SHORT, MAX_STRING_EXTRA_LONG } from '../schemas'
import { observable, toJS } from 'mobx'

export const inventoryItemSchema = joi.object().keys({
    delivery: joi.boolean().required(),
    foodOption: joi.string().min(MIN_STRING).max(MAX_STRING_SHORT).required(),
    id: joi.string().min(MIN_STRING).max(MAX_STRING_SHORT).required(),
    isLocallyGrown: joi.boolean().required(),
    isOrganic: joi.boolean().required(),
    name: joi.string().min(MIN_STRING).max(MAX_STRING_SHORT).required(),
    notes: joi.string().min(MIN_STRING).max(MAX_STRING_EXTRA_LONG).allow(null).required(), // Can be null
    pickup: joi.boolean().required(),
    picture: joi.any(),
    pictures: joi.any(), //TODO: only pictures as an array
    price: joi.number().required(), // TODO: remove required
    priceUnit: joi.string().min(MIN_STRING).max(MAX_STRING_SHORT).required(),
    public: joi.boolean().required(),
    quantity: joi.number().required(),
    quantityUnit: joi.string().min(MIN_STRING).max(MAX_STRING_SHORT).required(),
    reasonForPost: joi.array().items(joi.string().min(MIN_STRING).max(MAX_STRING_SHORT)).required(), // Can be empty
    seller: joi.object().required(),
    uid: joi.string().min(MIN_STRING).max(MAX_STRING_SHORT).required(),
    useByDate: joi.string().min(MIN_STRING).max(MAX_STRING_SHORT).required(), // TODO: date validator
    version: joi.number().required(),
});

export default class InventoryItem {
    @observable delivery
    @observable foodOption
    @observable id
    @observable isLocallyGrown
    @observable isOrganic
    @observable name
    @observable notes
    @observable pickup
    @observable pictures
    @observable price
    @observable priceUnit
    @observable public
    @observable quantity
    @observable quantityUnit
    @observable reasonForPost
    @observable seller
    @observable uid
    @observable useByDate
    @observable version
    
    constructor(delivery = false, foodOption = null, id = null, isLocallyGrown = false, isOrganic = false, 
                name = null, notes = null, pickup = false, pictures = [],
                price = 0, priceUnit = null, _public = false, quantity = 0, quantityUnit = null,
                reasonForPost = [], seller = null, uid = null, useByDate = null, version = 0) { //TODO: pictures
        this.delivery = delivery;
        this.foodOption = foodOption;
        this.id = id;
        this.isLocallyGrown = isLocallyGrown;
        this.isOrganic = isOrganic;
        this.name = name;
        this.notes = notes;
        this.pickup = pickup;
        this.pictures = pictures;
        this.price = price;
        this.priceUnit = priceUnit;
        this.public = _public;
        this.quantity = quantity;
        this.quantityUnit = quantityUnit;
        this.reasonForPost = reasonForPost;
        this.seller = seller;
        this.uid = uid;
        this.useByDate = useByDate;
        this.version = version;
    }

    formatForDB() {
        let data = observable({
            delivery: this.delivery,
            foodOption: this.foodOption,
            isLocallyGrown: this.isLocallyGrown,
            isOrganic: this.isOrganic,
            name: this.name,
            notes: this.notes,
            pickup: this.pickup,
            price: this.price,
            priceUnit: this.priceUnit,
            public: this.public,
            quantity: this.quantity,
            quantityUnit: this.quantityUnit,
            reasonForPost: this.reasonForPost,
            uid: this.uid,
            useByDate: this.useByDate
        });
        return toJS(data);
    }

    validate() {
        const result = joi.validate(this, inventoryItemSchema);
        return (result.error ? false : true); // lol
    }
}