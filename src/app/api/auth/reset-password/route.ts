import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { nanoid } from 'nanoid';

// Store reset tokens in memory (in production, use Redis or database)
const resetTokens = new Map<string, { email: string; expiresAt: number }>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, token, newPassword } = body;

    // Request password reset
    if (email && !token && !newPassword) {
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      // Always return success for security (don't reveal if email exists)
      if (user) {
        const resetToken = nanoid(32);
        resetTokens.set(resetToken, {
          email: user.email,
          expiresAt: Date.now() + 3600000, // 1 hour
        });

        // In production, send email with reset link
        // For now, log the token (in production, remove this)
        console.log(`Password reset token for ${email}: ${resetToken}`);
        console.log(`Reset link: ${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`);
      }

      return NextResponse.json({
        message: 'If an account exists, a reset link has been sent',
      });
    }

    // Reset password with token
    if (token && newPassword) {
      const tokenData = resetTokens.get(token);

      if (!tokenData || tokenData.expiresAt < Date.now()) {
        return NextResponse.json(
          { error: 'Invalid or expired reset token' },
          { status: 400 }
        );
      }

      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: 'Password must be at least 6 characters' },
          { status: 400 }
        );
      }

      const hashedPassword = await hashPassword(newPassword);

      await prisma.user.update({
        where: { email: tokenData.email },
        data: { password: hashedPassword },
      });

      // Delete used token
      resetTokens.delete(token);

      return NextResponse.json({ message: 'Password reset successful' });
    }

    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
