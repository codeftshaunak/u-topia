/**
 * Package Referral Commissions API
 *
 * GET /api/referrals/package-rewards
 *
 * Returns the current user's multi-level commission rewards from the
 * commission_ledger table. Includes per-referral commission details
 * and aggregate stats.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all commissions earned by this user from the Commission ledger
    const commissions = await prisma.commission.findMany({
      where: {
        beneficiaryUserId: session.id,
      },
      include: {
        referredUser: {
          include: {
            profile: true,
          },
        },
        sourceRevenueEvent: {
          select: {
            amountUsd: true,
            source: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Build response mapped to the same shape the frontend expects
    const referredUsers = commissions.map((c) => {
      const profile = c.referredUser.profile;

      // Mask email for privacy
      const emailToMask = profile?.email || c.referredUser.email || "Unknown";
      const emailParts = emailToMask.split("@");
      const maskedEmail =
        emailParts.length === 2 && emailParts[0].length > 3
          ? emailParts[0].substring(0, 3) + "***@" + emailParts[1]
          : emailToMask;

      return {
        id: c.id,
        buyerUserId: c.referredUserId,
        buyerName: profile?.fullName || null,
        buyerEmail: maskedEmail,
        buyerAvatar: profile?.avatarUrl || null,
        tier: c.notes?.match(/\b(bronze|silver|gold|platinum|diamond)\b/i)?.[1] || "unknown",
        purchaseAmountUsd: c.sourceRevenueEvent?.amountUsd ?? 0,
        rewardPercent: c.ratePercent,
        rewardAmountUsd: c.amountUsd,
        rewardStatus: c.status,
        layer: c.layer,
        purchaseDate: c.createdAt,
      };
    });

    // Aggregate stats
    const stats = {
      totalReferredPurchases: referredUsers.length,
      totalRewardsEarned: referredUsers.reduce(
        (sum, r) => sum + r.rewardAmountUsd,
        0,
      ),
      pendingRewards: referredUsers
        .filter((r) => r.rewardStatus === "pending")
        .reduce((sum, r) => sum + r.rewardAmountUsd, 0),
      approvedRewards: referredUsers
        .filter((r) => r.rewardStatus === "approved")
        .reduce((sum, r) => sum + r.rewardAmountUsd, 0),
      paidRewards: referredUsers
        .filter((r) => r.rewardStatus === "paid")
        .reduce((sum, r) => sum + r.rewardAmountUsd, 0),
      tierBreakdown: Object.entries(
        referredUsers.reduce(
          (acc, r) => {
            acc[r.tier] = (acc[r.tier] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>,
        ),
      ).map(([tier, count]) => ({ tier, count })),
    };

    return NextResponse.json({ referredUsers, stats });
  } catch (error) {
    console.error("[Package Referrals API] Error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
