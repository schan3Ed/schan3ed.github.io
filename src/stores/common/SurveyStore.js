import { action, observable, toJS } from 'mobx';
import DatabaseClient from '../../core/DatabaseClient';
import { States } from '../../core/core';
import { getFlattenedValues } from '../FormHelper';
import validate from 'validate.js';
import { userStore } from '..';
import { Business } from '../../core/model'

class SurveyStore {
    @observable form
    defaultForm = {
        fields: {
            name: {
                value: null,
                validation: {
                    presence: true,
                    length: {
                        minimum: 1,
                        maximum: 50,
                        message: '^This field is required and must be less than 50 characters',
                    },
                },
                error: null,
            },
            streetAddress: {
                value: null,
                validation: {
                    presence: true,
                    length: {
                      minimum: 1,
                      maximum: 100,
                      message: '^This field is required and must be less than 100 characters',
                    },
                },
                error: null,
            },
            city: {
                value: null,
                validation: {
                    presence: true,
                    length: {
                      minimum: 1,
                      maximum: 50,
                      message: '^This field is required and must be less than 50 characters',
                    },
                },
                error: null,
            },
            state: {
                value: null,
                validation: {
                    presence: true,
                    inclusion: States,
                },
                error: null,
            },
            zipcode: {
                value: null,
                validation: {
                    presence: true,
                    format: {
                        pattern: "[0-9]{5}(-[0-9]{4})?",
                        message: "^Must be a valid zipcode",
                    },
                },
                error: null,
            },
            opening: {
                value: '08:00',
                validation: {
                    presence: true,
                    format: {
                        pattern: "([01]?[0-9]|2[0-3]):[0-5][0-9]",
                        message: "^Must be a valid time in the 24 hour format XX:XX",
                    }
                },
                error: null,
            },
            closing: {
                value: '17:00',
                validation: {
                    presence: true,
                    format: {
                        pattern: "([01]?[0-9]|2[0-3]):[0-5][0-9]",
                        message: "^Must be a valid time in the 24 hour format XX:XX",
                    }
                },
                error: null,
            },
            paymentOptions: {
                value: [],
                validation: {
                    presence: false,
                },
                error: null,
            },
            paymentOptionsOther: {
                value: null,
                validation: {
                    presence: false,
                    length: {
                        maximum: 25,
                        message: 'must be less than 25 characters',
                      },
                },
                error: null,
            },
            phone: {
                value: null, // TODO: validate phone numbers and have nice masked input
                validation: {
                    presence: true,
                    format: {
                       pattern: "^(\\+\\d{1,2}\\s)?\\(?\\d{3}\\)?[\\s.-]\\d{3}[\\s.-]\\d{4}$",
                       message: "^Must be in the format (XXX) XXX-XXXX",
                    },
                },
                error: null,
            },
            email: {
                value: null, // TODO: validate phone numbers and have nice masked input
                validation: {
                    presence: true,
                    email: {
                        message: "^Must be a valid email",
                    }
                },
                error: null,
            },
            firstName: {
                value: null,
                validation: {
                    presence: true,
                    length: {
                        minimum: 1,
                        maximum: 50,
                        message: '^This field is required and must be less than 50 characters',
                    },
                },
                error: null,
            },
            lastName: {
                value: null,
                validation: {
                    presence: true,
                    length: {
                        minimum: 1,
                        maximum: 50,
                        message: '^This field is required and must be less than 50 characters',
                    },
                },
                error: null,
            },
            description: {
                value: null,
                validation: {
                    presence: true,
                    length: {
                        min: 1,
                        maximum: 300,
                    },
                },
                error: null,
            },
            foodOptions: {
                value: [],
                validation: {
                    presence: false,
                },
                error: null,
            },
            foodOptionsOther: {
                value: null,
                validation: {
                    presence: false,
                    length: {
                        maximum: 25,
                        message: 'must be less than 25 characters',
                      },
                },
                error: null,
            },
            picture: {
                value: null,
                validation: {
                  presence: false,
                },
                error: null,
            },
            communicationOptions: {
                value: [],
                validation: {
                    presence: false,
                },
                error: null,
            },
            communicationOptionsOther: {
                value: null,
                validation: {
                    presence: false,
                    length: {
                        maximum: 25,
                        message: 'must be less than 25 characters',
                      },
                },
                error: null,
            },
            TOSAgreement: {
                value: null,
                validation: {
                  presence: {
                    message: "^This field is required",
                  },
                },
                error: null,
            },
        },
        validation: {
            error: null,
        },
    }

    init() {
        this.resetForm();
    }

