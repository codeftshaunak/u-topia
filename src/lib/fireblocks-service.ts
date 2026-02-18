
import { getFireblocksClient } from "./fireblocks";

// --- Types ---

export interface FireblocksError {
  response?: {
    data?: { message?: string; code?: number; status?: number };
    statusCode?: number;
  };
  message?: string;
}

export interface VaultCreateParams {
  name: string;
  customerRefId: string;
  hiddenOnUI?: boolean;
  autoFuel?: boolean;
}

export interface DepositAddress {
  assetId: string;
  address: string;
  tag?: string;
  legacyAddress?: string;
}

export interface AssetActivationResult {
  asset: string;
  status: 'success' | 'failed';
  /** Deposit address returned by Fireblocks at activation time (only present on first activation). */
  address?: string;
  tag?: string;
  legacyAddress?: string;
  error?: string;
}

// --- Vault Operations ---

export async function createVault(params: VaultCreateParams): Promise<string> {
  const fireblocks = getFireblocksClient();

  const vault = await fireblocks.vaults.createVaultAccount({
    createVaultAccountRequest: {
      name: params.name,
      hiddenOnUI: params.hiddenOnUI ?? false,
      customerRefId: params.customerRefId,
      autoFuel: params.autoFuel ?? false,
    },
  });

  const vaultId = vault.data?.id;
  if (!vaultId) {
    throw new Error("Failed to create Fireblocks vault: no vault ID returned");
  }

  console.log(`Created Fireblocks vault: ${vaultId} (${params.name})`);
  return vaultId;
}


export async function getVault(vaultId: string) {
  const fireblocks = getFireblocksClient();
  return await fireblocks.vaults.getVaultAccount({ vaultAccountId: vaultId });
}


export async function vaultExists(vaultId: string): Promise<boolean> {
  try {
    await getVault(vaultId);
    return true;
  } catch (err: unknown) {
    const fbErr = err as FireblocksError;
    const msg = fbErr.response?.data?.message || fbErr.message || String(err);

    // If it's a "not found" error, return false
    if (msg.includes("not found") || msg.includes("does not exist") || fbErr.response?.statusCode === 404) {
      return false;
    }

    // Re-throw other errors
    throw err;
  }
}

// --- Asset Operations ---

/**
 * Activate an asset wallet in a Fireblocks vault.
 *
 * IMPORTANT: The deposit address is ONLY returned by Fireblocks in this
 * activation response. On EVM chains (ETH, USDT, etc.) it cannot be
 * retrieved any other way after the fact — so we must capture it here.
 *
 * Returns: { activated: boolean, address?, tag?, legacyAddress? }
 */
export async function activateAssetInVault(
  vaultId: string,
  assetId: string
): Promise<{ activated: boolean; address?: string; tag?: string; legacyAddress?: string }> {
  const fireblocks = getFireblocksClient();

  try {
    const resp = await fireblocks.vaults.createVaultAccountAsset({
      vaultAccountId: vaultId,
      assetId: assetId,
    });
    const address = resp.data?.address || undefined;
    console.log(`  ✅ Activated ${assetId} in vault ${vaultId}${address ? ` — address: ${address}` : ''}`);
    return {
      activated: true,
      address,
      tag: resp.data?.tag || undefined,
      legacyAddress: resp.data?.legacyAddress || undefined,
    };
  } catch (err: unknown) {
    const fbErr = err as FireblocksError;
    const msg = fbErr.response?.data?.message || fbErr.message || String(err);

    // "Already exists" — wallet was activated before; address must be read separately
    if (msg.includes('already exists') || msg.includes('Asset already created')) {
      console.log(`  ℹ️  ${assetId} already activated in vault ${vaultId}`);
      return { activated: true };
    }

    console.warn(`  ⚠️  Failed to activate ${assetId} in vault ${vaultId}: ${msg}`);
    return { activated: false };
  }
}


