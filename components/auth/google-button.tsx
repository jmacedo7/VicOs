"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { SITE_URL } from "@/lib/supabase/config";

function safeNext() {
  const next = new URLSearchParams(window.location.search).get("next");
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
}

export function GoogleButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function signInWithGoogle() {
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${SITE_URL}/auth/callback?next=${encodeURIComponent(safeNext())}` },
    });
    if (error) {
      setError("Não foi possível iniciar o Google agora.");
      setLoading(false);
    }
  }

  return (
    <div>
      <button disabled={loading} onClick={signInWithGoogle} type="button" aria-label="Continuar com Google" className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60">
        <span aria-hidden="true" className="grid h-6 w-6 place-items-center rounded-full border border-slate-200 text-sm font-black">G</span>
        {loading ? "Abrindo Google..." : "Continuar com Google"}
      </button>
      {error && <p role="alert" className="mt-2 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}
