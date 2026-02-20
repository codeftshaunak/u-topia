import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

async function requireAdmin() {
  const session = await getSession();
  if (!session) return null;
  const allowed = await prisma.adminWhitelist.findFirst({
    where: { email: session.email, isActive: true },
  });
  return allowed ? session : null;
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { id, priceUsd, isActive, commissionLevels } = body;

    if (!id) {
      return NextResponse.json({ error: 'Package id is required' }, { status: 400 });
    }

    const data: Record<string, unknown> = { updatedBy: session.email };
    if (priceUsd !== undefined) data.priceUsd = priceUsd;
    if (isActive !== undefined) data.isActive = isActive;
    if (commissionLevels !== undefined) data.commissionLevels = commissionLevels;

    const updated = await prisma.package.update({ where: { id }, data });

    await prisma.adminAuditLog.create({
      data: {
        action: 'UPDATE_PACKAGE',
        adminEmail: session.email,
        targetTable: 'packages',
        targetId: id,
        after: JSON.parse(JSON.stringify(data)),
      },
    });

    return NextResponse.json({ package: updated });
  } catch (error) {
    console.error('Admin update package error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
