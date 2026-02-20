import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword, createToken, setAuthCookie } from '@/lib/auth';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, fullName, mobile, referralCode } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Resolve referral code to referrer user, if provided
    let referredByUserId: string | null = null;
    if (referralCode) {
      const referralLink = await prisma.referralLink.findUnique({
        where: { code: referralCode },
        select: { userId: true, isActive: true, user: { select: { id: true, email: true, currentPackage: true } } },
      });

      if (referralLink && referralLink.isActive) {
        // Prevent self-referral
        if (referralLink.user.email.toLowerCase() !== email.toLowerCase()) {
          // Referrer must have purchased a package to generate valid referrals
          if (referralLink.user.currentPackage) {
            referredByUserId = referralLink.userId;
          } else {
            console.log(`[Signup] Referral code "${referralCode}" from user without package — ignoring`);
          }
        }
      } else {
        console.log(`[Signup] Referral code "${referralCode}" not found or inactive`);
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user, profile, affiliate status, and referral record in a transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: email.toLowerCase(),
          password: hashedPassword,
          referredByUserId,
          profile: {
            create: {
              email: email.toLowerCase(),
              fullName: fullName || null,
            },
          },
          affiliateStatus: {
            create: {
              tier: 'bronze',
              tierDepthLimit: 0, // No commission depth until package purchase
              isActive: true,
            },
          },
        },
        include: {
          profile: true,
        },
      });

      // Create Referral record if there's a referrer
      if (referredByUserId) {
        await tx.referral.create({
          data: {
            referrerUserId: referredByUserId,
            referredUserId: newUser.id,
            status: 'active',
          },
        });
        console.log(`[Signup] Referral chain: ${referredByUserId} → ${newUser.id}`);
      }

      return newUser;
    });

    // Create auth token
    const token = await createToken({
      id: user.id,
      email: user.email,
      emailVerified: user.emailVerified,
    });

    // Create response with cookie
    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
        profile: user.profile,
      },
      token,
    });

    // Set auth cookie on response
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
