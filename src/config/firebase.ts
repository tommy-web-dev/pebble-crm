import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { getAnalytics, isSupported } from 'firebase/analytics';

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

// Initialize analytics conditionally based on cookie consent
let analytics: any = null;

const initializeAnalytics = async () => {
    try {
        // Check if analytics are supported and cookies are accepted
        const analyticsSupported = await isSupported();
        const cookiesAccepted = localStorage.getItem('cookiesAccepted') === 'true';
        
        if (analyticsSupported && cookiesAccepted) {
            analytics = getAnalytics(app);
            console.log('Firebase Analytics enabled');
        } else {
            console.log('Firebase Analytics disabled - cookies not accepted or not supported');
        }
    } catch (error) {
        console.log('Firebase Analytics initialization failed:', error);
    }
};

// Initialize analytics on app start
initializeAnalytics();

export { auth, db, functions, app, analytics, initializeAnalytics }; 