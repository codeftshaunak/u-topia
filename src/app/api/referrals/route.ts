import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

const maskEmail = (email: string) => {
  const parts = email.split("@");
  return parts.length === 2 && parts[0].length > 3
    ? parts[0].substring(0, 3) + "***@" + parts[1]
    : email;
};

const maskName = (fullName: string | null | undefined): string | null => {
  if (!fullName) return null;
  const parts = fullName.trim().split(" ");
  if (parts.length >= 2) return `${parts[0]} ${parts[1][0]}***`;
  return parts[0];
};

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ── 1. Signup referrals (Referral model) ──────────────────────────────
    const referrals = await prisma.referral.findMany({
      where: { referrerUserId: session.id },
      include: {
        referred: {
          include: {
            profile: true,
            purchases: { where: { status: "completed" } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const referredUserIds = referrals.map((r) => r.referredUserId);

    const commissions = await prisma.commission.findMany({
      where: {
        beneficiaryUserId: session.id,
        referredUserId: { in: referredUserIds },
      },
    });

    const commissionsMap = new Map<string, { total: number; status: string }>();
    commissions.forEach((c) => {
      const existing = commissionsMap.get(c.referredUserId);
      if (existing) {
        existing.total += Number(c.amountUsd);
      } else {
        commissionsMap.set(c.referredUserId, {
          total: Number(c.amountUsd),
          status: c.status,
        });
      }
    });

    const signupReferralData = referrals.map((r) => {
      const profile = r.referred.profile;
      const purchases = r.referred.purchases;
      const commission = commissionsMap.get(r.referredUserId);

      return {
        id: r.id,
        referredUserId: r.referredUserId,
        referredName: maskName(profile?.fullName),
        referredEmail: maskEmail(profile?.email || r.referred.email || "Unknown"),
        signupDate: r.createdAt,
        status: r.status,
        packagePurchased:
          purchases?.length > 0 && purchases[0].tier
            ? purchases[0].tier.charAt(0).toUpperCase() + purchases[0].tier.slice(1)
            : null,
        commissionEarned: commission?.total || 0,
        commissionStatus: commission?.status || null,
        referralType: "signup" as const,
      };
    });

    // ── 2. Package purchase referrals (PackageReferralReward) ──────────────
    // Only buyers who are NOT already in the signup referral list
    const signupReferredSet = new Set(referredUserIds);

    const packageRewards = await prisma.packageReferralReward.findMany({
      where: { referrerUserId: session.id },
      include: { buyer: { include: { profile: true } } },
      orderBy: { createdAt: "desc" },
    });

    const packageReferralData = packageRewards
      .filter((pr) => !signupReferredSet.has(pr.buyerUserId))
      .map((pr) => ({
        id: `pkg_${pr.id}`,
        referredUserId: pr.buyerUserId,
        referredName: maskName(pr.buyer.profile?.fullName),
        referredEmail: maskEmail(pr.buyer.profile?.email || pr.buyer.email),
        signupDate: pr.createdAt,
        status: "active" as const,
        packagePurchased:
          pr.tier.charAt(0).toUpperCase() + pr.tier.slice(1),
        commissionEarned: pr.rewardAmountUsd,
        commissionStatus: pr.status,
        referralType: "package" as const,
      }));

    // Enrich signup referrals that also have a matching PackageReferralReward
    const packageRewardsByUserId = new Map(
      packageRewards.map((pr) => [pr.buyerUserId, pr])
    );
    const enrichedSignupReferrals = signupReferralData.map((r) => {
      const pkgReward = packageRewardsByUserId.get(r.referredUserId);
      if (pkgReward && r.commissionEarned === 0) {
        return {
          ...r,
          commissionEarned: pkgReward.rewardAmountUsd,
          commissionStatus: pkgReward.status,
          packagePurchased:
            r.packagePurchased ||
            pkgReward.tier.charAt(0).toUpperCase() + pkgReward.tier.slice(1),
        };
      }
      return r;
    });

    // ── 3. Merge & build stats ─────────────────────────────────────────────
    const referralData = [...enrichedSignupReferrals, ...packageReferralData];

    const stats = {
      totalReferrals: referralData.length,
      activeReferrals: referralData.filter((r) => r.status === "active").length,
      pendingReferrals: referralData.filter((r) => r.status === "pending").length,
      totalCommissions: referralData.reduce((sum, r) => sum + r.commissionEarned, 0),
    };

    return NextResponse.json({ referrals: referralData, stats });
  } catch (error) {
    console.error("[Referrals API] Error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

