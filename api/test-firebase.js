const admin = require('firebase-admin');

module.exports = async function handler(req, res) {
    // Handle CORS
    res.setHeader('Access-Control-Allow-Origin', 'https://www.pebblecrm.app');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Check environment variables
        const envCheck = {
            hasProjectId: !!process.env.FIREBASE_PROJECT_ID,
            hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
            hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
            hasDatabaseUrl: !!process.env.FIREBASE_DATABASE_URL,
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKeyLength: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.length : 0,
            databaseUrl: process.env.FIREBASE_DATABASE_URL
        };

        console.log('Environment check:', envCheck);

        // Try to initialize Firebase Admin
        if (!admin.apps.length) {
            console.log('Initializing Firebase Admin...');
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
                }),
                databaseURL: process.env.FIREBASE_DATABASE_URL,
            });
            console.log('Firebase Admin initialized successfully');
        }

        // Test Firestore connection
        const db = admin.firestore();
        console.log('Testing Firestore connection...');

        // Try to read a test document
        const testDoc = await db.collection('users').doc('test').get();
        console.log('Firestore connection successful');

        res.status(200).json({
            success: true,
            message: 'Firebase Admin authentication successful',
            envCheck: envCheck,
            firebaseStatus: 'Connected'
        });

    } catch (error) {
        console.error('Firebase test failed:', error);
        res.status(500).json({
            success: false,
            error: 'Firebase authentication failed',
            details: error.message,
            code: error.code,
            envCheck: {
                hasProjectId: !!process.env.FIREBASE_PROJECT_ID,
                hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
                hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
                hasDatabaseUrl: !!process.env.FIREBASE_DATABASE_URL
            }
        });
    }
}; 