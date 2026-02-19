#!/usr/bin/env node

/**
 * List all assets in a specific vault
 * Run with: node scripts/list-vault-assets.js
 */

import { Fireblocks, BasePath } from "@fireblocks/ts-sdk";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

console.log("=== Fireblocks Vault Assets List ===\n");

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
const FIREBLOCKS_VAULT_ID = process.env.FIREBLOCKS_VAULT_ID || "1";

const keyPath = resolve(process.cwd(), FIREBLOCKS_SECRET_KEY_PATH);
const secretKey = readFileSync(keyPath, "utf8");

const fireblocks = new Fireblocks({
  apiKey: FIREBLOCKS_API_KEY,
  basePath: BasePath.Sandbox,
  secretKey: secretKey,
});

async function listVaultAssets() {
  console.log(`Vault ID: ${FIREBLOCKS_VAULT_ID}\n`);

  try {
    // Get vault account details
    const vaultAccounts = await fireblocks.vaults.getPagedVaultAccounts({
      limit: 50,
    });

    const vault = vaultAccounts.data?.accounts?.find(
      (v) => v.id === FIREBLOCKS_VAULT_ID
    );

    if (!vault) {
      console.log(`⚠️  Vault ${FIREBLOCKS_VAULT_ID} not found`);
      return;
    }

    console.log(`Vault Name: ${vault.name}`);
    console.log(`Assets in vault: ${vault.assets?.length || 0}\n`);

    if (vault.assets && vault.assets.length > 0) {
      console.log("Available Assets:");
      console.log("─".repeat(80));

      for (const asset of vault.assets) {
        const balance = parseFloat(asset.total || "0");
        const hasBalance = balance > 0;

        console.log(`\n${asset.id?.padEnd(20)} | Balance: ${asset.total || "0"}`);

        // Try to get addresses for this asset
        try {
          const addresses = await fireblocks.vaults.getVaultAccountAssetAddressesPaginated({
            vaultAccountId: FIREBLOCKS_VAULT_ID,
            assetId: asset.id,
          });

          const addressCount = addresses.data?.addresses?.length || 0;
          console.log(`${"".padEnd(20)} | Addresses: ${addressCount}`);

          if (addresses.data?.addresses && addresses.data.addresses.length > 0) {
            addresses.data.addresses.slice(0, 2).forEach((addr) => {
              console.log(`${"".padEnd(20)} |   - ${addr.address} (${addr.type})`);
            });
          }
        } catch (e) {
          console.log(`${"".padEnd(20)} | ⚠️  Cannot get addresses: ${e.message}`);
        }
      }

      console.log("\n" + "─".repeat(80));
      console.log("\n✅ Assets suitable for payments (have addresses or balance):");
      vault.assets.forEach((asset) => {
        const balance = parseFloat(asset.total || "0");
        if (balance > 0 || asset.id === "BTC" || asset.id === "ETH") {
          console.log(`   - ${asset.id}`);
        }
      });
    } else {
      console.log("⚠️  No assets found in this vault.");
      console.log("\nYou may need to:");
      console.log("1. Activate assets in the Fireblocks console");
      console.log("2. Generate addresses for supported assets");
    }
  } catch (error) {
    console.error("\n❌ Error:", error.message);
  }
}

listVaultAssets();
