import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { sessionId, tier } = body;

    if (!sessionId) {
      // If no session ID, assume success (direct navigation)
      return NextResponse.json({
        verified: true,
        emailSent: false,
      });
    }

    // Verify with Stripe
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);

    if (checkoutSession.payment_status !== "paid") {
      return NextResponse.json({
        verified: false,
        emailSent: false,
        error: "Payment not completed",
      });
    }

    // Verify the session belongs to the current user
    if (checkoutSession.metadata?.userId !== session.userId) {
      return NextResponse.json(
        {
          verified: false,
          error: "Session mismatch",
        },
        { status: 403 },
      );
    }

    const purchaseTier = checkoutSession.metadata?.tier || tier;
    const amountPaid = checkoutSession.amount_total || 0;

    // Record the purchase in the database
    try {
      await prisma.purchase.create({
        data: {
          userId: session.userId,
          tier: purchaseTier.toLowerCase(),
          amount: amountPaid,
          status: "completed",
          stripeSessionId: sessionId,
          stripePaymentIntentId: checkoutSession.payment_intent as string,
        },
      });

      // Update user's affiliate tier
      await prisma.affiliateStatus.upsert({
        where: { userId: session.userId },
        create: {
          userId: session.userId,
          tier: purchaseTier.toLowerCase(),
          tierDepthLimit: getTierDepth(purchaseTier),
          isActive: true,
        },
        update: {
          tier: purchaseTier.toLowerCase(),
          tierDepthLimit: getTierDepth(purchaseTier),
          isActive: true,
          updatedAt: new Date(),
        },
      });

      // TODO: Send confirmation email
      // This could be implemented using a service like SendGrid, Resend, or AWS SES

      return NextResponse.json({
        verified: true,
        emailSent: false, // Set to true when email is implemented
        tier: purchaseTier,
      });
    } catch (dbError) {
      console.error("Database error during purchase verification:", dbError);
      return NextResponse.json({
        verified: true, // Payment was successful
        emailSent: false,
        error: "Failed to update records",
      });
    }
  } catch (error) {
    console.error("Purchase verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify purchase" },
      { status: 500 },
    );
  }
}

// Helper function to get tier depth
function getTierDepth(tier: string): number {
  const depths: Record<string, number> = {
    bronze: 1,
    silver: 2,
    gold: 3,
    platinum: 4,
    diamond: 5,
  };
  return depths[tier.toLowerCase()] || 1;
}
