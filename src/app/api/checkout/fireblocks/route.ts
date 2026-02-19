/**
 * Fireblocks Checkout API Route (alias for /api/checkout with Fireblocks)
 *
 * POST /api/checkout/fireblocks — creates payment session
 * GET  /api/checkout/fireblocks — returns supported assets & tiers
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
    if (!isFireblocksConfigured()) {
      return NextResponse.json({ error: "Payment system not configured" }, { status: 503 });
    }

    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { tier, assetId } = body;

    if (!tier) {
      return NextResponse.json({ error: "Membership tier is required" }, { status: 400 });
    }

    const pkg = TIER_PACKAGES[tier.toLowerCase()];
    if (!pkg) {
      return NextResponse.json({ error: "Invalid membership tier" }, { status: 400 });
    }

    if (!assetId) {
      return NextResponse.json({ error: "Cryptocurrency selection (assetId) is required" }, { status: 400 });
    }

    const asset = SUPPORTED_ASSETS.find((a) => a.id === assetId);
    if (!asset) {
      return NextResponse.json({ error: `Unsupported asset: ${assetId}` }, { status: 400 });
    }

    const paymentSession = await createPaymentSession(session.id, session.email, tier, assetId);

    return NextResponse.json({
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
      supportedAssets: SUPPORTED_ASSETS,
      expiresAt: paymentSession.expiresAt.toISOString(),
      instructions: {
        title: "Complete Your Payment",
        steps: [
          `Send exactly ${paymentSession.amountCrypto} BTC (≈ $${pkg.price} USD) to the address below`,
          "Copy the deposit address or scan the QR code",
          "Wait for blockchain confirmation (usually 10–30 minutes for BTC)",
          "Your membership will activate automatically",
        ],
        note: `Rate: 1 BTC = $${paymentSession.btcRateUsd.toLocaleString()} USD. Each address is unique to your session.`,
      },
    });
  } catch (error) {
    console.error("Fireblocks checkout error:", error);
    const message = error instanceof Error ? error.message : "Failed to create payment session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    supportedAssets: SUPPORTED_ASSETS,
    tiers: Object.entries(TIER_PACKAGES).map(([key, value]) => ({
      id: key,
      name: value.name,
      price: value.price,
      shares: value.shares,
    })),
  });
}
