
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

export async function activateAssetInVault(vaultId: string, assetId: string): Promise<boolean> {
  const fireblocks = getFireblocksClient();

  try {
    await fireblocks.vaults.createVaultAccountAsset({
      vaultAccountId: vaultId,
      assetId: assetId,
    });
    console.log(`  ✅ Activated ${assetId} in vault ${vaultId}`);
    return true;
  } catch (err: unknown) {
    const fbErr = err as FireblocksError;
    const msg = fbErr.response?.data?.message || fbErr.message || String(err);

    // Ignore "already exists" errors
    if (msg.includes('already exists') || msg.includes('Asset already created')) {
      console.log(`  ℹ️  ${assetId} already activated in vault ${vaultId}`);
      return true;
    }

    console.warn(`  ⚠️  Failed to activate ${assetId} in vault ${vaultId}: ${msg}`);
    return false;
  }
}


export async function activateVaultAssets(
  vaultId: string,
  assetIds: string[]
): Promise<AssetActivationResult[]> {
  const results: AssetActivationResult[] = [];

  console.log(`Activating ${assetIds.length} assets in vault ${vaultId}...`);

  for (const assetId of assetIds) {
    const success = await activateAssetInVault(vaultId, assetId);
    results.push({
      asset: assetId,
      status: success ? 'success' : 'failed',
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

// --- Address Operations ---

export async function generateDepositAddress(
  vaultId: string,
  assetId: string
): Promise<DepositAddress> {
  const fireblocks = getFireblocksClient();

  // Ensure asset wallet exists in vault
  await activateAssetInVault(vaultId, assetId);

  // Try to create a new deposit address (works for UTXO chains)
  try {
    const newAddr = await fireblocks.vaults.createVaultAccountAssetAddress({
      vaultAccountId: vaultId,
      assetId: assetId,
    });

    if (newAddr.data?.address) {
      console.log(`Generated new deposit address for ${assetId} in vault ${vaultId}`);
      return {
        assetId,
        address: newAddr.data.address,
        tag: newAddr.data.tag,
        legacyAddress: newAddr.data.legacyAddress,
      };
    }
  } catch (err: unknown) {
    // For EVM chains that don't support multiple addresses, fall back to existing
    const fbErr = err as FireblocksError;
    const msg = fbErr.response?.data?.message || fbErr.message || String(err);
    console.log(`New address creation not supported for ${assetId}, using existing address: ${msg}`);
  }

  // Fallback: get existing addresses
  const addresses = await fireblocks.vaults.getVaultAccountAssetAddressesPaginated({
    vaultAccountId: vaultId,
    assetId: assetId,
  });

  if (addresses.data?.addresses?.length) {
    const addr = addresses.data.addresses[0];
    console.log(`Using existing deposit address for ${assetId} in vault ${vaultId}`);
    return {
      assetId,
      address: addr.address || "",
      tag: addr.tag,
      legacyAddress: addr.legacyAddress,
    };
  }

  throw new Error(`Cannot generate deposit address for ${assetId} in vault ${vaultId}`);
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
