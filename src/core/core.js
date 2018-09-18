// @flow

export type User = {
    uid: string,
    firstName: string,
    lastName: string,
    email: string,
};

export const UserKeys = ['uid', 'firstName', 'lastName', 'email'];

export const CommunicationOptions = Object.freeze({
    TEXT: 'Text',
    EMAIL: 'Email',
    CALL: 'Call',
    OTHER: 'Other',
});
export type CommunicationOptionsType = $Values<typeof CommunicationOptions>;

export const PaymentOptions = Object.freeze({
    CREDIT_CARD:  'Credit Card',
    CHECK: 'Check',
    CASH: 'Cash',
    PAYPAL: 'PayPal',
    MONEY_ORDER: 'Money Order',
    DIRECT_DEPOSIT: 'Direct Deposit',
    OTHER: 'Other',
});
export type PaymentOptionsType = $Values<typeof PaymentOptions>;

export const FoodOptions = Object.freeze({
    FRUIT: 'Fruit',
    VEGETABLES: 'Vegetables',
    DAIRY: 'Dairy',
    MEATS: 'Meat',
    FUNGI: 'Fungi',
    BAKERY: 'Bakery',
    OTHER: 'Other',
});
export type FoodOptionTypes = $Values<typeof FoodOptions>;

export const ReasonForPostOptions = Object.freeze({
    EXTRA: 'Extra from an order',
    REJECT: 'Rejected Shipment',
    IMPERFECTION: 'Imperfections',
    OTHER: 'Other',
});

export type ReasonForPostType = $Values<typeof ReasonForPost>


export type Business = User & {
    name: string,
    streetAddress: string,
    city: string,
    state: string,
    zipcode: number,
    phone: string,
    description: string,
    communicationOptions: Array<string>,
    opening: number,
    closing: number,
};

export const BusinessKeys = ['name', 'streetAddress', 'city', 'state', 'zipcode', 'phone', 'description', 'communicationOptions', 'opening', 'closing'];

export type Seller = Business & {
    paymentOptions: Array<string>,
    foodOptions: Array<string>,
};

export const SellerKeys = ['paymentOptions', 'foodOptions'];


export type Buyer = Business & {
    sellers: Array<string>,
    deliveryOptions: {
        allowsDelivery: boolean,
        hours: {
            start: number,
            end: number
        },
    },
    pickupOptions: {
        allowsPickup: boolean,
        hours: {
            start: number,
            end: number
        },
    },
    privacyOptions: {
        isSearchRestricted: boolean,
        radius: number,
    },
    paymentMethods: Array<string>,
    foodOptions: Array<string>,
};

export type Deal = {
    id: ?string,
    uid: string,
    name: string,
    pictures: ?Array<string>,
    quantity: number,
    quantityUnit: string,
    useByDate: string,
    price: number,
    priceUnit: string,
    isOrganic: boolean,
    isLocallyGrown: boolean,
    delivery: boolean,
    pickup: boolean,
    reasonForPost: ?Array<string>,
    notes: ?string,
    public: boolean,
    foodOption: string,
};

export const DealKeys = ['name', 'quantity', 'quantityUnit', 'useByDate', 'price', 'priceUnit', 'isOrganic', 'isLocallyGrown', 'delivery', 'pickup', 'reasonForPost', 'notes', 'public', 'foodOption'];

export const FoodUnits = Object.freeze({
    LB: 'lb',
    CASE: 'case',
    BAG: 'bag',
    PALLET: 'pallet'
});

export const States = ["AK","AL","AR","AZ","CA","CO","CT","DC","DE","FL","GA","GU","HI","IA","ID", "IL","IN","KS","KY","LA","MA","MD","ME","MH","MI","MN","MO","MS","MT","NC","ND","NE","NH","NJ","NM","NV","NY", "OH","OK","OR","PA","PR","PW","RI","SC","SD","TN","TX","UT","VA","VI","VT","WA","WI","WV","WY"];