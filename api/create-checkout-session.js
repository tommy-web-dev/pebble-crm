const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const admin = require('firebase-admin');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
        databaseURL: process.env.FIREBASE_DATABASE_URL,
    });
}

const db = admin.firestore();

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { interval, successUrl, cancelUrl, userId, userEmail } = req.body;

        if (!userId || !userEmail) {
            return res.status(400).json({ error: 'User ID and email are required' });
        }

        console.log(`Creating checkout session for user ${userId} with email ${userEmail}`);

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
        const session = await stripe.checkout.sessions.create({
            customer: customer.id,
            mode: 'subscription',
            payment_method_types: ['card'],
            billing_address_collection: 'auto',
            line_items: [
                {
                    price_data: {
                        unit_amount: interval === 'monthly' ? 500 : 5000, // £5 or £50 in pence
                        currency: 'gbp',
                        product_data: {
                            name: 'Pebble CRM - Professional Plan',
                            description: `Professional CRM plan (${interval})`,
                        },
                        recurring: {
                            interval: interval === 'monthly' ? 'month' : 'year',
                        },
                    },
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
        res.status(500).json({ error: 'Failed to create checkout session' });
    }
}; 