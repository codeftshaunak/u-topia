/**
 * Payment Status API
 *
 * GET /api/checkout/fireblocks/status?sessionId=xxx
 *
 * Returns the current status of a payment session.
 * Called by the frontend polling loop every 15 seconds.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { getPaymentSessionStatus } from "@/lib/fireblocks-payment";

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

    const paymentStatus = await getPaymentSessionStatus(sessionId, session.id);

    if (!paymentStatus) {
      return NextResponse.json({ error: "Payment session not found" }, { status: 404 });
    }

    // User-friendly status messages
    const statusMessages: Record<string, string> = {
      pending:    "Waiting for payment. Send cryptocurrency to the deposit address.",
      confirming: "Payment detected! Waiting for blockchain confirmations.",
      completed:  "Payment confirmed! Your membership has been activated.",
      partial:    "Partial payment received. Please send the remaining amount or contact support.",
      failed:     "Payment failed. Please try again or contact support.",
      expired:    "Payment session expired. Please create a new session.",
    };

    return NextResponse.json({
      sessionId: paymentStatus.sessionId,
      purchaseId: paymentStatus.purchaseId,
      tier: paymentStatus.tier,
      amountUsd: paymentStatus.amountUsd,
      assetId: paymentStatus.assetId,
      depositAddress: paymentStatus.depositAddress,
      depositTag: paymentStatus.depositTag,
      status: paymentStatus.status,
      message: statusMessages[paymentStatus.status] || "Unknown status",
      fireblocksTxId: paymentStatus.fireblocksTxId,
      txHash: paymentStatus.txHash,
      amountReceived: paymentStatus.amountReceived,
      amountCrypto: paymentStatus.amountCrypto,
      expiresAt: paymentStatus.expiresAt.toISOString(),
      createdAt: paymentStatus.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Payment status error:", error);
    return NextResponse.json({ error: "Failed to get payment status" }, { status: 500 });
  }
}
