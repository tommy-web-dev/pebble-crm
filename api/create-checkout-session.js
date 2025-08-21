import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { userId, email, displayName } = req.body;

        if (!userId || !email) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Create or retrieve customer
        let customer;
        const existingCustomers = await stripe.customers.list({
            email: email,
            limit: 1
        });

        if (existingCustomers.data.length > 0) {
            customer = existingCustomers.data[0];
            // Update customer metadata if needed
            if (customer.metadata.userId !== userId) {
                customer = await stripe.customers.update(customer.id, {
                    metadata: { userId: userId }
                });
            }
        } else {
            customer = await stripe.customers.create({
                email: email,
                name: displayName,
                metadata: { userId: userId }
            });
        }

        // Create checkout session
        const session = await stripe.checkout.sessions.create({
            customer: customer.id,
            payment_method_types: ['card'],
            line_items: [
                {
                    price: process.env.STRIPE_PRICE_ID, // Your £9/month price ID
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success`,
            cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/upgrade?payment=cancelled`,
            allow_promotion_codes: true,
            subscription_data: {
                trial_period_days: 30, // 30-day free trial
                metadata: {
                    userId: userId
                }
            },
            metadata: {
                userId: userId
            }
        });

        res.status(200).json({ sessionId: session.id, url: session.url });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({ message: 'Failed to create checkout session' });
    }
} 