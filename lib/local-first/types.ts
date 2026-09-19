export type LocalMutationOperation = "insert" | "upsert" | "update" | "delete";

export type LocalMutationStatus = "pending" | "syncing" | "failed" | "conflict";

export type LocalMutation = {
  id: string;
  table: string;
  operation: LocalMutationOperation;
  payload: Record<string, unknown> | Record<string, unknown>[];
  createdAt: number;
  attempts: number;
  status: LocalMutationStatus;
  nextAttemptAt: number;
  lastAttemptAt?: number;
  lastError?: string;
  conflictReason?: string;
};

export type SyncState = "idle" | "syncing" | "offline" | "error";
