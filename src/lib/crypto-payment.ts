import axios from "axios";
import crypto from "crypto";

// NOWPayments API configuration
const NOWPAYMENTS_API_URL = "https://api.nowpayments.io/v1";
const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY;

if (!NOWPAYMENTS_API_KEY) {
  console.warn(
    "NOWPAYMENTS_API_KEY is not set - crypto payments will not work",
  );
}

// Tier pricing in USD
export const TIER_PACKAGES: Record<string, { name: string; price: number }> = {
  bronze: { name: "Bronze Membership", price: 100 },
  silver: { name: "Silver Membership", price: 250 },
  gold: { name: "Gold Membership", price: 500 },
  platinum: { name: "Platinum Membership", price: 1000 },
  diamond: { name: "Diamond Membership", price: 2500 },
};

export interface CryptoPaymentResponse {
  payment_id: string;
  payment_status: string;
  pay_address: string;
  price_amount: number;
  price_currency: string;
  pay_amount: number;
  pay_currency: string;
  order_id: string;
  order_description: string;
  ipn_callback_url?: string;
  invoice_url?: string;
  success_url?: string;
  cancel_url?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentStatusResponse {
  payment_id: string;
  payment_status: string;
  pay_address: string;
  price_amount: number;
  price_currency: string;
  pay_amount: number;
  actually_paid: number;
  pay_currency: string;
  order_id: string;
  order_description: string;
  purchase_id: string;
  created_at: string;
  updated_at: string;
  outcome_amount?: number;
  outcome_currency?: string;
}

// Create a crypto payment
export async function createCryptoPayment(
  tier: string,
  userId: string,
  email: string,
  successUrl: string,
  cancelUrl: string,
  ipnCallbackUrl: string,
): Promise<CryptoPaymentResponse> {
  if (!NOWPAYMENTS_API_KEY) {
    throw new Error("NOWPayments API key not configured");
  }

  const packageInfo = TIER_PACKAGES[tier.toLowerCase()];
  if (!packageInfo) {
    throw new Error("Invalid tier");
  }

  try {
    const response = await axios.post(
      `${NOWPAYMENTS_API_URL}/payment`,
      {
        price_amount: packageInfo.price,
        price_currency: "usd",
        pay_currency: "btc", // Default to Bitcoin, users can choose others
        ipn_callback_url: ipnCallbackUrl,
        order_id: `${userId}_${tier}_${Date.now()}`,
        order_description: `${packageInfo.name} - ${email}`,
        success_url: successUrl,
        cancel_url: cancelUrl,
      },
      {
        headers: {
          "x-api-key": NOWPAYMENTS_API_KEY,
          "Content-Type": "application/json",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "NOWPayments create payment error:",
      error.response?.data || error.message,
    );
    throw new Error("Failed to create crypto payment");
  }
}

// Get payment status
export async function getPaymentStatus(
  paymentId: string,
): Promise<PaymentStatusResponse> {
  if (!NOWPAYMENTS_API_KEY) {
    throw new Error("NOWPayments API key not configured");
  }

  try {
    const response = await axios.get(
      `${NOWPAYMENTS_API_URL}/payment/${paymentId}`,
      {
        headers: {
          "x-api-key": NOWPAYMENTS_API_KEY,
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "NOWPayments get status error:",
      error.response?.data || error.message,
    );
    throw new Error("Failed to get payment status");
  }
}

// Get available currencies
export async function getAvailableCurrencies(): Promise<{
  currencies: string[];
}> {
  if (!NOWPAYMENTS_API_KEY) {
    throw new Error("NOWPayments API key not configured");
  }

  try {
    const response = await axios.get(`${NOWPAYMENTS_API_URL}/currencies`, {
      headers: {
        "x-api-key": NOWPAYMENTS_API_KEY,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "NOWPayments get currencies error:",
      error.response?.data || error.message,
    );
    return { currencies: ["btc", "eth", "usdt", "ltc", "bch"] }; // Fallback
  }
}

// Verify webhook signature
export function verifyWebhookSignature(
  receivedSignature: string,
  payload: string,
): boolean {
  if (!process.env.NOWPAYMENTS_IPN_SECRET) {
    console.warn(
      "NOWPAYMENTS_IPN_SECRET not set - webhook verification disabled",
    );
    return true; // Allow in development
  }

  const hmac = crypto.createHmac("sha512", process.env.NOWPAYMENTS_IPN_SECRET);
  hmac.update(payload);
  const expectedSignature = hmac.digest("hex");

  return receivedSignature === expectedSignature;
}
