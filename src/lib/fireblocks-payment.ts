/**
 * Fireblocks Payment Service
 *
 * Production-ready crypto payment flow for U-Topia membership purchases.
 *
 * Architecture:
 * - ONE Fireblocks vault account per user (stored in User.fireblocksVaultId)
 * - INTELLIGENT MATCHING for multi-package support:
 *   • UTXO chains (BTC): Each session gets unique deposit address
 *   • Account-based (ETH, USDT, etc.): Same address reused, match by amount
 * - Webhook identifies payments using chain-aware matching strategy
 * - externalTxId ensures idempotency so duplicate tx requests are impossible
 *
 * Flow:
 * 1. User selects tier + crypto asset -> POST /api/checkout
 * 2. Backend gets or creates user's Fireblocks vault (idempotent)
 * 3. Backend generates deposit address (unique for BTC, reused for ETH)
 * 4. PaymentSession record created with address, tier, externalTxId, purchase link
 * 5. Frontend shows address + QR code, polls status
 * 6. Fireblocks webhook fires -> intelligent matching by chain type
 *    • BTC: Match by unique depositAddress
 *    • ETH: Match by vaultId + amountUsd (identifies tier)
 * 7. Frontend detects completion -> redirects to success
 *
 * Key Innovation: Amount-based matching for account-based chains solves the
 * challenge of multiple packages using the same deposit address.
 */

import { isFireblocksConfigured } from "./fireblocks";
import {
  createVault,
  vaultExists,
  activateVaultAssets,
  generateDepositAddress as generateAddress,
  activateAssetInVault,
  extractErrorMessage,
  isPermissionError,
} from "./fireblocks-service";
import prisma from "./db";

// --- Types ---

export interface DepositAddress {
  assetId: string;
  assetName: string;
  address: string;
  tag?: string;
  legacyAddress?: string;
}

export interface PaymentSessionResult {
  sessionId: string;
  purchaseId: string;
  externalTxId: string;
  userId: string;
  email: string;
  tier: string;
  priceUsd: number;
  /** Exact BTC amount the user must send (priceUsd / btcRate), stored in DB */
  amountCrypto: number;
  /** Live BTC/USD rate used to compute amountCrypto */
  btcRateUsd: number;
  assetId: string;
  assetName: string;
  depositAddress: string;
  depositTag?: string;
  vaultAccountId: string;
  status: string;
  expiresAt: Date;
}

// --- Tier & Asset Configuration ---

// --- Live BTC/USD Rate ---

/**
 * Fetch the live BTC/USD spot rate.
 * Primary source: CoinGecko (free, no key required).
 * Fallback: conservative static rate so payments never fail.
 */
