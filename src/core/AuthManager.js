// @flow
import { action, observable } from "mobx";
import { auth } from './firebase/firebase';
import firebase from 'firebase';
import DatabaseClient from './DatabaseClient';
import { User } from "./model";

class AuthManager {
    async sendPasswordResetEmail(email) {
        await auth.sendPasswordResetEmail(email);
    }

    async login(email, password) {
        let userCredential = await auth.signInWithEmailAndPassword(email, password);
        let user = await DatabaseClient.getUser(userCredential.uid);
        return user;
    }

    async logout() {
        await auth.signOut();
    }

    async signUp(firstName, lastName, email, password, type) {
        let userCredential = await auth.createUserWithEmailAndPassword(email, password);
        let user = new User(email, false, firstName, lastName, type, userCredential.uid);
        await DatabaseClient.createUser(user);
        return user;
    }
}

export default new AuthManager()