/**
 * Fireblocks Webhook Handler
 *
 * Processes real-time webhook notifications from Fireblocks:
 *   - TRANSACTION_CREATED     → logs detection
 *   - TRANSACTION_STATUS_UPDATED → matches payment session, updates status
 *
 * INTELLIGENT PAYMENT MATCHING STRATEGY:
 *   - UTXO chains (BTC): Match by unique depositAddress
 *   - Account-based chains (ETH, USDT, USDC, SOL): Match by vaultId + amount
 *
 * Why? Account-based chains reuse the SAME address for all payments to a vault,
 * so we must use the payment AMOUNT to determine which package tier was purchased.
 *
 * POST /api/webhooks/fireblocks
 */

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/db";
import { AffiliateTier } from "@prisma/client";
import {
  findSessionByDepositAddress,
  findSessionByVaultId,
  findSessionByVaultAndAmount,
  isUTXOChain,
  isAccountBasedChain,
  getTierFromAmount,
  getTierDepth,
  TIER_PACKAGES,
  expireOldSessions,
} from "@/lib/fireblocks-payment";
import {
  WebhookPayload,
  WebhookTransactionData,
  WEBHOOK_EVENT_TYPES,
  TRANSACTION_STATUS,
  FAILURE_STATUSES,
  ACCOUNT_TYPES,
  type FireblocksTransactionStatus,
} from "./types";

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
// See ./types.ts for WebhookPayload interface definition

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

    console.log(`[Webhook] ${payload.eventType}`, {
      txId: payload.data?.id,
      status: payload.data?.status,
      asset: payload.data?.assetId,
      destAddress: payload.data?.destinationAddress,
      destVault: payload.data?.destination?.id,
      amountUSD: payload.data?.amountUSD,
    });

    switch (payload.eventType) {
      case "transaction.created":
        await handleTransactionCreated(payload);
        break;
      case "transaction.status.updated":
        await handleTransactionStatusUpdated(payload);
        break;
      default:
        console.log(`[Webhook] Unhandled event type: ${payload.eventType}`);
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
  if (data.destination.type !== ACCOUNT_TYPES.VAULT_ACCOUNT) return;

  console.log(`[Webhook] New incoming tx detected:`, {
    txId: data.id,
    asset: data.assetId,
    amount: data.amountInfo.amount,
    amountUSD: data.amountUSD,
    destAddress: data.destinationAddress,
    vaultId: data.destination.id,
    status: data.status,
  });

  await prisma.platformActivity.create({
    data: {
      eventType: "payment_initiated",
      status: "pending",
      amount: data.amountUSD || 0,
      metadata: {
        transactionId: data.id,
        assetId: data.assetId,
        amount: data.amountInfo.amount,
        vaultAccountId: data.destination.id,
        destinationAddress: data.destinationAddress,
        fireblocksStatus: data.status,
      },
    },
  });

  // IMPORTANT: Also update the matching payment session with initial status
  // Many incoming transactions are created already in CONFIRMING status,
  // so we need to update the session immediately, not just wait for status.updated
  if (data.status === TRANSACTION_STATUS.CONFIRMING) {
    await handleConfirming(data);
  } else if (data.status === TRANSACTION_STATUS.COMPLETED) {
    await handleCompleted(data);
  }
}

// ─── Transaction Status Updated ──────────────────────────────────────────────

