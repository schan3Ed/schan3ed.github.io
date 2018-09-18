import { observable, toJS } from 'mobx'

export default class Business {
    @observable city
    @observable closing
    @observable communicationOptions
    @observable description
    @observable email
    @observable foodOptions
    @observable name
    @observable opening
    @observable paymentOptions
    @observable picture
    @observable phone
    @observable state
    @observable streetAddress
    @observable uid
    @observable zipcode

    constructor(city = null, closing = null, communicationOptions = [], description = null, 
                email = null, foodOptions = [], name = null, opening = null, paymentOptions = [], picture = null,
                phone = null, state = null, streetAddress = null, uid = null, zipcode = null) {
        this.city = city;
        this.closing = closing;
        this.communicationOptions = communicationOptions;
        this.description = description;
        this.email = email;
        this.foodOptions = foodOptions;
        this.name = name;
        this.opening = opening;
        this.paymentOptions = paymentOptions;
        this.picture = picture;
        this.phone = phone;
        this.state = state;
        this.streetAddress = streetAddress;
        this.uid = uid;
        this.zipcode = zipcode;
    }

    formatForDB() {
        let data = observable({
            city: this.city,
            closing: this.closing,
            communicationOptions: this.communicationOptions,
            description: this.description,
            email: this.email,
            foodOptions: this.foodOptions,
            name: this.name,
            opening: this.opening,
            paymentOptions: this.paymentOptions,
            phone: this.phone,
            state: this.state,
            streetAddress: this.streetAddress,
            zipcode: this.zipcode
        });
        return toJS(data);
    }
}