import { observable } from 'mobx'

export default class Notification {
    @observable id
    @observable link
    @observable message
    @observable pictureURL
    @observable read
    @observable subject
    @observable timestamp

    constructor(id = null, link = null, message = null, pictureURL = null, read = false, subject = null, timestamp = 0) {
        this.id = id;
        this.link = link;
        this.message = message;
        this.pictureURL = pictureURL;
        this.read = read;
        this.subject = subject;
        this.timestamp = timestamp;
    }
}