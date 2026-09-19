type CacheListener = () => void;

const listeners = new Map<string, Set<CacheListener>>();
let broadcastChannel: BroadcastChannel | null = null;
let broadcastInitialized = false;

function getBroadcastChannel() {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") {
    return null;
  }

  if (!broadcastInitialized) {
    broadcastInitialized = true;
    broadcastChannel = new BroadcastChannel("vicos-local-cache");
    broadcastChannel.addEventListener("message", (event) => {
      const key = event.data?.key;
      if (typeof key !== "string") return;

      listeners.get(key)?.forEach((listener) => listener());
    });
  }

  return broadcastChannel;
}

export function subscribeCacheChanges(key: string, listener: CacheListener) {
  const current = listeners.get(key) ?? new Set<CacheListener>();
  current.add(listener);
  listeners.set(key, current);

  getBroadcastChannel();

  return () => {
    const bucket = listeners.get(key);
    if (!bucket) return;

    bucket.delete(listener);
    if (!bucket.size) listeners.delete(key);
  };
}

export function notifyCacheChange(key: string) {
  listeners.get(key)?.forEach((listener) => listener());
  getBroadcastChannel()?.postMessage({ key });
}