async function handleTransactionStatusUpdated(payload: WebhookPayload) {
  const { data } = payload;
  if (data.destination.type !== ACCOUNT_TYPES.VAULT_ACCOUNT) return;

  console.log(`[Webhook] Status update: ${data.status}${data.subStatus ? ` / ${data.subStatus}` : ""}`, {
    txId: data.id,
    asset: data.assetId,
    amountUSD: data.amountInfo.amountUSD,
    amountCrypto: data.amountInfo.amount,
    destAddress: data.destinationAddress,
    vaultId: data.destination.id,
  });

  switch (data.status) {
    case TRANSACTION_STATUS.COMPLETED:
      await handleCompleted(data);
      break;
    case TRANSACTION_STATUS.CONFIRMING:
      await handleConfirming(data);
      break;
    case TRANSACTION_STATUS.FAILED:
    case TRANSACTION_STATUS.CANCELLED:
    case TRANSACTION_STATUS.REJECTED:
    case TRANSACTION_STATUS.BLOCKED:
      await handleFailed(data);
      break;
    // ── Intermediate / in-progress statuses ──────────────────────────────────
    case TRANSACTION_STATUS.SUBMITTED:
    case TRANSACTION_STATUS.QUEUED:
    case TRANSACTION_STATUS.PENDING_AML_SCREENING:
    case TRANSACTION_STATUS.PENDING_ENRICHMENT:
    case TRANSACTION_STATUS.PENDING_AUTHORIZATION:
    case TRANSACTION_STATUS.PENDING_SIGNATURE:
    case TRANSACTION_STATUS.PENDING_3RD_PARTY_MANUAL_APPROVAL:
    case TRANSACTION_STATUS.PENDING_3RD_PARTY:
    case TRANSACTION_STATUS.BROADCASTING:
    case TRANSACTION_STATUS.CANCELLING:
    case TRANSACTION_STATUS.SIGNED:
      await handleIntermediateStatus(data);
      break;
    default:
      console.log(`[Webhook] Unhandled Fireblocks status: ${data.status}`);
  }
}

// ─── Handle Intermediate / In-Progress Statuses ──────────────────────────────

async function handleIntermediateStatus(data: WebhookPayload["data"]) {
  const session = await findMatchingSession(data);
  if (!session) {
    console.warn(`[Webhook] INTERMEDIATE (${data.status}): No matching session found for tx ${data.id}`);
    return;
  }

  // Map Fireblocks status → our session display status
  const inProgressStatuses: Partial<Record<FireblocksTransactionStatus, string>> = {
    SUBMITTED:                        "pending",
    QUEUED:                           "pending",
    PENDING_AML_SCREENING:            "pending",
    PENDING_ENRICHMENT:               "pending",
    PENDING_AUTHORIZATION:            "pending",
    PENDING_SIGNATURE:                "pending",
    PENDING_3RD_PARTY_MANUAL_APPROVAL: "pending",
    PENDING_3RD_PARTY:                "pending",
    BROADCASTING:                     "broadcasting",
    CANCELLING:                       "cancelling",
    SIGNED:                           "confirming",
  };

  const sessionStatus = inProgressStatuses[data.status as FireblocksTransactionStatus] ?? "pending";
  const rawStatus = data.status as FireblocksTransactionStatus;

  await prisma.paymentSession.update({
    where: { id: session.id },
    data: {
      fireblocksStatus: rawStatus,
      fireblocksTxId: data.id,
      ...(sessionStatus !== session.status && { status: sessionStatus }),
    },
  });

  console.log(`[Webhook] Session ${session.id}: fireblocksStatus → ${rawStatus} (status=${sessionStatus})`);
}

// ─── Find the matching PaymentSession ────────────────────────────────────────

/**
 * INTELLIGENT PAYMENT MATCHING
 *
 * Solves the "one vault per user" challenge where account-based chains
 * (ETH, USDT, USDC, SOL) reuse the SAME address for multiple payments.
 *
 * Strategy:
 *   1. Match by customerRefId (if available from metadata)
 *   2. For UTXO chains (BTC): Match by unique depositAddress
 *   3. For Account-based chains (ETH, etc): Match by vaultId + amount
 *   4. Fallback: Most recent pending session for vault
 */