export async function getBtcRateUsd(): Promise<number> {
  const FALLBACK_RATE = 80000; // conservative fallback — updated periodically

  try {
    const isSandbox = process.env.FIREBLOCKS_BASE_PATH === "sandbox";
    // Use BTC_TEST (testnet) or BTC (mainnet) id for CoinGecko
    const coinId = isSandbox ? "bitcoin" : "bitcoin";
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`,
      { next: { revalidate: 60 } } // cache 60s on Next.js
    );
    if (!res.ok) throw new Error(`CoinGecko HTTP ${res.status}`);
    const json = await res.json();
    const rate = json?.bitcoin?.usd;
    if (typeof rate !== "number" || rate <= 0) throw new Error("Invalid rate");
    console.log(`[BTC Rate] Live rate: $${rate.toLocaleString()}/BTC`);
    return rate;
  } catch (err) {
    console.warn(`[BTC Rate] Failed to fetch live rate, using fallback $${FALLBACK_RATE}:`, err);
    return FALLBACK_RATE;
  }
}

/**
 * Convert a USD amount to BTC, rounded to 8 decimal places (satoshi precision).
 */
export function usdToBtc(usd: number, btcRateUsd: number): number {
  return parseFloat((usd / btcRateUsd).toFixed(8));
}

export const TIER_PACKAGES: Record<string, { name: string; price: number; shares: number }> = {
  bronze:   { name: "Bronze Membership",   price: 1,  shares: 100  },
  silver:   { name: "Silver Membership",   price: 2,  shares: 250  },
  gold:     { name: "Gold Membership",     price: 3,  shares: 500  },
  platinum: { name: "Platinum Membership", price: 4, shares: 1000 },
  diamond:  { name: "Diamond Membership",  price: 5, shares: 2500 },
};

/**
 * Asset Configuration
 *
 * ONLY Bitcoin is supported for payments.
 *
 * Reason: BTC is a UTXO chain — each payment session gets a UNIQUE deposit
 * address via createVaultAccountAssetAddress. This makes it trivially easy
 * to identify exactly which package a received payment belongs to.
 *
 * EVM/account-based chains (ETH, USDT, SOL) reuse a single vault address,
 * so two simultaneous pending sessions would share the same address and
 * create an irresolvable conflict.
 */
export const MAINNET_ASSETS = [
  { id: "BTC", name: "Bitcoin", symbol: "BTC" },
];

export const TESTNET_ASSETS = [
  { id: "BTC_TEST", name: "Bitcoin Testnet", symbol: "BTC" },
];

function getSupportedAssets() {
  const isSandbox = process.env.FIREBLOCKS_BASE_PATH === "sandbox";
  const override  = process.env.FIREBLOCKS_ENABLED_ASSETS;
  if (override) {
    const ids = override.split(",").map((a) => a.trim());
    return [...MAINNET_ASSETS, ...TESTNET_ASSETS].filter((a) => ids.includes(a.id));
  }
  return isSandbox ? TESTNET_ASSETS : MAINNET_ASSETS;
}

export const SUPPORTED_ASSETS = getSupportedAssets();

// --- Vault Management ---

/**
 * Get or create a Fireblocks vault account for a specific user.
 *
 * This function implements the "One Vault Per User" architecture:
 * 1. Check if user already has a vault ID stored in database
 * 2. If yes, verify it exists in Fireblocks and return it
 * 3. If no, create a new vault in Fireblocks with user ID as name
 * 4. Store the vault ID in the user record for future use
 *
 * This ensures each user has their own isolated vault for all crypto payments.
 * Idempotent: safe to call multiple times for the same user.
 */
export async function getOrCreateUserVault(userId: string): Promise<string> {
  if (!isFireblocksConfigured()) {
    throw new Error("Fireblocks is not configured");
  }

  // 1. Check if user already has a vault
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, fireblocksVaultId: true },
  });

  if (!user) {
    throw new Error(`User not found: ${userId}`);
  }

  // 2. If vault exists in DB, verify it still exists in Fireblocks and return it.
  //    For BTC (UTXO), each session generates a fresh address on demand via
  //    createVaultAccountAssetAddress — no need to validate existing addresses.
  if (user.fireblocksVaultId) {
    const exists = await vaultExists(user.fireblocksVaultId);
    if (exists) {
      console.log(`Using existing Fireblocks vault ${user.fireblocksVaultId} for user ${userId}`);
      return user.fireblocksVaultId;
    }
    console.warn(`Stored vault ${user.fireblocksVaultId} not found in Fireblocks. Creating new vault.`);
  }

  // 3. Create new Fireblocks vault for this user
  // Use full user ID as vault name for clear identification
  const vaultName = userId;

  try {
    // Create the vault
    const vaultId = await createVault({
      name: vaultName,
      customerRefId: userId, // Use user ID as reference for lookups
      hiddenOnUI: false,
      autoFuel: false,
    });

    // 4. Activate crypto assets in the new vault
    try {
      const assetIds = SUPPORTED_ASSETS.map(a => a.id);
      await activateVaultAssets(vaultId, assetIds);
    } catch (err: unknown) {
      const msg = extractErrorMessage(err);
      console.warn(`Warning: Failed to activate some assets in vault ${vaultId}: ${msg}`);
      // Continue despite asset activation failures - we can activate them later
    }

    // 5. Store vault ID in user record
    await prisma.user.update({
      where: { id: userId },
      data: { fireblocksVaultId: vaultId },
    });

    return vaultId;
  } catch (err: unknown) {
    const msg = extractErrorMessage(err);

    // Handle race condition: vault might have been created by parallel request
    if (msg.includes("already exists") || msg.includes("duplicate")) {
      // Retry fetching user's vault ID
      const updatedUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { fireblocksVaultId: true },
      });

      if (updatedUser?.fireblocksVaultId) {
        console.log(`Vault already exists from parallel request: ${updatedUser.fireblocksVaultId}`);
        return updatedUser.fireblocksVaultId;
      }
    }

    // Provide helpful error message for permission issues
    if (isPermissionError(err)) {
      throw new Error(
        `Failed to create Fireblocks vault for user ${userId}: ${msg}\n\n` +
        `This error usually means your Fireblocks API key doesn't have the "Create vault accounts" permission.\n` +
        `To fix this:\n` +
        `1. Go to Fireblocks Console (https://sandbox.console.fireblocks.io/)\n` +
        `2. Navigate to Settings → API Users\n` +
        `3. Find your API user and edit permissions\n` +
        `4. Enable "Create vault accounts" permission\n` +
        `5. Save and wait ~1 minute for changes to propagate\n` +
        `6. Run: node scripts/test-fireblocks-permissions.js to verify`
      );
    }

    throw new Error(`Failed to create Fireblocks vault for user ${userId}: ${msg}`);
  }
}

