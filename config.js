import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';


const firebaseConfig = {
    apiKey: "AIzaSyBy6OgzOutIJ1EAFGgy1ExjnjByiO8chZg",
    authDomain: "book-f12a2.firebaseapp.com",
    projectId: "book-f12a2",
    storageBucket: "book-f12a2.appspot.com",
    messagingSenderId: "97654459996",
    appId: "1:97654459996:web:291b0cf265cb529a9f2099",
    measurementId: "G-ZTZ6RCFV4N"
    
}
if(!firebase.apps.length){
    firebase.initializeApp(firebaseConfig);
}
const storage = firebase.storage();

export { firebase, storage };

