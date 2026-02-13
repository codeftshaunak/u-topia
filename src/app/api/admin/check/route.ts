import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ isAdmin: false });
    }

    // Check if user email is in admin_whitelist
    const adminWhitelist = await prisma.adminWhitelist.findFirst({
      where: {
        email: session.email,
        isActive: true,
      },
    });

    return NextResponse.json({
      isAdmin: !!adminWhitelist,
      email: session.email,
    });
  } catch (error) {
    console.error('Admin check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