async function findMatchingSession(data: WebhookPayload["data"]) {
  const assetId = data.assetId;
  const depositAddress = data.destinationAddress;
  const vaultId = data.destination.id;
  const amountUsd = data.amountUSD || 0;

  console.log(`[Payment Matching] Asset: ${assetId}, Amount: $${amountUsd}, Vault: ${vaultId}`);

  // 1. For UTXO chains: Match by unique deposit address (includes partial sessions)
  if (isUTXOChain(assetId) && depositAddress) {
    const session = await findSessionByDepositAddress(depositAddress);
    if (session) {
      console.log(`[✓] UTXO Match by address: ${session.tier} (${session.id}) status=${session.status}`);
      return session;
    }
    console.warn(`[Payment Matching] No session found for address: ${depositAddress}`);
  }

  // 3. For Account-based chains: Match by vault + amount
  if (isAccountBasedChain(assetId) && vaultId) {
    const session = await findSessionByVaultAndAmount(vaultId, amountUsd);
    if (session) {
      console.log(`[✓] Account-based Match by amount: ${session.tier} (${session.id})`);
      return session;
    }
  }

  // 4. UTXO fallback: Try vault ID (in case address lookup failed)
  if (isUTXOChain(assetId) && vaultId) {
    const session = await findSessionByVaultId(vaultId);
    if (session) {
      console.log(`[✓] UTXO Fallback by vault: ${session.tier} (${session.id})`);
      return session;
    }
  }

  // 5. Try externalTxId (rare, but possible)
  if (data.externalTxId) {
    const session = await prisma.paymentSession.findFirst({
      where: { externalTxId: data.externalTxId, status: { in: ["pending", "broadcasting", "cancelling", "confirming"] } },
    });
    if (session) {
      console.log(`[✓] Matched by externalTxId: ${session.tier} (${session.id})`);
      return session;
    }
  }

  console.warn(`[✗] No matching session found for ${assetId} payment of $${amountUsd}`);
  return null;
}

// ─── Handle COMPLETED ────────────────────────────────────────────────────────

