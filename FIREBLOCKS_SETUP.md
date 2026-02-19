# Fireblocks Setup Guide

## Overview

This document explains how to set up Fireblocks for crypto payment processing in U-Topia.

## Prerequisites

1. Fireblocks account (sandbox or production)
2. API credentials (API Key and Secret Key)
3. At least one vault account created

## Environment Configuration

Add these variables to your `.env.local`:

```env
# Fireblocks API Credentials
FIREBLOCKS_API_KEY=your-api-key-here
FIREBLOCKS_SECRET_KEY_PATH=.secrets/fireblocks_secret.key
FIREBLOCKS_BASE_PATH=sandbox  # or "production" for mainnet
FIREBLOCKS_VAULT_ID=1  # Your vault account ID

# Optional: Manually specify which assets to enable
# FIREBLOCKS_ENABLED_ASSETS=BTC_TEST,ETH_TEST3
```

## Asset Configuration

### Sandbox (Testnet) Assets

When using `FIREBLOCKS_BASE_PATH=sandbox`, the system automatically uses testnet assets:

- **BTC_TEST** - Bitcoin Testnet
- **ETH_TEST3** - Ethereum Sepolia (replaces deprecated ETH_TEST)

### Production (Mainnet) Assets

When using `FIREBLOCKS_BASE_PATH=production`, the system uses mainnet assets:

- **BTC** - Bitcoin
- **ETH** - Ethereum
- **USDT_ERC20** - Tether (ERC-20)
- **USDC** - USD Coin
- **SOL** - Solana

## Activating Assets in Fireblocks Console

### Step 1: Access the Console

- **Sandbox**: https://sandbox.console.fireblocks.io/
- **Production**: https://console.fireblocks.io/

### Step 2: Navigate to Your Vault

1. Log in to Fireblocks Console
2. Go to **Vaults** section
3. Select your vault account (the one specified in `FIREBLOCKS_VAULT_ID`)

### Step 3: Activate Test Assets (Sandbox Only)

For sandbox testing, you need to manually activate test assets:

1. Click on your vault account
2. Click **"Add Asset"** or **"Activate Asset"**
3. Search for and activate:
   - **BTC_TEST** (Bitcoin Testnet)
   - **ETH_TEST3** (Ethereum Sepolia) - DO NOT use deprecated ETH_TEST
4. Wait for the asset wallets to be created (~1-2 minutes)

### Step 4: Verify Asset Activation

After activation, you should see the asset wallets listed in your vault with:
- ✅ Green checkmark or "Active" status
- An address displayed for each asset
- Ability to receive deposits

## Common Issues & Solutions

### Issue: "Wallet BTC_TEST not found"

**Solution**: The asset hasn't been activated in your vault.
1. Go to Fireblocks Console
2. Select your vault
3. Click "Add Asset" and activate BTC_TEST
4. Wait 1-2 minutes for wallet creation

### Issue: "Deprecated asset ETH_TEST"

**Solution**: ETH_TEST has been deprecated by Fireblocks.
- Use **ETH_TEST3** (Ethereum Sepolia) instead
- The code has been updated to use ETH_TEST3 automatically

### Issue: "asset is not in testnet while testMode is 2"

**Solution**: You're trying to use mainnet assets in sandbox mode.
- Ensure `FIREBLOCKS_BASE_PATH=sandbox` is set
- The code will automatically use test assets (BTC_TEST, ETH_TEST3)

### Issue: "Creating addresses for the provided asset is not supported"

**Solution**: The asset doesn't support address generation in your current environment.
- For sandbox: Only BTC_TEST and ETH_TEST3 are guaranteed to work
- Some assets (like SOL) may not be available in sandbox

## Manual Asset Override

If you want to test specific assets only, set the `FIREBLOCKS_ENABLED_ASSETS` variable:

```env
# Only try BTC_TEST
FIREBLOCKS_ENABLED_ASSETS=BTC_TEST

# Try multiple assets
FIREBLOCKS_ENABLED_ASSETS=BTC_TEST,ETH_TEST3
```

This is useful for:
- Testing specific payment methods
- Troubleshooting individual assets
- Production environments with limited asset support

## Testing Your Setup

After configuration, test the payment flow:

1. Start your development server: `pnpm run dev`
2. Navigate to a membership purchase page
3. Click "Purchase" to initiate checkout
4. Check the server logs for:
   ```
   Attempting to generate addresses for: BTC_TEST, ETH_TEST3
   ✅ Generated address for BTC_TEST
   ✅ Generated address for ETH_TEST3
   ```

If you see errors, refer to the "Common Issues" section above.

## API Permissions

Ensure your API key has these permissions in Fireblocks:

- ✅ View vault accounts
- ✅ Create vault account assets
- ✅ View vault asset addresses
- ✅ Create vault asset addresses
- ✅ View transactions

## Support

For Fireblocks-specific issues:
- Documentation: https://developers.fireblocks.com/
- Support: https://www.fireblocks.com/support/

For U-Topia integration issues:
- Check the error logs in your terminal
- Review this setup guide
- Verify all environment variables are set correctly
