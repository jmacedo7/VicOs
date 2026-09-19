const FALLBACK_SUPABASE_URL = "https://muzopxphnxzxszkgpxoq.supabase.co";
const FALLBACK_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_lMWr67CDqsDdcAJp3N6khw_iHt83Mvo";
export const CANONICAL_SITE_URL = "https://vicos.vercel.app";

export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_SUPABASE_URL;

export const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || FALLBACK_SUPABASE_PUBLISHABLE_KEY;

export const SITE_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : CANONICAL_SITE_URL;

export function assertSupabaseConfig() {
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    throw new Error("SUPABASE_PUBLIC_CONFIG_MISSING");
  }
}
