"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { clearLocalFirstData } from "@/lib/local-first/db";
import { startSyncEngine, stopSyncEngine } from "@/lib/local-first/sync-engine";
import { startRealtimeReconciler, stopRealtimeReconciler } from "@/lib/local-first/realtime-reconciler";

export function LocalFirstSyncProvider() {
  useEffect(() => {
    const supabase = createClient();
    let cleanupSync: (() => void) | null = null;
    let cleanupRealtime: (() => void) | null = null;

    const start = () => {
      cleanupSync?.();
      cleanupRealtime?.();
      cleanupSync = startSyncEngine();
      cleanupRealtime = startRealtimeReconciler();
    };

    const stopAndClear = () => {
      cleanupSync?.();
      cleanupRealtime?.();
      cleanupSync = null;
      cleanupRealtime = null;
      stopSyncEngine();
      stopRealtimeReconciler();
      void clearLocalFirstData();
    };

    const { data: authSubscription } = supabase.auth.onAuthStateChange((event) => {
      // INITIAL_SESSION means the existing browser session is still active.
      // SIGNED_IN can also mean a different account replaced the previous one,
      // so its local cache must not be trusted across identities.
      if (event === "INITIAL_SESSION") {
        void supabase.auth.getSession().then(({ data }) => {
          if (data.session) start();
        });
        return;
      }

      if (event === "SIGNED_IN") {
        // Never reuse another account's local-first data after a fresh sign-in.
        void clearLocalFirstData().finally(start);
        return;
      }

      if (event === "SIGNED_OUT") {
        stopAndClear();
      }
    });

    return () => {
      authSubscription.subscription.unsubscribe();
      cleanupSync?.();
      cleanupRealtime?.();
      cleanupSync = null;
      cleanupRealtime = null;
    };
  }, []);

  return null;
}
