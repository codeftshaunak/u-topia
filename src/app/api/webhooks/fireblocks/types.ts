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
 * Source: https://support.fireblocks.io/hc/en-us/articles/5536566813468-Primary-transaction-statuses
 */
export const TRANSACTION_STATUS = {
  /** Outgoing tx submitted to Fireblocks; first stage when AML is not enabled */
  SUBMITTED: "SUBMITTED",
  /** Waiting on AML/Travel Rule screening result */
  PENDING_AML_SCREENING: "PENDING_AML_SCREENING",
  /** Waiting on Fireblocks internal security enrichment */
  PENDING_ENRICHMENT: "PENDING_ENRICHMENT",
  /** Waiting for Console/API user authorization per Policy */
  PENDING_AUTHORIZATION: "PENDING_AUTHORIZATION",
  /** Queued for processing; Fireblocks handles one tx per chain per vault at a time */
  QUEUED: "QUEUED",
  /** Waiting for designated signer to sign */
  PENDING_SIGNATURE: "PENDING_SIGNATURE",
  /** Waiting for manual 3rd-party (e.g. exchange) email approval */
  PENDING_3RD_PARTY_MANUAL_APPROVAL: "PENDING_3RD_PARTY_MANUAL_APPROVAL",
  /** Waiting for 3rd-party service (e.g. exchange) to process */
  PENDING_3RD_PARTY: "PENDING_3RD_PARTY",
  /** Being broadcast to the blockchain network */
  BROADCASTING: "BROADCASTING",
  /** Broadcast to blockchain; waiting for confirmations */
  CONFIRMING: "CONFIRMING",
  /** Successfully completed and on-chain — FINAL SUCCESS */
  COMPLETED: "COMPLETED",
  /** Signed but not broadcast (Solana sign-only) */
  SIGNED: "SIGNED",
  /** Cancellation in progress */
  CANCELLING: "CANCELLING",
  /** Cancelled by user/approver/signer — FINAL FAILURE */
  CANCELLED: "CANCELLED",
  /** Blocked by a Policy Engine rule — FINAL FAILURE */
  BLOCKED: "BLOCKED",
  /** Rejected by Fireblocks, approver, signer, or 3rd-party — FINAL FAILURE */
  REJECTED: "REJECTED",
  /** No longer processing; no assets transferred — FINAL FAILURE */
  FAILED: "FAILED",
} as const;

export type FireblocksTransactionStatus = typeof TRANSACTION_STATUS[keyof typeof TRANSACTION_STATUS];

/** Statuses that are terminal (no further updates expected) */
export const TERMINAL_STATUSES: FireblocksTransactionStatus[] = [
  TRANSACTION_STATUS.COMPLETED,
  TRANSACTION_STATUS.CANCELLED,
  TRANSACTION_STATUS.BLOCKED,
  TRANSACTION_STATUS.REJECTED,
  TRANSACTION_STATUS.FAILED,
];

/** Statuses indicating a successful outcome */
export const SUCCESS_STATUSES: FireblocksTransactionStatus[] = [
  TRANSACTION_STATUS.COMPLETED,
];

/** Statuses indicating a failure outcome */
export const FAILURE_STATUSES: FireblocksTransactionStatus[] = [
  TRANSACTION_STATUS.CANCELLED,
  TRANSACTION_STATUS.BLOCKED,
  TRANSACTION_STATUS.REJECTED,
  TRANSACTION_STATUS.FAILED,
];

/**
 * Account Types
 */
export const ACCOUNT_TYPES = {
  VAULT_ACCOUNT: "VAULT_ACCOUNT",
  EXTERNAL_WALLET: "EXTERNAL_WALLET",
  INTERNAL_WALLET: "INTERNAL_WALLET",
  EXCHANGE_ACCOUNT: "EXCHANGE_ACCOUNT",
} as const;
