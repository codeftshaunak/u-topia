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

    // ── Fetch all users directly referred by the current user ─────────
    const referredUsers = await prisma.user.findMany({
      where: { referredByUserId: session.id },
      include: {
        profile: true,
        purchases: {
          where: { status: "completed" },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // ── Fetch commissions earned from these users ─────────────────────
    const referredUserIds = referredUsers.map((u) => u.id);
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

    // ── Build referral data ────────────────────────────────────────────
    const referralData = referredUsers.map((user) => {
      const profile = user.profile;
      const purchase = user.purchases?.[0];
      const commission = commissionsMap.get(user.id);
      const hasPurchasedPackage = !!user.currentPackage;

      return {
        id: user.id,
        referredUserId: user.id,
        referredName: maskName(profile?.fullName),
        referredEmail: maskEmail(profile?.email || user.email || "Unknown"),
        signupDate: user.createdAt,
        status: hasPurchasedPackage ? ("active" as const) : ("pending" as const),
        packagePurchased: purchase
          ? purchase.tier.charAt(0).toUpperCase() + purchase.tier.slice(1)
          : null,
        commissionEarned: commission?.total || 0,
        commissionStatus: commission?.status || null,
        referralType: "signup" as const,
      };
    });

    // ── Stats ──────────────────────────────────────────────────────────
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

