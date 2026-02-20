/**
 * Seed / upsert packages with commission levels.
 * Run: node scripts/seed-packages.mjs
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

const packages = [
  {
    name: 'Bronze',
    priceUsd: 100,
    isActive: true,
    commissionLevels: [
      { level: 1, rate: 10 },
    ],
  },
  {
    name: 'Silver',
    priceUsd: 250,
    isActive: true,
    commissionLevels: [
      { level: 1, rate: 10 },
      { level: 2, rate: 5 },
    ],
  },
  {
    name: 'Gold',
    priceUsd: 500,
    isActive: true,
    commissionLevels: [
      { level: 1, rate: 10 },
      { level: 2, rate: 5 },
      { level: 3, rate: 2.5 },
    ],
  },
  {
    name: 'Platinum',
    priceUsd: 1000,
    isActive: true,
    commissionLevels: [
      { level: 1, rate: 10 },
      { level: 2, rate: 5 },
      { level: 3, rate: 2.5 },
      { level: 4, rate: 1.25 },
    ],
  },
  {
    name: 'Diamond',
    priceUsd: 2500,
    isActive: true,
    commissionLevels: [
      { level: 1, rate: 10 },
      { level: 2, rate: 5 },
      { level: 3, rate: 2.5 },
      { level: 4, rate: 1.25 },
      { level: 5, rate: 0.625 },
      { level: 6, rate: 0.3125 },
    ],
  },
];

async function main() {
  console.log('Seeding packages...\n');

  for (const p of packages) {
    const result = await prisma.package.upsert({
      where: { name: p.name },
      update: {
        priceUsd: p.priceUsd,
        isActive: p.isActive,
        commissionLevels: p.commissionLevels,
      },
      create: {
        name: p.name,
        priceUsd: p.priceUsd,
        isActive: p.isActive,
        commissionLevels: p.commissionLevels,
      },
    });

    const levels = p.commissionLevels.map(l => `L${l.level}:${l.rate}%`).join(', ');
    console.log(`✔ ${result.name.padEnd(10)} $${result.priceUsd.toLocaleString().padStart(5)}  [${levels}]`);
  }

  console.log('\nDone.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); await pool.end(); });
