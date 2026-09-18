"use client";

import { createClient } from "@/lib/supabase/client";

export function GoogleButton() {
  async function signInWithGoogle() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/dashboard` },
    });
  }

  return (
    <button onClick={signInWithGoogle} type="button" aria-label="Continuar com Google" className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">
      <span aria-hidden="true" className="grid h-6 w-6 place-items-center rounded-full border border-slate-200 text-sm font-black">G</span>
      Continuar com Google
    </button>
  );
}
