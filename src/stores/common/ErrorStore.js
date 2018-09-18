import { action, observable, computed } from 'mobx'
import DatabaseClient from '../../core/DatabaseClient'
import { userStore } from '../index';

class ErrorStore {
    async reportError(error, info) {
        let user = userStore.user;
        let uid = user ? user.uid : null;
        await DatabaseClient.reportError(uid, error, info);
    }
}

export default new ErrorStore()
