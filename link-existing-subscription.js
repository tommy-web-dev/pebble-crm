// Quick script to link existing Stripe subscription to Firebase user
// Run this once to establish the connection

// Load environment variables
require('dotenv').config({ path: './firebase-config.env' });

const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
    });
}

const db = admin.firestore();

async function linkExistingSubscription() {
    try {
        const email = 'tom.williams5@gmail.com';
        const stripeCustomerId = 'cus_StZNDGCSBHo8jj'; // Your existing Stripe customer ID

        console.log(`Linking Stripe customer ${stripeCustomerId} to Firebase user with email ${email}`);

        // Find user document with this email
        const userQuery = await db.collection('users').where('email', '==', email).get();

        if (userQuery.empty) {
            console.log('❌ No user found with email:', email);
            return;
        }

        // Update the user document
        const userDoc = userQuery.docs[0];
        const userId = userDoc.id;

        await db.collection('users').doc(userId).update({
            stripeCustomerId: stripeCustomerId,
            updatedAt: new Date()
        });

        console.log(`✅ Successfully linked Stripe customer ${stripeCustomerId} to Firebase user ${userId}`);
        console.log('🔄 Now the webhook can sync your subscription data automatically!');

    } catch (error) {
        console.error('❌ Error linking subscription:', error);
    }
}

linkExistingSubscription(); 