
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
 * Generate a fresh unique deposit address for a vault asset.
 *
 * Since only BTC (UTXO) is supported, every call creates a brand-new address
 * via createVaultAccountAssetAddress — each payment session gets its own
 * unique address, making it unambiguous which package a payment belongs to.
 *
 * Flow:
 * 1. Activate the asset (idempotent). On first activation the address is
 *    returned directly in the response — use it immediately.
 * 2. For subsequent calls (asset already active), call
 *    createVaultAccountAssetAddress to get a fresh unique address.
 */
export async function generateDepositAddress(
  vaultId: string,
  assetId: string
): Promise<DepositAddress> {
  const fireblocks = getFireblocksClient();

  // Step 1: activate — returns address on first activation
  const activation = await activateAssetInVault(vaultId, assetId);
  if (activation.address) {
    console.log(`New deposit address for ${assetId} in vault ${vaultId} (from activation): ${activation.address}`);
    return {
      assetId,
      address: activation.address,
      tag: activation.tag || undefined,
      legacyAddress: activation.legacyAddress || undefined,
    };
  }

  // Step 2: asset already active — create a new unique address (UTXO only)
  try {
    const resp = await fireblocks.vaults.createVaultAccountAssetAddress({
      vaultAccountId: vaultId,
      assetId: assetId,
    });
    const address = resp.data?.address;
    if (address) {
      console.log(`New deposit address for ${assetId} in vault ${vaultId}: ${address}`);
      return {
        assetId,
        address,
        tag: resp.data?.tag || undefined,
        legacyAddress: resp.data?.legacyAddress || undefined,
      };
    }
  } catch (err: unknown) {
    throw new Error(
      `Failed to create deposit address for ${assetId} in vault ${vaultId}: ${extractErrorMessage(err)}`
    );
  }

  throw new Error(`No address returned for ${assetId} in vault ${vaultId}.`);
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


