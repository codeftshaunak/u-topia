/**
 * Payment Session Retrieval API
 *
 * GET /api/checkout/fireblocks/session?sessionId=xxx
 *
 * Retrieves full session data for an existing payment session.
 * Used when the user returns to the payment page after navigating away.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { getPaymentSessionStatus, TIER_PACKAGES, SUPPORTED_ASSETS } from "@/lib/fireblocks-payment";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessionId = request.nextUrl.searchParams.get("sessionId");
    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    const paymentSession = await getPaymentSessionStatus(sessionId, session.id);
    if (!paymentSession) {
      return NextResponse.json({ error: "Payment session not found" }, { status: 404 });
    }

    const pkg = TIER_PACKAGES[paymentSession.tier];
    const asset = SUPPORTED_ASSETS.find((a) => a.id === paymentSession.assetId);

    return NextResponse.json({
      sessionId: paymentSession.sessionId,
      purchaseId: paymentSession.purchaseId,
      tier: paymentSession.tier,
      tierName: pkg?.name || paymentSession.tier,
      priceUsd: paymentSession.amountUsd,
      assetId: paymentSession.assetId,
      assetName: asset?.name || paymentSession.assetId,
      depositAddress: paymentSession.depositAddress,
      depositTag: paymentSession.depositTag,
      status: paymentSession.status,
      fireblocksTxId: paymentSession.fireblocksTxId,
      txHash: paymentSession.txHash,
      amountReceived: paymentSession.amountReceived,
      supportedAssets: SUPPORTED_ASSETS,
      expiresAt: paymentSession.expiresAt.toISOString(),
      createdAt: paymentSession.createdAt.toISOString(),
      instructions: {
        title: "Complete Your Payment",
        steps: [
          `Send exactly $${pkg?.price || paymentSession.amountUsd} USD worth of ${asset?.name || paymentSession.assetId} to the address below`,
          "Copy the deposit address or scan the QR code",
          "Wait for blockchain confirmation (usually 10-30 minutes)",
          "Your membership will activate automatically",
        ],
        note: "Each payment address is unique to your session. Do not reuse old addresses.",
      },
    });
  } catch (error) {
    console.error("Payment session retrieval error:", error);
    return NextResponse.json({ error: "Failed to retrieve payment session" }, { status: 500 });
  }
}
