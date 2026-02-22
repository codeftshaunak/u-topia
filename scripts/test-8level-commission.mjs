/**
 * Multi-Level Commission System — Example Payout Scenario & Test
 *
 * Run: node scripts/test-8level-commission.mjs
 *
 * Simulates an 8-level referral chain and calculates expected payouts.
 * No DB required — uses the pure calculation function.
 *
 * ┌────────────────────────────────────────────────────────────────────────┐
 * │                        EXAMPLE SCENARIO                               │
 * │                                                                       │
 * │  User A (Titan/R8)                                                    │
 * │    └─ referred User B (Legend/R7)                                     │
 * │         └─ referred User C (Elite/R6)                                 │
 * │              └─ referred User D (Diamond/R5)                          │
 * │                   └─ referred User E (Platinum/R4)                    │
 * │                        └─ referred User F (Gold/R3)                   │
 * │                             └─ referred User G (Silver/R2)            │
 * │                                  └─ referred User H (Bronze/R1)       │
 * │                                       └─ User I BUYS Titan ($25,000)  │
 * └────────────────────────────────────────────────────────────────────────┘
 */

// ─── Commission Rates (canonical) ────────────────────────────────────────────

const COMMISSION_RATES = {
  1: 10,
  2: 5,
  3: 2.5,
  4: 1.25,
  5: 0.625,
  6: 0.3175,
  7: 0.15875,
  8: 0.079375,
};

const PACKAGE_LEVELS = {
  bronze: 1, silver: 2, gold: 3, platinum: 4,
  diamond: 5, elite: 6, legend: 7, titan: 8,
};

const PACKAGE_PRICES = {
  bronze: 1, silver: 2, gold: 3, platinum: 4,
  diamond: 5, elite: 6, legend: 7, titan: 8,
};

// ─── Pure Calculation ────────────────────────────────────────────────────────

function calculateCommissions(buyerId, commissionBase, ancestors) {
  const payouts = [];
  const skipped = [];
  const visited = new Set([buyerId]);
  let layer = 1;

  for (const ancestor of ancestors) {
    if (layer > 8) break;
    if (visited.has(ancestor.id)) {
      skipped.push({ userId: ancestor.id, layer, reason: 'circular_reference' });
      break;
    }
    visited.add(ancestor.id);

    const pkgLevel = PACKAGE_LEVELS[ancestor.package] ?? 0;

    if (!ancestor.package || !ancestor.active) {
      skipped.push({ userId: ancestor.id, layer, reason: !ancestor.package ? 'no_package' : 'inactive' });
      layer++;
      continue;
    }

    if (pkgLevel < layer) {
      skipped.push({
        userId: ancestor.id, layer,
        reason: `${ancestor.package}(lvl${pkgLevel}) < layer ${layer}`,
      });
      layer++;
      continue;
    }

    const rate = COMMISSION_RATES[layer];
    const amount = parseFloat((commissionBase * rate / 100).toFixed(2));

    payouts.push({
      user: ancestor.id,
      package: ancestor.package,
      packageLevel: pkgLevel,
      layer,
      rate,
      amount,
    });

    layer++;
  }

  return { payouts, skipped };
}

// ─── Scenario 1: Full 8-level chain, all eligible ────────────────────────────

function scenario1() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('SCENARIO 1: Full 8-Level Chain — User I buys Titan ($25,000)');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const purchasePrice = 25000;
  const ancestors = [
    { id: 'H', package: 'bronze',   active: true },  // L1 — bronze can earn L1 ✓
    { id: 'G', package: 'silver',   active: true },  // L2 — silver can earn L1-2 ✓
    { id: 'F', package: 'gold',     active: true },  // L3 — gold can earn L1-3 ✓
    { id: 'E', package: 'platinum', active: true },  // L4 — plat can earn L1-4 ✓
    { id: 'D', package: 'diamond',  active: true },  // L5 — diamond can earn L1-5 ✓
    { id: 'C', package: 'elite',    active: true },  // L6 — elite can earn L1-6 ✓
    { id: 'B', package: 'legend',   active: true },  // L7 — legend can earn L1-7 ✓
    { id: 'A', package: 'titan',    active: true },  // L8 — titan can earn L1-8 ✓
  ];

  const { payouts, skipped } = calculateCommissions('I', purchasePrice, ancestors);
  printResults(purchasePrice, payouts, skipped);
}

// ─── Scenario 2: Mixed eligibility ──────────────────────────────────────────

