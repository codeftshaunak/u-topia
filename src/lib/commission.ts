/**
 * Multi-Level Referral Commission Engine
 *
 * Distributes commissions up to 8 levels deep based on the referrer's package.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ Package (R1-R8)  │  Max Depth  │  Commission Rates                │
 * ├──────────────────┼─────────────┼──────────────────────────────────┤
 * │ R1 (Bronze)      │  1 level    │  L1: 10%                        │
 * │ R2 (Silver)      │  2 levels   │  L1: 10%, L2: 5%                │
 * │ R3 (Gold)        │  3 levels   │  + L3: 2.5%                     │
 * │ R4 (Platinum)    │  4 levels   │  + L4: 1.25%                    │
 * │ R5 (Diamond)     │  5 levels   │  + L5: 0.625%                   │
 * │ R6 (Elite)       │  6 levels   │  + L6: 0.3175%                  │
 * │ R7 (Legend)      │  7 levels   │  + L7: 0.15875%                 │
 * │ R8 (Titan)       │  8 levels   │  + L8: 0.079375%                │
 * └──────────────────┴─────────────┴──────────────────────────────────┘
 *
 * Rules:
 * 1. Commission is calculated from the PURCHASED package price
 * 2. A referrer only earns if their package level >= the referral depth level
 * 3. Ineligible users are SKIPPED (not counted as a level)
 * 4. Circular referral chains are detected and stopped
 * 5. All payouts are wrapped in a DB transaction
 * 6. Commission is only triggered after successful payment (settled revenue event)
 * 7. Upgrades pay commission only on the price DIFFERENCE
 */

import prisma from "./db";
import type { AffiliateTier } from "@prisma/client";

// ─── Constants ───────────────────────────────────────────────────────────────

export const MAX_COMMISSION_DEPTH = 8;

/**
 * Commission rates per referral level.
 * These are the CANONICAL rates; DB packages store the same values.
 */
export const COMMISSION_RATES: Record<number, number> = {
  1: 10,
  2: 5,
  3: 2.5,
  4: 1.25,
  5: 0.625,
  6: 0.3175,
  7: 0.15875,
  8: 0.079375,
};

/**
 * Package tier → numeric level mapping.
 * Determines max commission depth: package level N unlocks levels 1–N.
 */
export const PACKAGE_LEVELS: Record<string, number> = {
  bronze: 1,
  silver: 2,
  gold: 3,
  platinum: 4,
  diamond: 5,
  elite: 6,
  legend: 7,
  titan: 8,
};

/**
 * Package prices in USD. Used as canonical fallback;
 * actual prices come from the DB packages table.
 */
export const PACKAGE_PRICES: Record<string, number> = {
  bronze: 1,
  silver: 2,
  gold: 3,
  platinum: 4,
  diamond: 5,
  elite: 6,
  legend: 7,
  titan: 8,
};

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CommissionPayout {
  beneficiaryUserId: string;
  referredUserId: string;
  layer: number;
  ratePercent: number;
  amountUsd: number;
  notes: string;
}

export interface CommissionResult {
  success: boolean;
  purchasePrice: number;
  commissionBase: number; // price used for commission calculation (may differ for upgrades)
  totalCommissionPaid: number;
  payouts: CommissionPayout[];
  skipped: Array<{ userId: string; layer: number; reason: string }>;
  error?: string;
}

interface AncestorData {
  id: string;
  currentPackage: string | null;
  referredByUserId: string | null;
  affiliateStatus: { isActive: boolean } | null;
}

// ─── Commission Calculation (Pure Function) ──────────────────────────────────

/**
 * Calculate commissions WITHOUT writing to DB.
 * Useful for previews, simulations, and testing.
 */
