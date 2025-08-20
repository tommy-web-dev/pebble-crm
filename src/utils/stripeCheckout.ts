// This utility handles Stripe checkout flow
// You'll need to implement the backend endpoint to create checkout sessions

import { auth } from '../config/firebase';

export interface CheckoutOptions {
    interval: 'monthly' | 'yearly';
    successUrl?: string;
    cancelUrl?: string;
    userId?: string;
    userEmail?: string;
}

export const createStripeCheckout = async (options: CheckoutOptions): Promise<string | null> => {
    try {
        console.log('createStripeCheckout called with options:', options);

        // Get current user from Firebase Auth
        const { getAuth, onAuthStateChanged } = await import('firebase/auth');
        const auth = getAuth();

        return new Promise((resolve, reject) => {
            const unsubscribe = onAuthStateChanged(auth, async (user) => {
                unsubscribe();

                if (!user) {
                    console.error('User not authenticated in createStripeCheckout');
                    reject(new Error('User not authenticated'));
                    return;
                }

                console.log('User authenticated, UID:', user.uid, 'Email:', user.email);

                // This calls your Express server to create a Stripe checkout session
                const response = await fetch('https://pebble-crm.vercel.app/api/create-checkout-session-simple', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        interval: options.interval,
                        userId: user.uid,
                        userEmail: user.email
                    }),
                });

                console.log('API response status:', response.status);

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('API error response:', errorText);
                    throw new Error('Failed to create checkout session');
                }

                const data = await response.json();
                console.log('API response data:', data);
                resolve(data.url); // Stripe checkout URL
            });
        });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        return null;
    }
};

export const redirectToStripeCheckout = async (options: CheckoutOptions = { interval: 'monthly' }) => {
    try {
        console.log('Starting Stripe checkout process...');

        // Get current user for the checkout session
        const user = auth.currentUser;
        if (!user) {
            console.error('No authenticated user found');
            window.location.href = '/login';
            return;
        }

        console.log('User authenticated, UID:', user.uid, 'Email:', user.email);

        // Create a checkout session with custom success/cancel URLs
        const response = await fetch('https://pebble-crm.vercel.app/api/create-checkout-session-simple', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                interval: options.interval,
                userId: user.uid,
                userEmail: user.email,
                successUrl: 'https://www.pebblecrm.app/dashboard',
                cancelUrl: 'https://www.pebblecrm.app/upgrade'
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.url) {
            console.log('Redirecting to Stripe checkout:', data.url);
            window.location.href = data.url;
        } else {
            throw new Error('No checkout URL received');
        }

    } catch (error) {
        console.error('Error in Stripe checkout redirect:', error);
        // Fallback to upgrade page if something goes wrong
        window.location.href = '/upgrade';
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