#!/usr/bin/env node

/**
 * Test Fireblocks API permissions
 * Run with: node scripts/test-fireblocks-permissions.js
 */

import { Fireblocks, BasePath } from "@fireblocks/ts-sdk";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

console.log("=== Fireblocks Permission Test ===\n");

// Read .env.local manually
const envPath = resolve(process.cwd(), ".env.local");
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, "utf8");
  envContent.split("\n").forEach((line) => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2];
    }
  });
}

const FIREBLOCKS_API_KEY = process.env.FIREBLOCKS_API_KEY;
const FIREBLOCKS_SECRET_KEY_PATH = process.env.FIREBLOCKS_SECRET_KEY_PATH;

console.log("=== Fireblocks Permission Test ===\n");

// Check configuration
if (!FIREBLOCKS_API_KEY) {
  console.error("❌ FIREBLOCKS_API_KEY not set");
  process.exit(1);
}

if (!FIREBLOCKS_SECRET_KEY_PATH) {
  console.error("❌ FIREBLOCKS_SECRET_KEY_PATH not set");
  process.exit(1);
}

// Load secret key
const keyPath = resolve(process.cwd(), FIREBLOCKS_SECRET_KEY_PATH);
if (!existsSync(keyPath)) {
  console.error(`❌ Secret key file not found: ${keyPath}`);
  process.exit(1);
}

const secretKey = readFileSync(keyPath, "utf8");
console.log(`✅ API Key: ${FIREBLOCKS_API_KEY.substring(0, 10)}...`);
console.log(`✅ Secret Key loaded (${secretKey.length} bytes)\n`);

// Initialize Fireblocks
const fireblocks = new Fireblocks({
  apiKey: FIREBLOCKS_API_KEY,
  basePath: BasePath.Sandbox,
  secretKey: secretKey,
});

async function testPermissions() {
  console.log("Testing API permissions...\n");

  // Test 1: Get supported assets (requires minimal permissions)
  try {
    console.log("1️⃣  Testing: Get supported assets...");
    const assets = await fireblocks.blockchainsAssets.getSupportedAssets();
    console.log(`   ✅ SUCCESS - Found ${assets.data?.length || 0} assets`);
  } catch (error) {
    console.log(`   ❌ FAILED - ${error.message}`);
  }

  // Test 2: List vault accounts (requires read permission)
  try {
    console.log("\n2️⃣  Testing: List vault accounts...");
    const vaults = await fireblocks.vaults.getPagedVaultAccounts({ limit: 5 });
    console.log(`   ✅ SUCCESS - Found ${vaults.data?.accounts?.length || 0} vaults`);
    if (vaults.data?.accounts && vaults.data.accounts.length > 0) {
      console.log(`   First vault: ${vaults.data.accounts[0].name} (ID: ${vaults.data.accounts[0].id})`);
    }
  } catch (error) {
    console.log(`   ❌ FAILED - ${error.message}`);
  }

  // Test 3: Create vault account (requires write permission)
  try {
    console.log("\n3️⃣  Testing: Create test vault...");
    const testName = `Test-${Date.now()}`;
    const vault = await fireblocks.vaults.createVaultAccount({
      createVaultAccountRequest: {
        name: testName,
        hiddenOnUI: false,
        autoFuel: false,
      },
    });
    console.log(`   ✅ SUCCESS - Created vault: ${vault.data?.name} (ID: ${vault.data?.id})`);

    // Clean up - try to rename it
    if (vault.data?.id) {
      try {
        await fireblocks.vaults.updateVaultAccount({
          vaultAccountId: vault.data.id,
          updateVaultAccountRequest: {
            name: `${testName}-DELETEME`,
          },
        });
        console.log(`   ℹ️  Marked vault for manual deletion: ${testName}-DELETEME`);
      } catch (e) {
        // Ignore cleanup error
      }
    }
  } catch (error) {
    console.log(`   ❌ FAILED - ${error.message}`);
    if (error.message?.includes("Unauthorized")) {
      console.log(`\n   ⚠️  Your API credentials don't have permission to create vaults!`);
      console.log(`   ⚠️  Please check your Fireblocks API User permissions in the console.`);
    }
  }

  console.log("\n=== Test Complete ===");
}

testPermissions().catch((error) => {
  console.error("\n❌ Test failed:", error);
  process.exit(1);
});
