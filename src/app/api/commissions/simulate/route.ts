/**
 * Commission Simulation API
 *
 * GET /api/commissions/simulate?tier=gold&upgrade=true
 *
 * Preview what commissions WOULD be paid for a hypothetical purchase.
 * Does NOT write to DB — pure read-only simulation.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { simulateCommissions, PACKAGE_LEVELS, COMMISSION_RATES } from "@/lib/commission";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tier = searchParams.get("tier");
    const isUpgrade = searchParams.get("upgrade") === "true";

    if (!tier || !PACKAGE_LEVELS[tier.toLowerCase()]) {
      return NextResponse.json(
        {
          error: "Invalid or missing tier parameter",
          validTiers: Object.keys(PACKAGE_LEVELS),
        },
        { status: 400 },
      );
    }

    const result = await simulateCommissions(session.id, tier.toLowerCase(), isUpgrade);

    return NextResponse.json({
      simulation: {
        buyerUserId: session.id,
        packageTier: tier.toLowerCase(),
        packageLevel: PACKAGE_LEVELS[tier.toLowerCase()],
        isUpgrade,
        purchasePrice: result.purchasePrice,
        commissionBase: result.commissionBase,
        totalCommission: result.totalCommission,
        commissionRates: COMMISSION_RATES,
        payouts: result.payouts.map((p) => ({
          layer: p.layer,
          beneficiaryUserId: p.beneficiaryUserId,
          ratePercent: p.ratePercent,
          amountUsd: p.amountUsd,
        })),
        skipped: result.skipped,
      },
    });
  } catch (error) {
    console.error("[Commission Simulate] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
