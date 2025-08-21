import Stripe from 'stripe';
import admin from 'firebase-admin';

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

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const sig = req.headers['stripe-signature'];
    let event;

    try {
        // Verify webhook signature
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).json({ message: 'Webhook signature verification failed' });
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed':
                await handleCheckoutSessionCompleted(event.data.object);
                break;

            case 'customer.subscription.created':
                await handleSubscriptionCreated(event.data.object);
                break;

            case 'customer.subscription.updated':
                await handleSubscriptionUpdated(event.data.object);
                break;

            case 'customer.subscription.deleted':
                await handleSubscriptionDeleted(event.data.object);
                break;

            case 'invoice.payment_succeeded':
                await handleInvoicePaymentSucceeded(event.data.object);
                break;

            case 'invoice.payment_failed':
                await handleInvoicePaymentFailed(event.data.object);
                break;

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        res.status(200).json({ received: true });
    } catch (error) {
        console.error('Webhook handler error:', error);
        res.status(500).json({ message: 'Webhook handler failed' });
    }
}

async function handleCheckoutSessionCompleted(session) {
    console.log('Checkout session completed:', session.id);

    try {
        // Get customer details
        const customer = await stripe.customers.retrieve(session.customer);
        const subscription = await stripe.subscriptions.retrieve(session.subscription);

        // Update user subscription in Firestore
        if (customer.metadata.userId) {
            const userRef = db.collection('users').doc(customer.metadata.userId);

            await userRef.update({
                stripeCustomerId: customer.id,
                stripeSubscriptionId: subscription.id,
                subscriptionStatus: subscription.status,
                subscriptionPlan: 'professional',
                trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
                currentPeriodEnd: subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : null,
                updatedAt: new Date()
            });

            console.log(`Updated user ${customer.metadata.userId} subscription status to ${subscription.status}`);
        }
    } catch (error) {
        console.error('Error handling checkout session completed:', error);
    }
}

async function handleSubscriptionCreated(subscription) {
    console.log('Subscription created:', subscription.id);

    try {
        const customer = await stripe.customers.retrieve(subscription.customer);

        if (customer.metadata.userId) {
            const userRef = db.collection('users').doc(customer.metadata.userId);

            await userRef.update({
                stripeCustomerId: customer.id,
                stripeSubscriptionId: subscription.id,
                subscriptionStatus: subscription.status,
                subscriptionPlan: 'professional',
                trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
                currentPeriodEnd: subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : null,
                updatedAt: new Date()
            });
        }
    } catch (error) {
        console.error('Error handling subscription created:', error);
    }
}

async function handleSubscriptionUpdated(subscription) {
    console.log('Subscription updated:', subscription.id);

    try {
        const customer = await stripe.customers.retrieve(subscription.customer);

        if (customer.metadata.userId) {
            const userRef = db.collection('users').doc(customer.metadata.userId);

            await userRef.update({
                subscriptionStatus: subscription.status,
                trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
                currentPeriodEnd: subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : null,
                updatedAt: new Date()
            });
        }
    } catch (error) {
        console.error('Error handling subscription updated:', error);
    }
}

async function handleSubscriptionDeleted(subscription) {
    console.log('Subscription deleted:', subscription.id);

    try {
        const customer = await stripe.customers.retrieve(subscription.customer);

        if (customer.metadata.userId) {
            const userRef = db.collection('users').doc(customer.metadata.userId);

            await userRef.update({
                subscriptionStatus: 'canceled',
                updatedAt: new Date()
            });
        }
    } catch (error) {
        console.error('Error handling subscription deleted:', error);
    }
}

async function handleInvoicePaymentSucceeded(invoice) {
    console.log('Invoice payment succeeded:', invoice.id);

    try {
        const customer = await stripe.customers.retrieve(invoice.customer);

        if (customer.metadata.userId) {
            const userRef = db.collection('users').doc(customer.metadata.userId);

            await userRef.update({
                subscriptionStatus: 'active',
                updatedAt: new Date()
            });
        }
    } catch (error) {
        console.error('Error handling invoice payment succeeded:', error);
    }
}

async function handleInvoicePaymentFailed(invoice) {
    console.log('Invoice payment failed:', invoice.id);

    try {
        const customer = await stripe.customers.retrieve(invoice.customer);

        if (customer.metadata.userId) {
            const userRef = db.collection('users').doc(customer.metadata.userId);

            await userRef.update({
                subscriptionStatus: 'past_due',
                updatedAt: new Date()
            });
        }
    } catch (error) {
        console.error('Error handling invoice payment failed:', error);
    }
}
