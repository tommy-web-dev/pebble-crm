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

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Set CORS headers for actual request
    res.setHeader('Access-Control-Allow-Origin', 'https://www.pebblecrm.app');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    const { customerId } = req.query;

    if (!customerId) {
        return res.status(400).json({ error: 'Customer ID is required' });
    }

    try {
        console.log(`Fetching subscription data for customer: ${customerId}`);

        // Get customer details
        const customer = await stripe.customers.retrieve(customerId);
        console.log(`Found customer: ${customer.email}`);

        // Get customer's subscriptions
        const subscriptions = await stripe.subscriptions.list({
            customer: customerId,
            limit: 1,
            status: 'all'
        });

        if (subscriptions.data.length === 0) {
            console.log(`No subscriptions found for customer: ${customerId}`);
            return res.status(200).json({
                customer: customer,
                subscription: null,
                message: 'No subscriptions found'
            });
        }

        const subscription = subscriptions.data[0];
        console.log(`Found subscription: ${subscription.id} with status: ${subscription.status}`);

        res.status(200).json({
            customer: customer,
            subscription: subscription
        });

    } catch (error) {
        console.error('Error fetching subscription data:', error);
        res.status(500).json({ error: 'Failed to fetch subscription data' });
    }
}; 