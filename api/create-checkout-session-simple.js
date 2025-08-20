const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

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
        console.log('=== SIMPLIFIED CHECKOUT ENDPOINT ===');
        console.log('Environment check:', {
            hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
            hasPriceId: !!process.env.STRIPE_PRICE_ID
        });

        const { interval, successUrl, cancelUrl, userId, userEmail } = req.body;

        if (!userId || !userEmail) {
            return res.status(400).json({ error: 'User ID and email are required' });
        }

        console.log(`Creating checkout session for user ${userId} with email ${userEmail}`);

        // Create Stripe customer (without Firebase)
        let customer;
        try {
            customer = await stripe.customers.create({
                email: userEmail,
                metadata: {
                    firebaseUserId: userId
                }
            });
            console.log(`Created Stripe customer: ${customer.id}`);
        } catch (stripeError) {
            console.error('Error creating Stripe customer:', stripeError);
            return res.status(500).json({
                error: 'Failed to create Stripe customer',
                details: stripeError.message
            });
        }

        // Create checkout session
        const session = await stripe.checkout.sessions.create({
            customer: customer.id,
            payment_method_types: ['card'],
            line_items: [
                {
                    price: process.env.STRIPE_PRICE_ID || 'price_1RxSYvJp0yoFovcOpODFoD46',
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: successUrl || 'https://www.pebblecrm.app/dashboard',
            cancel_url: cancelUrl || 'https://www.pebblecrm.app/upgrade',
            trial_period_days: 7,
            metadata: {
                firebaseUserId: userId,
                userEmail: userEmail
            }
        });

        console.log(`Created checkout session: ${session.id}`);

        res.status(200).json({
            url: session.url,
            sessionId: session.id,
            customerId: customer.id
        });

    } catch (error) {
        console.error('Error in simplified checkout:', error);
        res.status(500).json({
            error: 'Failed to create checkout session',
            details: error.message,
            type: error.type,
            code: error.code
        });
    }
}; 