export async function activateVaultAssets(
  vaultId: string,
  assetIds: string[]
): Promise<AssetActivationResult[]> {
  const results: AssetActivationResult[] = [];

  console.log(`Activating ${assetIds.length} assets in vault ${vaultId}...`);

  for (const assetId of assetIds) {
    const result = await activateAssetInVault(vaultId, assetId);
    results.push({
      asset: assetId,
      status: result.activated ? 'success' : 'failed',
      address: result.address,
      tag: result.tag,
      legacyAddress: result.legacyAddress,
    });
  }

  const successful = results.filter(r => r.status === 'success').length;
  const failed = results.filter(r => r.status === 'failed').length;

  console.log(`Asset activation complete: ${successful} succeeded, ${failed} failed`);

  // If all assets failed, throw an error
  if (successful === 0 && failed > 0) {
    throw new Error(`Failed to activate any assets in vault ${vaultId}`);
  }

  return results;
}

// --- Utility Functions ---

export function extractErrorMessage(err: unknown): string {
  const fbErr = err as FireblocksError;
  return fbErr.response?.data?.message || fbErr.message || String(err);
}

export function isPermissionError(err: unknown): boolean {
  const msg = extractErrorMessage(err);
  return msg.includes("Unauthorized") ||
         msg.includes("Forbidden") ||
         msg.includes("Permission denied");
}

// --- Address Operations ---

/**
 * Get the deposit address for a vault asset.
 *
 * Strategy:
 * 1. Call createVaultAccountAsset (activation).
 *    - On FIRST activation → Fireblocks returns the address directly in the
 *      response. This is the ONLY reliable way to get the address for EVM
 *      chains (ETH, USDT, etc.) on Fireblocks sandbox.
 *    - On subsequent calls → "already exists" error; fall through to step 2.
 * 2. Read from getVaultAccountAssetAddressesPaginated (with retry/backoff)
 *    for assets that were activated previously.
 */
export async function generateDepositAddress(
  vaultId: string,
  assetId: string,
  maxRetries = 5,
  delayMs = 2000
): Promise<DepositAddress> {
  const fireblocks = getFireblocksClient();

  // Step 1: activate — may return address directly on first activation
  const activation = await activateAssetInVault(vaultId, assetId);
  if (activation.address) {
    console.log(`Deposit address for ${assetId} in vault ${vaultId} (from activation): ${activation.address}`);
    return {
      assetId,
      address: activation.address,
      tag: activation.tag,
      legacyAddress: activation.legacyAddress,
    };
  }

  // Step 2: asset was already active — fetch existing address with retry/backoff
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const resp = await fireblocks.vaults.getVaultAccountAssetAddressesPaginated({
        vaultAccountId: vaultId,
        assetId: assetId,
      });

      const addr = resp.data?.addresses?.[0];
      if (addr?.address) {
        console.log(`Deposit address for ${assetId} in vault ${vaultId}: ${addr.address} (attempt ${attempt})`);
        return {
          assetId,
          address: addr.address,
          tag: addr.tag,
          legacyAddress: addr.legacyAddress,
        };
      }

      console.log(`No address yet for ${assetId} in vault ${vaultId} (attempt ${attempt}/${maxRetries}), retrying in ${delayMs}ms...`);
    } catch (err: unknown) {
      console.warn(`Error fetching address for ${assetId} (attempt ${attempt}): ${extractErrorMessage(err)}`);
    }

    if (attempt < maxRetries) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      delayMs = Math.min(delayMs * 1.5, 8000);
    }
  }

  throw new Error(
    `No deposit address found for ${assetId} in vault ${vaultId}. ` +
    `The vault may be in a broken state (assets activated without addresses). ` +
    `Clear the user's fireblocksVaultId in the database to force a new vault.`
  );
}


export async function getAssetAddresses(
  vaultId: string,
  assetId: string
): Promise<DepositAddress[]> {
  const fireblocks = getFireblocksClient();

  const response = await fireblocks.vaults.getVaultAccountAssetAddressesPaginated({
    vaultAccountId: vaultId,
    assetId: assetId,
  });

  return (response.data?.addresses || []).map(addr => ({
    assetId,
    address: addr.address || "",
    tag: addr.tag,
    legacyAddress: addr.legacyAddress,
  }));
}


