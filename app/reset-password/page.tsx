"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setMessage(""); setError("");
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirmation = String(form.get("confirmation") ?? "");
    if (password.length < 8) return setError("A senha precisa ter pelo menos 8 caracteres.");
    if (password !== confirmation) return setError("As senhas não coincidem.");
    setLoading(true);
    const { error } = await createClient().auth.updateUser({ password });
    if (error) setError("Não foi possível atualizar a senha. Solicite um novo link de recuperação.");
    else setMessage("Senha atualizada com segurança. Você já pode acessar o painel.");
    setLoading(false);
  }
  return <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12"><section className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
    <Link href="/" className="text-xl font-black tracking-tight"><span className="text-blue-500">Vic</span>Os</Link>
    <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-blue-500">Segurança</p>
    <h1 className="mt-2 text-3xl font-black text-slate-950">Nova senha</h1>
    <p className="mt-2 text-sm leading-6 text-slate-500">Defina uma nova senha. O VicOs não armazena senhas nas tabelas de negócio.</p>
    <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
      <input name="password" type="password" autoComplete="new-password" minLength={8} className="w-full rounded-xl border border-slate-200 px-4 py-3" placeholder="Nova senha (mín. 8 caracteres)" required />
      <input name="confirmation" type="password" autoComplete="new-password" minLength={8} className="w-full rounded-xl border border-slate-200 px-4 py-3" placeholder="Confirmar nova senha" required />
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}
      {message && <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}
      <button disabled={loading} type="submit" className="w-full rounded-xl bg-blue-500 px-4 py-3 font-bold text-white disabled:opacity-60">{loading ? "Atualizando..." : "Atualizar senha"}</button>
    </form>
  </section></main>;
}
