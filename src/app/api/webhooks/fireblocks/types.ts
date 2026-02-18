/**
 * Fireblocks Webhook Type Definitions
 * Organized types for webhook payload structures
 */

export interface WebhookSource {
  type: string;
  id?: string;
  name?: string;
  subType?: string;
}

export interface WebhookDestination {
  type: string;
  id?: string;
  name?: string;
  subType?: string;
}

export interface WebhookAmountInfo {
  amount: string;
  requestedAmount?: string;
  netAmount?: string;
  amountUSD?: string;
}

export interface WebhookFeeInfo {
  networkFee?: string;
  gasPrice?: string;
}

export interface WebhookBlockInfo {
  blockHeight?: string;
  blockHash?: string;
}

export interface WebhookTransactionData {
  id: string;
  createdAt: number;
  lastUpdated: number;
  assetId: string;
  source: WebhookSource;
  destination: WebhookDestination;
  amount: number;
  fee?: number;
  networkFee?: number;
  netAmount?: number;
  sourceAddress?: string;
  destinationAddress?: string;
  destinationAddressDescription?: string;
  destinationTag?: string;
  status: string;
  subStatus?: string;
  txHash?: string;
  operation: string;
  customerRefId?: string | null;
  externalTxId?: string | null;
  amountUSD?: number;
  numOfConfirmations?: number;
  note?: string;
  amountInfo: WebhookAmountInfo;
  feeInfo?: WebhookFeeInfo;
  blockInfo?: WebhookBlockInfo;
}

export interface WebhookPayload {
  id: string;
  resourceId: string;
  webhookId: string;
  workspaceId: string;
  eventType: string;
  createdAt: number;
  data: WebhookTransactionData;
}

/**
 * Event Types
 */
export const WEBHOOK_EVENT_TYPES = {
  TRANSACTION_CREATED: "transaction.created",
  TRANSACTION_STATUS_UPDATED: "transaction.status.updated",
} as const;

/**
 * Transaction Status Types
 */
export const TRANSACTION_STATUS = {
  COMPLETED: "COMPLETED",
  CONFIRMING: "CONFIRMING",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED",
  REJECTED: "REJECTED",
  BLOCKED: "BLOCKED",
} as const;

/**
 * Account Types
 */
export const ACCOUNT_TYPES = {
  VAULT_ACCOUNT: "VAULT_ACCOUNT",
  EXTERNAL_WALLET: "EXTERNAL_WALLET",
  INTERNAL_WALLET: "INTERNAL_WALLET",
  EXCHANGE_ACCOUNT: "EXCHANGE_ACCOUNT",
} as const;
