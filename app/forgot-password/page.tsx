"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: ${window.location.origin}/auth/callback?next=/reset-password });
    if (error) setError("Não foi possível enviar o e-mail de recuperação.");
    else setMessage("Se esse e-mail estiver cadastrado, você receberá as instruções de recuperação.");
    setLoading(false);
  }

  return <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12"><section className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
    <Link href="/" className="text-xl font-black tracking-tight"><span className="text-blue-500">Vic</span>Os</Link>
    <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-blue-500">Recuperação de acesso</p>
    <h1 className="mt-2 text-3xl font-black text-slate-950">Redefinir senha</h1>
    <p className="mt-2 text-sm leading-6 text-slate-500">Informe o e-mail da sua conta e enviaremos as instruções para recuperar o acesso.</p>
    <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
      <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">E-mail</span><input name="email" type="email" autoComplete="email" className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500" placeholder="voce@empresa.com" required /></label>
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}
      {message && <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}
      <button disabled={loading} type="submit" className="w-full rounded-xl bg-blue-500 px-4 py-3 font-bold text-white hover:bg-blue-600 disabled:opacity-60">{loading ? "Enviando..." : "Enviar instruções"}</button>
    </form>
    <p className="mt-6 text-center text-sm text-slate-500"><Link href="/login" className="font-bold text-blue-500">Voltar para o login</Link></p>
  </section></main>;
}
