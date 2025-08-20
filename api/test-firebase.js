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

            // Convert the private key from \n format to actual newlines
            let privateKey = process.env.FIREBASE_PRIVATE_KEY;

            console.log('=== PRIVATE KEY DEBUG START ===');
            console.log('Original private key length:', privateKey.length);
            console.log('Original private key starts with:', privateKey.substring(0, 100));
            console.log('Original private key ends with:', privateKey.substring(privateKey.length - 100));

            // Remove any surrounding quotes (single or double)
            privateKey = privateKey.replace(/^["']|["']$/g, '');

            // Remove any invisible Unicode characters
            privateKey = privateKey.replace(/[\u200B-\u200D\uFEFF]/g, '');

            // Convert various line ending formats to actual newlines
            privateKey = privateKey.replace(/\\r\\n/g, '\n');  // Windows line endings
            privateKey = privateKey.replace(/\\n/g, '\n');     // Unix line endings
            privateKey = privateKey.replace(/\\r/g, '\n');     // Old Mac line endings

            // Remove any extra whitespace and normalize
            privateKey = privateKey.trim();

            // Ensure proper PEM format
            if (!privateKey.startsWith('-----BEGIN PRIVATE KEY-----')) {
                throw new Error('Invalid private key format: missing BEGIN marker');
            }
            if (!privateKey.endsWith('-----END PRIVATE KEY-----')) {
                throw new Error('Invalid private key format: missing END marker');
            }

            // Count the lines to ensure proper PEM structure
            const lines = privateKey.split('\n');
            if (lines.length < 3) {
                throw new Error('Invalid private key format: insufficient lines');
            }

            console.log('=== PRIVATE KEY DEBUG END ===');
            console.log('Processed private key length:', privateKey.length);
            console.log('Processed private key starts with:', privateKey.substring(0, 100));
            console.log('Processed private key ends with:', privateKey.substring(privateKey.length - 100));
            console.log('Private key contains newlines:', privateKey.includes('\n'));
            console.log('Private key line count:', lines.length);
            console.log('First line:', lines[0]);
            console.log('Last line:', lines[lines.length - 1]);

            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: privateKey,
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