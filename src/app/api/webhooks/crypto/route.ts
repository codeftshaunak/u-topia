import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/crypto-payment";
import prisma from "@/lib/db";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("x-nowpayments-sig");

  if (!signature) {
    return NextResponse.json(
      { error: "No signature provided" },
      { status: 400 },
    );
  }

  // Verify webhook signature
  const isValid = verifyWebhookSignature(signature, body);
  if (!isValid) {
    console.error("Invalid webhook signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    const payload = JSON.parse(body);
    const {
      payment_id,
      payment_status,
      order_id,
      price_amount,
      price_currency,
      pay_amount,
      actually_paid,
      pay_currency,
      outcome_amount,
      outcome_currency,
    } = payload;

    console.log(
      `Webhook received for payment ${payment_id}: ${payment_status}`,
    );

    // Handle different payment statuses
    switch (payment_status.toLowerCase()) {
      case "finished":
      case "confirmed": {
        // Payment is completed - record in database
        await handleCompletedPayment(payment_id, order_id, price_amount);
        break;
      }

      case "failed":
      case "expired": {
        // Payment failed - update status
        await handleFailedPayment(payment_id, order_id, payment_status);
        break;
      }

      case "waiting":
      case "confirming":
      case "sending":
        // Payment is in progress - log it
        console.log(`Payment ${payment_id} is ${payment_status}`);
        break;

      default:
        console.log(`Unknown payment status: ${payment_status}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing crypto webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}

async function handleCompletedPayment(
  paymentId: string,
  orderId: string,
  priceAmount: number,
) {
  try {
    // Extract user ID and tier from order ID
    // Format: userId_tier_timestamp
    const parts = orderId.split("_");
    if (parts.length < 2) {
      console.error("Invalid order ID format:", orderId);
      return;
    }

    const userId = parts[0];
    const tier = parts[1];

    // Check if purchase already exists
    const existingPurchase = await prisma.purchase.findFirst({
      where: { stripeSessionId: paymentId },
    });

    if (existingPurchase) {
      console.log("Purchase already recorded:", paymentId);
      return;
    }

    // Get user's email
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!user) {
      console.error("User not found:", userId);
      return;
    }

    // Record the purchase
    await prisma.purchase.create({
      data: {
        userId,
        email: user.email,
        tier: tier.toLowerCase(),
        amount: priceAmount * 100, // Convert to cents
        status: "completed",
        stripeSessionId: paymentId, // Reusing for crypto payment ID
        stripePaymentIntentId: orderId,
      },
    });

    // Update affiliate status
    await prisma.affiliateStatus.upsert({
      where: { userId },
      create: {
        userId,
        tier: tier.toLowerCase(),
        tierDepthLimit: getTierDepth(tier),
        isActive: true,
      },
      update: {
        tier: tier.toLowerCase(),
        tierDepthLimit: getTierDepth(tier),
        isActive: true,
        updatedAt: new Date(),
      },
    });

    console.log(`Purchase processed for user ${userId}, tier: ${tier}`);
  } catch (error) {
    console.error("Error handling completed payment:", error);
    throw error;
  }
}

async function handleFailedPayment(
  paymentId: string,
  orderId: string,
  status: string,
) {
  try {
    // Check if purchase exists and update status
    const existingPurchase = await prisma.purchase.findFirst({
      where: { stripeSessionId: paymentId },
    });

    if (existingPurchase) {
      await prisma.purchase.update({
        where: { id: existingPurchase.id },
        data: { status: "failed" },
      });
      console.log(`Purchase ${paymentId} marked as failed`);
    }
  } catch (error) {
    console.error("Error handling failed payment:", error);
  }
}

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
