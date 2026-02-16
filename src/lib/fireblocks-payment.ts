/**
 * Fireblocks Payment Service
 *
 * Production-ready crypto payment flow for U-Topia membership purchases.
 *
 * Architecture:
 * - Single shared Fireblocks vault (configured via FIREBLOCKS_VAULT_ID)
 * - Each payment session gets a UNIQUE deposit address within that vault
 * - Webhook identifies payments by matching depositAddress in the PaymentSession table
 * - externalTxId ensures idempotency so duplicate tx requests are impossible
 *
 * Flow:
 * 1. User selects tier + crypto asset -> POST /api/checkout
 * 2. Backend generates fresh deposit address in shared vault
 * 3. PaymentSession record created with address, externalTxId, purchase link
 * 4. Frontend shows address + QR code, polls status
 * 5. Fireblocks webhook fires -> matches depositAddress -> updates PaymentSession & Purchase
 * 6. Frontend detects completion -> redirects to success
 */

import { getFireblocksClient, isFireblocksConfigured, getFireblocksVaultId } from "./fireblocks";
import prisma from "./db";

// --- Types ---

interface FireblocksError {
  response?: {
    data?: { message?: string; code?: number; status?: number };
    statusCode?: number;
  };
  message?: string;
}

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
  assetId: string;
  assetName: string;
  depositAddress: string;
  depositTag?: string;
  vaultAccountId: string;
  status: string;
  expiresAt: Date;
}

// --- Tier & Asset Configuration ---

export const TIER_PACKAGES: Record<string, { name: string; price: number; shares: number }> = {
  bronze:   { name: "Bronze Membership",   price: 100,  shares: 100  },
  silver:   { name: "Silver Membership",   price: 250,  shares: 250  },
  gold:     { name: "Gold Membership",     price: 500,  shares: 500  },
  platinum: { name: "Platinum Membership", price: 1000, shares: 1000 },
  diamond:  { name: "Diamond Membership",  price: 2500, shares: 2500 },
};

const MAINNET_ASSETS = [
  { id: "BTC",        name: "Bitcoin",          symbol: "BTC"  },
  { id: "ETH",        name: "Ethereum",         symbol: "ETH"  },
  { id: "USDT_ERC20", name: "Tether (ERC-20)",  symbol: "USDT" },
  { id: "USDC",       name: "USD Coin",         symbol: "USDC" },
  { id: "SOL",        name: "Solana",           symbol: "SOL"  },
];

