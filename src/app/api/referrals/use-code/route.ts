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

    // Find referral link
    const referralLink = await prisma.referralLink.findUnique({
      where: { code },
      include: { user: true },
    });

    if (!referralLink || !referralLink.isActive) {
      return NextResponse.json(
        { error: 'Invalid or expired referral code' },
        { status: 400 }
      );
    }

    // Check if already used
    if (referralLink.usedAt) {
      return NextResponse.json(
        { error: 'This referral code has already been used' },
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

    // Check if user has already been referred
    const existingReferral = await prisma.referral.findFirst({
      where: {
        referredUserId: referredUser.id,
      },
    });

    if (existingReferral) {
      return NextResponse.json(
        { error: 'This user has already been referred by another user' },
        { status: 400 }
      );
    }

    // Create referral
    await prisma.referral.create({
      data: {
        referrerUserId: referralLink.userId,
        referredUserId: referredUser.id,
        status: 'pending',
      },
    });

    // Mark referral link as used
    await prisma.referralLink.update({
      where: { id: referralLink.id },
      data: {
        usedAt: new Date(),
        usedByEmail: email.toLowerCase(),
        isActive: false,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Use referral code error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
