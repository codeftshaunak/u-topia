/**
 * Package Referrals API
 *
 * GET /api/referrals/package-rewards
 *
 * Returns the current user's package referral rewards including:
 * - List of referred users who purchased packages
 * - Total rewards earned
 * - Reward stats
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

    // Fetch all package referral rewards where current user is the referrer
    const rewards = await prisma.packageReferralReward.findMany({
      where: {
        referrerUserId: session.id,
      },
      include: {
        buyer: {
          include: {
            profile: true,
          },
        },
        purchase: {
          select: {
            id: true,
            tier: true,
            amount: true,
            status: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Also fetch purchases made using this user's referral links (even without rewards yet)
    const referredPurchases = await prisma.purchase.findMany({
      where: {
        referredByUserId: session.id,
        status: "completed",
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Build response
    const referredUsers = rewards.map((r) => {
      const profile = r.buyer.profile;

      // Mask email for privacy
      const emailToMask = profile?.email || r.buyer.email || "Unknown";
      const emailParts = emailToMask.split("@");
      const maskedEmail =
        emailParts.length === 2 && emailParts[0].length > 3
          ? emailParts[0].substring(0, 3) + "***@" + emailParts[1]
          : emailToMask;

      return {
        id: r.id,
        buyerUserId: r.buyerUserId,
        buyerName: profile?.fullName || null,
        buyerEmail: maskedEmail,
        buyerAvatar: profile?.avatarUrl || null,
        tier: r.tier,
        purchaseAmountUsd: r.purchaseAmountUsd,
        rewardPercent: r.rewardPercent,
        rewardAmountUsd: r.rewardAmountUsd,
        rewardStatus: r.status,
        purchaseDate: r.createdAt,
      };
    });

    // Calculate stats
    const stats = {
      totalReferredPurchases: referredUsers.length,
      totalRewardsEarned: referredUsers.reduce(
        (sum, r) => sum + r.rewardAmountUsd,
        0
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
          {} as Record<string, number>
        )
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
      { status: 500 }
    );
  }
}