export function calculateCommissions(
  buyerUserId: string,
  commissionBase: number,
  ancestors: AncestorData[],
): { payouts: CommissionPayout[]; skipped: Array<{ userId: string; layer: number; reason: string }> } {
  const payouts: CommissionPayout[] = [];
  const skipped: Array<{ userId: string; layer: number; reason: string }> = [];
  const visited = new Set<string>([buyerUserId]);

  let layer = 1;

  for (const ancestor of ancestors) {
    if (layer > MAX_COMMISSION_DEPTH) break;

    // Circular reference guard
    if (visited.has(ancestor.id)) {
      skipped.push({ userId: ancestor.id, layer, reason: "circular_reference" });
      break;
    }
    visited.add(ancestor.id);

    const hasPackage = !!ancestor.currentPackage;
    const isActive = ancestor.affiliateStatus?.isActive ?? false;

    if (!hasPackage || !isActive) {
      skipped.push({
        userId: ancestor.id,
        layer,
        reason: !hasPackage ? "no_package" : "inactive_affiliate",
      });
      // Still count as a level — they occupy a position in the chain
      layer++;
      continue;
    }

    const packageLevel = PACKAGE_LEVELS[ancestor.currentPackage!.toLowerCase()] ?? 0;

    // Rule: user only earns if their package level >= current referral layer
    if (packageLevel < layer) {
      skipped.push({
        userId: ancestor.id,
        layer,
        reason: `package_${ancestor.currentPackage}_level_${packageLevel}_insufficient_for_layer_${layer}`,
      });
      layer++;
      continue;
    }

    const rate = COMMISSION_RATES[layer];
    if (!rate || rate <= 0) {
      skipped.push({ userId: ancestor.id, layer, reason: `no_rate_for_layer_${layer}` });
      layer++;
      continue;
    }

    const amount = parseFloat((commissionBase * rate / 100).toFixed(2));

    if (amount > 0) {
      payouts.push({
        beneficiaryUserId: ancestor.id,
        referredUserId: buyerUserId,
        layer,
        ratePercent: rate,
        amountUsd: amount,
        notes: `L${layer} commission: ${ancestor.currentPackage} (lvl ${packageLevel}) earns ${rate}% on $${commissionBase}`,
      });
    }

    layer++;
  }

  return { payouts, skipped };
}

// ─── Upline Chain Walker ─────────────────────────────────────────────────────

/**
 * Walk up the referral chain from a user, returning ordered ancestors.
 * Stops at MAX_COMMISSION_DEPTH or when chain ends.
 * Detects and breaks circular references.
 */
export async function getUplineChain(
  startUserId: string,
  maxDepth: number = MAX_COMMISSION_DEPTH,
): Promise<AncestorData[]> {
  const ancestors: AncestorData[] = [];
  const visited = new Set<string>([startUserId]);

  // Get the starting user's direct referrer
  const startUser = await prisma.user.findUnique({
    where: { id: startUserId },
    select: { referredByUserId: true },
  });

  if (!startUser?.referredByUserId) return ancestors;

  let currentUserId: string | null = startUser.referredByUserId;

  while (currentUserId && ancestors.length < maxDepth) {
    if (visited.has(currentUserId)) {
      console.warn(`[Commission] Circular referral detected at ${currentUserId}`);
      break;
    }
    visited.add(currentUserId);

    const user = await prisma.user.findUnique({
      where: { id: currentUserId },
      select: {
        id: true,
        currentPackage: true,
        referredByUserId: true,
        affiliateStatus: { select: { isActive: true } },
      },
    });

    if (!user) break;

    ancestors.push(user);
    currentUserId = user.referredByUserId;
  }

  return ancestors;
}

// ─── Commission Distribution (DB Write) ──────────────────────────────────────

/**
 * Distribute multi-level commissions for a purchase.
 *
 * This is the main entry point called after a successful payment.
 * All commission records are created inside a single DB transaction.
 *
 * @param buyerUserId  - The user who made the purchase
 * @param purchasePrice - Full price of the purchased package
 * @param commissionBase - Amount to calculate commission on (= purchasePrice for new, = difference for upgrades)
 * @param revenueEventId - ID of the settled revenue event
 * @param tier - The purchased package tier name
 */
