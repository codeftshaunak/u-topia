/**
 * Package Upgrade API
 *
 * POST /api/packages/upgrade
 * Body: { tier: "gold" }  ← target package name
 *
 * Validates the upgrade is allowed, then:
 * 1. Calculates price difference
 * 2. Creates a new payment session for the difference amount
 * 3. After payment completes (via webhook), commissions are distributed on the difference
 *
 * GET /api/packages/upgrade
 * Returns available upgrade options for the current user.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PACKAGE_LEVELS, PACKAGE_PRICES } from "@/lib/commission";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { currentPackage: true },
    });

    const currentTier = user?.currentPackage?.toLowerCase() || null;
    const currentLevel = currentTier ? (PACKAGE_LEVELS[currentTier] ?? 0) : 0;
    const currentPrice = currentTier ? (PACKAGE_PRICES[currentTier] ?? 0) : 0;

    // Fetch all active packages from DB
    const packages = await prisma.package.findMany({
      where: { isActive: true },
      orderBy: { priceUsd: "asc" },
    });

    // Show only packages above the current one
    const upgradeOptions = packages
      .filter((p) => (PACKAGE_LEVELS[p.name.toLowerCase()] ?? 0) > currentLevel)
      .map((p) => ({
        name: p.name.toLowerCase(),
        displayName: p.name,
        level: PACKAGE_LEVELS[p.name.toLowerCase()] ?? 0,
        priceUsd: p.priceUsd,
        upgradeCostUsd: p.priceUsd - currentPrice,
        maxDepth: PACKAGE_LEVELS[p.name.toLowerCase()] ?? 1,
        commissionLevels: p.commissionLevels,
      }));

    return NextResponse.json({
      currentPackage: currentTier,
      currentLevel,
      currentPrice,
      upgradeOptions,
    });
  } catch (error) {
    console.error("[Upgrade API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const targetTier = body.tier?.toLowerCase();

    if (!targetTier || !PACKAGE_LEVELS[targetTier]) {
      return NextResponse.json(
        { error: "Invalid package tier" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { currentPackage: true },
    });

    const currentTier = user?.currentPackage?.toLowerCase() || null;
    const currentLevel = currentTier ? (PACKAGE_LEVELS[currentTier] ?? 0) : 0;
    const targetLevel = PACKAGE_LEVELS[targetTier];

    if (targetLevel <= currentLevel) {
      return NextResponse.json(
        {
          error: "Cannot downgrade or re-purchase same package",
          currentPackage: currentTier,
          currentLevel,
          targetPackage: targetTier,
          targetLevel,
        },
        { status: 400 },
      );
    }

    // Get prices from DB
    const packages = await prisma.package.findMany({
      where: {
        name: {
          in: [currentTier, targetTier]
            .filter(Boolean)
            .map((t) => t!.charAt(0).toUpperCase() + t!.slice(1)),
        },
        isActive: true,
      },
    });

    const pkgMap: Record<string, number> = {};
    for (const p of packages) {
      pkgMap[p.name.toLowerCase()] = p.priceUsd;
    }

    const currentPrice = currentTier ? (pkgMap[currentTier] ?? PACKAGE_PRICES[currentTier] ?? 0) : 0;
    const targetPrice = pkgMap[targetTier] ?? PACKAGE_PRICES[targetTier] ?? 0;
    const upgradeCost = targetPrice - currentPrice;

    if (upgradeCost <= 0) {
      return NextResponse.json(
        { error: "Invalid upgrade cost" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      upgrade: {
        fromPackage: currentTier || "none",
        toPackage: targetTier,
        fromPrice: currentPrice,
        toPrice: targetPrice,
        upgradeCost,
        message: `Upgrade from ${currentTier || "none"} to ${targetTier} costs $${upgradeCost}. Proceed to checkout with the upgrade tier.`,
      },
    });
  } catch (error) {
    console.error("[Upgrade API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
