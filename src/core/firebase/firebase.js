import firebase from 'firebase';
import 'firebase/database';
import 'firebase/auth';
import 'firebase/storage';
import 'firebase/firestore';

const stagingConfig = {
    apiKey: "AIzaSyAeLr3EbmZnTFqKJ7dVeIFgehHodaHh4sg",
    authDomain: "freshspire-staging.firebaseapp.com",
    databaseURL: "https://freshspire-staging.firebaseio.com",
    projectId: "freshspire-staging",
    storageBucket: "freshspire-staging.appspot.com",
    messagingSenderId: "463174640643"
}

const testConfig = {
  apiKey: "AIzaSyB_3lvZ6NnAaIGCUmXDTlLytw0hq81IH1s",
  authDomain: "freshspire-testing.firebaseapp.com",
  databaseURL: "https://freshspire-testing.firebaseio.com",
  projectId: "freshspire-testing",
  storageBucket: "freshspire-testing.appspot.com",
  messagingSenderId: "4008422115"
}

const config = stagingConfig;

//if (!firebase.apps.length) {
const fb =firebase.initializeApp(config);
//}
const auth = fb.auth();
//auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
const database = fb.database();
const storage = fb.storage();
const db = fb.firestore();

export {
  auth,
  database,
  storage,
  db
};
