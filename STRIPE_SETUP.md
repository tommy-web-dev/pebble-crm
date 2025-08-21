# Stripe Webhook Setup Guide

## Overview
This guide explains how to set up Stripe webhooks for automatic subscription management in Pebble CRM.

## Environment Variables Required

Add these to your Vercel environment variables:

```bash
STRIPE_SECRET_KEY=sk_test_... # Your Stripe secret key
STRIPE_WEBHOOK_SECRET=whsec_... # Webhook endpoint secret
STRIPE_PRICE_ID=price_... # Your £9/month subscription price ID
NEXT_PUBLIC_BASE_URL=https://yourdomain.vercel.app # Your Vercel domain
```

## Stripe Dashboard Setup

### 1. Create a Product & Price
- Go to Stripe Dashboard > Products
- Create a new product called "Pebble CRM Professional"
- Add a recurring price of £9/month
- Copy the Price ID (starts with `price_`)

### 2. Set Up Webhook Endpoint
- Go to Stripe Dashboard > Developers > Webhooks
- Click "Add endpoint"
- Endpoint URL: `https://yourdomain.vercel.app/api/stripe-webhook`
- Events to send:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`

### 3. Get Webhook Secret
- After creating the webhook, click on it
- Copy the "Signing secret" (starts with `whsec_`)
- Add this to your Vercel environment variables

## How It Works

1. **User signs up** → Creates Firebase account
2. **Checkout session created** → Includes user ID in metadata
3. **User completes payment** → Stripe sends webhook
4. **Webhook processes event** → Updates user subscription in Firestore
5. **User redirected** → To payment success page
6. **Auto-redirect** → To dashboard after 5 seconds

## Testing

### Test Mode
- Use Stripe test cards (e.g., 4242 4242 4242 4242)
- Test webhook events in Stripe Dashboard
- Check Firestore for subscription updates

### Live Mode
- Ensure all environment variables are set
- Test with real payment methods
- Monitor webhook delivery in Stripe Dashboard

## Troubleshooting

### Common Issues
1. **Webhook not receiving events** → Check endpoint URL and events
2. **Environment variables missing** → Verify all are set in Vercel
3. **Firebase connection failed** → Check Firebase config and permissions
4. **User not redirected** → Verify success_url in checkout session

### Debug Steps
1. Check Vercel function logs
2. Verify Stripe webhook delivery
3. Check Firestore for subscription updates
4. Test checkout session creation

## Security Notes

- Webhook signature verification is implemented
- User ID is validated before database updates
- All sensitive data is handled server-side
- Environment variables are encrypted in Vercel