export async function distributeCommissions(
  buyerUserId: string,
  purchasePrice: number,
  commissionBase: number,
  revenueEventId: string,
  tier: string,
): Promise<CommissionResult> {
  try {
    // 1. Walk the upline chain
    const ancestors = await getUplineChain(buyerUserId);

    if (ancestors.length === 0) {
      return {
        success: true,
        purchasePrice,
        commissionBase,
        totalCommissionPaid: 0,
        payouts: [],
        skipped: [],
      };
    }

    // 2. Calculate payouts
    const { payouts, skipped } = calculateCommissions(buyerUserId, commissionBase, ancestors);

    if (payouts.length === 0) {
      console.log(`[Commission] No eligible commissions for ${tier} purchase by ${buyerUserId}`);
      return {
        success: true,
        purchasePrice,
        commissionBase,
        totalCommissionPaid: 0,
        payouts: [],
        skipped,
      };
    }

    // 3. Write all commissions in a single transaction
    const commissionRecords = payouts.map((p) =>
      prisma.commission.create({
        data: {
          beneficiaryUserId: p.beneficiaryUserId,
          referredUserId: p.referredUserId,
          sourceRevenueEventId: revenueEventId,
          layer: p.layer,
          ratePercent: p.ratePercent,
          amountUsd: p.amountUsd,
          status: "approved",
          notes: p.notes,
        },
      }),
    );

    await prisma.$transaction(commissionRecords);

    const totalPaid = payouts.reduce((sum, p) => sum + p.amountUsd, 0);

    console.log(
      `[Commission] Distributed ${payouts.length} commissions ($${totalPaid.toFixed(2)}) ` +
      `for $${commissionBase} ${tier} purchase by ${buyerUserId}`,
    );

    for (const p of payouts) {
      console.log(
        `  L${p.layer}: ${p.beneficiaryUserId} → $${p.amountUsd} (${p.ratePercent}%)`,
      );
    }

    return {
      success: true,
      purchasePrice,
      commissionBase,
      totalCommissionPaid: totalPaid,
      payouts,
      skipped,
    };
  } catch (error) {
    console.error("[Commission] Distribution error:", error);
    return {
      success: false,
      purchasePrice,
      commissionBase,
      totalCommissionPaid: 0,
      payouts: [],
      skipped: [],
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// ─── Upgrade Handling ────────────────────────────────────────────────────────

/**
 * Handle package upgrade commission distribution.
 *
 * When a user upgrades from a lower package to a higher one:
 * 1. Commission is calculated on the PRICE DIFFERENCE only
 * 2. The user's package and affiliate status are updated
 * 3. An upgrade record is logged
 *
 * @returns Commission result + upgrade metadata
 */
export async function handlePackageUpgrade(
  userId: string,
  newTier: string,
  revenueEventId: string,
): Promise<CommissionResult & { isUpgrade: boolean; fromTier?: string; toTier?: string }> {
  const newTierLower = newTier.toLowerCase();
  const newLevel = PACKAGE_LEVELS[newTierLower];

  if (!newLevel) {
    return {
      success: false,
      isUpgrade: false,
      purchasePrice: 0,
      commissionBase: 0,
      totalCommissionPaid: 0,
      payouts: [],
      skipped: [],
      error: `Invalid tier: ${newTier}`,
    };
  }

  // Fetch user's current package
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { currentPackage: true },
  });

  const currentTier = user?.currentPackage?.toLowerCase();
  const currentLevel = currentTier ? (PACKAGE_LEVELS[currentTier] ?? 0) : 0;

  if (currentLevel >= newLevel) {
    return {
      success: false,
      isUpgrade: false,
      purchasePrice: 0,
      commissionBase: 0,
      totalCommissionPaid: 0,
      payouts: [],
      skipped: [],
      error: `Cannot downgrade or re-purchase same package. Current: ${currentTier} (${currentLevel}), requested: ${newTierLower} (${newLevel})`,
    };
  }

  // Get prices from DB (fallback to constants)
  const packages = await prisma.package.findMany({
    where: { name: { in: [currentTier || "", newTierLower].map(t => t.charAt(0).toUpperCase() + t.slice(1)) } },
  });

  const pkgMap: Record<string, number> = {};
  for (const p of packages) {
    pkgMap[p.name.toLowerCase()] = p.priceUsd;
  }

  const currentPrice = currentTier ? (pkgMap[currentTier] ?? PACKAGE_PRICES[currentTier] ?? 0) : 0;
  const newPrice = pkgMap[newTierLower] ?? PACKAGE_PRICES[newTierLower] ?? 0;
  const difference = newPrice - currentPrice;

  if (difference <= 0) {
    return {
      success: false,
      isUpgrade: false,
      purchasePrice: newPrice,
      commissionBase: 0,
      totalCommissionPaid: 0,
      payouts: [],
      skipped: [],
      error: `Price difference is zero or negative ($${currentPrice} → $${newPrice})`,
    };
  }

  // Log the upgrade
  await prisma.$transaction([
    // Record upgrade history
    prisma.packageUpgrade.create({
      data: {
        userId,
        fromPackage: currentTier || "none",
        toPackage: newTierLower,
        fromPriceUsd: currentPrice,
        toPriceUsd: newPrice,
        differenceUsd: difference,
      },
    }),

    // Update user's package
    prisma.user.update({
      where: { id: userId },
      data: {
        currentPackage: newTierLower as AffiliateTier,
        packageActivatedAt: new Date(),
      },
    }),

    // Update affiliate status depth
    prisma.affiliateStatus.upsert({
      where: { userId },
      create: {
        userId,
        tier: newTierLower as AffiliateTier,
        tierDepthLimit: newLevel,
        isActive: true,
      },
      update: {
        tier: newTierLower as AffiliateTier,
        tierDepthLimit: newLevel,
        isActive: true,
      },
    }),
  ]);

  console.log(
    `[Upgrade] ${userId}: ${currentTier || "none"} ($${currentPrice}) → ${newTierLower} ($${newPrice}), ` +
    `commission base: $${difference}`,
  );

  // Distribute commission on the DIFFERENCE
  const result = await distributeCommissions(
    userId,
    newPrice,
    difference, // Commission calculated only on the upgrade difference
    revenueEventId,
    newTierLower,
  );

  return {
    ...result,
    isUpgrade: true,
    fromTier: currentTier || "none",
    toTier: newTierLower,
  };
}

// ─── Referral Setup ──────────────────────────────────────────────────────────

/**
 * Validate and set a user's referrer. Can only be done ONCE.
 *
 * Prevents:
 * - Self-referral
 * - Circular references (A→B→A)
 * - Re-setting referrer
 * - Referring to non-existent users
 */
export async function setReferrer(
  userId: string,
  referrerUserId: string,
): Promise<{ success: boolean; error?: string }> {
  if (userId === referrerUserId) {
    return { success: false, error: "Cannot refer yourself" };
  }

  const [user, referrer] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, referredByUserId: true },
    }),
    prisma.user.findUnique({
      where: { id: referrerUserId },
      select: { id: true, referredByUserId: true, currentPackage: true },
    }),
  ]);

  if (!user) return { success: false, error: "User not found" };
  if (!referrer) return { success: false, error: "Referrer not found" };

  // Rule 8: A user can only set referral once
  if (user.referredByUserId) {
    return { success: false, error: "Referrer already set" };
  }

  // Check for circular reference: walk up from referrer to see if we'd create a loop
  const visited = new Set<string>([userId]);
  let current: string | null = referrerUserId;

  while (current) {
    if (visited.has(current)) {
      return { success: false, error: "Circular referral chain detected" };
    }
    visited.add(current);

    const parent = await prisma.user.findUnique({
      where: { id: current },
      select: { referredByUserId: true },
    });

    current = parent?.referredByUserId ?? null;
  }

  // Set the referral
  await prisma.user.update({
    where: { id: userId },
    data: { referredByUserId: referrerUserId },
  });

  return { success: true };
}

