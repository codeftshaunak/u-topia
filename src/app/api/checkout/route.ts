import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createCryptoPayment, TIER_PACKAGES } from "@/lib/crypto-payment";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { tier, payCurrency } = body;

    if (!tier) {
      return NextResponse.json({ error: "Tier is required" }, { status: 400 });
    }

    const packageInfo = TIER_PACKAGES[tier.toLowerCase()];
    if (!packageInfo) {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }

    // Get the base URL for redirects
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      request.headers.get("origin") ||
      "http://localhost:3000";

    const successUrl = `${baseUrl}/purchase-success?tier=${tier}`;
    const cancelUrl = `${baseUrl}/purchase`;
    const ipnCallbackUrl = `${baseUrl}/api/webhooks/crypto`;

    // Create crypto payment
    const payment = await createCryptoPayment(
      tier,
      session.userId,
      session.email,
      successUrl,
      cancelUrl,
      ipnCallbackUrl,
    );

    // Store payment info temporarily for verification
    // In a production system, you'd store this in a database
    return NextResponse.json({
      paymentId: payment.payment_id,
      payAddress: payment.pay_address,
      payAmount: payment.pay_amount,
      payCurrency: payment.pay_currency,
      priceAmount: payment.price_amount,
      priceCurrency: payment.price_currency,
      invoiceUrl: payment.invoice_url,
      orderId: payment.order_id,
      status: payment.payment_status,
    });
  } catch (error: any) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to initiate checkout" },
      { status: 500 },
    );
  }
}
