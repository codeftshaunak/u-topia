#!/usr/bin/env node
/**
 * Test script to verify Fireblocks configuration
 * Run: node scripts/test-fireblocks.js
 */

const fs = require('fs');
const path = require('path');

// Load .env.local
const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      // Remove quotes
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  });
}

console.log('🔍 Fireblocks Configuration Check\n');

// Check API Key
const apiKey = process.env.FIREBLOCKS_API_KEY;
console.log('✓ FIREBLOCKS_API_KEY:', apiKey ? `${apiKey.slice(0, 8)}...` : '❌ NOT SET');

// Check Secret Key Path
const secretKeyPath = process.env.FIREBLOCKS_SECRET_KEY_PATH;
console.log('✓ FIREBLOCKS_SECRET_KEY_PATH:', secretKeyPath || '❌ NOT SET');

if (secretKeyPath) {
  const absolutePath = path.resolve(process.cwd(), secretKeyPath);
  console.log('  Resolved path:', absolutePath);

  if (fs.existsSync(absolutePath)) {
    const stats = fs.statSync(absolutePath);
    console.log('  ✓ File exists (', stats.size, 'bytes)');

    const content = fs.readFileSync(absolutePath, 'utf8');
    if (content.includes('-----BEGIN PRIVATE KEY-----')) {
      console.log('  ✓ Valid private key format');
    } else {
      console.log('  ❌ Invalid key format (missing BEGIN PRIVATE KEY)');
    }
  } else {
    console.log('  ❌ File not found');
  }
}

// Check Base Path
const basePath = process.env.FIREBLOCKS_BASE_PATH || 'sandbox';
console.log('✓ FIREBLOCKS_BASE_PATH:', basePath);

console.log('\n✅ Configuration check complete!');
console.log('\nExpected values:');
console.log('- API_KEY: Your Fireblocks API User ID (UUID format)');
console.log('- SECRET_KEY_PATH: .secrets/fireblocks_secret.key');
console.log('- BASE_PATH: sandbox (for testing) or production');