// ─── Simulation / Preview ────────────────────────────────────────────────────

/**
 * Preview what commissions WOULD be paid for a hypothetical purchase.
 * Does NOT write to DB — pure read-only operation.
 */
export async function simulateCommissions(
  buyerUserId: string,
  packageTier: string,
  isUpgrade: boolean = false,
): Promise<{
  purchasePrice: number;
  commissionBase: number;
  payouts: CommissionPayout[];
  skipped: Array<{ userId: string; layer: number; reason: string }>;
  totalCommission: number;
}> {
  const tierLower = packageTier.toLowerCase();
  const newPrice = PACKAGE_PRICES[tierLower] ?? 0;

  let commissionBase = newPrice;

  if (isUpgrade) {
    const user = await prisma.user.findUnique({
      where: { id: buyerUserId },
      select: { currentPackage: true },
    });
    const currentTier = user?.currentPackage?.toLowerCase();
    const currentPrice = currentTier ? (PACKAGE_PRICES[currentTier] ?? 0) : 0;
    commissionBase = Math.max(0, newPrice - currentPrice);
  }

  const ancestors = await getUplineChain(buyerUserId);
  const { payouts, skipped } = calculateCommissions(buyerUserId, commissionBase, ancestors);

  return {
    purchasePrice: newPrice,
    commissionBase,
    payouts,
    skipped,
    totalCommission: payouts.reduce((sum, p) => sum + p.amountUsd, 0),
  };
}
