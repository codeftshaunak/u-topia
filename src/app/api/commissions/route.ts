import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

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

    return NextResponse.json({ commissions });
  } catch (error) {
    console.error('Get commissions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
