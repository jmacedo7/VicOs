export type LocalMutationOperation = "insert" | "upsert" | "update" | "delete";

export type LocalMutation = {
  id: string;
  table: string;
  operation: LocalMutationOperation;
  payload: Record<string, unknown> | Record<string, unknown>[];
  createdAt: number;
  attempts: number;
  lastError?: string;
};

export type SyncState = "idle" | "syncing" | "offline" | "error";
