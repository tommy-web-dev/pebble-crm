const { Resend } = require('resend');

const resend = new Resend(process.env.REACT_APP_RESEND_API_KEY);

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { email, displayName, dashboardUrl } = req.body;

        if (!email || !displayName || !dashboardUrl) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const { data, error } = await resend.emails.send({
            from: 'Pebble CRM <noreply@pebblecrm.app>',
            to: [email],
            subject: 'Test Email - Welcome to Pebble CRM! 🎉',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Test Email - Pebble CRM</title>
                    <style>
                        body { 
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                            line-height: 1.6; 
                            color: #333; 
                            max-width: 600px; 
                            margin: 0 auto; 
                            padding: 20px;
                        }
                        .header { 
                            text-align: center; 
                            padding: 30px 0; 
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white; 
                            border-radius: 10px; 
                            margin-bottom: 30px;
                        }
                        .logo { 
                            font-size: 2.5em; 
                            font-weight: bold; 
                            margin-bottom: 10px;
                        }
                        .button { 
                            display: inline-block; 
                            padding: 15px 30px; 
                            background: #667eea; 
                            color: white; 
                            text-decoration: none; 
                            border-radius: 8px; 
                            font-weight: 600; 
                            margin: 20px 0;
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="logo">P</div>
                        <h1>Test Email - Welcome to Pebble CRM!</h1>
                        <p>This is a test email to verify the email service is working</p>
                    </div>
                    
                    <h2>Hi ${displayName},</h2>
                    
                    <p>🎉 <strong>This is a test email!</strong> If you're seeing this, your email service is working perfectly!</p>
                    
                    <p>Your email service is now configured and ready to send welcome emails to new users.</p>
                    
                    <div style="text-align: center;">
                        <a href="${dashboardUrl}" class="button">🚀 Go to Dashboard</a>
                    </div>
                    
                    <p><strong>Email Service Status:</strong> ✅ Working!</p>
                    <p><strong>Domain:</strong> ✅ Verified</p>
                    <p><strong>API Key:</strong> ✅ Configured</p>
                    
                    <p>You're all set to send welcome emails to new users!</p>
                    
                    <p><strong>The Pebble CRM Team</strong></p>
                </body>
                </html>
            `,
        });

        if (error) {
            console.error('Email send error:', error);
            return res.status(500).json({ message: 'Failed to send email', error: error.message });
        }

        console.log('Test email sent successfully:', data);
        res.status(200).json({ message: 'Test email sent successfully', data });
    } catch (error) {
        console.error('Test email error:', error);
        res.status(500).json({ message: 'Failed to send test email', error: error.message });
    }
};
