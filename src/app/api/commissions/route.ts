import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { COMMISSION_RATES, PACKAGE_LEVELS, MAX_COMMISSION_DEPTH } from '@/lib/commission';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all multi-layer commissions for this user
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
        sourceRevenueEvent: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Aggregate stats per layer
    const layerStats: Record<number, { count: number; totalUsd: number; rate: number }> = {};
    for (let l = 1; l <= MAX_COMMISSION_DEPTH; l++) {
      layerStats[l] = { count: 0, totalUsd: 0, rate: COMMISSION_RATES[l] ?? 0 };
    }
    for (const c of commissions) {
      if (layerStats[c.layer]) {
        layerStats[c.layer].count++;
        layerStats[c.layer].totalUsd += c.amountUsd;
      }
    }

    // Get user's current package depth
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { currentPackage: true },
    });
    const maxDepth = user?.currentPackage
      ? (PACKAGE_LEVELS[user.currentPackage.toLowerCase()] ?? 0)
      : 0;

    const stats = {
      totalCommissions: commissions.length,
      totalEarnedUsd: commissions.reduce((sum, c) => sum + c.amountUsd, 0),
      pendingUsd: commissions.filter(c => c.status === 'pending').reduce((sum, c) => sum + c.amountUsd, 0),
      approvedUsd: commissions.filter(c => c.status === 'approved').reduce((sum, c) => sum + c.amountUsd, 0),
      paidUsd: commissions.filter(c => c.status === 'paid').reduce((sum, c) => sum + c.amountUsd, 0),
      currentPackage: user?.currentPackage || null,
      maxDepth,
      maxPossibleDepth: MAX_COMMISSION_DEPTH,
      layerStats,
    };

    return NextResponse.json({ commissions, stats });
  } catch (error) {
    console.error('Get commissions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