function scenario2() {
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('SCENARIO 2: Mixed Eligibility — User buys Diamond ($2,500)');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const purchasePrice = 2500;
  const ancestors = [
    { id: 'H', package: 'gold',     active: true },  // L1 — gold lvl3 >= 1 ✓
    { id: 'G', package: 'bronze',   active: true },  // L2 — bronze lvl1 < 2 ✗
    { id: 'F', package: 'diamond',  active: true },  // L3 — diamond lvl5 >= 3 ✓
    { id: 'E', package: null,       active: false },  // L4 — no package ✗
    { id: 'D', package: 'titan',    active: true },  // L5 — titan lvl8 >= 5 ✓
  ];

  const { payouts, skipped } = calculateCommissions('buyer', purchasePrice, ancestors);
  printResults(purchasePrice, payouts, skipped);
}

// ─── Scenario 3: Upgrade scenario ───────────────────────────────────────────

function scenario3() {
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('SCENARIO 3: Upgrade — User upgrades Silver→Platinum');
  console.log('  Original price: $250 (Silver), New price: $1000 (Platinum)');
  console.log('  Commission base: $750 (difference only)');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const commissionBase = 1000 - 250; // $750 difference
  const ancestors = [
    { id: 'R1', package: 'titan',    active: true },  // L1
    { id: 'R2', package: 'diamond',  active: true },  // L2
    { id: 'R3', package: 'gold',     active: true },  // L3
    { id: 'R4', package: 'platinum', active: true },  // L4
  ];

  const { payouts, skipped } = calculateCommissions('upgrader', commissionBase, ancestors);
  printResults(commissionBase, payouts, skipped);
  console.log(`  ℹ  Commission is on the $750 UPGRADE DIFFERENCE, not the full $1000 price.\n`);
}

// ─── Scenario 4: All same package ───────────────────────────────────────────

function scenario4() {
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('SCENARIO 4: All Referrers have Bronze — Buyer purchases Gold ($500)');
  console.log('  Bronze (lvl1) can only earn from L1, so only the direct referrer earns.');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const purchasePrice = 500;
  const ancestors = [
    { id: 'R1', package: 'bronze', active: true },  // L1 — bronze lvl1 >= 1 ✓
    { id: 'R2', package: 'bronze', active: true },  // L2 — bronze lvl1 < 2 ✗
    { id: 'R3', package: 'bronze', active: true },  // L3 — bronze lvl1 < 3 ✗
    { id: 'R4', package: 'bronze', active: true },  // L4 — bronze lvl1 < 4 ✗
  ];

  const { payouts, skipped } = calculateCommissions('buyer', purchasePrice, ancestors);
  printResults(purchasePrice, payouts, skipped);
}

// ─── Helper ──────────────────────────────────────────────────────────────────

function printResults(base, payouts, skipped) {
  console.log(`  Commission Base: $${base.toLocaleString()}\n`);

  if (payouts.length > 0) {
    console.log('  ✅ PAYOUTS:');
    console.log('  ┌───────┬──────────┬─────────────┬────────────┬────────────┐');
    console.log('  │ Layer │ User     │ Package     │ Rate       │ Amount     │');
    console.log('  ├───────┼──────────┼─────────────┼────────────┼────────────┤');
    for (const p of payouts) {
      const layer = `L${p.layer}`.padEnd(5);
      const user = p.user.padEnd(8);
      const pkg = `${p.package}(${p.packageLevel})`.padEnd(11);
      const rate = `${p.rate}%`.padEnd(10);
      const amt = `$${p.amount.toFixed(2)}`.padStart(10);
      console.log(`  │ ${layer} │ ${user} │ ${pkg} │ ${rate} │ ${amt} │`);
    }
    console.log('  └───────┴──────────┴─────────────┴────────────┴────────────┘');

    const total = payouts.reduce((s, p) => s + p.amount, 0);
    console.log(`\n  TOTAL DISTRIBUTED: $${total.toFixed(2)} (${(total / base * 100).toFixed(4)}% of base)\n`);
  }

  if (skipped.length > 0) {
    console.log('  ⏭  SKIPPED:');
    for (const s of skipped) {
      console.log(`     L${s.layer}: ${s.userId} — ${s.reason}`);
    }
    console.log('');
  }
}

// ─── Run All Scenarios ───────────────────────────────────────────────────────

console.log('\n🔗 Multi-Level Referral Commission System — 8 Packages (R1–R8)\n');
console.log('Commission Rates:');
for (const [level, rate] of Object.entries(COMMISSION_RATES)) {
  console.log(`  Level ${level}: ${rate}%`);
}
console.log('\nPackages:');
for (const [name, level] of Object.entries(PACKAGE_LEVELS)) {
  console.log(`  R${level} (${name.padEnd(8)}) — $${PACKAGE_PRICES[name].toLocaleString().padStart(6)} — earns from L1${level > 1 ? `–L${level}` : ''}`);
}
console.log('');

scenario1();
scenario2();
scenario3();
scenario4();

console.log('═══════════════════════════════════════════════════════════════');
console.log('All scenarios completed.');
console.log('═══════════════════════════════════════════════════════════════');
