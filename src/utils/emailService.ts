import { Resend } from 'resend';

// Initialize Resend with your API key
const resend = new Resend(process.env.REACT_APP_RESEND_API_KEY);

export interface WelcomeEmailData {
    email: string;
    displayName: string;
    dashboardUrl: string;
}

export const sendWelcomeEmail = async (data: WelcomeEmailData) => {
    try {
        const { data: result, error } = await resend.emails.send({
            from: 'Pebble CRM <noreply@pebblecrm.app>',
            to: [data.email],
            subject: 'Welcome to Pebble CRM! 🎉',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Welcome to Pebble CRM</title>
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
                        .footer { 
                            text-align: center; 
                            margin-top: 40px; 
                            padding-top: 20px; 
                            border-top: 1px solid #eee; 
                            color: #666; 
                            font-size: 14px;
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="logo">P</div>
                        <h1>Welcome to Pebble CRM!</h1>
                        <p>Your recruitment business is about to get a whole lot easier</p>
                    </div>
                    
                    <h2>Hi ${data.displayName},</h2>
                    
                    <p>🎉 <strong>Welcome to Pebble CRM!</strong> We're excited to have you on board.</p>
                    
                    <p>Pebble CRM is designed specifically for solo recruiters and small firms like yours. Here's what you can do right now:</p>
                    
                    <ul>
                        <li>📊 <strong>Dashboard</strong> - Track your key metrics and performance</li>
                        <li>👥 <strong>Client Management</strong> - Organize and track your client relationships</li>
                        <li>💼 <strong>Job Tracking</strong> - Manage your recruitment pipeline</li>
                        <li>👤 <strong>Candidate Database</strong> - Build and manage your talent pool</li>
                        <li>📝 <strong>Task Management</strong> - Stay organized and never miss a follow-up</li>
                    </ul>
                    
                    <div style="text-align: center;">
                        <a href="${data.dashboardUrl}" class="button">🚀 Get Started</a>
                    </div>
                    
                    <h3>Getting Started Tips:</h3>
                    <ol>
                        <li><strong>Add Your First Client</strong> - Start building your client database</li>
                        <li><strong>Create Job Listings</strong> - Track your recruitment opportunities</li>
                        <li><strong>Add Candidates</strong> - Build your talent pool</li>
                        <li><strong>Set Up Tasks</strong> - Stay organized with follow-ups</li>
                    </ol>
                    
                    <p><strong>Need help?</strong> We're here to support you. Email us at <a href="mailto:support@pebblecrm.app">support@pebblecrm.app</a> and we'll get back to you within 48 hours.</p>
                    
                    <p>Happy recruiting!</p>
                    <p><strong>The Pebble CRM Team</strong></p>
                    
                    <div class="footer">
                        <p>© 2024 Pebble CRM. All rights reserved.</p>
                        <p>You're receiving this email because you signed up for Pebble CRM.</p>
                    </div>
                </body>
                </html>
            `,
        });

        if (error) {
            console.error('Email send error:', error);
            return false;
        }

        console.log('Welcome email sent successfully:', result);
        return true;
    } catch (error) {
        console.error('Email service error:', error);
        return false;
    }
};

export const sendPaymentSuccessEmail = async (data: WelcomeEmailData) => {
    try {
        const { data: result, error } = await resend.emails.send({
            from: 'Pebble CRM <noreply@pebblecrm.app>',
            to: [data.email],
            subject: 'Payment Successful - Welcome to Pebble CRM! 💳✅',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Payment Successful - Pebble CRM</title>
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
                            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                            color: white; 
                            border-radius: 10px; 
                            margin-bottom: 30px;
                        }
                        .success-icon { 
                            font-size: 3em; 
                            margin-bottom: 10px;
                        }
                        .button { 
                            display: inline-block; 
                            padding: 15px 30px; 
                            background: #10b981; 
                            color: white; 
                            text-decoration: none; 
                            border-radius: 8px; 
                            font-weight: 600; 
                            margin: 20px 0;
                        }
                        .footer { 
                            text-align: center; 
                            margin-top: 40px; 
                            padding-top: 20px; 
                            border-top: 1px solid #eee; 
                            color: #666; 
                            font-size: 14px;
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="success-icon">✅</div>
                        <h1>Payment Successful!</h1>
                        <p>Your Pebble CRM subscription is now active</p>
                    </div>
                    
                    <h2>Hi ${data.displayName},</h2>
                    
                    <p>🎉 <strong>Congratulations!</strong> Your payment has been processed successfully and your Pebble CRM subscription is now active.</p>
                    
                    <h3>What's Next?</h3>
                    <ul>
                        <li>✅ <strong>30-day free trial</strong> - You won't be charged until your trial ends</li>
                        <li>🚀 <strong>Full access</strong> - All features are now available to you</li>
                        <li>📊 <strong>Start building</strong> - Begin managing your recruitment business</li>
                    </ul>
                    
                    <div style="text-align: center;">
                        <a href="${data.dashboardUrl}" class="button">🚀 Access Your Dashboard</a>
                    </div>
                    
                    <h3>Your Subscription Details:</h3>
                    <ul>
                        <li><strong>Plan:</strong> Professional</li>
                        <li><strong>Price:</strong> £9/month (after trial)</li>
                        <li><strong>Trial Period:</strong> 30 days</li>
                        <li><strong>Billing:</strong> Monthly</li>
                    </ul>
                    
                    <p><strong>Need help getting started?</strong> Email us at <a href="mailto:support@pebblecrm.app">support@pebblecrm.app</a> and we'll guide you through everything.</p>
                    
                    <p>Welcome to the Pebble CRM family!</p>
                    <p><strong>The Pebble CRM Team</strong></p>
                    
                    <div class="footer">
                        <p>© 2024 Pebble CRM. All rights reserved.</p>
                        <p>You're receiving this email because you completed payment for Pebble CRM.</p>
                    </div>
                </body>
                </html>
            `,
        });

        if (error) {
            console.error('Payment success email error:', error);
            return false;
        }

        console.log('Payment success email sent:', result);
        return true;
    } catch (error) {
        console.error('Email service error:', error);
        return false;
    }
};
