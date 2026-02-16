# Fireblocks Payment Integration Guide

## Overview

U-Topia now supports **Fireblocks** as the primary cryptocurrency payment processor for membership purchases. Fireblocks provides institutional-grade security for digital asset operations.

## Features

- **Secure Vault-based Payments**: Each user gets a dedicated vault account for payments
- **Multi-cryptocurrency Support**: Accept BTC, ETH, USDT, USDC, SOL, and more
- **Automatic Payment Processing**: Webhook-driven payment confirmation
- **Real-time Transaction Monitoring**: Track payment status in real-time
- **Production-ready Security**: RSA-512 signature verification for webhooks

## Setup Instructions

### 1. Create Fireblocks Account

1. Visit [https://www.fireblocks.com/developer-sandbox-sign-up/](https://www.fireblocks.com/developer-sandbox-sign-up/) for sandbox access
2. For production, contact Fireblocks sales team
3. Complete the workspace setup wizard

### 2. Generate API Credentials

1. Log in to your Fireblocks Console
2. Navigate to **Settings** → **API Users**
3. Create a new API user with the following permissions:
   - `vault:read` - Read vault accounts
   - `vault:write` - Create vault accounts
   - `addresses:read` - Read deposit addresses
   - `addresses:write` - Generate deposit addresses
   - `transactions:read` - Read transactions
4. Download the **API Secret Key** (private key file)
5. Note down the **API Key ID**

### 3. Configure Webhooks

1. In Fireblocks Console, go to **Settings** → **Webhooks** (or Developer Center for v2)
2. Add a new webhook endpoint: `https://yourdomain.com/api/webhooks/fireblocks`
3. Enable the following event types:
   - `TRANSACTION_CREATED`
   - `TRANSACTION_STATUS_UPDATED`
4. Note: Webhooks are signed using RSA-512 - signature verification is automatic

### 4. Environment Variables

Add these to your `.env.local` file:

```env
# Fireblocks Configuration
FIREBLOCKS_API_KEY="your-api-key-id"
FIREBLOCKS_SECRET_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
# Or use file path for secret key
FIREBLOCKS_SECRET_KEY_PATH="./fireblocks_secret.key"

# Base path: sandbox | production | eu | eu2
FIREBLOCKS_BASE_PATH="sandbox"

# Payment provider selection (optional - defaults to fireblocks if configured)
DEFAULT_PAYMENT_PROVIDER="fireblocks"

# Application URL
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
```

### 5. Test Mode (Sandbox)

For development and testing:

1. Use sandbox credentials
2. Set `FIREBLOCKS_BASE_PATH="sandbox"`
3. Sandbox transactions are simulated and don't require real crypto

## Payment Flow

### 1. User Initiates Purchase

- User selects membership tier (Bronze, Silver, Gold, Platinum, Diamond)
- User clicks "Buy Now" button
- System calls `/api/checkout` endpoint

### 2. Payment Session Created

```typescript
POST /api/checkout
{
  "tier": "silver",
  "provider": "fireblocks",  // Optional - uses default if not specified
  "selectedAssets": ["BTC", "ETH"]  // Optional - generates addresses for specific assets
}
```

Response:
```json
{
  "provider": "fireblocks",
  "sessionId": "user123_silver_1234567890",
  "tier": "silver",
  "tierName": "Silver Membership",
  "priceUsd": 250,
  "depositAddresses": [
    {
      "assetId": "BTC",
      "assetName": "Bitcoin",
      "address": "bc1q..."
    },
    {
      "assetId": "ETH",
      "assetName": "Ethereum",
      "address": "0x..."
    }
  ],
  "expiresAt": "2024-01-16T12:00:00.000Z",
  "instructions": {
    "title": "Complete Your Payment",
    "steps": ["..."]
  }
}
```

### 3. User Sends Payment

- User selects cryptocurrency (BTC, ETH, etc.)
- User copies deposit address
- User sends payment from their wallet
- Transaction is broadcast to blockchain

### 4. Webhook Notification

Fireblocks sends webhook when transaction is detected:

```json
{
  "type": "TRANSACTION_STATUS_UPDATED",
  "data": {
    "id": "fb-tx-12345",
    "status": "COMPLETED",
    "assetId": "ETH",
    "destination": {
      "type": "VAULT_ACCOUNT",
      "id": "vault-123"
    },
    "amountInfo": {
      "amount": "0.1",
      "amountUSD": "250.00"
    }
  }
}
```

### 5. Payment Processing

- Webhook handler verifies signature
- Checks if payment amount meets tier requirements
- Updates purchase status to "completed"
- Activates user's membership tier
- Creates revenue event for commission tracking

## API Endpoints

### POST /api/checkout

Create a new payment session.

**Request:**
```json
{
  "tier": "gold",
  "provider": "fireblocks",
  "selectedAssets": ["BTC", "ETH", "USDT_ERC20"]
}
```

### GET /api/checkout

Get available payment providers and supported assets.

**Response:**
```json
{
  "defaultProvider": "fireblocks",
  "providers": [
    { "id": "fireblocks", "name": "Fireblocks", "available": true },
    { "id": "nowpayments", "name": "NOWPayments", "available": false }
  ],
  "supportedAssets": [
    { "id": "BTC", "name": "Bitcoin", "symbol": "BTC" },
    { "id": "ETH", "name": "Ethereum", "symbol": "ETH" }
  ]
}
```

### GET /api/checkout/fireblocks/status?sessionId=xxx

Check payment status.

**Response:**
```json
{
  "sessionId": "user123_silver_1234567890",
  "tier": "silver",
  "amount": 250,
  "status": "confirming",
  "message": "Payment detected! Waiting for blockchain confirmations.",
  "recentTransactions": [...]
}
```

### POST /api/webhooks/fireblocks

Webhook endpoint for Fireblocks transaction notifications.

## Transaction Statuses

| Status | Description |
|--------|-------------|
| `pending` | Payment created, waiting for funds |
| `confirming` | Payment detected, awaiting confirmations |
| `completed` | Payment confirmed, membership activated |
| `partial` | Insufficient payment received |
| `failed` | Transaction failed |

## Supported Cryptocurrencies

| Asset ID | Name | Network |
|----------|------|---------|
| `BTC` | Bitcoin | Bitcoin |
| `ETH` | Ethereum | Ethereum |
| `USDT_ERC20` | Tether (ERC-20) | Ethereum |
| `USDC_ERC20` | USD Coin (ERC-20) | Ethereum |
| `SOL` | Solana | Solana |

## Membership Tiers

| Tier | Price (USD) | Shares |
|------|-------------|--------|
| Bronze | $100 | 100 |
| Silver | $250 | 250 |
| Gold | $500 | 500 |
| Platinum | $1,000 | 1,000 |
| Diamond | $2,500 | 2,500 |

## Security Best Practices

1. **Never expose API keys** in client-side code
2. **Verify webhook signatures** - always enabled in production
3. **Use HTTPS** for all API endpoints
4. **Store secret keys securely** - use environment variables or secure file storage
5. **Monitor transactions** - set up alerts for unusual activity

## Troubleshooting

### Webhook Signature Verification Failed

- Ensure you're using the correct public key for your environment (sandbox vs production)
- Check that the raw request body is being passed for verification
- Verify webhook URL matches exactly in Fireblocks Console

### Deposit Address Not Generated

- Verify API key has `addresses:write` permission
- Check if asset is supported in your Fireblocks workspace
- Ensure vault account exists before generating addresses

### Payment Not Detected

- Confirm transaction was sent to correct address
- Check transaction has sufficient confirmations
- Verify webhook endpoint is accessible from Fireblocks IPs:
  - 3.134.25.131
  - 3.23.47.185
  - 18.223.19.147
  - 3.141.88.232
  - 18.189.135.42

## Migration from NOWPayments

The existing NOWPayments integration remains available. To switch between providers:

1. **Default to Fireblocks**: Set `DEFAULT_PAYMENT_PROVIDER="fireblocks"`
2. **Keep NOWPayments as fallback**: Configure both providers
3. **Per-request selection**: Include `"provider": "fireblocks"` or `"provider": "nowpayments"` in checkout request

## Support

For Fireblocks-specific issues:
- [Fireblocks Documentation](https://developers.fireblocks.com/docs)
- [Fireblocks Support](https://support.fireblocks.io)
- [SDK Reference](https://developers.fireblocks.com/reference)

For U-Topia integration issues:
- Check application logs
- Review webhook handler at `/api/webhooks/fireblocks`
- Contact platform support
