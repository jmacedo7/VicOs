import { createClient } from "@/lib/supabase/client";
import { listCachesByTable, listMutations, writeCache } from "./db";
import type { LocalMutation } from "./types";

type RealtimeEventType = "INSERT" | "UPDATE" | "DELETE";

type RealtimePayload = {
  eventType: RealtimeEventType;
  table: string;
  new: Record<string, unknown>;
  old: Record<string, unknown>;
};

type CacheRow = Record<string, unknown>;

const REALTIME_TABLES = [
  "companies",
  "contacts",
  "tags",
  "contact_tags",
  "accounts",
  "account_contacts",
  "incomes",
  "expenses",
  "documents",
  "document_versions",
  "tasks",
] as const;

let cleanupReconciler: (() => void) | null = null;
let handlingEvents = 0;

function recordIdentity(table: string, row: CacheRow) {
  if (table === "contact_tags") {
    const contactId = typeof row.contact_id === "string" ? row.contact_id : "";
    const tagId = typeof row.tag_id === "string" ? row.tag_id : "";
    return contactId && tagId ? `${contactId}:${tagId}` : null;
  }

  if (table === "account_contacts") {
    const accountId = typeof row.account_id === "string" ? row.account_id : "";
    const contactId = typeof row.contact_id === "string" ? row.contact_id : "";
    return accountId && contactId ? `${accountId}:${contactId}` : null;
  }

  return typeof row.id === "string" ? row.id : null;
}

function timestampOf(row: CacheRow) {
  const value =
    (typeof row.updated_at === "string" && row.updated_at) ||
    (typeof row.created_at === "string" && row.created_at);

  if (!value) return null;

  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : null;
}

function remoteIsStale(remote: CacheRow, local: CacheRow) {
  const remoteTimestamp = timestampOf(remote);
  const localTimestamp = timestampOf(local);

  return remoteTimestamp !== null && localTimestamp !== null && remoteTimestamp < localTimestamp;
}

function mutationTouchesRecord(mutation: LocalMutation, table: string, identity: string) {
  if (mutation.table !== table) return false;
  if (mutation.status !== "pending" && mutation.status !== "syncing" && mutation.status !== "failed" && mutation.status !== "conflict") {
    return false;
  }

  const payloadRows = Array.isArray(mutation.payload) ? mutation.payload : [mutation.payload];
  return payloadRows.some((row) => {
    const candidate = recordIdentity(table, row);
    return candidate === identity;
  });
}

async function hasPendingLocalMutation(table: string, row: CacheRow) {
  const identity = recordIdentity(table, row);
  if (!identity) return false;

  const mutations = await listMutations();
  return mutations.some((mutation) => mutationTouchesRecord(mutation, table, identity));
}

function reconcileArray(table: string, current: CacheRow[], eventType: RealtimeEventType, remote: CacheRow) {
  const identity = recordIdentity(table, remote);
  if (!identity) return current;

  const existingIndex = current.findIndex((row) => recordIdentity(table, row) === identity);

  if (eventType === "DELETE") {
    return existingIndex === -1 ? current : current.filter((_, index) => index !== existingIndex);
  }

  if (existingIndex === -1) {
    return [...current, remote];
  }

  const existing = current[existingIndex];
  if (remoteIsStale(remote, existing)) {
    return current;
  }

  if (table === "documents" && remote.archived_at) {
    return current.filter((_, index) => index !== existingIndex);
  }

  const next = [...current];
  next[existingIndex] = { ...existing, ...remote };
  return next;
}

function reconcileValue(
  table: string,
  value: unknown,
  eventType: RealtimeEventType,
  remote: CacheRow
) {
  if (Array.isArray(value)) {
    return reconcileArray(table, value as CacheRow[], eventType, remote);
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  const current = value as CacheRow;
  const identity = recordIdentity(table, remote);
  if (!identity || recordIdentity(table, current) !== identity) {
    return value;
  }

  if (eventType === "DELETE") {
    return null;
  }

  if (remoteIsStale(remote, current)) {
    return value;
  }

  return { ...current, ...remote };
}

async function reconcilePayload(payload: RealtimePayload) {
  if (!REALTIME_TABLES.includes(payload.table as (typeof REALTIME_TABLES)[number])) return;

  const remote = payload.eventType === "DELETE" ? payload.old : payload.new;
  if (!remote || typeof remote !== "object") return;
  if (!recordIdentity(payload.table, remote)) return;

  if (await hasPendingLocalMutation(payload.table, remote)) {
    return;
  }

  const caches = await listCachesByTable(payload.table);
  for (const cache of caches) {
    const next = reconcileValue(payload.table, cache.value, payload.eventType, remote);

    if (next === cache.value) continue;
    await writeCache(cache.key, cache.table, next);
  }
}

export function startRealtimeReconciler() {
  if (typeof window === "undefined") return () => undefined;
  if (cleanupReconciler) return cleanupReconciler;

  const supabase = createClient();
  const channel = supabase.channel("local-first-reconciler");

  for (const table of REALTIME_TABLES) {
    channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table,
      },
      (payload) => {
        handlingEvents += 1;
        void reconcilePayload(payload as RealtimePayload).finally(() => {
          handlingEvents = Math.max(0, handlingEvents - 1);
        });
      }
    );
  }

  channel.subscribe();

  cleanupReconciler = () => {
    void supabase.removeChannel(channel);
    cleanupReconciler = null;
    handlingEvents = 0;
  };

  return cleanupReconciler;
}

export function stopRealtimeReconciler() {
  cleanupReconciler?.();
}

export function isRealtimeReconcilerBusy() {
  return handlingEvents > 0;
}
