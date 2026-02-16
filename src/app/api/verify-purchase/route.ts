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
    const { paymentId, tier } = body;

    if (!paymentId) {
      // If no payment ID, check for any completed purchase for this user
      const existingPurchase = await prisma.purchase.findFirst({
        where: {
          userId: session.id,
          status: "completed",
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      if (existingPurchase) {
        return NextResponse.json({
          verified: true,
          emailSent: false,
          tier: existingPurchase.tier,
        });
      }

      // No payment ID and no existing purchase
      return NextResponse.json({
        verified: false,
        error: "No payment found",
      });
    }

    // Check if payment exists and is completed
    const purchase = await prisma.purchase.findFirst({
      where: {
        stripeSessionId: paymentId, // Using this field for crypto payment ID
        userId: session.id,
      },
    });

    if (!purchase) {
      return NextResponse.json({
        verified: false,
        error: "Payment not found",
      });
    }

    if (purchase.status !== "completed") {
      return NextResponse.json({
        verified: false,
        emailSent: false,
        error: "Payment not completed",
        status: purchase.status,
      });
    }

    return NextResponse.json({
      verified: true,
      emailSent: false,
      tier: purchase.tier,
    });
  } catch (error) {
    console.error("Purchase verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify purchase" },
      { status: 500 },
    );
  }
}
