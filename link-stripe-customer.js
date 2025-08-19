// Simple script to link Stripe customer to Firebase user
// Run this once to establish the connection

const admin = require('firebase-admin');

// Initialize Firebase Admin (you'll need to set environment variables)
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

async function linkStripeCustomer() {
    try {
        const email = 'tom.williams5@gmail.com';
        const stripeCustomerId = 'YOUR_STRIPE_CUSTOMER_ID'; // Replace with actual customer ID

        // Find user documents with this email
        const userQuery = await db.collection('users').where('email', '==', email).get();

        if (userQuery.empty) {
            console.log('No user found with email:', email);
            return;
        }

        // Update the most recent user document
        const userDoc = userQuery.docs[0];
        const userId = userDoc.id;

        await db.collection('users').doc(userId).update({
            stripeCustomerId: stripeCustomerId,
            updatedAt: new Date()
        });

        console.log(`Successfully linked Stripe customer ${stripeCustomerId} to user ${userId}`);

    } catch (error) {
        console.error('Error linking Stripe customer:', error);
    }
}

linkStripeCustomer(); 