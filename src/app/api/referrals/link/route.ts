import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { nanoid } from 'nanoid';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has purchased a package — required to share referral links
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { currentPackage: true },
    });

    if (!user?.currentPackage) {
      return NextResponse.json(
        {
          error: 'Package required',
          message: 'You must purchase a package before you can share your referral link.',
          hasPackage: false,
        },
        { status: 403 }
      );
    }

    // Get existing active referral link
    let referralLink = await prisma.referralLink.findFirst({
      where: {
        userId: session.id,
        isActive: true,
      },
    });

    // If no active link exists, create one
    if (!referralLink) {
      const code = nanoid(10);
      referralLink = await prisma.referralLink.create({
        data: {
          userId: session.id,
          code,
          isActive: true,
        },
      });
    }

    return NextResponse.json({ code: referralLink.code, hasPackage: true });
  } catch (error) {
    console.error('Get referral link error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has purchased a package — required to share referral links
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { currentPackage: true },
    });

    if (!user?.currentPackage) {
      return NextResponse.json(
        {
          error: 'Package required',
          message: 'You must purchase a package before you can share your referral link.',
          hasPackage: false,
        },
        { status: 403 }
      );
    }

    // Generate new referral link
    const code = nanoid(10);

    // Deactivate old links
    await prisma.referralLink.updateMany({
      where: {
        userId: session.id,
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });

    // Create new link
    const referralLink = await prisma.referralLink.create({
      data: {
        userId: session.id,
        code,
        isActive: true,
      },
    });

    return NextResponse.json({ code: referralLink.code, hasPackage: true });
  } catch (error) {
    console.error('Create referral link error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