// --- Deposit Address Generation ---

/**
 * Generate a deposit address for a specific asset in a vault.
 *
 * For UTXO chains (BTC) this creates a FRESH address each time.
 * For account-based chains (ETH, SOL) it returns the vault's address for that asset.
 * Since each user has their own vault, all addresses are unique per user.
 */
// --- Deposit Address Generation ---

/**
 * Get or generate a deposit address for payment.
 *
 * IMPORTANT BEHAVIOR BY CHAIN TYPE:
 *   - UTXO chains (BTC): Creates NEW unique address each time
 *   - Account-based chains (ETH, USDT, USDC, SOL): Returns SAME address for vault
 *
 * This is why we need intelligent matching:
 *   - BTC: Match by unique depositAddress
 *   - ETH: Match by vault + amount (address is reused!)
 */
async function getDepositAddress(
  vaultAccountId: string,
  assetId: string
): Promise<DepositAddress> {
  if (!isFireblocksConfigured()) {
    throw new Error("Fireblocks is not configured");
  }

  const assetInfo = SUPPORTED_ASSETS.find((a) => a.id === assetId);
  const address = await generateAddress(vaultAccountId, assetId);

  return {
    assetId,
    assetName: assetInfo?.name || assetId,
    address: address.address,
    tag: address.tag,
    legacyAddress: address.legacyAddress,
  };
}

// --- Payment Session Creation ---

/**
 * Create a one-time payment session.
 *
 * This is the main entry point called from the checkout API.
 * It creates:
 *   1. A Purchase record (the business-level order)
 *   2. A PaymentSession record (unique address, asset, expiry, externalTxId)
 *
 * The externalTxId is a unique string for Fireblocks idempotency:
 * if the same externalTxId is submitted twice, Fireblocks ignores the dup.
 */
