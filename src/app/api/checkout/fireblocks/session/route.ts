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
import { getPaymentSessionStatus, TIER_PACKAGES, SUPPORTED_ASSETS, getBtcRateUsd, usdToBtc } from "@/lib/fireblocks-payment";

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

    // Determine amountCrypto: ALWAYS use the value stored at session creation.
    // The BTC/USD rate fluctuates — the user must send the exact amount they
    // were quoted, so we must never recalculate this on reload.
    const storedCrypto = parseFloat(paymentSession.amountCrypto || "0");

    let amountCrypto: number;
    let btcRateUsd: number;

    if (storedCrypto > 0) {
      // Use the stored required amount (locked at session creation – financial invariant).
      amountCrypto = storedCrypto;
      // Derive the original rate from stored values so the displayed rate is
      // consistent with the quoted amount (avoids confusing rate vs amount mismatch).
      btcRateUsd = paymentSession.amountUsd / storedCrypto;
    } else {
      // Fallback: session was created without storing amountCrypto (legacy sessions).
      // Compute from live rate so the user still sees a valid amount to send.
      btcRateUsd = await getBtcRateUsd();
      amountCrypto = usdToBtc(paymentSession.amountUsd, btcRateUsd);
    }

    return NextResponse.json({
      sessionId: paymentSession.sessionId,
      purchaseId: paymentSession.purchaseId,
      tier: paymentSession.tier,
      tierName: pkg?.name || paymentSession.tier,
      priceUsd: paymentSession.amountUsd,
      amountCrypto,
      btcRateUsd,
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
          `Send exactly ${amountCrypto.toFixed(8)} BTC (≈ $${pkg?.price || paymentSession.amountUsd} USD) to the address below`,
          "Copy the deposit address or scan the QR code",
          "Wait for blockchain confirmation (usually 10–30 minutes for BTC)",
          "Your membership will activate automatically",
        ],
        note: `Rate: 1 BTC = $${btcRateUsd.toLocaleString()} USD. Each address is unique to your session.`,
      },
    });
  } catch (error) {
    console.error("Payment session retrieval error:", error);
    return NextResponse.json({ error: "Failed to retrieve payment session" }, { status: 500 });
  }
}