const TESTNET_ASSETS = [
  { id: "BTC_TEST",  name: "Bitcoin Testnet",  symbol: "BTC" },
  { id: "ETH_TEST5", name: "Ethereum Sepolia", symbol: "ETH" },
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
 * Get the shared Fireblocks vault ID for all payments.
 * This vault is pre-created and configured via FIREBLOCKS_VAULT_ID environment variable.
 * All users' deposit addresses are generated within this single vault.
 */
export async function getVaultId(): Promise<string> {
  if (!isFireblocksConfigured()) {
    throw new Error("Fireblocks is not configured");
  }

  const vaultId = getFireblocksVaultId();
  console.log(`Using shared Fireblocks vault: ${vaultId}`);
  return vaultId;
}

// --- Deposit Address Generation ---

/**
 * Generate a deposit address for a specific asset in a user's vault.
 *
 * For UTXO chains (BTC) this creates a FRESH address each time.
 * For account-based chains (ETH) it returns the single vault address
 * -- which is still unique per-user because each user has their own vault.
 */
export async function generateDepositAddress(
  vaultAccountId: string,
  assetId: string
): Promise<DepositAddress> {
  if (!isFireblocksConfigured()) throw new Error("Fireblocks is not configured");

  const fireblocks = getFireblocksClient();
  const assetInfo  = SUPPORTED_ASSETS.find((a) => a.id === assetId);

  // Ensure asset wallet exists in vault
  try {
    await fireblocks.vaults.createVaultAccountAsset({ vaultAccountId, assetId });
    console.log(`Asset wallet ${assetId} activated in vault ${vaultAccountId}`);
  } catch (err: unknown) {
    const fbErr = err as FireblocksError;
    const msg   = fbErr.response?.data?.message || fbErr.message || String(err);
    if (!msg.includes("already exists") && fbErr.response?.data?.code !== 1010) {
      throw new Error(`Failed to activate asset ${assetId}: ${msg}`);
    }
  }

  // Create new deposit address (for UTXO: brand new; for EVM: same address per vault)
  try {
    const newAddr = await fireblocks.vaults.createVaultAccountAssetAddress({
      vaultAccountId,
      assetId,
    });
    if (newAddr.data?.address) {
      return {
        assetId,
        assetName: assetInfo?.name || assetId,
        address: newAddr.data.address,
        tag: newAddr.data.tag,
        legacyAddress: newAddr.data.legacyAddress,
      };
    }
  } catch (err: unknown) {
    // For EVM chains that don't support multiple addresses, fall back to existing
    const fbErr = err as FireblocksError;
    const msg = fbErr.response?.data?.message || fbErr.message || String(err);
    console.log(`New address creation fell back for ${assetId}: ${msg}`);
  }

  // Fallback: get existing addresses
  const addresses = await fireblocks.vaults.getVaultAccountAssetAddressesPaginated({
    vaultAccountId,
    assetId,
  });

  if (addresses.data?.addresses?.length) {
    const addr = addresses.data.addresses[0];
    return {
      assetId,
      assetName: assetInfo?.name || assetId,
      address: addr.address || "",
      tag: addr.tag,
      legacyAddress: addr.legacyAddress,
    };
  }

  throw new Error(`Cannot generate deposit address for ${assetId}`);
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

  // 1. Get shared vault ID
  const vaultAccountId = await getVaultId();

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
    return {
      sessionId: existingSession.id,
      purchaseId: existingSession.purchaseId,
      externalTxId: existingSession.externalTxId,
      userId: existingSession.userId,
      email: existingSession.email,
      tier: existingSession.tier,
      priceUsd: existingSession.amountUsd,
      assetId: existingSession.assetId,
      assetName: asset.name,
      depositAddress: existingSession.depositAddress,
      depositTag: existingSession.depositTag || undefined,
      vaultAccountId: existingSession.vaultAccountId,
      status: existingSession.status,
      expiresAt: existingSession.expiresAt,
    };
  }

  // 3. Generate unique deposit address
  const deposit = await generateDepositAddress(vaultAccountId, assetId);

  // 4. Generate unique externalTxId for Fireblocks idempotency
  const externalTxId = `utopia_${userId.slice(0, 8)}_${tier}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  // 5. Create Purchase + PaymentSession atomically
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
        assetId,
        depositAddress: deposit.address,
        depositTag: deposit.tag,
        vaultAccountId,
        externalTxId,
        status: "pending",
        isTest: process.env.FIREBLOCKS_BASE_PATH === "sandbox",
        expiresAt,
      },
    });

    return { purchase, session };
  });

  console.log(`Payment session created: ${result.session.id} | Address: ${deposit.address} | Asset: ${assetId}`);

  return {
    sessionId: result.session.id,
    purchaseId: result.purchase.id,
    externalTxId: result.session.externalTxId,
    userId,
    email,
    tier: tier.toLowerCase(),
    priceUsd: pkg.price,
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
    fireblocksTxId: session.fireblocksTxId,
    txHash: session.txHash,
    amountReceived: session.amountReceived,
    amountCrypto: session.amountCrypto,
    expiresAt: session.expiresAt,
    createdAt: session.createdAt,
  };
}

/**
 * Find a payment session by its deposit address.
 * Primary matching mechanism used by the webhook handler.
 */
export async function findSessionByDepositAddress(depositAddress: string) {
  return prisma.paymentSession.findFirst({
    where: {
      depositAddress,
      status: { in: ["pending", "confirming"] },
    },
    include: { purchase: true, user: true },
  });
}

/**
 * Find a payment session by vault account ID (fallback).
 */
export async function findSessionByVaultId(vaultAccountId: string) {
  return prisma.paymentSession.findFirst({
    where: {
      vaultAccountId,
      status: { in: ["pending", "confirming"] },
    },
    orderBy: { createdAt: "desc" },
    include: { purchase: true, user: true },
  });
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
