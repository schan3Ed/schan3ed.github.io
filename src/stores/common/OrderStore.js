import { action, observable } from 'mobx'
import DatabaseClient from '../../core/DatabaseClient';
import { userStore } from '..'
import searchjs from 'searchjs'

class OrderStore {
  /**
   * Each of these arrays has elements of the following format
   * {
   *    business: Business
   *    orders: Array<Order>
   * }
   */
  @observable requests = []
  @observable ordersInProgress = []
  @observable ordersCompleted = []

  async init() {
    await this.refresh();
  }

  async getOrders(status) {
    let user = userStore.user;
    if (!user) {
      throw new Error('No user is logged in.');
    }

    let orders = null;
    if (user.isBuyer()) {
      orders = await DatabaseClient.getOrdersForBuyer(user.uid, status);
    }
    else { //Seller
      orders = await DatabaseClient.getOrdersForSeller(user.uid, status);
    }

    let items = {};
    for (let i = 0; i < orders.length; i++) {
      let order = orders[i];
      let uid = user.isBuyer() ? order['sellerUID'] : order['buyerUID'];
      if (items[uid]) {
        items[uid]['orders'].push(order);
        items[uid]['totalCost'] += order['totalCost'];
      }
      else {
        items[uid] = {
          business: user.isBuyer() ? order['seller'] : order['buyer'],
          orders: [order],
          totalCost: order['totalCost']
        }
      }
    }

    // Lastly, sort the business alphabetically
    let arr = Object.values(items);
    arr.sort((item1, item2) => { return item1.business.name.localeCompare(item2.business.name)})
    return arr;
  }

  @action
  async refreshAll() {
    let requestsPromise = this.getOrders('created');
    let ordersInProgressPromise = this.getOrders('accepted');
    let ordersCompletedPromise = this.getOrders('completed');

    let [requests, ordersInProgress, ordersCompleted] = await Promise.all([requestsPromise, ordersInProgressPromise, ordersCompletedPromise]);
    this.requests.replace(requests);
    this.ordersInProgress.replace(ordersInProgress);
    this.ordersCompleted.replace(ordersCompleted);
  }

  @action
  async refreshRequests() {
    let requests = await this.getOrders('created');
    this.requests.replace(requests);
  }

  @action
  async refreshOrdersInProgress() {
    let ordersInProgress = await this.getOrders('accepted');
    this.ordersInProgress.replace(ordersInProgress);
  }

  @action
  async refreshOrdersCompleted() {
    let ordersCompleted = await this.getOrders('completed');
    this.ordersCompleted.replace(ordersCompleted);
  }

  @action
  removeOrder(arr, orderID) {
    for (let i = 0; i < arr.length; i++) {
      for (let j = 0; j < arr[i].orders.length; j++) {
        if (arr[i].orders[j]['id'] === orderID) {
          if (arr[i].orders.length === 1) {
            arr.splice(i, 1);
            return;
          }
          else {
            let tc = arr[i].orders[j].totalCost;
            arr[i].orders.splice(j,1);
            arr[i].totalCost -= tc;
            return;
          }
        }
      }
    }
  }

  @action
  updateOrder(arr, orderID, field, value) {
    for (let i = 0; i < arr.length; i++) {
      for (let j = 0; j < arr[i].orders.length; j++) {
        if (arr[i].orders[j]['id'] === orderID) {
          arr[i].orders[j][field] = value;
        }
      }
    }
  }

  getOrder(arr, orderID) {
    for (let i = 0; i < arr.length; i++) {
      for (let j = 0; j < arr[i].orders.length; j++) {
        if (arr[i].orders[j]['id'] === orderID) {
          return arr[i].orders[j];
        }
      }
    }
    return null;
  }

