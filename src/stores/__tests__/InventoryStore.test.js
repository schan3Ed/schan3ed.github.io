import { inventoryStore } from '../';
import moment from 'moment';
import { FoodUnits } from '../../core/core';

jest.mock('../../core/firebase/firebase', () => {
    //Initialize everything in here
    const firebasemock = require('firebase-mock');
    const mockdatabase = new firebasemock.MockFirebase();
    const mockauth = new firebasemock.MockFirebase();
    const mocksdk = new firebasemock.MockFirebaseSdk(path => {
        return path ? mockdatabase.child(path) : mockdatabase;
    }, () => {
        return mockauth;
    });
  
    //Initialize app
    // can take a path arg to database url
    const firebaseApp = mocksdk.initializeApp(); 
  
    // return the mock to match your export signature
    return {
      fb: mocksdk,
      db: firebaseApp.firestore(), // mockdatabase
      auth: firebaseApp.auth(), // mockauth
      storage: firebaseApp.storage()
    };
});

describe('InventoryStore', () => {
    it('resets the form', () => {
        inventoryStore.resetForm();
        expect(inventoryStore.form).toEqual(inventoryStore.defaultForm);
    });

    it('changes the name', () => {
        // Null
        inventoryStore.onFieldChangeAddDeal('name', null);
        expect(inventoryStore.form.fields.name.error).toEqual("Name can't be blank");
        
        /*-----BVA-----*/

        // Length: 0
        inventoryStore.onFieldChangeAddDeal('name', '');
        expect(inventoryStore.form.fields.name.value).toEqual(null);
        expect(inventoryStore.form.fields.name.error).toEqual("Name can't be blank");
        
        // Length: 1
        inventoryStore.onFieldChangeAddDeal('name', 'B');
        expect(inventoryStore.form.fields.name.error).toEqual(null);

        // Length: 49
        inventoryStore.onFieldChangeAddDeal('name', 'BananasBananasBananasBananasBananasBananasBananas');
        expect(inventoryStore.form.fields.name.error).toEqual(null);

        // Length: 50
        inventoryStore.onFieldChangeAddDeal('name', 'BananasBananasBananasBananasBananasBananasBananass');
        expect(inventoryStore.form.fields.name.error).toEqual(null);

        // Length: 51
        inventoryStore.onFieldChangeAddDeal('name', 'BananasBananasBananasBananasBananasBananasBananasss');
        expect(inventoryStore.form.fields.name.error).toEqual('Name ' + inventoryStore.form.fields.name.validation.length.message);

        // Set the actual name
        inventoryStore.onFieldChangeAddDeal('name', 'Bananas');
        expect(inventoryStore.form.fields.name.error).toEqual(null);
    });

    it('changes the quantity', () => {
        inventoryStore.onFieldChangeAddDeal('quantity', null);
        expect(inventoryStore.form.fields.quantity.error).toEqual("Quantity can't be blank");
        /*-----BVA-----*/
        inventoryStore.onFieldChangeAddDeal('quantity', -1);
        expect(inventoryStore.form.fields.quantity.error).toEqual('Quantity ' + inventoryStore.form.fields.quantity.validation.numericality.message);
        inventoryStore.onFieldChangeAddDeal('quantity', 0);
        expect(inventoryStore.form.fields.quantity.error).toEqual('Quantity ' + inventoryStore.form.fields.quantity.validation.numericality.message);
        inventoryStore.onFieldChangeAddDeal('quantity', 1);
        expect(inventoryStore.form.fields.quantity.error).toEqual(null);

        /*-----Equivalence classes-----*/
        inventoryStore.onFieldChangeAddDeal('quantity', 0.5);
        expect(inventoryStore.form.fields.quantity.error).toEqual('Quantity ' + inventoryStore.form.fields.quantity.validation.numericality.message);
        inventoryStore.onFieldChangeAddDeal('quantity', 'Strings!');
        expect(inventoryStore.form.fields.quantity.error).toEqual('Quantity ' + inventoryStore.form.fields.quantity.validation.numericality.message);
        
        // Accepted value
        inventoryStore.onFieldChangeAddDeal('quantity', 20);
        expect(inventoryStore.form.fields.quantity.error).toEqual(null);
    });

    it('changes the useByDate', () => {
        /*-----EC-----*/
        inventoryStore.onFieldChangeAddDeal('useByDate', null);
        expect(inventoryStore.form.fields.useByDate.error).toEqual("Use by date can't be blank");
        inventoryStore.onFieldChangeAddDeal('useByDate', 'Asdf');
        expect(inventoryStore.form.fields.useByDate.error).toEqual("Use by date must be a valid date");
        inventoryStore.onFieldChangeAddDeal('useByDate', 3);
        expect(inventoryStore.form.fields.useByDate.error).toEqual("Use by date must be a valid date");
        inventoryStore.onFieldChangeAddDeal('useByDate', '2080-02-29'); // Leap year
        expect(inventoryStore.form.fields.useByDate.error).toEqual(null);
        inventoryStore.onFieldChangeAddDeal('useByDate', '2079-02-29'); // Not a leap year
        expect(inventoryStore.form.fields.useByDate.error).toEqual("Use by date must be a valid date");
        
        /*-----BVA-----*/
        const yesterday = moment().add(-1, 'd').format('YYYY-MM-DD');
        const today = moment().format('YYYY-MM-DD');
        const tomorrow = moment().add(1, 'd').format('YYYY-MM-DD');
        inventoryStore.onFieldChangeAddDeal('useByDate', yesterday);
        expect(inventoryStore.form.fields.useByDate.error).toEqual("Use by date must be no earlier than " + today);
        inventoryStore.onFieldChangeAddDeal('useByDate', today);
        expect(inventoryStore.form.fields.useByDate.error).toEqual(null);
        inventoryStore.onFieldChangeAddDeal('useByDate', tomorrow);
        expect(inventoryStore.form.fields.useByDate.error).toEqual(null);
    });

    it('changes the quantity unit', () => {
        /*-----EC-----*/
        inventoryStore.onFieldChangeAddDeal('quantityUnit', '');
        expect(inventoryStore.form.fields.quantityUnit.error).toEqual("Quantity unit can't be blank");
        let unit = Object.values(FoodUnits)[0];
        let badUnit = 'Bad unit';
        inventoryStore.onFieldChangeAddDeal('quantityUnit', badUnit);
        expect(inventoryStore.form.fields.quantityUnit.error).toEqual(badUnit + ' is not included in the list');
        inventoryStore.onFieldChangeAddDeal('quantityUnit', unit);
        expect(inventoryStore.form.fields.quantityUnit.error).toEqual(null);
    });

    it('changes the price', () => {
        inventoryStore.onFieldChangeAddDeal('price', null);
        expect(inventoryStore.form.fields.price.error).toEqual("Price can't be blank");
        /*-----BVA-----*/
        inventoryStore.onFieldChangeAddDeal('price', -1 + '');
        expect(inventoryStore.form.fields.price.error).toEqual('Price must be greater than 0');
        inventoryStore.onFieldChangeAddDeal('price', 0 + '');
        expect(inventoryStore.form.fields.price.error).toEqual('Price must be greater than 0');
        inventoryStore.onFieldChangeAddDeal('price', 1 + '');
        expect(inventoryStore.form.fields.price.error).toEqual(null);

        /*-----Equivalence Classes-----*/
        inventoryStore.onFieldChangeAddDeal('price', 'Strings!');
        expect(inventoryStore.form.fields.price.error).toEqual(`Price is not a number`);
        inventoryStore.onFieldChangeAddDeal('price', 3.22); // Price must be a string number a number - validate.js's fault
        expect(inventoryStore.form.fields.price.error).toEqual(`Price ${inventoryStore.form.fields.price.value} must be in the format $X.YZ`);

        // Accepted value
        inventoryStore.onFieldChangeAddDeal('price', 3.22 + '');
        expect(inventoryStore.form.fields.price.error).toEqual(null);
    });

    it('changes the price unit', () => {
        /*-----EC-----*/
        inventoryStore.onFieldChangeAddDeal('priceUnit', '');
        expect(inventoryStore.form.fields.priceUnit.error).toEqual("Price unit can't be blank");
        let unit = Object.values(FoodUnits)[0];
        let badUnit = 'Bad unit';
        inventoryStore.onFieldChangeAddDeal('priceUnit', badUnit);
        expect(inventoryStore.form.fields.priceUnit.error).toEqual(badUnit + ' is not included in the list');
        inventoryStore.onFieldChangeAddDeal('priceUnit', unit);
        expect(inventoryStore.form.fields.priceUnit.error).toEqual(null);
    });

    it('changes isOrganic', () => {
        inventoryStore.onFieldChangeAddDeal('isOrganic', null);
        expect(inventoryStore.form.fields.isOrganic.error).toEqual("Is organic can't be blank");
        inventoryStore.onFieldChangeAddDeal('isOrganic', 3);
        expect(inventoryStore.form.fields.isOrganic.error).toEqual(inventoryStore.form.fields.isOrganic.value + " is not included in the list");
        inventoryStore.onFieldChangeAddDeal('isOrganic', false);
        expect(inventoryStore.form.fields.isOrganic.error).toEqual(null);
    });

    it('changes isLocallyGrown', () => {
        inventoryStore.onFieldChangeAddDeal('isLocallyGrown', null);
        expect(inventoryStore.form.fields.isLocallyGrown.error).toEqual("Is locally grown can't be blank");
        inventoryStore.onFieldChangeAddDeal('isLocallyGrown', 3);
        expect(inventoryStore.form.fields.isLocallyGrown.error).toEqual(inventoryStore.form.fields.isLocallyGrown.value + " is not included in the list");
        inventoryStore.onFieldChangeAddDeal('isLocallyGrown', false);
        expect(inventoryStore.form.fields.isLocallyGrown.error).toEqual(null);
    });

    it('changes delivery', () => {
        const fieldName = 'delivery';
        const field = inventoryStore.form.fields[fieldName];
        inventoryStore.onFieldChangeAddDeal(fieldName, false);
        expect(field.error).toEqual('Item must be available for either pickup, delivery, or both');
    })

    it('changes pickup', () => {
        const fieldName = 'pickup';
        const field = inventoryStore.form.fields[fieldName];
        inventoryStore.onFieldChangeAddDeal(fieldName, false);
        expect(field.error).toEqual('Item must be available for either pickup, delivery, or both');
        inventoryStore.onFieldChangeAddDeal(fieldName, true);
        expect(field.error).toEqual(null);
    })

    it('changes reason for post', () => {
        
    })
});