async function handleCompleted(data: WebhookPayload["data"]) {
  const amountUsd   = data.amountUSD || 0;
  const amountCrypto = parseFloat(data.amountInfo.amount || "0");

  const session = await findMatchingSession(data);

  if (!session) {
    // Unknown payment — log for manual review
    const detectedTier = getTierFromAmount(amountUsd);
    console.warn(`[Webhook] COMPLETED: No matching session for tx ${data.id} (amount: $${amountUsd}, asset: ${data.assetId}, vault: ${data.destination.id})`);

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

  // Validate received crypto amount against session's stored amountCrypto.
  // Accept if received >= stored (same amount or overpayment both pass).
  // USD is NOT checked — BTC/USD rate fluctuates and is unreliable for validation.
  const sessionAmountCrypto = parseFloat(session.amountCrypto || "0");
  console.log(`[Webhook] Crypto check — received: ${amountCrypto} BTC, session requires: ${sessionAmountCrypto} BTC, pass: ${amountCrypto >= sessionAmountCrypto}`);
  if (sessionAmountCrypto > 0 && amountCrypto < sessionAmountCrypto) {
    console.warn(
      `[Webhook] Insufficient crypto: received ${amountCrypto} BTC, ` +
      `session requires ${sessionAmountCrypto} BTC (session ${session.id})`
    );

    await prisma.$transaction([
      prisma.paymentSession.update({
        where: { id: session.id },
        data: {
          status: "partial",
          fireblocksTxId: data.id,
          txHash: data.txHash,
          amountReceived: amountUsd,
          // NOTE: amountCrypto is intentionally NOT updated here.
          // It stores the required BTC amount (set at session creation) and must
          // never be overwritten by the received amount. This ensures the UI
          // always shows the correct amount to pay, even after a partial payment.
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
            expectedCrypto: sessionAmountCrypto,
            receivedCrypto: amountCrypto,
            purchaseId: session.purchaseId,
          },
        },
      }),
    ]);
    return;
  }

  // Crypto amount is sufficient (received >= required) — complete the purchase!

  // Payment is sufficient — complete the purchase!
  try {
    await prisma.$transaction([
      // Update PaymentSession
      prisma.paymentSession.update({
        where: { id: session.id },
        data: {
          status: "completed",
          fireblocksStatus: "COMPLETED",
          fireblocksTxId: data.id,
          txHash: data.txHash,
          amountReceived: amountUsd,
          // NOTE: amountCrypto is intentionally NOT updated here.
          // It stores the required BTC amount (set at session creation) and must
          // never be overwritten by the received amount.
        },
      }),

      // Update Purchase
      prisma.purchase.update({
        where: { id: session.purchaseId },
        data: { status: "completed" },
      }),

      // Update User with current package, activation time, and points (100% of purchase)
      prisma.user.update({
        where: { id: session.userId },
        data: {
          currentPackage: session.tier as AffiliateTier,
          packageActivatedAt: new Date(),
          totalPoints: {
            increment: pkg.price, // 100% of purchase amount as points
          },
        },
      }),

      // Activate affiliate membership
      prisma.affiliateStatus.upsert({
        where: { userId: session.userId },
        create: {
          userId: session.userId,
          tier: session.tier as AffiliateTier,
          tierDepthLimit: getTierDepth(session.tier),
          isActive: true,
        },
        update: {
          tier: session.tier as AffiliateTier,
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

      // Store transaction history
      prisma.transactionHistory.create({
        data: {
          purchaseId: session.purchaseId,
          userId: session.userId,
          provider: "fireblocks",
          transactionId: data.id,
          status: data.status,
          subStatus: data.subStatus,
          eventType: "TRANSACTION_COMPLETED",
          amount: parseFloat(data.amountInfo.amount || "0"),
          amountUsd: amountUsd,
          networkFee: parseFloat(data.feeInfo?.networkFee || "0"),
          currency: data.assetId,
          txHash: data.txHash,
          sourceAddress: data.sourceAddress,
          destinationAddress: data.destinationAddress,
          blockHeight: data.blockInfo?.blockHeight,
          blockHash: data.blockInfo?.blockHash,
          confirmations: data.numOfConfirmations,
          note: data.note || null,
        },
      }),
    ]);

    console.log(`[Webhook] PAYMENT COMPLETED: user=${session.userId} tier=${session.tier} amount=$${amountUsd}`);

    // ─── Multi-Level Referral Commission (DB-driven) ────────────────────
    //
    // Walk up the referral chain (User.referredByUserId) up to MAX_DEPTH=8.
    // For each ancestor at level L:
    //   1. Look up the ancestor's OWN package from the packages DB table
    //   2. Read commissionLevels JSON: [{ level: 1, rate: 10 }, ...]
    //   3. Find the entry where level === L
    //   4. If found → commission = purchasePrice × rate / 100
    //   5. If missing → ancestor's package doesn't unlock that depth → skip
    //
    // Commission is based on the REFERRER's package, not the buyer's.
    try {
      const MAX_DEPTH = 8;

      // Fetch all packages from DB once (avoid N+1 queries)
      const allPackages = await prisma.package.findMany({
        where: { isActive: true },
      });
      const packageByName: Record<string, typeof allPackages[0]> = {};
      for (const p of allPackages) {
        packageByName[p.name.toLowerCase()] = p;
      }

      // Purchase price from DB package (fallback to TIER_PACKAGES for safety)
      const dbPackage = packageByName[session.tier.toLowerCase()];
      const purchasePrice = dbPackage?.priceUsd ?? pkg.price;

      // Find the revenue event we just created for this purchase
      const revenueEvent = await prisma.revenueEvent.findFirst({
        where: {
          userId: session.userId,
          source: "membership_purchase",
          externalReference: data.id,
        },
        orderBy: { createdAt: "desc" },
      });

      if (!revenueEvent) {
        console.warn("[Webhook] Revenue event not found for commission calculation");
      }

      // Get the buyer's direct referrer
      const buyer = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { referredByUserId: true },
      });

      if (buyer?.referredByUserId && revenueEvent) {
        let currentUserId: string | null = buyer.referredByUserId;
        let layer = 1;
        const visitedIds = new Set<string>([session.userId]); // Prevent circular refs

        console.log(`[Commission] Starting chain walk for purchase: $${purchasePrice} (${session.tier})`);

        while (currentUserId && layer <= MAX_DEPTH) {
          if (visitedIds.has(currentUserId)) {
            console.warn(`[Commission] Circular referral at user ${currentUserId}, stopping`);
            break;
          }
          visitedIds.add(currentUserId);

          // Fetch the ancestor's details
          const ancestor = await prisma.user.findUnique({
            where: { id: currentUserId },
            select: {
              id: true,
              currentPackage: true,
              referredByUserId: true,
              affiliateStatus: { select: { isActive: true } },
            },
          });

          if (!ancestor) break;

          const hasPackage = !!ancestor.currentPackage;
          const isActive = ancestor.affiliateStatus?.isActive ?? false;

          if (hasPackage && isActive) {
            // Look up the ancestor's PACKAGE from DB
            const ancestorPkg = packageByName[ancestor.currentPackage!.toLowerCase()];

            if (ancestorPkg) {
              // Parse commission levels from DB JSON
              const levels = (ancestorPkg.commissionLevels as Array<{ level: number; rate: number }>) ?? [];
              const levelEntry = levels.find(l => l.level === layer);

              if (levelEntry && levelEntry.rate > 0) {
                const commissionAmount = parseFloat((purchasePrice * levelEntry.rate / 100).toFixed(2));

                if (commissionAmount > 0) {
                  // Calculate points for referrer (1% of purchase price)
                  const referrerPoints = parseFloat((purchasePrice * 0.01).toFixed(2));

                  // Create commission and award points to referrer in a transaction
                  await prisma.$transaction([
                    prisma.commission.create({
                      data: {
                        beneficiaryUserId: ancestor.id,
                        referredUserId: session.userId,
                        sourceRevenueEventId: revenueEvent.id,
                        layer,
                        ratePercent: levelEntry.rate,
                        amountUsd: commissionAmount,
                        status: "approved",
                        notes: `L${layer} commission: ${ancestor.currentPackage} referrer earns ${levelEntry.rate}% on $${purchasePrice} ${session.tier} purchase`,
                      },
                    }),
                    // Award 1% points to referrer
                    prisma.user.update({
                      where: { id: ancestor.id },
                      data: {
                        totalPoints: {
                          increment: referrerPoints,
                        },
                      },
                    }),
                  ]);

                  console.log(
                    `[Commission] PAID L${layer}: ancestor=${ancestor.id} (${ancestor.currentPackage}) ` +
                    `rate=${levelEntry.rate}% amount=$${commissionAmount} points=+${referrerPoints} (from $${purchasePrice} ${session.tier})`
                  );
                }
              } else {
                console.log(
                  `[Commission] SKIP L${layer}: ancestor=${ancestor.id} (${ancestor.currentPackage}) ` +
                  `— package has no rate for level ${layer} (max depth: ${levels.length})`
                );
              }
            } else {
              console.log(
                `[Commission] SKIP L${layer}: ancestor=${ancestor.id} ` +
                `— package "${ancestor.currentPackage}" not found in DB`
              );
            }
          } else {
            console.log(
              `[Commission] SKIP L${layer}: ancestor=${ancestor.id} ` +
              `hasPackage=${hasPackage} isActive=${isActive}`
            );
          }

          // Move up the chain
          currentUserId = ancestor.referredByUserId;
          layer++;
        }
      }
    } catch (commissionErr) {
      // Don't fail the whole payment if commission calculation fails
      console.error("[Webhook] Error calculating multi-level commissions:", commissionErr);
    }
  } catch (error) {
    console.error("[Webhook] Error completing payment:", error);
    throw error;
  }
}

// ─── Handle CONFIRMING ───────────────────────────────────────────────────────

async function handleConfirming(data: WebhookPayload["data"]) {
  const session = await findMatchingSession(data);
  if (!session) {
    console.warn(`[Webhook] CONFIRMING: No matching session found for tx ${data.id}`);
    return;
  }

  await prisma.$transaction([
    prisma.paymentSession.update({
      where: { id: session.id },
      data: {
        status: "confirming",
        fireblocksStatus: "CONFIRMING",
        fireblocksTxId: data.id,
        txHash: data.txHash,
        amountReceived: parseFloat(data.amountInfo.amountUSD || "0"),
        // NOTE: amountCrypto is intentionally NOT updated here.
        // It stores the required BTC amount (set at session creation) and must
        // never be overwritten by the received amount.
      },
    }),
    prisma.purchase.update({
      where: { id: session.purchaseId },
      data: { status: "confirming" },
    }),
  ]);

  console.log(`[Webhook] Session ${session.id} status -> confirming (fireblocksStatus: CONFIRMING)`);
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
      amount: data.amountUSD || 0,
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
        data: {
          status: "failed",
          fireblocksStatus: data.status as FireblocksTransactionStatus,
          fireblocksTxId: data.id,
        },
      }),
      prisma.purchase.update({
        where: { id: session.purchaseId },
        data: { status: "failed" },
      }),
    ]);
    console.log(`[Webhook] Session ${session.id} status -> failed (fireblocksStatus: ${data.status})`);
  } else {
    console.warn(`[Webhook] FAILED: No matching session found for tx ${data.id}`);
  }
}
