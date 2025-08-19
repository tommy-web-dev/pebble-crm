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

    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        // Verify webhook signature
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).json({ error: 'Webhook signature verification failed' });
    }

    console.log('Received webhook event:', event.type);

    try {
        switch (event.type) {
            case 'customer.subscription.created':
            case 'customer.subscription.updated':
                await handleSubscriptionChange(event.data.object);
                break;
            case 'customer.subscription.deleted':
                await handleSubscriptionCancellation(event.data.object);
                break;
            case 'invoice.payment_succeeded':
                await handlePaymentSuccess(event.data.object);
                break;
            case 'invoice.payment_failed':
                await handlePaymentFailure(event.data.object);
                break;
            case 'customer.updated':
                await handleCustomerUpdate(event.data.object);
                break;
            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        res.status(200).json({ received: true });
    } catch (error) {
        console.error('Error processing webhook:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
}

async function handleSubscriptionChange(subscription) {
    try {
        console.log(`Processing subscription ${subscription.id} for customer ${subscription.customer}`);

        // Find user by Stripe customer ID
        const userQuery = await db.collection('users').where('stripeCustomerId', '==', subscription.customer).get();

        if (userQuery.empty) {
            console.log(`No user found with Stripe customer ID: ${subscription.customer}`);
            return;
        }

        const userDoc = userQuery.docs[0];
        const userId = userDoc.id;

        // Create subscription data
        const subscriptionData = {
            stripeCustomerId: subscription.customer,
            stripeSubscriptionId: subscription.id,
            status: subscription.status,
            planName: 'Pebble CRM - Professional Plan',
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            trialStart: subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
            trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // Update user document
        await db.collection('users').doc(userId).update({
            subscription: subscriptionData,
            updatedAt: new Date()
        });

        console.log(`Updated subscription for user ${userId}: ${subscription.status}`);
    } catch (error) {
        console.error('Error handling subscription change:', error);
        throw error;
    }
}

async function handleSubscriptionCancellation(subscription) {
    try {
        console.log(`Processing subscription cancellation for customer ${subscription.customer}`);

        const userQuery = await db.collection('users').where('stripeCustomerId', '==', subscription.customer).get();

        if (userQuery.empty) {
            console.log(`No user found with Stripe customer ID: ${subscription.customer}`);
            return;
        }

        const userDoc = userQuery.docs[0];
        const userId = userDoc.id;

        await db.collection('users').doc(userId).update({
            'subscription.status': 'canceled',
            'subscription.updatedAt': new Date(),
            updatedAt: new Date()
        });

        console.log(`Cancelled subscription for user ${userId}`);
    } catch (error) {
        console.error('Error handling subscription cancellation:', error);
        throw error;
    }
}

async function handlePaymentSuccess(invoice) {
    try {
        console.log(`Processing payment success for customer ${invoice.customer}`);

        const userQuery = await db.collection('users').where('stripeCustomerId', '==', invoice.customer).get();

        if (userQuery.empty) {
            console.log(`No user found with Stripe customer ID: ${invoice.customer}`);
            return;
        }

        const userDoc = userQuery.docs[0];
        const userId = userDoc.id;

        await db.collection('users').doc(userId).update({
            'subscription.status': 'active',
            'subscription.updatedAt': new Date(),
            updatedAt: new Date()
        });

        console.log(`Payment succeeded for user ${userId}`);
    } catch (error) {
        console.error('Error handling payment success:', error);
        throw error;
    }
}

async function handlePaymentFailure(invoice) {
    try {
        console.log(`Processing payment failure for customer ${invoice.customer}`);

        const userQuery = await db.collection('users').where('stripeCustomerId', '==', invoice.customer).get();

        if (userQuery.empty) {
            console.log(`No user found with Stripe customer ID: ${invoice.customer}`);
            return;
        }

        const userDoc = userQuery.docs[0];
        const userId = userDoc.id;

        await db.collection('users').doc(userId).update({
            'subscription.status': 'past_due',
            'subscription.updatedAt': new Date(),
            updatedAt: new Date()
        });

        console.log(`Payment failed for user ${userId}`);
    } catch (error) {
        console.error('Error handling payment failure:', error);
        throw error;
    }
}

async function handleCustomerUpdate(customer) {
    try {
        console.log(`Processing customer update for ${customer.id}`);

        const userQuery = await db.collection('users').where('stripeCustomerId', '==', customer.id).get();

        if (userQuery.empty) {
            console.log(`No user found with Stripe customer ID: ${customer.id}`);
            return;
        }

        const userDoc = userQuery.docs[0];
        const userId = userDoc.id;

        // Update user with latest customer info
        const updateData = {
            updatedAt: new Date()
        };

        if (customer.email) {
            updateData.email = customer.email;
        }
        if (customer.name) {
            updateData.displayName = customer.name;
        }

        await db.collection('users').doc(userId).update(updateData);

        console.log(`Updated customer info for user ${userId}`);
    } catch (error) {
        console.error('Error handling customer update:', error);
        throw error;
    }
} 