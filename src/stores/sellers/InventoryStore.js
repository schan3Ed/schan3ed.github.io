import { action, observable , computed} from 'mobx'
import AuthManager from '../../core/AuthManager'
import DatabaseClient from '../../core/DatabaseClient'
import { ReasonForPostOptions, FoodOptions, FoodUnits } from '../../core/core';
import { getFlattenedValues } from '../FormHelper';
import moment from 'moment';
import validate from 'validate.js';
import firebase from 'firebase';
import { InventoryItem } from '../../core/model'
import { userStore } from '..';

class InventoryStore {
  @observable deals = null
  @observable currentDealID = null
  @observable form = null;
  defaultForm = {
    fields: {
      name: {
        value: null,
        validation: {
          presence: true,
          length: {
            minimum: 1,
            maximum: 50,
            message: 'is required and must be less than 50 characters',
          },
        },
        error: null,
      },
      quantity: {
        value: 1,
        validation: {
          presence: true,
          numericality: {
            onlyInteger: true,
            greaterThanOrEqualTo: 1,
            message: 'must be a whole number',
          },
        },
        error: null,
      },
      quantityUnit: {
        value: null,
        validation: {
          presence: true,
          inclusion: {
            within: Object.values(FoodUnits),
          },
        },
        error: null,
      },
      useByDate: {
        value: this.getCurrentDate(),
        validation: {
          presence: {
            message: '^Must be a valid date'
          },
          datetime: {
            earliest: moment().format('YYYY-MM-DD'),
            dateOnly: true,
            message: '^Must be no earlier than ' + moment().format('MM-DD-YYYY'),
          },
        },
        error: null,
      },
      price: {
        value: 0,
        validation: {
          presence: true,
          numericality: {
            greaterThan: 0
          },
          format: {
            pattern: "[0-9]+(\.[0-9]{1,2})?", //"[0-9]+(\.[0-9][0-9])",
            message: '%{value} must be in the format $X.YZ',
          },
        },
        error: null,
      },
      priceUnit: {
        value: null,
        validation: {
          presence: true,
          inclusion: {
            within: Object.values(FoodUnits),
          },
        },
        error: null,
      },
      isOrganic: {
        value: false,
        validation: {
          presence: true,
          inclusion: {
            within: [true, false],
          },
        },
        error: null,
      },
      isLocallyGrown: {
        value: false,
        validation: {
          presence: true,
          inclusion: {
            within: [true, false],
          },
        },
        error: null,
      },
      delivery: {
        value: false,
        validation: (() => {
          return {
            atLeastOneOf: {
              otherField: this.form.fields.pickup,
              message: '^Item must be available for either pickup, delivery, or both',
            },
            inclusion: {
              within: [true, false],
            },
          };
        }),
        error: null,
        
      },
      pickup: {
        value: false,
        validation: (() => {
          return {
            atLeastOneOf: {
              otherField: this.form.fields.delivery,
              message: '^Item must be available for either pickup, delivery, or both',
            },
            inclusion: {
              within: [true, false],
            },
          };
        }),
        error: null,
      },
      reasonForPost: {
        value: [],
        validation: {
          presence: false,
        },
        error: null,
      },
      reasonForPostOther: {
        value: null,
        validation: {
          presence: false,
          length: {
            maximum: 50,
            message: '^Must be less than 50 characters',
          },
        },
        error: null,
      },
      notes: {
        value: null,
        validation: {
          presence: false,
          length: {
            maximum: 300,
            message: 'must be less than 300 characters',
          },
        },
        error: null,
      },
      public: {
        value: false,
        validation: {
          presence: true,
          inclusion: {
            within: [true, false],
          },
        },
        error: null,
      },
      foodOption: {
        value: null,
        validation: {
          presence: {
            message: "^This field is required",
          },
          length: {
            minimum: 1,
            maximum: 25,
            message: '^This field is required and must be less than 25 characters',
          },
        },
        error: null,
      },
      pictures: {
        value: null,
        validation: {
          presence: false,
        },
        error: null,
      }
    },
    validation: {
      error: null,
    },
  }

  @action
  resetForm() {
    this.form = Object.assign({}, this.defaultForm);
  }

