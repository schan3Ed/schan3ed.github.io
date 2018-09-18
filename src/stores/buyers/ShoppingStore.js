import { action, observable, computed } from 'mobx'
import { userStore } from '..'
import DatabaseClient from '../../core/DatabaseClient'
import { shoppingCartStore } from '..'
import moment from 'moment';
import validate from 'validate.js'

/**
 * Store that holds data for the buyer views.  Stores the deals that are
 * available for the buyer to see.  Manages the shopping cart and the
 * checkout process
 * 
 * Usage:
 * Use @inject('shoppingStore')
 * Retrieve deals asynchronously with getDeals()
 * If you wish to observe the deals property, shoppingStore must be initialized first.
 * For example, init() can be called during componentDidMount():
 * ================================
 * state = {
 *  isLoading: true  // Turn on a loading spinner until shoppingStore has been initialized
 * }
 * 
 * async componentDidMount() {
 *  await shoppingStore.init()
 *  this.setState({isLoading: false}); // Turn off the loading spinner
 *  // Now you can access shoppingStore.deals
 * }
 * 
 * render() {
 *  return (this.state.isLoading ? <LoadingSpinner /> : <everything-else>)
 * }
 * ================================
 */
class ShoppingStore {
  /**
   * See core.js for the data format of deals
   */
  @observable deals = null

  /**
   * Form to fill in to request an item
   */
  @observable form = null
  defaultForm = {
    fields: {
      quantityRequested: {
        value: 0,
        validation: {
          numericality: {
            isInteger: true,
            greaterThan: 0,
          },
        },
        error: null,
      },
      needByDate: {
        value: '',
        validation: {
          presence: {
            message: '^Need by Date is invalid'
          },
          datetime: {
            earliest: moment().format('YYYY-MM-DD'),
            dateOnly: true,
            message: '^Need by Date is invalid'
          },
        },
        error: null,
      },
      exchange: {
        value: '',
        validation: {
          presence: true,
          inclusion: {
            within: ['delivery', 'pickup']
          },
        },
        error: null,
      },
    },
    validation: {
      error: null,
    }
  }

  constructor() {
    this.resetForm();
  }

  @action
  async addToShoppingCart(dealID) {
    if (!this.validateAll()) {
      throw new Error('The fields are invalid');
    }
    
    /*
    if (pickupAvailable && !deliveryAvailable) {
      exchange = 'pickup';
    }
    else if (deliveryAvailable && !pickupAvailable) {
      exchange = 'delivery'
    }
    */
    await shoppingCartStore.addToShoppingCart(dealID, this.form.fields.quantityRequested.value, this.form.fields.needByDate.value, this.form.fields.exchange.value);
  }

  @action
  onFieldChange = (field, value) => {
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
      throw new Error(err[field][0]);
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

  resetForm() {
    this.form = Object.assign({}, this.defaultForm);
  }

  async init() {
    await this.refresh();
  }

  @action
  async refresh() {
    let user = userStore.user;
    if (userStore.user === null) {
      throw new Error('No user is logged in.');
    }
    let _deals = await DatabaseClient.getDealsForBuyer(user.uid);
    for (let i = 0; i < _deals.length; i++) {
      /*
      if (!('picture' in _deals[i])) {
        _deals[i]['picture'] = 'https://firebasestorage.googleapis.com/v0/b/getfreshspired.appspot.com/o/images%2Fdeals%2Fcart_empty_icon.png?alt=media&token=9a878b4f-3f11-4461-8fe7-67f4be8fef49';
      }
      */
    }
    this.deals = _deals;
  }

  @action
  async getAll() {
    await this.refresh();
    return this.deals;
  }

  getIndexOfDeal(dealID) {
    for (let i = 0; i < this.deals.length; i++) {
      if (this.deals[i]['id'] == dealID) {
        return i;
      }
    }
    return -1;
  }

  getDeal(dealID) {
    let index = this.getIndexOfDeal(dealID);
    if (index > -1) {
      return this.deals[index];
    }
    else {
      return null;
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
export default new ShoppingStore()
