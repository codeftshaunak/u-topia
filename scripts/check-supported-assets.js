#!/usr/bin/env node

/**
 * Check supported blockchain assets in Fireblocks
 */

import { Fireblocks, BasePath } from "@fireblocks/ts-sdk";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

// Read .env.local
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

const keyPath = resolve(process.cwd(), FIREBLOCKS_SECRET_KEY_PATH);
const secretKey = readFileSync(keyPath, "utf8");

const fireblocks = new Fireblocks({
  apiKey: FIREBLOCKS_API_KEY,
  basePath: BasePath.Sandbox,
  secretKey: secretKey,
});

async function checkAssets() {
  console.log("=== Checking Fireblocks Supported Assets ===\n");

  // Assets we want to support
  const desiredAssets = [
    "BTC",
    "ETH",
    "USDT",
    "USDT_ERC20",
    "USDT_TRC20",
    "USDC",
    "USDC_ERC20",
    "SOL",
    "SOL_TEST",
  ];

  console.log("Checking desired payment assets:\n");

  for (const assetId of desiredAssets) {
    try {
      const assets = await fireblocks.blockchainsAssets.getSupportedAssets();
      const asset = assets.data?.find((a) => a.id === assetId);

      if (asset) {
        console.log(`✅ ${assetId.padEnd(20)} - ${asset.name} (${asset.type})`);
      } else {
        console.log(`❌ ${assetId.padEnd(20)} - Not found`);
      }
    } catch (error) {
      console.log(`❌ ${assetId.padEnd(20)} - Error: ${error.message}`);
    }
  }

  console.log("\n" + "=".repeat(70));
  console.log("\n🔍 Searching for stablecoin options...\n");

  try {
    const allAssets = await fireblocks.blockchainsAssets.getSupportedAssets();

    // Find USDT variants
    const usdtAssets = allAssets.data?.filter((a) => a.id?.includes("USDT"));
    console.log("USDT options:");
    usdtAssets?.slice(0, 10).forEach((a) => {
      console.log(`   ${a.id?.padEnd(30)} - ${a.name}`);
    });

    // Find USDC variants
    const usdcAssets = allAssets.data?.filter((a) => a.id?.includes("USDC"));
    console.log("\nUSDC options:");
    usdcAssets?.slice(0, 10).forEach((a) => {
      console.log(`   ${a.id?.padEnd(30)} - ${a.name}`);
    });

    // Find SOL
    const solAssets = allAssets.data?.filter((a) => a.id?.includes("SOL"));
    console.log("\nSOL options:");
    solAssets?.forEach((a) => {
      console.log(`   ${a.id?.padEnd(30)} - ${a.name}`);
    });
  } catch (error) {
    console.error("Error fetching assets:", error.message);
  }
}

checkAssets();