  @action
  onFieldChangeAddDeal = (field, value) => {
    // Go ahead and update the value
    // Treat empty strings as null
    if (value === '') {
      value = null;
    }
    this.form.fields[field].value = value;
    this.validateField(field);
  }
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
      return false;
    }
    else {
      this.form.fields[field].error = null;
      return true;
    }
  }

  @action
  validateAll = () => {
    // Start off assuming no errors are present
    this.form.validation.error = null;
    // let data = getFlattenedValues(this.form, 'value');
    //let validationRules = getFlattenedValues(this.form, 'validation');
    Object.keys(this.form.fields).forEach( (field) => {
      let validated = this.validateField(field);
      if (!validated) {
        this.form.validation.error = "Form failed validation.";
      }
    })
    return (this.form.validation.error === null);
    //this.form.validation.error = validate(data, validationRules);
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
  }


  getCurrentDate() {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; // January is 0!
    var yyyy = today.getFullYear();

    if(dd<10) {
        dd = '0'+dd
    } 

    if(mm<10) {
        mm = '0'+mm
    } 

    today = yyyy + '-' + mm + '-' + dd;
    return today;
  }

  constructor() {
    this.resetForm();
  }

  /**
   * Populates the deals observable with all the deals of the currently
   * logged in user.
   */
  async init() {
    // TODO: autopopulate the deals observable
    this.resetForm();
  }

  @action
  async refreshDeals() {
    let user = userStore.getUser();
    if (!user) {
      throw new Error('No user is logged in');
    }
    let _deals = await DatabaseClient.getDealsBySeller(user.uid);

    // Format deals properly
    _deals.forEach( (deal) => {
      // TODO: Allow multiple pictures
      /*
      if (!('picture' in deal)) {
        deal['picture'] = 'https://firebasestorage.googleapis.com/v0/b/getfreshspired.appspot.com/o/images%2Fdeals%2Fcart_empty_icon.png?alt=media&token=9a878b4f-3f11-4461-8fe7-67f4be8fef49';
      }
      */
      // Format price to be in format X.YZ
      // TODO: leave this to the view
      deal['price'] = Number.parseFloat(deal['price']);
    });
    this.deals = _deals;
  }

  @action
  async getDeals() {
    // Refresh the deals
    await this.refreshDeals();
    return this.deals;
  }

  /**
   * Prepares a deal object from the given form
   * @param {Object} form 
   * @return an object with the contents of the form and the pictures. 
   * The format is {deal: {}, pictures: <array>}, where pictures may or
   * may not exist depending on whether the user has uploaded pictures.
   */
  prepareDeal() {
    let user = userStore.getUser();
    if (!user) {
      throw new Error('No user is logged in');
    }
    let obj = {};
    let vals = getFlattenedValues(this.form, 'value');
    obj['deal'] = new InventoryItem(vals.delivery, vals.foodOption, undefined, vals.isLocallyGrown, vals.isOrganic, 
                                    vals.name, vals.notes, vals.pickup, undefined, parseFloat(vals.price), vals.priceUnit, vals.public,
                                    parseInt(vals.quantity), vals.quantityUnit, vals.reasonForPost, undefined, user.uid, vals.useByDate, undefined);
    console.log(vals.pictures);
    if (vals.pictures) {
      obj.pictures = [vals.pictures]; // TODO: integrate pictures with InventoryItem
    }
    if (vals.reasonForPostOther) {
      obj.deal.reasonForPost.push(vals.reasonForPostOther);
    }
    return obj;
  }

  /**
   * Creates a deal using all the fields in the form observable
   * @throws an error when the form fails to be validated or there is
   *  a problem during database insertion
   */
  @action
  async createDeal() {
    // Validate fields
    if (!this.validateAll()) {
      throw new Error('Form failed validation.');
    }
    let {deal, pictures} = this.prepareDeal();
    console.log('pictures',pictures)
    await DatabaseClient.createDeal(deal, pictures);
    this.resetForm();
  }

  @action
  loadDeal(dealID) {
    // Get the deal of interest
    for (let i = 0; i < this.deals.length; i++) {
      if (this.deals[i]['id'] === dealID) {
        let deal = Object.assign({}, this.deals[i]);
        let reasonsObj = Object.assign({}, ReasonForPostOptions);
        delete reasonsObj.OTHER;
        let reasons = Object.values(reasonsObj);
        if (deal['reasonForPost']) {
          for (let i = 0; i < deal['reasonForPost'].length; i++) {
            if (!reasons.includes(deal['reasonForPost'][i])) {
              // We have an 'Other' reason
              deal['reasonForPostOther'] = deal['reasonForPost'][i];
              deal['reasonForPost'].splice(i, 1);
            }
          }
        }
        if (deal['picture']) {
          deal['pictures'] = deal['picture'];
          delete deal['picture'];
        }
        else {
          deal['pictures'] = null;
        }

        // Populate the form with the given deal details
        Object.keys(this.form.fields).forEach( (field) => {
          this.form.fields[field].value = deal[field] !== undefined ? deal[field] : this.defaultForm.fields[field].value;
        });
        this.form.fields['price'].value = this.form.fields['price'].value.toFixed(2);
        this.resetErrors();
        this.currentDealID = dealID;
        return;
      }
    }
  }

  @action
  getDeal(dealID) {
    for (let i = 0; i < this.deals.length; i++) {
      if (this.deals[i]['id'] === dealID) {
        return this.deals[i];
      }
    }
  }

  @action
  async editDeal(dealID) {
    // Validate fields
    if (!this.validateAll()) {
      throw new Error('Form failed validation.');
    }
    let {deal, pictures} = this.prepareDeal();
    console.log('pictures',pictures)

    //Update the picture
    if (pictures && pictures.length !== 0) {
      if (typeof pictures[0] === 'string') {
        await DatabaseClient.editDeal(dealID, deal); // Just the OG picture. TODO: change this flaky logic
      }
      else { // TODO: actually check that these are files
        await DatabaseClient.editDeal(dealID, deal, pictures);
      }
    }
    else {
      await DatabaseClient.editDeal(dealID, deal, []);
    }
    this.resetForm();
  }

  @action
  resetErrors() {
    Object.keys(this.form.fields).forEach( (field) => {
      this.form.fields[field].error = null;
    });
    this.form.validation.error = null;
  }

  @action
  async archiveDeal(dealID) {
    await DatabaseClient.archiveDeal(dealID);
    for (let i = 0; i < this.deals.length; i++) {
      if (this.deals[i]['id'] === dealID) {
        this.deals.splice(i, 1);
        return;
      }
    }
  }
}

// Extend the validator with a way to validate datetimes
validate.extend(validate.validators.datetime, {
  parse: function(value, options) {
    return +moment.utc(value);
  },
  format: function(value, options) {
    var format = options.dateOnly ? "YYYY-MM-DD" : "YYYY-MM-DD hh:mm:ss";
    return moment.utc(value).format(format);
  }
});
validate.validators.atLeastOneOf = function(value, options, key, attributes) {
  if (value || options['otherField'].value) {
    options['otherField'].error = null;
    return null;
  }
  else {
    return options['message'];
  }
};
//inventoryStore.init();
export default new InventoryStore();