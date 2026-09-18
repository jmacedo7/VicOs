"use client";

type DeviceRecord = { id: string; privateKey: CryptoKey; publicKey: JsonWebKey };

const DB_NAME = "vicos-secure-keys";
const STORE = "keys";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function dbGet<T>(key: string): Promise<T | undefined> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const request = tx.objectStore(STORE).get(key);
    request.onsuccess = () => resolve(request.result as T | undefined);
    request.onerror = () => reject(request.error);
  });
}

async function dbPut(key: string, value: unknown) {
  const db = await openDb();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

const b64 = (bytes: ArrayBuffer | Uint8Array) =>
  btoa(String.fromCharCode(...new Uint8Array(bytes instanceof ArrayBuffer ? bytes : bytes.buffer)));

const fromB64 = (value: string) =>
  Uint8Array.from(atob(value), (char) => char.charCodeAt(0));

async function importPublic(jwk: JsonWebKey) {
  return crypto.subtle.importKey("jwk", jwk, { name: "ECDH", namedCurve: "P-256" }, false, []);
}

async function deriveWrapKey(privateKey: CryptoKey, remotePublic: JsonWebKey) {
  const remote = await importPublic(remotePublic);
  return crypto.subtle.deriveKey(
    { name: "ECDH", public: remote },
    privateKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function ensureDeviceKey(
  userId: string,
  supabase: ReturnType<typeof import("@/lib/supabase/client").createClient>,
) : Promise<DeviceRecord> {
  const local = await dbGet<DeviceRecord>(`device:${userId}`);
  if (local) {
    await supabase.from("device_keys").update({ last_seen_at: new Date().toISOString() }).eq("id", local.id);
    return local;
  }

  const pair = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    false,
    ["deriveKey", "deriveBits"],
  ) as CryptoKeyPair;
  const publicKey = await crypto.subtle.exportKey("jwk", pair.publicKey);
  const { data, error } = await supabase.from("device_keys").insert({
    user_id: userId,
    public_key: JSON.stringify(publicKey),
    device_label: navigator.userAgent.includes("Mobile") ? "Celular" : "Navegador",
  }).select("id").single();
  if (error || !data) throw new Error("Não foi possível registrar este dispositivo para o chat.");

  const record = { id: data.id, privateKey: pair.privateKey, publicKey };
  await dbPut(`device:${userId}`, record);
  return record;
}

export async function createConversationKey() {
  return crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
}

export async function wrapConversationKey(
  conversationKey: CryptoKey,
  senderPrivateKey: CryptoKey,
  targetPublicKey: JsonWebKey,
) {
  const wrapKey = await deriveWrapKey(senderPrivateKey, targetPublicKey);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const raw = await crypto.subtle.exportKey("raw", conversationKey);
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, wrapKey, raw);
  return { encryptedKey: b64(encrypted), iv: b64(iv) };
}

export async function unwrapConversationKey(
  envelope: { encryptedKey: string; iv: string },
  receiverPrivateKey: CryptoKey,
  senderPublicKey: JsonWebKey,
) {
  const wrapKey = await deriveWrapKey(receiverPrivateKey, senderPublicKey);
  const raw = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: fromB64(envelope.iv) },
    wrapKey,
    fromB64(envelope.encryptedKey),
  );
  return crypto.subtle.importKey("raw", raw, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}

export async function encryptMessage(key: CryptoKey, text: string) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(text);
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoded);
  return { ciphertext: b64(ciphertext), iv: b64(iv) };
}

export async function decryptMessage(key: CryptoKey, ciphertext: string, iv: string) {
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: fromB64(iv) }, key, fromB64(ciphertext));
  return new TextDecoder().decode(plain);
}
