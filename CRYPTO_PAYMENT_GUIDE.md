# Cryptocurrency Payment Integration Guide

## Overview

This application uses **NOWPayments** for cryptocurrency payment processing. Users can purchase membership tiers using Bitcoin, Ethereum, USDT, and other supported cryptocurrencies.

## Setup Instructions

### 1. Create NOWPayments Account

1. Visit [https://nowpayments.io](https://nowpayments.io)
2. Sign up for a new account
3. Complete the verification process (KYC may be required)

### 2. Get API Credentials

1. Log in to your NOWPayments dashboard
2. Go to **Settings** → **API Keys**
3. Copy your **API Key**
4. Go to **Settings** → **IPN Settings**
5. Create an IPN secret or copy the existing one
6. Set your IPN callback URL to: `https://yourdomain.com/api/webhooks/crypto`

### 3. Configure Environment Variables

Update your `.env.local` file with your NOWPayments credentials:

```env
# Crypto Payment (NOWPayments)
NOWPAYMENTS_API_KEY="your_actual_api_key_here"
NOWPAYMENTS_IPN_SECRET="your_actual_ipn_secret_here"

# Application URL (important for redirects and webhooks)
NEXT_PUBLIC_APP_URL="http://localhost:3000"  # Change to your production URL
```

### 4. Test Mode

NOWPayments provides a sandbox environment for testing:

1. Use sandbox API keys from your dashboard
2. Sandbox URL: `https://sandbox.nowpayments.io`
3. Test payments won't require real cryptocurrency

## Payment Flow

### 1. User Initiates Purchase

- User selects a membership tier (Bronze, Silver, Gold, Platinum, Diamond)
- Clicks "Buy Now" button
- System calls `/api/checkout` endpoint

### 2. Payment Creation

```typescript
POST /api/checkout
{
  "tier": "silver",
  "payCurrency": "btc"  // Optional, defaults to BTC
}
```

Response:

```json
{
  "paymentId": "12345678",
  "payAddress": "bc1q...", // Crypto address to send payment
  "payAmount": 0.0045, // Amount in crypto
  "payCurrency": "btc",
  "priceAmount": 250, // Price in USD
  "priceCurrency": "usd",
  "invoiceUrl": "https://nowpayments.io/payment/?iid=...",
  "orderId": "user_silver_1234567890",
  "status": "waiting"
}
```

### 3. User Makes Payment

- User is redirected to NOWPayments invoice page
- User can choose from multiple cryptocurrencies
- User sends payment to provided address
- Payment is detected and confirmed on blockchain

### 4. Webhook Notification

NOWPayments sends webhook to `/api/webhooks/crypto`:

```json
{
  "payment_id": "12345678",
  "payment_status": "finished",
  "pay_address": "bc1q...",
  "price_amount": 250,
  "price_currency": "usd",
  "pay_amount": 0.0045,
  "pay_currency": "btc",
  "order_id": "user_silver_1234567890",
  "order_description": "Silver Membership - user@example.com"
}
```

### 5. Payment Verification

- Webhook handler verifies signature
- System records purchase in database
- User's affiliate tier is updated
- User is redirected to success page

## Payment Statuses

| Status       | Description                              |
| ------------ | ---------------------------------------- |
| `waiting`    | Payment created, waiting for funds       |
| `confirming` | Payment detected, awaiting confirmations |
| `confirmed`  | Payment confirmed on blockchain          |
| `sending`    | Converting/sending funds                 |
| `finished`   | Payment completed successfully           |
| `failed`     | Payment failed                           |
| `expired`    | Payment expired (timeout)                |

## Supported Cryptocurrencies

Default supported currencies:

- Bitcoin (BTC)
- Ethereum (ETH)
- Tether (USDT)
- Litecoin (LTC)
- Bitcoin Cash (BCH)
- And 150+ more via NOWPayments

## Pricing

### Membership Tiers

| Tier     | Price (USD) |
| -------- | ----------- |
| Bronze   | $100        |
| Silver   | $250        |
| Gold     | $500        |
| Platinum | $1000       |
| Diamond  | $2500       |

## API Endpoints

### POST /api/checkout

Creates a new crypto payment for a membership purchase.

**Request:**

```json
{
  "tier": "silver"
}
```

**Response:**

```json
{
  "paymentId": "string",
  "payAddress": "string",
  "payAmount": number,
  "payCurrency": "string",
  "invoiceUrl": "string",
  "status": "string"
}
```

### POST /api/verify-purchase

Verifies a payment status and records purchase if completed.

**Request:**

```json
{
  "paymentId": "12345678",
  "tier": "silver"
}
```

**Response:**

```json
{
  "verified": true,
  "status": "completed",
  "tier": "silver",
  "amountPaid": 250,
  "currency": "usd"
}
```

### POST /api/webhooks/crypto

Receives IPN (Instant Payment Notifications) from NOWPayments.

**Headers:**

- `x-nowpayments-sig`: HMAC signature for verification

**Payload:** NOWPayments IPN format

## Security

### Webhook Signature Verification

All webhooks are verified using HMAC-SHA512:

```typescript
const crypto = require("crypto");
const hmac = crypto.createHmac("sha512", NOWPAYMENTS_IPN_SECRET);
hmac.update(payload);
const signature = hmac.digest("hex");
```

### Best Practices

1. **Always verify webhooks** - Check signature before processing
2. **Idempotency** - Check if payment already recorded before creating database entries
3. **Status checks** - Only complete purchases for `finished` or `confirmed` status
4. **Timeout handling** - Handle expired payments gracefully
5. **Error logging** - Log all payment errors for debugging

## Testing

### Local Testing with ngrok

1. Install ngrok: `npm install -g ngrok`
2. Start your dev server: `pnpm run dev`
3. Create tunnel: `ngrok http 3000`
4. Update NOWPayments IPN URL with ngrok URL
5. Test payments using NOWPayments sandbox

### Production Deployment

1. Set production URL in `NEXT_PUBLIC_APP_URL`
2. Configure production API keys
3. Set webhook URL to: `https://yourdomain.com/api/webhooks/crypto`
4. Test with small amount first
5. Monitor webhook logs

## Troubleshooting

### Common Issues

1. **"NOWPayments API key not configured"**
   - Check `.env.local` has `NOWPAYMENTS_API_KEY`
   - Restart dev server after adding env vars

2. **Webhook not received**
   - Verify IPN URL in NOWPayments dashboard
   - Check firewall/security rules
   - Test webhook endpoint manually

3. **Payment not confirmed**
   - Check blockchain confirmations (varies by crypto)
   - Monitor payment status in NOWPayments dashboard
   - Verify minimum payment amount met

4. **Signature verification failed**
   - Confirm `NOWPAYMENTS_IPN_SECRET` is correct
   - Check for trailing spaces in env var
   - Ensure raw request body is used for verification

## Support

- **NOWPayments Documentation**: https://documenter.getpostman.com/view/7907941/S1a32n38
- **NOWPayments Support**: support@nowpayments.io
- **Status Page**: https://status.nowpayments.io

## Migration from Stripe

Key changes made:

- Removed `stripe` and `@stripe/stripe-js` packages
- Replaced `src/lib/stripe.ts` with `src/lib/crypto-payment.ts`
- Updated checkout flow to use crypto payments
- Changed webhook endpoint from `/api/webhooks/stripe` to `/api/webhooks/crypto`
- Modified database field usage:
  - `stripeSessionId` → now stores crypto `paymentId`
  - `stripePaymentIntentId` → now stores crypto `order_id`