    @action
    resetForm() {
        this.form = Object.assign({}, this.defaultForm);
    }

    @action
    onFieldChange = (field, value) => {
        if (value === '') {
            value = null;
        }
        this.form.fields[field].value = value;
        this.validateField(field);
    };

    @action
    validateField = (field) => {
        let data = {}; // The data to validate
        data[field] = this.form.fields[field].value;
        let validationRules = {}; // The rules to use in validation
        validationRules[field] = this.form.fields[field].validation;
        let err = validate(data, validationRules);

        // Update error message
        if (err !== undefined) {
            this.form.fields[field].error = err[field][0];
        }
        else {
            this.form.fields[field].error = null;
        }

        if (field === 'paymentOptionsOther') {
            this.validateOptionsWithOther('paymentOptions', 'paymentOptionsOther');
        }
        if (field === 'foodOptionsOther') {
            this.validateOptionsWithOther('foodOptions', 'foodOptionsOther');
        }
        if (field === 'communicationOptionsOther') {
            this.validateOptionsWithOther('communicationOptions', 'communicationOptionsOther');
        }
    }

    @action
    validateAll = () => {
        Object.keys(this.form.fields).map(this.validateField);

        // Start off assuming no errors are present
        this.form.validation.error = null;
        /*
        let data = getFlattenedValues(this.form, 'value');
        let validationRules = getFlattenedValues(this.form, 'validation');
        this.form.validation.error = validate(data, validationRules);
        */
       Object.keys(this.form.fields).forEach( (field) => {
           if (this.form.fields[field].error) {
                this.form.validation.error = this.form.fields[field].error;
           }
       })

        // Do the options
        this.validateOptionsWithOther('paymentOptions', 'paymentOptionsOther');
        if (this.form.fields['paymentOptions'].error) {
            this.form.validation.error = this.form.fields['paymentOptions'].error;
        }
        this.validateOptionsWithOther('foodOptions', 'foodOptionsOther');
        if (this.form.fields['foodOptions'].error) {
            this.form.validation.error = this.form.fields['foodOptions'].error;
        }
        this.validateOptionsWithOther('communicationOptions', 'communicationOptionsOther');
        if (this.form.fields['communicationOptions'].error) {
            this.form.validation.error = this.form.fields['communicationOptions'].error;
        }
    }

    @action
    onCheckboxChange = (field, subfield) => {
        var index = this.form.fields[field].value.indexOf(subfield);
        if (index > -1) {
            this.form.fields[field].value.splice(index, 1);
        }
        else {
            this.form.fields[field].value.push(subfield);
        }
        this.validateOptionsWithOther(field, field + 'Other');
    }

    @action
    validateOptionsWithOther = (field1, field2) => {
        if (this.form.fields[field1].value.length === 0 && !this.form.fields[field2].value) {
            this.form.fields[field1].error = 'Please make a selection.';
            return false;
        } 
        else {
            this.form.fields[field1].error = null;
            return true;
        }
    }

    @action
    prepareEntity() {
        let data = getFlattenedValues(this.form, 'value');
        if (data['paymentOptionsOther']) {
            data['paymentOptions'].push(data['paymentOptionsOther']);
        }
        delete data['paymentOptionsOther'];
        if (data['foodOptionsOther']) {
            data['foodOptions'].push(data['foodOptionsOther']);
        }
        delete data['foodOptionsOther'];
        if (data['communicationOptionsOther']) {
            data['communicationOptions'].push(data['communicationOptionsOther']);
        }
        delete data['communicationOptionsOther'];
        let business = new Business(data.city, data.closing, data.communicationOptions, data.description,
                                    data.email, data.foodOptions, data.name, data.opening, data.paymentOptions,
                                    undefined, data.phone, data.state, data.streetAddress, userStore.user.uid, data.zipcode);
        return business;
    }

    @action
    async createEntity() {
        if (!userStore.isAuthenticated) {
            throw new Error('User is not logged in');
        }
        this.validateAll();
        if (this.form.validation.error) {
            throw new Error('Form failed validation.');
        }

        let business = this.prepareEntity();
        let uid = userStore.user.uid;
        await DatabaseClient.createBusiness(uid, business, this.form.fields.picture.value);
        let user = await DatabaseClient.getUser(uid); // Retrieve the user to prevent any tampering
        user.initialized = true;
        user.firstName = this.form.fields.firstName.value;
        user.lastName = this.form.fields.lastName.value;
        await DatabaseClient.updateUser(user);
        userStore.setUser(user);
    }
}

let surveyStore = new SurveyStore();
surveyStore.resetForm();
export default surveyStore;