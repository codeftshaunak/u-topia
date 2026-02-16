/**
 * Fireblocks Client Configuration
 *
 * This module initializes and exports the Fireblocks SDK client.
 * It handles authentication using API key and secret key from environment variables.
 */

import { Fireblocks, BasePath } from "@fireblocks/ts-sdk";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

// Environment variables
const FIREBLOCKS_API_KEY = process.env.FIREBLOCKS_API_KEY;
const FIREBLOCKS_SECRET_KEY = process.env.FIREBLOCKS_SECRET_KEY;
const FIREBLOCKS_SECRET_KEY_PATH = process.env.FIREBLOCKS_SECRET_KEY_PATH;
const FIREBLOCKS_BASE_PATH = process.env.FIREBLOCKS_BASE_PATH || "sandbox";
const FIREBLOCKS_VAULT_ID = process.env.FIREBLOCKS_VAULT_ID;

// Determine the base path (sandbox or production)
function getBasePath(): string {
  switch (FIREBLOCKS_BASE_PATH.toLowerCase()) {
    case "production":
    case "prod":
      return BasePath.US;
    case "eu":
      return BasePath.EU;
    case "eu2":
      return BasePath.EU2;
    case "sandbox":
    default:
      return BasePath.Sandbox;
  }
}

// Get secret key from environment or file
function getSecretKey(): string | undefined {
  // First try direct environment variable
  if (FIREBLOCKS_SECRET_KEY) {
    console.log("Using FIREBLOCKS_SECRET_KEY from environment");
    return FIREBLOCKS_SECRET_KEY;
  }

  // Then try reading from file path
  if (FIREBLOCKS_SECRET_KEY_PATH) {
    // Resolve path relative to project root (where package.json is)
    const absolutePath = resolve(process.cwd(), FIREBLOCKS_SECRET_KEY_PATH);
    console.log("Attempting to read Fireblocks key from:", absolutePath);

    if (existsSync(absolutePath)) {
      try {
        const key = readFileSync(absolutePath, "utf8");
        console.log("Successfully loaded Fireblocks secret key from file");
        return key;
      } catch (error) {
        console.error("Failed to read Fireblocks secret key from file:", error);
      }
    } else {
      console.error("Fireblocks secret key file not found at:", absolutePath);
    }
  }

  return undefined;
}

// Singleton instance
let fireblocksInstance: Fireblocks | null = null;

/**
 * Get the Fireblocks client instance
 * Uses singleton pattern to reuse the same client across requests
 */
export function getFireblocksClient(): Fireblocks {
  if (fireblocksInstance) {
    return fireblocksInstance;
  }

  console.log("Initializing Fireblocks client...");
  console.log("API Key (first 10 chars):", FIREBLOCKS_API_KEY?.substring(0, 10));

  if (!FIREBLOCKS_API_KEY) {
    throw new Error("FIREBLOCKS_API_KEY is not configured in environment variables");
  }

  const secretKey = getSecretKey();
  if (!secretKey) {
    throw new Error(
      "Fireblocks secret key not found. Set either FIREBLOCKS_SECRET_KEY or FIREBLOCKS_SECRET_KEY_PATH"
    );
  }

  console.log("Secret key loaded, length:", secretKey.length);

  const basePath = getBasePath();
  console.log("Fireblocks base path:", basePath);

  try {
    console.log("Creating Fireblocks instance...");
    fireblocksInstance = new Fireblocks({
      apiKey: FIREBLOCKS_API_KEY,
      basePath: basePath,
      secretKey: secretKey,
    });

    console.log("Fireblocks instance created");
    console.log("Instance type:", typeof fireblocksInstance);
    console.log("Instance keys:", Object.keys(fireblocksInstance).slice(0, 10));
    console.log("Has vaults property:", 'vaults' in fireblocksInstance);
    console.log("Has supportedAssets property:", 'supportedAssets' in fireblocksInstance);

    console.log("Fireblocks client initialized successfully");
  } catch (error) {
    console.error("Failed to initialize Fireblocks client:", error);
    throw error;
  }

  return fireblocksInstance;
}

/**
 * Check if Fireblocks is properly configured
 */
export function isFireblocksConfigured(): boolean {
  return !!(FIREBLOCKS_API_KEY && (FIREBLOCKS_SECRET_KEY || FIREBLOCKS_SECRET_KEY_PATH) && FIREBLOCKS_VAULT_ID);
}

/**
 * Get the configured Fireblocks vault ID
 */
export function getFireblocksVaultId(): string {
  if (!FIREBLOCKS_VAULT_ID) {
    throw new Error("FIREBLOCKS_VAULT_ID is not configured in environment variables");
  }
  return FIREBLOCKS_VAULT_ID;
}

// Export types for external use
export { Fireblocks, BasePath };
