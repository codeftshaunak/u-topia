/**
 * Purchase Verification API
 *
 * POST /api/verify-purchase
 * Body: { paymentId?: string, tier?: string }
 *
 * Verifies a completed purchase. Used by the success page after payment.
 * Checks both the Purchase record and the PaymentSession record.
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { paymentId } = body;

    // If a specific payment/session ID is provided, look it up
    if (paymentId) {
      // Try PaymentSession first (new flow)
      const paymentSession = await prisma.paymentSession.findFirst({
        where: {
          OR: [
            { id: paymentId },
            { externalTxId: paymentId },
          ],
          userId: session.id,
        },
        include: { purchase: true },
      });

      if (paymentSession) {
        return NextResponse.json({
          verified: paymentSession.status === "completed",
          tier: paymentSession.tier,
          status: paymentSession.status,
          txHash: paymentSession.txHash,
          emailSent: false,
        });
      }

      // Fallback: check Purchase by stripeSessionId (backward compat)
      const purchase = await prisma.purchase.findFirst({
        where: {
          stripeSessionId: paymentId,
          userId: session.id,
        },
      });

      if (purchase) {
        return NextResponse.json({
          verified: purchase.status === "completed",
          tier: purchase.tier,
          status: purchase.status,
          emailSent: false,
        });
      }

      return NextResponse.json({ verified: false, error: "Payment not found" });
    }

    // No payment ID — check for any completed purchase for this user
    const latestPurchase = await prisma.purchase.findFirst({
      where: { userId: session.id, status: "completed" },
      orderBy: { createdAt: "desc" },
    });

    if (latestPurchase) {
      return NextResponse.json({
        verified: true,
        tier: latestPurchase.tier,
        emailSent: false,
      });
    }

    return NextResponse.json({ verified: false, error: "No completed purchase found" });
  } catch (error) {
    console.error("Purchase verification error:", error);
    return NextResponse.json({ error: "Failed to verify purchase" }, { status: 500 });
  }
}
