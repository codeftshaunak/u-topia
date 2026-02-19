import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch classic multi-layer commissions (signup referrals)
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

    // Fetch package purchase referral rewards
    const packageRewards = await prisma.packageReferralReward.findMany({
      where: {
        referrerUserId: session.id,
      },
      include: {
        buyer: {
          include: {
            profile: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Map PackageReferralReward into the same shape expected by useCommissions
    const packageCommissions = packageRewards.map((reward) => ({
      id: reward.id,
      beneficiaryUserId: reward.referrerUserId,
      sourceRevenueEventId: reward.purchaseId,
      layer: 1,
      referredUserId: reward.buyerUserId,
      referredUser: reward.buyer,
      sourceRevenueEvent: null,
      amountUsd: reward.rewardAmountUsd,
      ratePercent: reward.rewardPercent,
      status: reward.status,
      createdAt: reward.createdAt,
      notes: `Package purchase - ${reward.tier} tier`,
    }));

    // Merge: regular commissions first, then package-referral commissions
    const allCommissions = [...commissions, ...packageCommissions];

    return NextResponse.json({ commissions: allCommissions });
  } catch (error) {
    console.error('Get commissions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
