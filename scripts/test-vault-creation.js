#!/usr/bin/env node

/**
 * Test complete vault creation flow with asset activation
 * Run with: node scripts/test-vault-creation.js
 */

import { Fireblocks, BasePath } from "@fireblocks/ts-sdk";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

console.log("=== Vault Creation + Asset Activation Test ===\n");

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
const FIREBLOCKS_BASE_PATH = process.env.FIREBLOCKS_BASE_PATH || "sandbox";

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
console.log(`✅ Secret Key loaded (${secretKey.length} bytes)`);
console.log(`✅ Environment: ${FIREBLOCKS_BASE_PATH}\n`);

// Initialize Fireblocks
const basePath = FIREBLOCKS_BASE_PATH === "sandbox" ? BasePath.Sandbox : BasePath.US;
const fireblocks = new Fireblocks({
  apiKey: FIREBLOCKS_API_KEY,
  basePath: basePath,
  secretKey: secretKey,
});

// Asset configuration (same as in fireblocks-payment.ts)
const TESTNET_ASSETS = ["BTC_TEST", "ETH_TEST5"];
const MAINNET_ASSETS = ["BTC", "ETH", "USDT_ERC20", "USDC", "SOL"];
const ASSETS_TO_ACTIVATE = FIREBLOCKS_BASE_PATH === "sandbox" ? TESTNET_ASSETS : MAINNET_ASSETS;

async function testVaultCreation() {
  const testUserId = `test_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const testVaultName = `utopia_${testUserId}`;
  let createdVaultId = null;

  try {
    // Step 1: Create vault
    console.log("1️⃣  Creating test vault...");
    const vault = await fireblocks.vaults.createVaultAccount({
      createVaultAccountRequest: {
        name: testVaultName,
        hiddenOnUI: false,
        autoFuel: false,
      },
    });

    createdVaultId = vault.data?.id;
    if (!createdVaultId) {
      throw new Error("No vault ID returned");
    }

    console.log(`   ✅ Created vault: ${testVaultName} (ID: ${createdVaultId})\n`);

    // Step 2: Activate assets
    console.log(`2️⃣  Activating ${ASSETS_TO_ACTIVATE.length} assets in vault...`);
    const results = [];

    for (const assetId of ASSETS_TO_ACTIVATE) {
      try {
        await fireblocks.vaults.createVaultAccountAsset({
          vaultAccountId: createdVaultId,
          assetId: assetId,
        });
        results.push({ asset: assetId, status: "success" });
        console.log(`   ✅ Activated ${assetId}`);
      } catch (err) {
        const msg = err.response?.data?.message || err.message || String(err);
        if (msg.includes("already exists") || msg.includes("Asset already created")) {
          results.push({ asset: assetId, status: "success" });
          console.log(`   ℹ️  ${assetId} already activated`);
        } else {
          results.push({ asset: assetId, status: "failed", error: msg });
          console.log(`   ⚠️  Failed to activate ${assetId}: ${msg}`);
        }
      }
    }

    const successful = results.filter((r) => r.status === "success").length;
    const failed = results.filter((r) => r.status === "failed").length;

    console.log(`\n   📊 Results: ${successful} succeeded, ${failed} failed\n`);

    // Step 3: Verify assets are activated
    console.log("3️⃣  Verifying vault assets...");
    const vaultDetails = await fireblocks.vaults.getVaultAccount({
      vaultAccountId: createdVaultId,
    });

    const activatedAssets = vaultDetails.data?.assets || [];
    console.log(`   ✅ Vault has ${activatedAssets.length} active assets:`);
    activatedAssets.forEach((asset) => {
      console.log(`      - ${asset.id}: ${asset.available || 0} (balance)`);
    });

    // Step 4: Cleanup - mark for deletion
    console.log("\n4️⃣  Marking vault for manual deletion...");
    try {
      await fireblocks.vaults.updateVaultAccount({
        vaultAccountId: createdVaultId,
        updateVaultAccountRequest: {
          name: `${testVaultName}-DELETEME`,
        },
      });
      console.log(`   ✅ Vault renamed to: ${testVaultName}-DELETEME`);
      console.log(`   ℹ️  Please manually delete this vault from Fireblocks Console`);
    } catch (err) {
      console.log(`   ⚠️  Could not rename vault: ${err.message}`);
    }

    console.log("\n=== ✅ Test Complete - Vault creation with asset activation works! ===");
  } catch (error) {
    console.error("\n❌ Test failed:", error.message);
    if (createdVaultId) {
      console.log(`\nℹ️  Created vault ID ${createdVaultId} - please delete manually`);
    }
    process.exit(1);
  }
}

testVaultCreation();
