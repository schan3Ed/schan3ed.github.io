import { observable } from 'mobx'

export default class UserSession {
    @observable notifications
    @observable pushToken
    
    constructor(notifications = [], pushToken = null) {
        this.notifications = notifications;
        this.pushToken = pushToken;
    }
}