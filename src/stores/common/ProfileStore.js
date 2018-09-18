import { action, observable, computed } from 'mobx'
import DatabaseClient from '../../core/DatabaseClient'

class ProfileStore {
    @observable business = null;

    @action
    async init(uid) {
        let businessInfo = await this.getBusiness(uid);
        this.business = businessInfo;
    }

    @action
    async getBusiness(uid) {
        let businessInfo = await DatabaseClient.getBusiness(uid);
        return businessInfo;
    }
}

export default new ProfileStore()
