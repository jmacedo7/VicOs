import { createClient } from "@/lib/supabase/client";
import { enqueueMutation, listMutations, removeMutation, updateMutation } from "./db";
import type { LocalMutation, SyncState } from "./types";

let running = false;
let cleanupEngine: (() => void) | null = null;
let listeners = new Set<(state: SyncState) => void>();

function emit(state: SyncState) {
  listeners.forEach((listener) => listener(state));
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
  if (typeof window === "undefined" || !navigator.onLine || running) {
    if (typeof window !== "undefined" && !navigator.onLine) emit("offline");
    return;
  }

  running = true;
  emit("syncing");

  try {
    const mutations = await listMutations();

    for (const mutation of mutations.sort((a, b) => a.createdAt - b.createdAt)) {
      try {
        await applyMutation(mutation);
        await removeMutation(mutation.id);
      } catch (error) {
        const next: LocalMutation = {
          ...mutation,
          attempts: mutation.attempts + 1,
          lastError: error instanceof Error ? error.message : "Unknown sync error",
        };
        await updateMutation(next);
      }
    }

    emit("idle");
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
  mutation: Omit<LocalMutation, "id" | "createdAt" | "attempts">
): Promise<void> {
  await enqueueMutation({
    ...mutation,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    attempts: 0,
  });

  void syncPendingMutations();
}
