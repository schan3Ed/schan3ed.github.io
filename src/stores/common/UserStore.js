// @flow
import { action, observable, computed } from 'mobx'
import store from 'store'
import { shoppingCartStore, profileStore } from '..'
import DatabaseClient from '../../core/DatabaseClient'
import AuthManager from '../../core/AuthManager'
// import NotificationClient from '../../core/NotificationClient'
import { notificationStore } from '../'
import { User } from '../../core/model';

const FRESHSPIRE_USER = '__freshspire_user'

class UserStore {
  @observable user = null
  @computed get hasLoggedIn() {
    return (this.user !== null);
  }
  @computed get isSeller() {
    return (this.user !== null && this.user.isSeller())
  }
  @computed get isBuyer() {
    return (this.user !== null && this.user.isBuyer())
  }

  init() {
    if (this.user === null) {
      return;
    }
    shoppingCartStore.initializeShoppingCart();
    profileStore.init(this.user.uid);
    // TODO: enable push notifications
    // NotificationClient.initializeNotifications(this.user.uid);
    notificationStore.init();
  }

  @action
  initUser() {
    let data = store.get(FRESHSPIRE_USER);
    if (data) {
      let user = new User(data.email, data.initialized, data.firstName, data.lastName, data.type, data.uid);
      if (user.validate()) {
        this.user = user;
        this.init();
        return;
      }
    }

    // If validation fails or there is no current user, reset
    this.removeUser();
  }

  // Sign up the user
  @action
  async signUp(firstName, lastName, email, password) {
    if (this.hasLoggedIn) {
      throw new Error('User is already logged in');
    }
    let user = await AuthManager.signUp(firstName, lastName, email, password);
    this.setUser(user);
    //TODO: we don't know if they are a seller or buyer at this point yet
  }

  @action
  async logout() {
    await AuthManager.logout();
    DatabaseClient.removeAllListeners();
    this.removeUser();
  }

  @action
  async removeUser() {
    this.user = null;
    store.remove(FRESHSPIRE_USER);
    shoppingCartStore.resetShoppingCart();
  }

  @action
  setUser(user) {
    this.user = user;
    store.set(FRESHSPIRE_USER, this.user);
    this.init();
  }

  @action
  async getUserBusiness() {
    if (!this.user) {
      throw new Error('No user is logged in');
    }
    let businessInfo = await DatabaseClient.getBusiness(this.user.uid);
    return businessInfo;
  }

  @action
  async login(username, password) {
    let loggedInUser = await AuthManager.login(username, password);
    this.setUser(loggedInUser);
  }

  @action
  getUser() {
    return this.user;
  }

  @computed get isAuthenticated() {
    return (this.user !== null);
  }
}

export default new UserStore()
