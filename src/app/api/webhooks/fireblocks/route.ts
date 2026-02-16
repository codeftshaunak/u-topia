/**
 * Fireblocks Webhook Handler
 *
 * Processes real-time webhook notifications from Fireblocks:
 *   - TRANSACTION_CREATED     → logs detection
 *   - TRANSACTION_STATUS_UPDATED → matches payment session, updates status
 *
 * Payment identification strategy:
 *   1. Primary:  Match by destinationAddress → PaymentSession.depositAddress
 *   2. Fallback: Match by destination vault ID → PaymentSession.vaultAccountId
 *
 * This ensures each of thousands of concurrent users gets their payment
 * correctly attributed even when transactions arrive simultaneously.
 *
 * POST /api/webhooks/fireblocks
 */

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/db";
import {
  findSessionByDepositAddress,
  findSessionByVaultId,
  isPaymentSufficient,
  getTierFromAmount,
  getTierDepth,
  TIER_PACKAGES,
  expireOldSessions,
} from "@/lib/fireblocks-payment";

// ─── Fireblocks Public Keys for Signature Verification ───────────────────────

const FIREBLOCKS_PRODUCTION_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEA0+6wd9OJQpK60ZI7qnZG
jjQ0wNFUHfRv85Tdyek8+ahlg1Ph8uhwl4N6DZw5LwLXhNjzAbQ8LGPxt36RUZl5
YlxTru0jZNKx5lslR+H4i936A4pKBjgiMmSkVwXD9HcfKHTp70GQ812+J0Fvti/v
4nrrUpc011Wo4F6omt1QcYsi4GTI5OsEbeKQ24BtUd6Z1Nm/EP7PfPxeb4CP8KOH
clM8K7OwBUfWrip8Ptljjz9BNOZUF94iyjJ/BIzGJjyCntho64ehpUYP8UJykLVd
CGcu7sVYWnknf1ZGLuqqZQt4qt7cUUhFGielssZP9N9x7wzaAIFcT3yQ+ELDu1SZ
dE4lZsf2uMyfj58V8GDOLLE233+LRsRbJ083x+e2mW5BdAGtGgQBusFfnmv5Bxqd
HgS55hsna5725/44tvxll261TgQvjGrTxwe7e5Ia3d2Syc+e89mXQaI/+cZnylNP
SwCCvx8mOM847T0XkVRX3ZrwXtHIA25uKsPJzUtksDnAowB91j7RJkjXxJcz3Vh1
4k182UFOTPRW9jzdWNSyWQGl/vpe9oQ4c2Ly15+/toBo4YXJeDdDnZ5c/O+KKadc
IMPBpnPrH/0O97uMPuED+nI6ISGOTMLZo35xJ96gPBwyG5s2QxIkKPXIrhgcgUnk
tSM7QYNhlftT4/yVvYnk0YcCAwEAAQ==
-----END PUBLIC KEY-----`;

const FIREBLOCKS_SANDBOX_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEApZE6wL2+7P1ohvVYSpCd
gSgtmyGwiLbUC1UoGJhn1zwfY7ZWbNH7Pg8Osk8OzZTZHSG/arcgE8HnGCmGKtbE
QBkf2XlBRBQ01FcCMlZuJQJ3nElCPaMl9N6fq0VKNEIlVSVUpDCgvag5kFhDKS/L
p3YYJLFR46/hDlVLn+vM84diO3xGyMc16YJGNz7Z4jb8dmSZQE5E2XaQMDXW6uxC
c2ChjWJ3X5H70MzRG35JsN0j58SQTwbf4Pxm0aJfhPuaIBn3mJuZL5etsuFihoFG
FDnT+qWRcgD/pRNulBFAFhJeUnFrE4fFTJ1iaHhjBrStBCrxJk6QI0pGznoapTgA
2QIDAQAB
-----END PUBLIC KEY-----`;

function getFireblocksPublicKey(): string {
  return (process.env.FIREBLOCKS_BASE_PATH || "sandbox") === "sandbox"
    ? FIREBLOCKS_SANDBOX_PUBLIC_KEY
    : FIREBLOCKS_PRODUCTION_PUBLIC_KEY;
}

function verifySignature(signature: string, body: string): boolean {
  try {
    const verifier = crypto.createVerify("RSA-SHA512");
    verifier.update(body);
    return verifier.verify(getFireblocksPublicKey(), Buffer.from(signature, "base64"));
  } catch {
    return false;
  }
}

// ─── Webhook Types ───────────────────────────────────────────────────────────

interface WebhookPayload {
  type: string;
  tenantId: string;
  timestamp: number;
  data: {
    id: string;
    status: string;
    subStatus?: string;
    txHash?: string;
    operation: string;
    assetId: string;
    source: { type: string; id?: string; name?: string };
    destination: { type: string; id?: string; name?: string };
    amountInfo: {
      amount: string;
      requestedAmount?: string;
      netAmount?: string;
      amountUSD?: string;
    };
    destinationAddress?: string;
    destinationAddressDescription?: string;
    createdAt: number;
    lastUpdated: number;
    customerRefId?: string;
    externalTxId?: string;
  };
}

