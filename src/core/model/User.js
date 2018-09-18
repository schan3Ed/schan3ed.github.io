import joi from 'joi-browser';
import { MIN_STRING, MAX_STRING_SHORT } from '../schemas'
import { observable, toJS } from 'mobx'

const schema = joi.object().keys({
    email: joi.string().email().required(),
    initialized: joi.boolean().required(),
    firstName: joi.string().min(MIN_STRING).max(MAX_STRING_SHORT).required(),
    lastName: joi.string().min(MIN_STRING).max(MAX_STRING_SHORT).required(),
    type: joi.string().valid(['buyer', 'seller']).required(),
    uid: joi.string().min(MIN_STRING).max(MAX_STRING_SHORT).required(),
});

export default class User {
    constructor(email = null, initialized = false, firstName = null, lastName = null, type = null, uid = null) {
        this.email = email;
        this.initialized = initialized;
        this.firstName = firstName;
        this.lastName = lastName;
        this.type = type;
        this.uid = uid;
    }

    formatForDB() {
        let data = {
            email: this.email,
            initialized: this.initialized,
            firstName: this.firstName,
            lastName: this.lastName,
            type: this.type
        }
        return data;
    }

    isSeller() {
        return (this.type === 'seller');
    }

    isBuyer() {
        return (this.type === 'buyer');
    }

    validate() {
        const result = joi.validate(toJS(this), schema);
        return (result.error ? false : true); // lol
    }
}