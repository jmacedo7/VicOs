"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { readCache, writeCache } from "./db";
import { subscribeCacheChanges } from "./cache-events";
import { queueMutation } from "./sync-engine";

type Row = Record<string, unknown>;

export function useLocalFirst<T extends Row>(table: string, cacheKey: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const hydrateFromCache = useCallback(async () => {
    const local = await readCache<T[]>(cacheKey);
    if (local) {
      setData(local);
      setLoading(false);
    }
  }, [cacheKey]);

  const refresh = useCallback(async () => {
    await hydrateFromCache();

    const supabase = createClient();
    const { data: remote, error } = await supabase.from(table).select("*");

    if (!error && remote) {
      const rows = remote as T[];
      setData(rows);
      await writeCache(cacheKey, table, rows);
    }

    setLoading(false);
  }, [cacheKey, hydrateFromCache, table]);

  useEffect(() => {
    void refresh();

    return subscribeCacheChanges(cacheKey, () => {
      void hydrateFromCache();
    });
  }, [cacheKey, hydrateFromCache, refresh]);

  const upsert = useCallback(
    async (row: T) => {
      setData((current) => {
        const id = row.id;
        if (!id) return [...current, row];

        const exists = current.some((item) => item.id === id);
        return exists
          ? current.map((item) => (item.id === id ? { ...item, ...row } : item))
          : [...current, row];
      });

      const optimistic = await readCache<T[]>(cacheKey);
      const next = optimistic ?? data;
      const id = row.id;
      const updated = id
        ? next.some((item) => item.id === id)
          ? next.map((item) => (item.id === id ? { ...item, ...row } : item))
          : [...next, row]
        : [...next, row];

      await writeCache(cacheKey, table, updated);
      await queueMutation({ table, operation: "upsert", payload: row });
    },
    [cacheKey, data, table]
  );

  const remove = useCallback(
    async (id: string) => {
      setData((current) => current.filter((item) => item.id !== id));

      const optimistic = await readCache<T[]>(cacheKey);
      await writeCache(
        cacheKey,
        table,
        (optimistic ?? data).filter((item) => item.id !== id)
      );
      await queueMutation({ table, operation: "delete", payload: { id } });
    },
    [cacheKey, data, table]
  );

  return { data, loading, refresh, upsert, remove };
}
