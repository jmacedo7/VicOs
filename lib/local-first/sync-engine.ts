import { createClient } from "@/lib/supabase/client";
import { enqueueMutation, listMutations, removeMutation, updateMutation } from "./db";
import type { LocalMutation, SyncState } from "./types";

const MAX_ATTEMPTS = 8;
const BASE_BACKOFF_MS = 2_000;
const MAX_BACKOFF_MS = 5 * 60_000;

let running = false;
let cleanupEngine: (() => void) | null = null;
let listeners = new Set<(state: SyncState) => void>();

function emit(state: SyncState) {
  listeners.forEach((listener) => listener(state));
}

function getBackoffMs(attempts: number) {
  const exponential = Math.min(MAX_BACKOFF_MS, BASE_BACKOFF_MS * 2 ** Math.max(0, attempts - 1));
  const jitter = Math.floor(Math.random() * 500);
  return exponential + jitter;
}

function isConflictError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const code = "code" in error ? String(error.code ?? "") : "";
  const status = "status" in error ? Number(error.status ?? 0) : 0;
  return code === "23505" || code === "23503" || code === "409" || status === 409 || status === 412;
}

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object" && "message" in error) return String(error.message);
  return "Unknown sync error";
}

async function applyMutation(mutation: LocalMutation) {
  const supabase = createClient();
  const rows = Array.isArray(mutation.payload) ? mutation.payload : [mutation.payload];

  if (mutation.operation === "delete") {
    const ids = rows.map((row) => row.id).filter((id): id is string => typeof id === "string");
    if (!ids.length) throw new Error("A queued delete requires an id");

    const { error } = await supabase.from(mutation.table).delete().in("id", ids);
    if (error) throw error;
    return;
  }

  if (mutation.operation === "insert") {
    const { error } = await supabase.from(mutation.table).insert(rows);
    if (error) throw error;
    return;
  }

  const { error } = await supabase.from(mutation.table).upsert(rows);
  if (error) throw error;
}

export function subscribeSyncState(listener: (state: SyncState) => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export async function syncPendingMutations(): Promise<void> {
  if (typeof window === "undefined") return;

  if (!navigator.onLine) {
    emit("offline");
    return;
  }

  if (running) return;

  running = true;
  emit("syncing");

  try {
    const now = Date.now();
    const mutations = (await listMutations())
      .filter((mutation) => mutation.status !== "conflict")
      .filter((mutation) => mutation.attempts < MAX_ATTEMPTS)
      .filter((mutation) => mutation.nextAttemptAt <= now);

    for (const mutation of mutations) {
      if (!navigator.onLine) {
        emit("offline");
        break;
      }

      const syncing: LocalMutation = {
        ...mutation,
        status: "syncing",
        lastAttemptAt: Date.now(),
      };
      await updateMutation(syncing);

      try {
        await applyMutation(syncing);
        await removeMutation(syncing.id);
      } catch (error) {
        const attempts = syncing.attempts + 1;
        const message = errorMessage(error);

        if (isConflictError(error)) {
          await updateMutation({
            ...syncing,
            status: "conflict",
            attempts,
            lastError: message,
            conflictReason: "The server rejected this mutation as a data or uniqueness conflict.",
          });
          continue;
        }

        const failed = attempts >= MAX_ATTEMPTS;
        await updateMutation({
          ...syncing,
          status: failed ? "failed" : "pending",
          attempts,
          lastError: message,
          nextAttemptAt: failed ? Number.MAX_SAFE_INTEGER : Date.now() + getBackoffMs(attempts),
        });
      }
    }

    const remaining = await listMutations();
    if (remaining.some((mutation) => mutation.status === "pending" || mutation.status === "syncing")) {
      emit("error");
    } else {
      emit("idle");
    }
  } catch {
    emit("error");
  } finally {
    running = false;
  }
}

export function startSyncEngine() {
  if (typeof window === "undefined") return () => undefined;
  if (cleanupEngine) return cleanupEngine;

  const run = () => void syncPendingMutations();
  const onOnline = () => run();
  const interval = window.setInterval(run, 15_000);

  window.addEventListener("online", onOnline);
  run();

  cleanupEngine = () => {
    window.removeEventListener("online", onOnline);
    window.clearInterval(interval);
    cleanupEngine = null;
  };

  return cleanupEngine;
}

export function stopSyncEngine() {
  cleanupEngine?.();
}

export async function queueMutation(
  mutation: Omit<LocalMutation, "id" | "createdAt" | "attempts" | "status" | "nextAttemptAt">
): Promise<void> {
  await enqueueMutation({
    ...mutation,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    attempts: 0,
    status: "pending",
    nextAttemptAt: Date.now(),
  });

  void syncPendingMutations();
}
