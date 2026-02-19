import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import {
  getTreasuryVaultId,
  isTreasuryAutoSweepEnabled,
  sweepCompletedSessionToTreasury,
} from "@/lib/fireblocks-payment";

interface LoosePaymentSessionClient {
  findMany(args: unknown): Promise<unknown>;
}

interface SweepCandidate {
  id: string;
  userId: string;
  email: string;
  purchaseId: string;
  tier: string;
  packageCode?: string | null;
  packageName?: string | null;
  amountUsd: number;
  amountCrypto?: string | null;
  amountReceived?: number | null;
  assetId: string;
  vaultAccountId: string;
  treasurySweepStatus?: string | null;
  treasurySweepTxId?: string | null;
  treasurySweepError?: string | null;
  createdAt: Date;
}

async function requireAdmin(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) return null;

  const admin = await prisma.adminWhitelist.findFirst({
    where: {
      email: session.email,
      isActive: true,
    },
    select: { id: true },
  });

  if (!admin) return null;
  return session;
}

function parseNumber(value: string | null, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toFloat(value: string | null | undefined): number {
  if (!value) return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireAdmin(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const assetId = url.searchParams.get("assetId") || undefined;
    const limit = parseNumber(url.searchParams.get("limit"), 100);
    const paymentSessionClient = prisma.paymentSession as unknown as LoosePaymentSessionClient;

    const whereClause = {
      status: "completed",
      ...(assetId ? { assetId } : {}),
      OR: [
        { treasurySweepTxId: null },
        { treasurySweepStatus: "failed" },
      ],
    };

    const sessions = (await paymentSessionClient.findMany({
      where: whereClause,
      orderBy: { createdAt: "asc" },
      take: Math.min(limit, 500),
      select: {
        id: true,
        userId: true,
        email: true,
        purchaseId: true,
        tier: true,
        packageCode: true,
        packageName: true,
        amountUsd: true,
        amountCrypto: true,
        amountReceived: true,
        assetId: true,
        vaultAccountId: true,
        treasurySweepStatus: true,
        treasurySweepTxId: true,
        treasurySweepError: true,
        createdAt: true,
      },
    })) as SweepCandidate[];

    const aggregateByAsset: Record<string, { count: number; totalUsd: number; totalCrypto: number }> = {};
    const aggregateByPackage: Record<string, { count: number; totalUsd: number }> = {};

    for (const item of sessions) {
      const assetKey = item.assetId;
      if (!aggregateByAsset[assetKey]) {
        aggregateByAsset[assetKey] = { count: 0, totalUsd: 0, totalCrypto: 0 };
      }
      aggregateByAsset[assetKey].count += 1;
      aggregateByAsset[assetKey].totalUsd += item.amountUsd || 0;
      aggregateByAsset[assetKey].totalCrypto += toFloat(item.amountCrypto);

      const packageKey = item.packageCode || item.tier;
      if (!aggregateByPackage[packageKey]) {
        aggregateByPackage[packageKey] = { count: 0, totalUsd: 0 };
      }
      aggregateByPackage[packageKey].count += 1;
      aggregateByPackage[packageKey].totalUsd += item.amountUsd || 0;
    }

    return NextResponse.json({
      treasuryVaultId: getTreasuryVaultId(),
      autoSweepEnabled: isTreasuryAutoSweepEnabled(),
      pendingSweepCount: sessions.length,
      aggregateByAsset,
      aggregateByPackage,
      sessions,
    });
  } catch (error) {
    console.error("Treasury GET error:", error);
    const message = error instanceof Error ? error.message : "Failed to load treasury sweep data";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const treasuryVaultId = getTreasuryVaultId();
    if (!treasuryVaultId) {
      return NextResponse.json(
        { error: "FIREBLOCKS_TREASURY_VAULT_ID is not configured" },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const sessionIds = Array.isArray(body.sessionIds) ? body.sessionIds : null;
    const limit = Number.isFinite(body.limit) ? Math.min(Number(body.limit), 500) : 100;
    const assetId = typeof body.assetId === "string" ? body.assetId : undefined;
    const onlyFailed = body.onlyFailed === true;

    let targetSessionIds: string[] = [];

    if (sessionIds && sessionIds.length > 0) {
      targetSessionIds = sessionIds;
    } else {
      const paymentSessionClient = prisma.paymentSession as unknown as LoosePaymentSessionClient;

      const candidates = (await paymentSessionClient.findMany({
        where: {
          status: "completed",
          ...(assetId ? { assetId } : {}),
          ...(onlyFailed
            ? { treasurySweepStatus: "failed" }
            : {
                OR: [{ treasurySweepTxId: null }, { treasurySweepStatus: "failed" }],
              }),
        },
        orderBy: { createdAt: "asc" },
        take: limit,
        select: { id: true },
      })) as Array<{ id: string }>;

      targetSessionIds = candidates.map((item) => item.id);
    }

    const results: Array<{
      sessionId: string;
      success: boolean;
      skipped?: boolean;
      reason?: string;
      treasurySweepTxId?: string;
      treasurySweepStatus?: string;
      error?: string;
    }> = [];

    for (const id of targetSessionIds) {
      try {
        const outcome = await sweepCompletedSessionToTreasury(id);
        results.push({
          sessionId: id,
          success: true,
          skipped: Boolean(outcome.skipped),
          reason: outcome.reason,
          treasurySweepTxId: outcome.treasurySweepTxId,
          treasurySweepStatus: outcome.treasurySweepStatus,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Sweep failed";
        results.push({
          sessionId: id,
          success: false,
          error: message,
        });
      }
    }

    const successCount = results.filter((r) => r.success && !r.skipped).length;
    const skippedCount = results.filter((r) => r.success && r.skipped).length;
    const failedCount = results.filter((r) => !r.success).length;

    return NextResponse.json({
      treasuryVaultId,
      requestedCount: targetSessionIds.length,
      successCount,
      skippedCount,
      failedCount,
      results,
    });
  } catch (error) {
    console.error("Treasury POST error:", error);
    const message = error instanceof Error ? error.message : "Failed to execute treasury sweep";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
