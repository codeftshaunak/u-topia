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
    level: 1,
    priceUsd: 1,
    maxDepth: 1,
    isActive: true,
    commissionLevels: [
      { level: 1, rate: 10 },
    ],
  },
  {
    name: 'Silver',
    level: 2,
    priceUsd: 2,
    maxDepth: 2,
    isActive: true,
    commissionLevels: [
      { level: 1, rate: 10 },
      { level: 2, rate: 5 },
    ],
  },
  {
    name: 'Gold',
    level: 3,
    priceUsd: 3,
    maxDepth: 3,
    isActive: true,
    commissionLevels: [
      { level: 1, rate: 10 },
      { level: 2, rate: 5 },
      { level: 3, rate: 2.5 },
    ],
  },
  {
    name: 'Platinum',
    level: 4,
    priceUsd: 4,
    maxDepth: 4,
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
    level: 5,
    priceUsd: 5,
    maxDepth: 5,
    isActive: true,
    commissionLevels: [
      { level: 1, rate: 10 },
      { level: 2, rate: 5 },
      { level: 3, rate: 2.5 },
      { level: 4, rate: 1.25 },
      { level: 5, rate: 0.625 },
    ],
  },
  {
    name: 'Elite',
    level: 6,
    priceUsd: 6,
    maxDepth: 6,
    isActive: true,
    commissionLevels: [
      { level: 1, rate: 10 },
      { level: 2, rate: 5 },
      { level: 3, rate: 2.5 },
      { level: 4, rate: 1.25 },
      { level: 5, rate: 0.625 },
      { level: 6, rate: 0.3175 },
    ],
  },
  {
    name: 'Legend',
    level: 7,
    priceUsd: 7,
    maxDepth: 7,
    isActive: true,
    commissionLevels: [
      { level: 1, rate: 10 },
      { level: 2, rate: 5 },
      { level: 3, rate: 2.5 },
      { level: 4, rate: 1.25 },
      { level: 5, rate: 0.625 },
      { level: 6, rate: 0.3175 },
      { level: 7, rate: 0.15875 },
    ],
  },
  {
    name: 'Titan',
    level: 8,
    priceUsd: 8,
    maxDepth: 8,
    isActive: true,
    commissionLevels: [
      { level: 1, rate: 10 },
      { level: 2, rate: 5 },
      { level: 3, rate: 2.5 },
      { level: 4, rate: 1.25 },
      { level: 5, rate: 0.625 },
      { level: 6, rate: 0.3175 },
      { level: 7, rate: 0.15875 },
      { level: 8, rate: 0.079375 },
    ],
  },
];

async function main() {
  console.log('Seeding packages...\n');

  for (const p of packages) {
    const result = await prisma.package.upsert({
      where: { name: p.name },
      update: {
        level: p.level,
        priceUsd: p.priceUsd,
        maxDepth: p.maxDepth,
        isActive: p.isActive,
        commissionLevels: p.commissionLevels,
      },
      create: {
        name: p.name,
        level: p.level,
        priceUsd: p.priceUsd,
        maxDepth: p.maxDepth,
        isActive: p.isActive,
        commissionLevels: p.commissionLevels,
      },
    });

    const levels = p.commissionLevels.map(l => `L${l.level}:${l.rate}%`).join(', ');
    console.log(`✔ R${p.level} ${result.name.padEnd(10)} $${result.priceUsd.toLocaleString().padStart(6)}  depth=${p.maxDepth}  [${levels}]`);
  }

  console.log('\nDone.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); await pool.end(); });
