/**
 * Unified Checkout API
 *
 * POST /api/checkout
 * Body: { tier: string, assetId: string }
 *
 * Creates a payment session with a unique deposit address for the selected
 * cryptocurrency. The user sends crypto to this address and the webhook
 * handler automatically detects and confirms the payment.
 *
 * GET /api/checkout
 * Returns available providers, tiers, and supported assets.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import {
  createPaymentSession,
  TIER_PACKAGES,
  SUPPORTED_ASSETS,
  isFireblocksConfigured,
} from "@/lib/fireblocks-payment";

export async function POST(request: NextRequest) {
  try {
    // Authenticate
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check Fireblocks
    if (!isFireblocksConfigured()) {
      return NextResponse.json(
        { error: "Payment system not configured" },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { tier, assetId } = body;

    // Validate tier
    if (!tier) {
      return NextResponse.json({ error: "Tier is required" }, { status: 400 });
    }

    const pkg = TIER_PACKAGES[tier.toLowerCase()];
    if (!pkg) {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }

    // Validate asset
    if (!assetId) {
      return NextResponse.json(
        { error: "Please select a cryptocurrency (assetId is required)" },
        { status: 400 }
      );
    }

    const asset = SUPPORTED_ASSETS.find((a) => a.id === assetId);
    if (!asset) {
      return NextResponse.json(
        { error: `Unsupported cryptocurrency: ${assetId}` },
        { status: 400 }
      );
    }

    // Create payment session
    const paymentSession = await createPaymentSession(
      session.id,
      session.email,
      tier,
      assetId
    );

    return NextResponse.json({
      provider: "fireblocks",
      sessionId: paymentSession.sessionId,
      purchaseId: paymentSession.purchaseId,
      tier: paymentSession.tier,
      tierName: pkg.name,
      priceUsd: paymentSession.priceUsd,
      amountCrypto: paymentSession.amountCrypto,
      btcRateUsd: paymentSession.btcRateUsd,
      assetId: paymentSession.assetId,
      assetName: paymentSession.assetName,
      depositAddress: paymentSession.depositAddress,
      depositTag: paymentSession.depositTag,
      vaultAccountId: paymentSession.vaultAccountId,
      expiresAt: paymentSession.expiresAt.toISOString(),
      supportedAssets: SUPPORTED_ASSETS,
      instructions: {
        title: "Complete Your Payment",
        steps: [
          `Send exactly ${paymentSession.amountCrypto.toFixed(8)} BTC (≈ $${pkg.price} USD) to the address below`,
          "Copy the deposit address or scan the QR code with your wallet",
          "Wait for blockchain confirmation (usually 10–30 minutes for BTC)",
          "Your membership will activate automatically once confirmed",
        ],
        note: `Rate: 1 BTC = $${paymentSession.btcRateUsd.toLocaleString()} USD. Each address is unique to your session.`,
      },
    });
  } catch (error) {
    console.error("Checkout error:", error);
    const message = error instanceof Error ? error.message : "Failed to initiate checkout";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * GET /api/checkout — Available tiers and assets
 */
export async function GET() {
  return NextResponse.json({
    provider: "fireblocks",
    available: isFireblocksConfigured(),
    tiers: Object.entries(TIER_PACKAGES).map(([key, value]) => ({
      id: key,
      name: value.name,
      price: value.price,
      shares: value.shares,
    })),
    supportedAssets: SUPPORTED_ASSETS,
  });
}