  @action
  addOrder(arr, order) {
    for (let i = 0; i < arr.length; i++) {
      // See if the business already exists
      let businessUID = userStore.isBuyer ? order['sellerUID'] : order['buyerUID']
      if (arr[i]['business']['uid'] == businessUID) {
        // Add to the existing element
        arr[i]['orders'].push(order);
        arr[i].totalCost += order.totalCost;
        return;
      }
    }
    
    // Business not found
    arr.push({
      business: userStore.isBuyer ? order['seller'] : order['buyer'],
      orders: [order],
      totalCost: order.totalCost
    });
  }

  async moveOrder(oldArr, newArr, orderID) {
    let order = this.getOrder(oldArr, orderID);
    this.removeOrder(oldArr, orderID);
    this.addOrder(newArr, order);
  }

  async markAsExchanged(orderID) {
    await DatabaseClient.updateOrder(orderID, {exchangeStatus: true});
    this.updateOrder(this.ordersInProgress, orderID, 'exchangeStatus', true);
    let order = this.getOrder(this.ordersInProgress, orderID);
    if (order['exchangeStatus'] && order['paymentStatus']) {
      // await DatabaseClient.updateOrder(orderID, {status: "completed"}); -> This is handled by cloud functions
      // this.moveOrder(this.ordersInProgress, this.ordersCompleted, orderID);
      this.removeOrder(this.ordersInProgress, orderID);
    }
  }

  async markAllAsExchanged(orderIDs) {
    for (let i = 0; i < orderIDs.length; i++) {
      await this.markAsExchanged(orderIDs[i])
    }
  }

  async markAsPaid(orderID) {
    await DatabaseClient.updateOrder(orderID, {paymentStatus: true});
    this.updateOrder(this.ordersInProgress, orderID, 'paymentStatus', true);
    let order = this.getOrder(this.ordersInProgress, orderID);
    if (order['exchangeStatus'] && order['paymentStatus']) {
      // await DatabaseClient.updateOrder(orderID, {status: "completed"});
      //this.moveOrder(this.ordersInProgress, this.ordersCompleted, orderID);
      this.removeOrder(this.ordersInProgress, orderID);
    }
  }

  async markAllAsPaid(orderIDs) {
    for (let i = 0; i < orderIDs.length; i++) {
      await this.markAsPaid(orderIDs[i])
    }
  }

  async acceptRequest(orderID) {
    await DatabaseClient.acceptRequest(orderID);
    this.removeOrder(this.requests, orderID);
    //this.moveOrder(this.requests, this.ordersInProgress, orderID);

    //this.updateOrder(this.ordersInProgress, orderID, 'status', 'accepted');
  }

  async acceptRequests(orderIDs) {
    for (let i = 0; i < orderIDs.length; i++) {
      await this.acceptRequest(orderIDs[i]);
    }
  }

  async declineRequest(orderID) {
    await DatabaseClient.updateOrder(orderID, {status: "declined"});
    this.removeOrder(this.requests, orderID);

    // Refresh
    //await this.refreshAll();
  }

  async declineRequests(orderIDs) {
    for (let i = 0; i < orderIDs.length; i++) {
      await this.declineRequest(orderIDs[i]);
    }
  }

  async cancelRequest(orderID) {
    await DatabaseClient.updateOrder(orderID, {status: "cancelled"});
    //this.removeOrder(this.requests, orderID);
    this.removeOrder(this.requests, orderID);
    //await this.refreshAll();
  }

  async cancelRequests(orderIDs) {
    for (let i = 0; i < orderIDs.length; i++) {
      await this.cancelRequest(orderIDs[i]);
    }
  }

  async cancelOrder(orderID) {
    await DatabaseClient.updateOrder(orderID, {status: "cancelled"});
    //this.removeOrder(this.requests, orderID);
    this.removeOrder(this.ordersInProgress, orderID);
    //await this.refreshAll();
  }

  async cancelOrders(orderIDs) {
    for (let i = 0; i < orderIDs.length; i++) {
      await this.cancelOrder(orderIDs[i]);
    }
  }
}
export default new OrderStore();
