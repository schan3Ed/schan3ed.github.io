import { action, observable, toJS } from 'mobx'
import DatabaseClient from '../../core/DatabaseClient';
import { userStore } from '..'
import moment from 'moment'

class InvoiceStore {
  /**
   * The data format of items is an array of elements of the type
   * {
   *    id: string (ID of the bundle)
   *    timestamp: number (date order bundle was placed)
   *    orders: Array<Order>
   *    totalCost: number
   *    business: Business
   * }
   */
  @observable items = []

  async init() {
    await this.refresh();
  }

  @action
  async refresh() {
    this.items = [];
    let user = userStore.user;
    if (!user) {
      throw new Error('No user is logged in.');
    }
    let bundles = user.isBuyer() ? await DatabaseClient.getOrderBundlesForBuyer(user.uid, ['accepted', 'completed']) : await DatabaseClient.getOrderBundlesForSeller(user.uid, ['accepted', 'completed']);
    this.items = bundles;
  }

  @action
  async getAll() {
    await this.refresh();
    return this.items;
  }
  
  @action
  async removeRequest(orderID) {
    for (let i = 0; i < this.items.length; i++) {
      for (let j = 0; j < this.items[i].requests.length; j++) {
        if (this.items[i].requests[j]['id'] === orderID) {
          this.items[i].requests.splice(j,1);
          j--;
        }
      }
      if (this.items[i].requests.length === 0) {
        this.items.splice(i, 1);
        i--;
      }
    }
  }
}
const invoiceStore = new InvoiceStore();
export default invoiceStore
