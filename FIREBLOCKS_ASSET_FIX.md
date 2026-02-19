# Fireblocks Asset Configuration Fix

## Problem

The Fireblocks integration was failing with errors:
- `"Deprecated asset ETH_TEST"` - ETH_TEST is no longer supported
- `"Wallet BTC_TEST not found"` - Assets not activated in vault
- `"asset is not in testnet while testMode is 2"` - Using mainnet assets in sandbox

## Solution

### 1. **Automatic Test Asset Detection**

The system now automatically uses the correct assets based on environment:

**Sandbox Mode** (`FIREBLOCKS_BASE_PATH=sandbox`):
- `BTC_TEST` - Bitcoin Testnet
- `ETH_TEST3` - Ethereum Sepolia (replaces deprecated ETH_TEST)

**Production Mode** (`FIREBLOCKS_BASE_PATH=production`):
- `BTC` - Bitcoin
- `ETH` - Ethereum
- `USDT_ERC20` - Tether
- `USDC` - USD Coin
- `SOL` - Solana

### 2. **Manual Asset Override**

You can now manually specify which assets to use via environment variable:

```env
# Only use specific test assets
FIREBLOCKS_ENABLED_ASSETS=BTC_TEST,ETH_TEST3

# Or in production
FIREBLOCKS_ENABLED_ASSETS=BTC,ETH,USDC
```

### 3. **Improved Error Messages**

Errors now provide clear guidance:

```
❌ No assets could be activated.
Failed assets: BTC_TEST (Asset wallet not found - activate this asset in Fireblocks console)

No payment addresses available. Assets not activated in Fireblocks console.
Go to https://sandbox.console.fireblocks.io/ and activate BTC_TEST or ETH_TEST3 in your vault.
```

## Setup Steps

### For Sandbox Testing:

1. **Update Environment** (already configured):
   ```env
   FIREBLOCKS_BASE_PATH=sandbox
   FIREBLOCKS_VAULT_ID=1
   ```

2. **Activate Test Assets in Fireblocks Console**:
   - Go to https://sandbox.console.fireblocks.io/
   - Navigate to your vault (ID: 1)
   - Click "Add Asset" or "Activate Asset"
   - Activate **BTC_TEST** (Bitcoin Testnet)
   - Activate **ETH_TEST3** (Ethereum Sepolia) - NOT ETH_TEST!
   - Wait 1-2 minutes for wallet creation

3. **Restart Your Dev Server**:
   ```bash
   pnpm run dev
   ```

4. **Test the Payment Flow**:
   - Go to a purchase page
   - Click "Purchase"
   - Check logs for:
     ```
     Attempting to generate addresses for: BTC_TEST, ETH_TEST3
     ✅ Generated address for BTC_TEST
     ✅ Generated address for ETH_TEST3
     ```

## Files Changed

### `/src/lib/fireblocks-payment.ts`
- Added automatic test/production asset detection
- Added `FIREBLOCKS_ENABLED_ASSETS` support for manual override
- Improved error handling with specific failure reasons
- Added FireblocksError type for proper TypeScript typing

### `.env.local`
- Added comment about `FIREBLOCKS_ENABLED_ASSETS` option

### `FIREBLOCKS_SETUP.md`
- Created comprehensive setup guide
- Added troubleshooting section
- Documented all common errors and solutions

## Quick Test

Run this to test your configuration:

```bash
# Start dev server
pnpm run dev

# In another terminal, test checkout
curl -X POST http://localhost:3000/api/checkout \
  -H "Content-Type: application/json" \
  -H "Cookie: auth-token=YOUR_AUTH_TOKEN" \
  -d '{"tier": "bronze"}'
```

Check the server logs for success messages.

## Next Steps

1. ✅ Activate BTC_TEST in Fireblocks Console
2. ✅ Activate ETH_TEST3 in Fireblocks Console
3. ✅ Restart dev server
4. ✅ Test payment flow
5. Review comprehensive guide in `FIREBLOCKS_SETUP.md`

## Troubleshooting

If you still see errors:

1. **Verify vault ID**: Check that `FIREBLOCKS_VAULT_ID=1` matches your actual vault
2. **Check asset status**: In Fireblocks Console, ensure assets show "Active" with green checkmark
3. **API permissions**: Verify API key has vault and address creation permissions
4. **Wait time**: After activating assets, wait 2-3 minutes before testing

For detailed troubleshooting, see `FIREBLOCKS_SETUP.md`.