// ─── Main Handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("fireblocks-signature");

  if (!signature) {
    console.warn("Webhook received without signature");
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  if (!verifySignature(signature, body)) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Invalid webhook signature - allowing in development mode");
    } else {
      console.error("Invalid webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  try {
    const payload: WebhookPayload = JSON.parse(body);

    console.log(`[Webhook] ${payload.type}`, {
      txId: payload.data?.id,
      status: payload.data?.status,
      asset: payload.data?.assetId,
      destAddress: payload.data?.destinationAddress,
      destVault: payload.data?.destination?.id,
      amountUSD: payload.data?.amountInfo?.amountUSD,
    });

    switch (payload.type) {
      case "TRANSACTION_CREATED":
        await handleTransactionCreated(payload);
        break;
      case "TRANSACTION_STATUS_UPDATED":
        await handleTransactionStatusUpdated(payload);
        break;
      default:
        console.log(`[Webhook] Unhandled type: ${payload.type}`);
    }

    // Opportunistically expire old sessions
    await expireOldSessions().catch(() => {});

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Webhook] Processing error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

// ─── Transaction Created ─────────────────────────────────────────────────────

async function handleTransactionCreated(payload: WebhookPayload) {
  const { data } = payload;

  // Only incoming to vault accounts
  if (data.destination.type !== "VAULT_ACCOUNT") return;

  console.log(`[Webhook] New incoming tx detected:`, {
    txId: data.id,
    asset: data.assetId,
    amount: data.amountInfo.amount,
    amountUSD: data.amountInfo.amountUSD,
    destAddress: data.destinationAddress,
    vaultId: data.destination.id,
  });

  await prisma.platformActivity.create({
    data: {
      eventType: "payment_initiated",
      status: "pending",
      amount: parseFloat(data.amountInfo.amountUSD || "0"),
      metadata: {
        transactionId: data.id,
        assetId: data.assetId,
        amount: data.amountInfo.amount,
        vaultAccountId: data.destination.id,
        destinationAddress: data.destinationAddress,
        txHash: data.txHash,
      },
    },
  });
}

// ─── Transaction Status Updated ──────────────────────────────────────────────

async function handleTransactionStatusUpdated(payload: WebhookPayload) {
  const { data } = payload;

  if (data.destination.type !== "VAULT_ACCOUNT") return;

  console.log(`[Webhook] Status update: ${data.status}`, {
    txId: data.id,
    asset: data.assetId,
    amountUSD: data.amountInfo.amountUSD,
    destAddress: data.destinationAddress,
  });

  switch (data.status) {
    case "COMPLETED":
      await handleCompleted(data);
      break;
    case "CONFIRMING":
      await handleConfirming(data);
      break;
    case "FAILED":
    case "CANCELLED":
    case "REJECTED":
    case "BLOCKED":
      await handleFailed(data);
      break;
  }
}

// ─── Find the matching PaymentSession ────────────────────────────────────────

/**
 * Identify which payment session this transaction belongs to.
 *
 * Strategy:
 *   1. Match by destination address (most reliable — unique per session for UTXO)
 *   2. Fallback to vault ID (works because each user has their own vault)
 */
async function findMatchingSession(data: WebhookPayload["data"]) {
  // 1. Try matching by deposit address
  if (data.destinationAddress) {
    const session = await findSessionByDepositAddress(data.destinationAddress);
    if (session) {
      console.log(`[Webhook] Matched by address: session ${session.id}`);
      return session;
    }
  }

  // 2. Fallback: match by vault ID (per-user vault ensures correct user)
  if (data.destination.id) {
    const session = await findSessionByVaultId(data.destination.id);
    if (session) {
      console.log(`[Webhook] Matched by vaultId: session ${session.id}`);
      return session;
    }
  }

  return null;
}

// ─── Handle COMPLETED ────────────────────────────────────────────────────────

async function handleCompleted(data: WebhookPayload["data"]) {
  const amountUsd   = parseFloat(data.amountInfo.amountUSD || "0");
  const amountCrypto = data.amountInfo.amount;

  const session = await findMatchingSession(data);

  if (!session) {
    // Unknown payment — log for manual review
    const detectedTier = getTierFromAmount(amountUsd);
    console.warn(`[Webhook] No matching session for completed tx ${data.id}`);

    await prisma.platformActivity.create({
      data: {
        eventType: "unexpected_payment",
        status: "pending",
        amount: amountUsd,
        metadata: {
          transactionId: data.id,
          destinationAddress: data.destinationAddress,
          vaultAccountId: data.destination.id,
          detectedTier,
          assetId: data.assetId,
          txHash: data.txHash,
          note: "Payment received without matching session - needs manual review",
        },
      },
    });
    return;
  }

  const pkg = TIER_PACKAGES[session.tier];
  if (!pkg) {
    console.error(`[Webhook] Unknown tier: ${session.tier}`);
    return;
  }

  // Check if amount is sufficient (2% tolerance for price fluctuations)
  if (!isPaymentSufficient(amountUsd, pkg.price)) {
    console.warn(`[Webhook] Insufficient: received $${amountUsd}, expected $${pkg.price}`);

    await prisma.$transaction([
      prisma.paymentSession.update({
        where: { id: session.id },
        data: {
          status: "partial",
          fireblocksTxId: data.id,
          txHash: data.txHash,
          amountReceived: amountUsd,
          amountCrypto,
        },
      }),
      prisma.purchase.update({
        where: { id: session.purchaseId },
        data: { status: "partial" },
      }),
      prisma.platformActivity.create({
        data: {
          eventType: "partial_payment",
          userId: session.userId,
          userEmail: session.email,
          status: "pending",
          amount: amountUsd,
          metadata: {
            sessionId: session.id,
            transactionId: data.id,
            expectedAmount: pkg.price,
            receivedAmount: amountUsd,
            purchaseId: session.purchaseId,
          },
        },
      }),
    ]);
    return;
  }

  // Payment is sufficient — complete the purchase!
  try {
    await prisma.$transaction([
      // Update PaymentSession
      prisma.paymentSession.update({
        where: { id: session.id },
        data: {
          status: "completed",
          fireblocksTxId: data.id,
          txHash: data.txHash,
          amountReceived: amountUsd,
          amountCrypto,
        },
      }),

      // Update Purchase
      prisma.purchase.update({
        where: { id: session.purchaseId },
        data: { status: "completed" },
      }),

      // Activate affiliate membership
      prisma.affiliateStatus.upsert({
        where: { userId: session.userId },
        create: {
          userId: session.userId,
          tier: session.tier as any,
          tierDepthLimit: getTierDepth(session.tier),
          isActive: true,
        },
        update: {
          tier: session.tier as any,
          tierDepthLimit: getTierDepth(session.tier),
          isActive: true,
          updatedAt: new Date(),
        },
      }),

      // Create revenue event for commission tracking
      prisma.revenueEvent.create({
        data: {
          userId: session.userId,
          source: "membership_purchase",
          amountUsd: pkg.price,
          status: "settled",
          externalReference: data.id,
          settledAt: new Date(),
        },
      }),

      // Log success
      prisma.platformActivity.create({
        data: {
          eventType: "payment_completed",
          userId: session.userId,
          userEmail: session.email,
          status: "completed",
          amount: amountUsd,
          metadata: {
            sessionId: session.id,
            transactionId: data.id,
            tier: session.tier,
            purchaseId: session.purchaseId,
            txHash: data.txHash,
            assetId: data.assetId,
            depositAddress: data.destinationAddress,
          },
        },
      }),
    ]);

    console.log(`[Webhook] PAYMENT COMPLETED: user=${session.userId} tier=${session.tier} amount=$${amountUsd}`);
  } catch (error) {
    console.error("[Webhook] Error completing payment:", error);
    throw error;
  }
}

// ─── Handle CONFIRMING ───────────────────────────────────────────────────────

async function handleConfirming(data: WebhookPayload["data"]) {
  const session = await findMatchingSession(data);
  if (!session) return;

  await prisma.$transaction([
    prisma.paymentSession.update({
      where: { id: session.id },
      data: {
        status: "confirming",
        fireblocksTxId: data.id,
        txHash: data.txHash,
        amountReceived: parseFloat(data.amountInfo.amountUSD || "0"),
        amountCrypto: data.amountInfo.amount,
      },
    }),
    prisma.purchase.update({
      where: { id: session.purchaseId },
      data: { status: "confirming" },
    }),
  ]);

  console.log(`[Webhook] Session ${session.id} status -> confirming`);
}

// ─── Handle FAILED/CANCELLED/REJECTED/BLOCKED ───────────────────────────────

async function handleFailed(data: WebhookPayload["data"]) {
  const session = await findMatchingSession(data);

  await prisma.platformActivity.create({
    data: {
      eventType: "payment_failed",
      userId: session?.userId,
      userEmail: session?.email,
      status: "failed",
      amount: parseFloat(data.amountInfo.amountUSD || "0"),
      metadata: {
        sessionId: session?.id,
        transactionId: data.id,
        vaultAccountId: data.destination.id,
        destinationAddress: data.destinationAddress,
        status: data.status,
        subStatus: data.subStatus,
      },
    },
  });

  if (session) {
    await prisma.$transaction([
      prisma.paymentSession.update({
        where: { id: session.id },
        data: { status: "failed", fireblocksTxId: data.id },
      }),
      prisma.purchase.update({
        where: { id: session.purchaseId },
        data: { status: "failed" },
      }),
    ]);
    console.log(`[Webhook] Session ${session.id} status -> failed (${data.status})`);
  }
}
