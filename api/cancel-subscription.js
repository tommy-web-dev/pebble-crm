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
        const { subscriptionId, customerId } = req.body;

        if (!subscriptionId) {
            return res.status(400).json({ error: 'Subscription ID is required' });
        }

        console.log(`Cancelling subscription: ${subscriptionId}`);

        // Cancel the subscription at period end (so user keeps access until end of current period)
        const cancelledSubscription = await stripe.subscriptions.update(subscriptionId, {
            cancel_at_period_end: true
        });

        console.log(`Subscription ${subscriptionId} cancelled successfully`);

        res.status(200).json({
            success: true,
            message: 'Subscription cancelled successfully',
            subscription: {
                id: cancelledSubscription.id,
                status: cancelledSubscription.status,
                cancelAtPeriodEnd: cancelledSubscription.cancel_at_period_end,
                currentPeriodEnd: cancelledSubscription.current_period_end
            }
        });

    } catch (error) {
        console.error('Error cancelling subscription:', error);
        res.status(500).json({
            error: 'Failed to cancel subscription',
            details: error.message,
            type: error.type,
            code: error.code
        });
    }
}; 