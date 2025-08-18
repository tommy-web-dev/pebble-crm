import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
// import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
    apiKey: "AIzaSyDipdhvekxXjwUGB3lhFRlCFsMsneBUvIc",
    authDomain: "pebble-99673.firebaseapp.com",
    projectId: "pebble-99673",
    storageBucket: "pebble-99673.firebasestorage.app",
    messagingSenderId: "680621796802",
    appId: "1:680621796802:web:2a7e773b5822b463b733cf",
    measurementId: "G-N1FNRPJ8K4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app);
// const analytics = getAnalytics(app);

export { auth, db, functions }; 