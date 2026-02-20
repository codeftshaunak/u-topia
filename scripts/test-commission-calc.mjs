/**
 * Commission Calculation Verification Script
 *
 * Simulates the exact commission walker logic used in the webhook
 * with REAL data from the database. Tests all scenarios.
 *
 * Run: export $(grep -v '^#' .env.local | xargs) && node scripts/test-commission-calc.mjs
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pkg from 'pg';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load .env.local manually
try {
  const env = readFileSync(resolve(process.cwd(), '.env.local'), 'utf8');
  for (const line of env.split('\n')) {
    const m = line.match(/^([^#=]+)=["']?(.+?)["']?\s*$/);
    if (m) process.env[m[1].trim()] = m[2].trim();
  }
} catch {}

const { Pool } = pkg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const MAX_DEPTH = 8;

// ── Helper: the exact commission calculation from the webhook ────────────────

async function simulateCommission(buyerUserId, purchaseTier) {
  console.log('\n' + '═'.repeat(70));
  console.log(`  COMMISSION SIMULATION`);
  console.log(`  Buyer: ${buyerUserId}`);
  console.log(`  Package purchased: ${purchaseTier}`);
  console.log('═'.repeat(70));

  // 1. Fetch all packages from DB
  const allPackages = await prisma.package.findMany({ where: { isActive: true } });
  const packageByName = {};
  for (const p of allPackages) {
    packageByName[p.name.toLowerCase()] = p;
  }

  // 2. Get purchase price from DB
  const purchasedPkg = packageByName[purchaseTier.toLowerCase()];
  if (!purchasedPkg) {
    console.error(`  ✗ Package "${purchaseTier}" not found in DB!`);
    return;
  }
  const purchasePrice = purchasedPkg.priceUsd;
  console.log(`  Purchase price: $${purchasePrice}`);
  console.log(`\n  DB Packages loaded:`);
  for (const p of allPackages) {
    const levels = (p.commissionLevels || []);
    console.log(`    ${p.name.padEnd(10)} $${String(p.priceUsd).padStart(6)} | Levels: ${levels.map(l => `L${l.level}:${l.rate}%`).join(', ') || 'none'}`);
  }

  // 3. Get buyer's referral chain
  const buyer = await prisma.user.findUnique({
    where: { id: buyerUserId },
    select: { referredByUserId: true, email: true },
  });

  if (!buyer) {
    console.error(`  ✗ Buyer not found!`);
    return;
  }

  console.log(`\n  Buyer email: ${buyer.email}`);
  console.log(`  Buyer's referrer: ${buyer.referredByUserId || 'NONE'}`);

  if (!buyer.referredByUserId) {
    console.log(`  ✗ No referrer — no commissions to distribute`);
    return;
  }

  // 4. Walk the chain
  let currentUserId = buyer.referredByUserId;
  let layer = 1;
  const visitedIds = new Set([buyerUserId]);
  let totalDistributed = 0;

  console.log(`\n  ${'Layer'.padEnd(6)} ${'Ancestor'.padEnd(28)} ${'Package'.padEnd(12)} ${'Rate'.padEnd(8)} ${'Commission'.padEnd(12)} Status`);
  console.log('  ' + '─'.repeat(66));

  while (currentUserId && layer <= MAX_DEPTH) {
    if (visitedIds.has(currentUserId)) {
      console.log(`  ⚠ Circular referral at ${currentUserId}`);
      break;
    }
    visitedIds.add(currentUserId);

    const ancestor = await prisma.user.findUnique({
      where: { id: currentUserId },
      select: {
        id: true,
        email: true,
        currentPackage: true,
        referredByUserId: true,
        affiliateStatus: { select: { isActive: true } },
      },
    });

    if (!ancestor) {
      console.log(`  L${layer}  Ancestor ${currentUserId} NOT FOUND — chain ends`);
      break;
    }

    const hasPackage = !!ancestor.currentPackage;
    const isActive = ancestor.affiliateStatus?.isActive ?? false;

    if (hasPackage && isActive) {
      const ancestorPkg = packageByName[ancestor.currentPackage.toLowerCase()];

      if (ancestorPkg) {
        const levels = (ancestorPkg.commissionLevels || []);
        const levelEntry = levels.find(l => l.level === layer);

        if (levelEntry && levelEntry.rate > 0) {
          const commission = parseFloat((purchasePrice * levelEntry.rate / 100).toFixed(2));
          totalDistributed += commission;
          console.log(
            `  L${String(layer).padEnd(4)} ` +
            `${ancestor.email.padEnd(28)} ` +
            `${ancestor.currentPackage.padEnd(12)} ` +
            `${(levelEntry.rate + '%').padEnd(8)} ` +
            `$${String(commission).padEnd(11)} ` +
            `✓ PAID`
          );
        } else {
          console.log(
            `  L${String(layer).padEnd(4)} ` +
            `${ancestor.email.padEnd(28)} ` +
            `${ancestor.currentPackage.padEnd(12)} ` +
            `${'—'.padEnd(8)} ` +
            `${'—'.padEnd(12)} ` +
            `⊘ No L${layer} rate (max depth: ${levels.length})`
          );
        }
      } else {
        console.log(
          `  L${String(layer).padEnd(4)} ` +
          `${ancestor.email.padEnd(28)} ` +
          `${(ancestor.currentPackage || '?').padEnd(12)} ` +
          `${'—'.padEnd(8)} ` +
          `${'—'.padEnd(12)} ` +
          `✗ Package not in DB`
        );
      }
    } else {
      console.log(
        `  L${String(layer).padEnd(4)} ` +
        `${ancestor.email.padEnd(28)} ` +
        `${'—'.padEnd(12)} ` +
        `${'—'.padEnd(8)} ` +
        `${'—'.padEnd(12)} ` +
        `✗ ${!hasPackage ? 'No package' : 'Inactive'}`
      );
    }

    currentUserId = ancestor.referredByUserId;
    layer++;
  }

  console.log('  ' + '─'.repeat(66));
  console.log(`  Total distributed: $${totalDistributed.toFixed(2)} out of $${purchasePrice} (${(totalDistributed / purchasePrice * 100).toFixed(2)}%)`);
  console.log('═'.repeat(70));
}

// ── Test scenarios ───────────────────────────────────────────────────────────

async function runTests() {
  console.log('\n╔══════════════════════════════════════════════════════════════════════╗');
  console.log('║  COMMISSION CALCULATION TEST SUITE                                  ║');
  console.log('║  Uses REAL data from database                                       ║');
  console.log('╚══════════════════════════════════════════════════════════════════════╝');

  // ── Scenario 1: Show all users with referral chains ──
  console.log('\n\n📊 ALL USERS WITH REFERRAL CHAINS:');
  console.log('─'.repeat(70));

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      currentPackage: true,
      referredByUserId: true,
      affiliateStatus: { select: { isActive: true, tierDepthLimit: true } },
    },
    orderBy: { createdAt: 'asc' },
  });

  for (const u of users) {
    const referrer = u.referredByUserId
      ? users.find(x => x.id === u.referredByUserId)?.email || u.referredByUserId
      : '—';
    console.log(
      `  ${u.email.padEnd(30)} ` +
      `pkg=${(u.currentPackage || 'none').padEnd(10)} ` +
      `active=${String(u.affiliateStatus?.isActive ?? false).padEnd(6)} ` +
      `referrer=${referrer}`
    );
  }

  // ── Scenario 2: Show existing commissions in DB ──
  console.log('\n\n💰 EXISTING COMMISSIONS IN DB:');
  console.log('─'.repeat(70));

  const commissions = await prisma.commission.findMany({
    include: {
      beneficiary: { select: { email: true } },
      referredUser: { select: { email: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  if (commissions.length === 0) {
    console.log('  (no commissions recorded yet)');
  } else {
    for (const c of commissions) {
      console.log(
        `  L${c.layer} | ${c.beneficiary.email.padEnd(25)} earned $${String(c.amountUsd).padEnd(8)} ` +
        `(${c.ratePercent}%) from ${c.referredUser.email.padEnd(25)} | ${c.status} | ${c.notes || ''}`
      );
    }
  }

  // ── Scenario 3: Simulate commission for each recent completed purchase ──
  const recentPurchases = await prisma.purchase.findMany({
    where: { status: 'completed' },
    include: { user: { select: { id: true, email: true } } },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  if (recentPurchases.length > 0) {
    console.log('\n\n🔄 SIMULATING COMMISSIONS FOR RECENT PURCHASES:');
    for (const p of recentPurchases) {
      if (p.userId) {
        await simulateCommission(p.userId, p.tier);
      }
    }
  }

  // ── Scenario 4: Manual test cases ──
  console.log('\n\n📝 EXPECTED CALCULATIONS:');
  console.log('─'.repeat(70));

  const allPkgs = await prisma.package.findMany({ where: { isActive: true } });
  const pkgMap = {};
  for (const p of allPkgs) pkgMap[p.name.toLowerCase()] = p;

  const scenarios = [
    { referrerPkg: 'bronze', buyerTier: 'gold', layer: 1, description: 'Bronze referrer, Gold buyer (L1)' },
    { referrerPkg: 'silver', buyerTier: 'gold', layer: 1, description: 'Silver referrer, Gold buyer (L1)' },
    { referrerPkg: 'silver', buyerTier: 'gold', layer: 2, description: 'Silver L2 ancestor, Gold buyer' },
    { referrerPkg: 'bronze', buyerTier: 'gold', layer: 2, description: 'Bronze L2 ancestor, Gold buyer (should be $0 — Bronze only has L1)' },
    { referrerPkg: 'diamond', buyerTier: 'diamond', layer: 6, description: 'Diamond L6 ancestor, Diamond buyer' },
    { referrerPkg: 'gold', buyerTier: 'bronze', layer: 3, description: 'Gold L3 ancestor, Bronze buyer' },
    { referrerPkg: 'platinum', buyerTier: 'silver', layer: 4, description: 'Platinum L4 ancestor, Silver buyer' },
  ];

  for (const s of scenarios) {
    const buyerPkg = pkgMap[s.buyerTier];
    const refPkg = pkgMap[s.referrerPkg];
    if (!buyerPkg || !refPkg) continue;

    const levels = (refPkg.commissionLevels || []);
    const levelEntry = levels.find(l => l.level === s.layer);
    const rate = levelEntry?.rate ?? 0;
    const commission = parseFloat((buyerPkg.priceUsd * rate / 100).toFixed(2));

    console.log(
      `  ${s.description}`
    );
    console.log(
      `    → Referrer's ${s.referrerPkg} pkg L${s.layer} rate = ${rate}%`
    );
    console.log(
      `    → $${buyerPkg.priceUsd} × ${rate}% = $${commission}`
    );
    console.log('');
  }
}

// ── Run ──────────────────────────────────────────────────────────────────────

runTests()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
