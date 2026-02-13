import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    console.log("[Referrals API] Starting GET request");
    const session = await getSession();
    console.log("[Referrals API] Session:", session);

    if (!session) {
      console.log("[Referrals API] No session found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[Referrals API] Fetching referrals for user:", session.id);
    // Fetch referrals where current user is the referrer
    const referrals = await prisma.referral.findMany({
      where: {
        referrerUserId: session.id,
      },
      include: {
        referred: {
          include: {
            profile: true,
            purchases: {
              where: { status: "completed" },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log("[Referrals API] Found", referrals.length, "referrals");
    if (referrals.length > 0) {
      console.log("[Referrals API] First referral ID:", referrals[0].id);
      console.log(
        "[Referrals API] First referral status:",
        referrals[0].status,
      );
    }

    // Fetch commissions for these referrals
    const referredUserIds = referrals.map((r) => r.referredUserId);
    console.log(
      "[Referrals API] Fetching commissions for",
      referredUserIds.length,
      "referred users",
    );

    const commissions = await prisma.commission.findMany({
      where: {
        beneficiaryUserId: session.id,
        referredUserId: { in: referredUserIds },
      },
    });

    console.log("[Referrals API] Found", commissions.length, "commissions");

    // Group commissions by referred user
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

    // Build response
    const referralData = referrals.map((r) => {
      const profile = r.referred.profile;
      const purchases = r.referred.purchases;
      const commission = commissionsMap.get(r.referredUserId);

      // Mask email for privacy - use referred user email as fallback
      const emailToMask = profile?.email || r.referred.email || "Unknown";
      const emailParts = emailToMask.split("@");
      const maskedEmail =
        emailParts.length === 2 && emailParts[0].length > 3
          ? emailParts[0].substring(0, 3) + "***@" + emailParts[1]
          : emailToMask;

      // Safely mask name
      let maskedName: string | null = null;
      if (profile?.fullName) {
        const nameParts = profile.fullName.split(" ");
        if (nameParts.length >= 2) {
          maskedName = `${nameParts[0]} ${nameParts[1][0]}***`;
        } else if (nameParts.length === 1) {
          maskedName = nameParts[0];
        }
      }

      return {
        id: r.id,
        referredUserId: r.referredUserId,
        referredName: maskedName,
        referredEmail: maskedEmail,
        signupDate: r.createdAt,
        status: r.status,
        packagePurchased:
          purchases && purchases.length > 0 && purchases[0].tier
            ? purchases[0].tier.charAt(0).toUpperCase() +
              purchases[0].tier.slice(1)
            : null,
        commissionEarned: commission?.total || 0,
        commissionStatus: commission?.status || null,
      };
    });

    // Calculate stats
    const stats = {
      totalReferrals: referralData.length,
      activeReferrals: referralData.filter((r) => r.status === "active").length,
      pendingReferrals: referralData.filter((r) => r.status === "pending")
        .length,
      totalCommissions: referralData.reduce(
        (sum, r) => sum + r.commissionEarned,
        0,
      ),
    };

    return NextResponse.json({ referrals: referralData, stats });
  } catch (error) {
    console.error("[Referrals API] Error:", error);
    console.error(
      "[Referrals API] Error stack:",
      error instanceof Error ? error.stack : "No stack trace",
    );
    console.error(
      "[Referrals API] Error message:",
      error instanceof Error ? error.message : String(error),
    );
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
