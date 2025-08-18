// This utility handles Stripe checkout flow
// You'll need to implement the backend endpoint to create checkout sessions

export interface CheckoutOptions {
    interval: 'monthly' | 'yearly';
    successUrl?: string;
    cancelUrl?: string;
}

export const createStripeCheckout = async (options: CheckoutOptions): Promise<string | null> => {
    try {
        // This calls your Express server to create a Stripe checkout session
        const response = await fetch('https://pebble-stripe-59wsz2kjx-pebble-crm.vercel.app/api/create-checkout-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                interval: options.interval,
                successUrl: options.successUrl || `${window.location.origin}/dashboard`,
                cancelUrl: options.cancelUrl || `${window.location.origin}/`,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to create checkout session');
        }

        const data = await response.json();
        return data.url; // Stripe checkout URL
    } catch (error) {
        console.error('Error creating checkout session:', error);
        return null;
    }
};

export const redirectToStripeCheckout = async (options: CheckoutOptions): Promise<void> => {
    const checkoutUrl = await createStripeCheckout(options);

    if (checkoutUrl) {
        window.location.href = checkoutUrl;
    } else {
        // Fallback to login page if checkout creation fails
        window.location.href = '/login';
    }
};

// Example backend endpoint you'll need to implement:
/*
app.post('/api/create-checkout-session', async (req, res) => {
    try {
        const { interval, successUrl, cancelUrl } = req.body;
        
        const session = await stripe.checkout.sessions.create({
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
            success_url: successUrl,
            cancel_url: cancelUrl,
            subscription_data: {
                trial_period_days: 7, // 7-day free trial
            },
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({ error: 'Failed to create checkout session' });
    }
});
*/ 