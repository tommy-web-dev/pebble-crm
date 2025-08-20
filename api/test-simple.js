module.exports = async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', 'https://www.pebblecrm.app');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        // Test basic API functionality without Firebase
        console.log('Simple test endpoint called successfully');

        res.status(200).json({
            success: true,
            message: 'Simple API endpoint working',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development'
        });
    } catch (error) {
        console.error('Error in simple test:', error);
        res.status(500).json({
            success: false,
            error: 'Simple test failed',
            details: error.message
        });
    }
}; 