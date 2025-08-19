# Pebble CRM

A lightweight, modern CRM for solo professionals and freelancers with Stripe subscription integration.

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Environment Variables in Vercel

You need to set these environment variables in your Vercel project:

#### Stripe Configuration
- `STRIPE_SECRET_KEY` - Your Stripe secret key (starts with `sk_`)
- `STRIPE_WEBHOOK_SECRET` - Your webhook secret (starts with `whsec_`)

#### Firebase Configuration
- `FIREBASE_PROJECT_ID` - Your Firebase project ID
- `FIREBASE_CLIENT_EMAIL` - Your Firebase service account email
- `FIREBASE_PRIVATE_KEY` - Your Firebase private key
- `FIREBASE_DATABASE_URL` - Your Firebase database URL

### 3. Deploy to Vercel
```bash
vercel --prod
```

## 📋 Environment Variables Setup

### In Vercel Dashboard:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add each variable from the list above

### Firebase Service Account:
1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Use the values from the JSON file for Firebase environment variables

## 🔗 Webhook Endpoint

After deployment, your webhook endpoint will be:
```
https://your-project.vercel.app/api/webhook
```

## 📝 Supported Events

- `customer.subscription.created` - New subscription
- `customer.subscription.updated` - Subscription changes
- `customer.subscription.deleted` - Subscription cancelled
- `invoice.payment_succeeded` - Payment successful
- `invoice.payment_failed` - Payment failed
- `customer.updated` - Customer details updated

## 🐛 Troubleshooting

### Check Vercel Logs:
1. Go to Vercel Dashboard → Functions
2. Click on webhook function
3. Check logs for errors

### Test Webhook:
1. Go to Stripe Dashboard → Webhooks
2. Click "Send test webhook"
3. Choose an event type
4. Check if it succeeds

## 🔒 Security

- Webhook signature verification is enabled
- Only POST requests are accepted
- All Stripe events are validated before processing 