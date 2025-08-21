// Test endpoint for email API verification
module.exports = async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        res.status(200).json({
            message: 'Email API endpoint is working!',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development'
        });
    } catch (error) {
        console.error('Test endpoint error:', error);
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
}
