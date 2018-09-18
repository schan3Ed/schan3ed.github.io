import { action, observable, computed } from 'mobx'
import DatabaseClient from '../../core/DatabaseClient'
import { userStore } from '../index';

class NotificationStore {
    @observable notifications = [];

    init() {
        if (!userStore.isAuthenticated) {
            return;
        }
        let uid = userStore.user.uid;
        // This will fire once for each value already in the notifications
        // collection and thereby properly initialize data for us
        DatabaseClient.removeNotificationListener();
        this.notifications.replace([]);
        DatabaseClient.setNotificationListener(uid,
            (newNotification) => {
                this.addNotification(newNotification);
            },
            (updatedNotification) => {
                // Don't do anything
                // this.updateNotification(updatedNotification);
            },
            (oldNotification) => {
                this.removeNotification(oldNotification['id']);
            });
    }

    @action
    addNotification(notification) {
        let i = 0;
        for (i = 0; i < this.notifications.length; i++) {
            if (this.notifications[i].timestamp < notification.timestamp) {
                break;
            }
        }
        this.notifications.splice(i, 0, notification);
    }

    @action
    updateNotification(notification) {
        let idx = this.indexOfNotification(notification['id']);
        if (idx > -1) {
            this.notifications[idx] = notification;
            return true;
        }
        return false;
    }

    @action
    removeNotification(notificationID) {
        let idx = this.indexOfNotification(notificationID);
        if (idx > -1) {
            this.notifications.splice(idx, 1);
            return true;
        }
        return false;
    }
    
    indexOfNotification(notificationID) {
        for (let i = 0; i < this.notifications.length; i++) {
            if (this.notifications[i]['id'] === notificationID) {
                return i;
            }
        }
        return -1;
    }
    
    @action
    async markAsRead(notificationID) {
        let uid = userStore.user.uid;
        await DatabaseClient.markNotificationAsRead(uid, notificationID)
    }
    
    @action
    clearNotifications() {
        let promiseList = [];
        for(let i = this.notifications.length-1; i>=0;i--){
            promiseList.push( this.markAsRead(this.notifications[i]['id']) );
        }
        return Promise.all(promiseList)
    }
    // TODO: remove notifications after they are unread and X old
}

export default new NotificationStore()
