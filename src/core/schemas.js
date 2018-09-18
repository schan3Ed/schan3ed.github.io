import joi from 'joi-browser';
export const MIN_STRING = 1;
export const MAX_STRING_SHORT = 50;
export const MAX_STRING_MED = 100;
export const MAX_STRING_LONG = 200;
export const MAX_STRING_EXTRA_LONG = 300;

export const businessSchema = joi.object().keys({
    city: joi.string().min(MIN_STRING).max(MAX_STRING_SHORT).required(),
    closing: joi.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
    communicationOptions: joi.array().items(joi.string().min(MIN_STRING).max(MAX_STRING_SHORT).required()).required(), 
    description: joi.string().min(MIN_STRING).max(MAX_STRING_EXTRA_LONG).required(),
    email: joi.string().email().required(),
    foodOptions: joi.array().items(joi.string().min(MIN_STRING).max(MAX_STRING_SHORT).required()),
    name: joi.string().min(MIN_STRING).max(MAX_STRING_SHORT).required(),
    opening: joi.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
    paymentOptions: joi.array().items(joi.string().min(MIN_STRING).max(MAX_STRING_SHORT).required()).required(),
    phone: joi.string().min(MIN_STRING).max(MAX_STRING_SHORT).required(), // TODO: add regex
    state: joi.string().min(MIN_STRING).max(MAX_STRING_SHORT).required(),
    streetAddress: joi.string().min(MIN_STRING).max(MAX_STRING_SHORT).required(),
    zipcode: joi.string().regex(/^[0-9]{5}(-[0-9]{4})?$/).required()
})

export const inventoryItemSchema = joi.object().keys({
    delivery: joi.boolean().required(),
    foodOption: joi.string().min(MIN_STRING).max(MAX_STRING_SHORT).required(),
    isLocallyGrown: joi.boolean().required(),
    isOrganic: joi.boolean().required(),
    name: joi.string().min(MIN_STRING).max(MAX_STRING_SHORT).required(),
    notes: joi.string().min(MIN_STRING).max(MAX_STRING_EXTRA_LONG).allow(null).required(), // Can be null
    pickup: joi.boolean().required(),
    price: joi.number().required(), // TODO: remove required
    priceUnit: joi.string().min(MIN_STRING).max(MAX_STRING_SHORT).required(),
    public: joi.boolean().required(),
    quantity: joi.number().required(),
    quantityUnit: joi.string().min(MIN_STRING).max(MAX_STRING_SHORT).required(),
    reasonForPost: joi.array().items(joi.string().min(MIN_STRING).max(MAX_STRING_SHORT)).required(), // Can be empty
    uid: joi.string().min(MIN_STRING).max(MAX_STRING_SHORT).required(),
    useByDate: joi.string().min(MIN_STRING).max(MAX_STRING_SHORT).required() // TODO: date validator
});

export const userSchema = joi.object().keys({
    email: joi.string().email().required(),
    initialized: joi.boolean().required(),
    firstName: joi.string().min(MIN_STRING).max(MAX_STRING_SHORT).required(),
    lastName: joi.string().min(MIN_STRING).max(MAX_STRING_SHORT).required(),
    type: joi.string().valid(['buyer', 'seller']).required() // TODO: enums
});

export const orderSchema = joi.object().keys({
    buyerUID: joi.string().min(MIN_STRING).max(MAX_STRING_SHORT).required(),
    dealID: joi.string().min(MIN_STRING).max(MAX_STRING_SHORT).required(),
    dealVersion: joi.number().required(),
    exchange: joi.string().valid(['pickup', 'delivery']).required(),
    exchangeStatus: joi.boolean().required(),
    needByDate: joi.string().min(MIN_STRING).max(MAX_STRING_SHORT).required(), // TODO: date validator
    paymentStatus: joi.boolean().required(),
    quantityRequested: joi.number().required(),
    sellerUID: joi.string().min(MIN_STRING).max(MAX_STRING_SHORT).required(),
    status: joi.string().min(MIN_STRING).max(MAX_STRING_SHORT).required(),
    timestamp: joi.number().required(),
    totalCost: joi.number().required() // TODO: positive floats, ints, etc...
});

export const orderBundleSchema = joi.object().keys({
    buyerUID: joi.string().min(MIN_STRING).max(MAX_STRING_SHORT).required(),
    orders: joi.array().items(joi.any()).required(), // TODO: figure out how to put Orders object in here
    sellerUID: joi.string().min(MIN_STRING).max(MAX_STRING_SHORT).required(),
    timestamp: joi.number().required(),
    totalCost: joi.number().required()
});