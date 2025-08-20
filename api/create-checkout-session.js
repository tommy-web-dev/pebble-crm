const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const admin = require('firebase-admin');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    console.log('Initializing Firebase Admin...');

    // Convert the private key from \n format to actual newlines
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;
    
    console.log('=== PRIVATE KEY DEBUG START ===');
    console.log('Original private key length:', privateKey.length);
    console.log('Original private key starts with:', privateKey.substring(0, 100));
    console.log('Original private key ends with:', privateKey.substring(privateKey.length - 100));
    
    // Remove any surrounding quotes (single or double)
    privateKey = privateKey.replace(/^["']|["']$/g, '');
    
    // Remove any invisible Unicode characters
    privateKey = privateKey.replace(/[\u200B-\u200D\uFEFF]/g, '');
    
    // Convert various line ending formats to actual newlines
    privateKey = privateKey.replace(/\\r\\n/g, '\n');  // Windows line endings
    privateKey = privateKey.replace(/\\n/g, '\n');     // Unix line endings
    privateKey = privateKey.replace(/\\r/g, '\n');     // Old Mac line endings
    
    // Remove any extra whitespace and normalize
    privateKey = privateKey.trim();
    
    // Ensure proper PEM format
    if (!privateKey.startsWith('-----BEGIN PRIVATE KEY-----')) {
        throw new Error('Invalid private key format: missing BEGIN marker');
    }
    if (!privateKey.endsWith('-----END PRIVATE KEY-----')) {
        throw new Error('Invalid private key format: missing END marker');
    }
    
    // Count the lines to ensure proper PEM structure
    const lines = privateKey.split('\n');
    if (lines.length < 3) {
        throw new Error('Invalid private key format: insufficient lines');
    }
    
    console.log('=== PRIVATE KEY DEBUG END ===');
    console.log('Processed private key length:', privateKey.length);
    console.log('Processed private key starts with:', privateKey.substring(0, 100));
    console.log('Processed private key ends with:', privateKey.substring(privateKey.length - 100));
    console.log('Private key contains newlines:', privateKey.includes('\n'));
    console.log('Private key line count:', lines.length);
    console.log('First line:', lines[0]);
    console.log('Last line:', lines[lines.length - 1]);

    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: privateKey,
        }),
        databaseURL: process.env.FIREBASE_DATABASE_URL,
    });
    console.log('Firebase Admin initialized successfully');
}

const db = admin.firestore();

module.exports = async function handler(req, res) {
    // Handle CORS preflight request
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', 'https://www.pebblecrm.app');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Set CORS headers for actual request
    res.setHeader('Access-Control-Allow-Origin', 'https://www.pebblecrm.app');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    try {
        // Debug: Log environment variables (without sensitive data)
        console.log('Environment check:', {
            hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
            hasFirebaseProjectId: !!process.env.FIREBASE_PROJECT_ID,
            hasFirebaseClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
            hasFirebasePrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
            hasFirebaseDatabaseUrl: !!process.env.FIREBASE_DATABASE_URL
        });

        const { interval, successUrl, cancelUrl, userId, userEmail } = req.body;

        if (!userId || !userEmail) {
            return res.status(400).json({ error: 'User ID and email are required' });
        }

        console.log(`Creating checkout session for user ${userId} with email ${userEmail}`);

        // Test Firebase Admin connection first
        try {
            console.log('Testing Firebase Admin connection...');
            const testDoc = await db.collection('users').doc('test').get();
            console.log('Firebase Admin connection successful');
        } catch (firebaseError) {
            console.error('Firebase Admin connection failed:', firebaseError);
            return res.status(500).json({
                error: 'Firebase connection failed',
                details: firebaseError.message
            });
        }

        // Check if user already has a Stripe customer ID
        const userDoc = await db.collection('users').doc(userId).get();
        let stripeCustomerId = null;

        if (userDoc.exists()) {
            const userData = userDoc.data();
            stripeCustomerId = userData.stripeCustomerId;
            console.log(`User ${userId} has existing Stripe customer ID: ${stripeCustomerId}`);
        }

        // Create or retrieve Stripe customer
        let customer;
        if (stripeCustomerId) {
            // Use existing customer
            customer = await stripe.customers.retrieve(stripeCustomerId);
            console.log(`Using existing Stripe customer: ${customer.id}`);
        } else {
            // Create new customer
            customer = await stripe.customers.create({
                email: userEmail,
                metadata: {
                    firebaseUserId: userId
                }
            });
            console.log(`Created new Stripe customer: ${customer.id}`);

            // Update Firebase user with Stripe customer ID
            await db.collection('users').doc(userId).update({
                stripeCustomerId: customer.id,
                updatedAt: new Date()
            });
            console.log(`Linked Stripe customer ${customer.id} to Firebase user ${userId}`);
        }

        // Create checkout session
        // Note: Replace 'price_1RxmEvJp0yoFovcO59Esb7f5' with your actual Stripe price ID
        // You can find this in your Stripe Dashboard under Products > Pricing
        const session = await stripe.checkout.sessions.create({
            customer: customer.id,
            mode: 'subscription',
            payment_method_types: ['card'],
            billing_address_collection: 'auto',
            line_items: [
                {
                    price: process.env.STRIPE_PRICE_ID || 'price_1RxmEvJp0yoFovcO59Esb7f5',
                    quantity: 1,
                },
            ],
            success_url: successUrl || `${req.headers.origin}/dashboard`,
            cancel_url: cancelUrl || `${req.headers.origin}/`,
            subscription_data: {
                trial_period_days: 7, // 7-day free trial
            },
            metadata: {
                firebaseUserId: userId,
                userEmail: userEmail
            }
        });

        console.log(`Created checkout session ${session.id} for customer ${customer.id}`);

        res.status(200).json({
            url: session.url,
            sessionId: session.id,
            customerId: customer.id
        });

    } catch (error) {
        console.error('Error creating checkout session:', error);
        console.error('Error details:', {
            message: error.message,
            type: error.type,
            code: error.code,
            stack: error.stack
        });

        // Return more specific error information
        if (error.type === 'StripeCardError') {
            res.status(400).json({ error: 'Card error: ' + error.message });
        } else if (error.type === 'StripeInvalidRequestError') {
            res.status(400).json({ error: 'Invalid request: ' + error.message });
        } else if (error.type === 'StripeAPIError') {
            res.status(500).json({ error: 'Stripe API error: ' + error.message });
        } else {
            res.status(500).json({ error: 'Failed to create checkout session: ' + error.message });
        }
    }
}; 