import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    const body = await request.json();
    const { code, email } = body;

    if (!code || !email) {
      return NextResponse.json(
        { error: 'Code and email are required' },
        { status: 400 }
      );
    }

    // Find referral link (must be active)
    const referralLink = await prisma.referralLink.findUnique({
      where: { code },
      include: { user: { select: { id: true, email: true, currentPackage: true } } },
    });

    if (!referralLink || !referralLink.isActive) {
      return NextResponse.json(
        { error: 'Invalid or expired referral code' },
        { status: 400 }
      );
    }

    // Referrer must have a package to generate valid referrals
    if (!referralLink.user.currentPackage) {
      return NextResponse.json(
        { error: 'Referrer has not purchased a package yet' },
        { status: 400 }
      );
    }

    // Check if user is trying to refer themselves
    if (referralLink.user.email.toLowerCase() === email.toLowerCase()) {
      return NextResponse.json(
        { error: 'You cannot refer yourself' },
        { status: 400 }
      );
    }

    // Find the referred user
    const referredUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!referredUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user already has a referrer
    if (referredUser.referredByUserId) {
      return NextResponse.json(
        { error: 'This user has already been referred by another user' },
        { status: 400 }
      );
    }

    // Set referredByUserId on the user and create Referral record atomically
    await prisma.$transaction([
      prisma.user.update({
        where: { id: referredUser.id },
        data: { referredByUserId: referralLink.userId },
      }),
      prisma.referral.create({
        data: {
          referrerUserId: referralLink.userId,
          referredUserId: referredUser.id,
          status: 'active',
        },
      }),
    ]);

    // NOTE: Referral links are reusable — we do NOT deactivate them

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Use referral code error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