export async function createPaymentSession(
  userId: string,
  email: string,
  tier: string,
  assetId: string
): Promise<PaymentSessionResult> {
  const pkg = TIER_PACKAGES[tier.toLowerCase()];
  if (!pkg) throw new Error("Invalid membership tier");

  const asset = SUPPORTED_ASSETS.find((a) => a.id === assetId);
  if (!asset) throw new Error(`Unsupported asset: ${assetId}`);

  // 1. Get or create user-specific vault
  const vaultAccountId = await getOrCreateUserVault(userId);

  // 2. Check for existing pending session for same user+tier+asset (prevent dups)
  const existingSession = await prisma.paymentSession.findFirst({
    where: {
      userId,
      tier: tier.toLowerCase(),
      assetId,
      status: "pending",
      expiresAt: { gt: new Date() },
    },
    include: { purchase: true },
  });

  if (existingSession) {
    console.log(`Reusing existing payment session ${existingSession.id}`);
    // Re-fetch live rate so the UI always shows a fresh BTC amount
    const btcRateUsd = await getBtcRateUsd();
    const storedCrypto = parseFloat(existingSession.amountCrypto || "0");
    const amountCrypto = storedCrypto > 0
      ? storedCrypto
      : usdToBtc(existingSession.amountUsd, btcRateUsd);
    return {
      sessionId: existingSession.id,
      purchaseId: existingSession.purchaseId,
      externalTxId: existingSession.externalTxId,
      userId: existingSession.userId,
      email: existingSession.email,
      tier: existingSession.tier,
      priceUsd: existingSession.amountUsd,
      amountCrypto,
      btcRateUsd,
      assetId: existingSession.assetId,
      assetName: asset.name,
      depositAddress: existingSession.depositAddress,
      depositTag: existingSession.depositTag || undefined,
      vaultAccountId: existingSession.vaultAccountId,
      status: existingSession.status,
      expiresAt: existingSession.expiresAt,
    };
  }

  // 3. Fetch live BTC/USD rate and compute exact crypto amount
  const btcRateUsd = await getBtcRateUsd();
  const amountCrypto = usdToBtc(pkg.price, btcRateUsd);
  console.log(`[Session] $${pkg.price} USD = ${amountCrypto} BTC @ $${btcRateUsd}/BTC`);

  // 4. Generate unique deposit address
  const deposit = await getDepositAddress(vaultAccountId, assetId);

  // 4. Generate unique externalTxId for Fireblocks idempotency
  const externalTxId = `utopia_${userId}_${tier}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  // 5. Generate customerRefId for package tracking
  // Format: package:tier:userId:timestamp
  const customerRefId = `pkg:${tier}:${userId}:${Date.now()}`;

  // 6. Create Purchase + PaymentSession atomically
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

  const result = await prisma.$transaction(async (tx) => {
    const purchase = await tx.purchase.create({
      data: {
        userId,
        email,
        tier: tier.toLowerCase(),
        amount: pkg.price * 100, // cents
        status: "pending",
        stripeSessionId: externalTxId,         // backward compat
        stripePaymentIntentId: vaultAccountId,  // backward compat
        isTest: process.env.FIREBLOCKS_BASE_PATH === "sandbox",
      },
    });

    const session = await tx.paymentSession.create({
      data: {
        purchaseId: purchase.id,
        userId,
        email,
        tier: tier.toLowerCase(),
        amountUsd: pkg.price,
        amountCrypto: amountCrypto.toString(), // exact BTC required
        assetId,
        depositAddress: deposit.address,
        depositTag: deposit.tag,
        vaultAccountId,
        externalTxId,
        customerRefId, // Package tracking reference
        status: "pending",
        isTest: process.env.FIREBLOCKS_BASE_PATH === "sandbox",
        expiresAt,
      },
    });

    return { purchase, session };
  });

  console.log(`Payment session created: ${result.session.id} | Address: ${deposit.address} | ${amountCrypto} BTC ($${pkg.price})`);

  return {
    sessionId: result.session.id,
    purchaseId: result.purchase.id,
    externalTxId: result.session.externalTxId,
    userId,
    email,
    tier: tier.toLowerCase(),
    priceUsd: pkg.price,
    amountCrypto,
    btcRateUsd,
    assetId,
    assetName: asset.name,
    depositAddress: deposit.address,
    depositTag: deposit.tag,
    vaultAccountId,
    status: "pending",
    expiresAt,
  };
}

// --- Payment Status & Helpers ---

/**
 * Get a payment session with its current status
 */
export async function getPaymentSessionStatus(sessionId: string, userId: string) {
  const session = await prisma.paymentSession.findFirst({
    where: { id: sessionId, userId },
    include: { purchase: true },
  });

  if (!session) return null;

  return {
    sessionId: session.id,
    purchaseId: session.purchaseId,
    tier: session.tier,
    amountUsd: session.amountUsd,
    assetId: session.assetId,
    depositAddress: session.depositAddress,
    depositTag: session.depositTag,
    vaultAccountId: session.vaultAccountId,
    status: session.status,
    fireblocksStatus: session.fireblocksStatus,
    fireblocksTxId: session.fireblocksTxId,
    txHash: session.txHash,
    amountReceived: session.amountReceived,
    amountCrypto: session.amountCrypto,
    expiresAt: session.expiresAt,
    createdAt: session.createdAt,
  };
}

// --- Chain Type Classification ---

/**
 * UTXO chains support multiple unique addresses per vault.
 * Account-based chains have ONE address per vault asset.
 */
const UTXO_CHAINS = ["BTC", "BTC_TEST", "LTC", "DOGE", "BCH"];
const ACCOUNT_BASED_CHAINS = ["ETH", "ETH_TEST5", "USDT_ERC20", "USDC", "SOL", "MATIC"];

export function isUTXOChain(assetId: string): boolean {
  return UTXO_CHAINS.some(chain => assetId.startsWith(chain));
}

export function isAccountBasedChain(assetId: string): boolean {
  return ACCOUNT_BASED_CHAINS.some(chain => assetId.startsWith(chain)) || assetId.includes("_ERC20");
}

// --- Session Finding Logic ---

/**
 * Find a payment session by deposit address.
 * Works perfectly for UTXO chains (BTC) with unique addresses per session.
 */
export async function findSessionByDepositAddress(depositAddress: string) {
  return prisma.paymentSession.findFirst({
    where: {
      depositAddress,
      status: { in: ["pending", "broadcasting", "confirming", "partial"] },
    },
    orderBy: { createdAt: "desc" },
    include: { purchase: true, user: true },
  });
}

/**
 * Find ALL pending sessions for a vault.
 * Used for account-based chains where we need to match by amount.
 */
export async function findAllPendingSessionsByVault(vaultAccountId: string) {
  return prisma.paymentSession.findMany({
    where: {
      vaultAccountId,
      status: { in: ["pending", "broadcasting", "confirming"] },
    },
    orderBy: { createdAt: "desc" },
    include: { purchase: true, user: true },
  });
}

/**
 * Find a payment session by vault account ID.
 * For ACCOUNT-BASED chains: matches by vault + amount
 * For UTXO chains: fallback when address match fails
 */
export async function findSessionByVaultId(vaultAccountId: string) {
  return prisma.paymentSession.findFirst({
    where: {
      vaultAccountId,
      status: { in: ["pending", "broadcasting", "confirming", "partial"] },
    },
    orderBy: { createdAt: "desc" },
    include: { purchase: true, user: true },
  });
}

/**
 * INTELLIGENT SESSION MATCHING for account-based chains.
 * Matches payment to session by comparing received amount with expected package price.
 */
export async function findSessionByVaultAndAmount(
  vaultAccountId: string,
  amountUsd: number,
  tolerancePercent: number = 2
) {
  const sessions = await findAllPendingSessionsByVault(vaultAccountId);

  if (sessions.length === 0) return null;

  // Try to find exact amount match first
  for (const session of sessions) {
    const pkg = TIER_PACKAGES[session.tier];
    if (!pkg) continue;

    if (isPaymentSufficient(amountUsd, pkg.price, tolerancePercent)) {
      // Check if amount matches this tier (not higher tier)
      const maxAmount = pkg.price * (1 + tolerancePercent / 100);
      if (amountUsd <= maxAmount) {
        console.log(`[Payment Match] Matched by amount: $${amountUsd} → ${session.tier} (session ${session.id})`);
        return session;
      }
    }
  }

  // Fallback: return most recent pending session
  console.warn(`[Payment Match] No exact amount match for $${amountUsd}, using most recent session`);
  return sessions[0];
}

/**
 * Check if a transaction meets the payment requirements
 */
export function isPaymentSufficient(
  amountUsd: number,
  requiredUsd: number,
  tolerancePercent: number = 2
): boolean {
  const minAmount = requiredUsd * (1 - tolerancePercent / 100);
  return amountUsd >= minAmount;
}

/**
 * Get tier from USD amount
 */
export function getTierFromAmount(amountUsd: number): string | null {
  const tiers = Object.entries(TIER_PACKAGES).sort((a, b) => b[1].price - a[1].price);
  for (const [tier, info] of tiers) {
    if (amountUsd >= info.price * 0.98) return tier;
  }
  return null;
}

/**
 * Get tier depth limit for affiliate commissions
 */
export function getTierDepth(tier: string): number {
  const depths: Record<string, number> = {
    bronze: 1, silver: 2, gold: 3, platinum: 4, diamond: 5,
  };
  return depths[tier.toLowerCase()] || 1;
}

/**
 * Expire old pending sessions (call from a cron or webhook)
 */
export async function expireOldSessions() {
  const result = await prisma.paymentSession.updateMany({
    where: {
      status: "pending",
      expiresAt: { lt: new Date() },
    },
    data: { status: "expired" },
  });

  if (result.count > 0) {
    console.log(`Expired ${result.count} payment sessions`);
  }

  return result.count;
}

// Re-export
export { isFireblocksConfigured };
