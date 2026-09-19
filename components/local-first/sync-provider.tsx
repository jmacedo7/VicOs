"use client";

import { useEffect } from "react";
import { startSyncEngine } from "@/lib/local-first/sync-engine";

export function LocalFirstSyncProvider() {
  useEffect(() => startSyncEngine(), []);
  return null;
}
