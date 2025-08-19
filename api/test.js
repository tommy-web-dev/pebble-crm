module.exports = async function handler(req, res) {
    return res.status(200).json({
        message: 'Test API endpoint working!',
        timestamp: new Date().toISOString(),
        endpoint: '/api/test'
    });
} 