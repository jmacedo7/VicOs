"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { GoogleButton } from "@/components/auth/google-button";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "");
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    const supabase = createClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      window.location.href = "/dashboard";
      return;
    }

    setMessage("Conta criada. Confira seu e-mail para confirmar o acesso.");
    setLoading(false);
  }

  return <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12"><section className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
    <Link href="/" className="text-xl font-black tracking-tight"><span className="text-blue-500">Vic</span>Os</Link>
    <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-blue-500">Primeiro acesso</p>
    <h1 className="mt-2 text-3xl font-black text-slate-950">Criar conta</h1>
    <p className="mt-2 text-sm leading-6 text-slate-500">Entre com Google ou crie seu acesso com e-mail e senha.</p>
    <div className="mt-6"><GoogleButton /></div>
    <div className="my-6 flex items-center gap-3 text-xs font-semibold text-slate-400"><div className="h-px flex-1 bg-slate-200" /><span>OU USE E-MAIL</span><div className="h-px flex-1 bg-slate-200" /></div>
    <form className="space-y-4" onSubmit={handleSubmit}>
      <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">Nome</span><input name="name" className="w-full rounded-xl border border-slate-200 px-4 py-3" placeholder="Seu nome" required /></label>
      <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">E-mail</span><input name="email" type="email" autoComplete="email" className="w-full rounded-xl border border-slate-200 px-4 py-3" placeholder="voce@empresa.com" required /></label>
      <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">Senha</span><input name="password" type="password" autoComplete="new-password" minLength={8} className="w-full rounded-xl border border-slate-200 px-4 py-3" placeholder="Crie uma senha (mín. 8 caracteres)" required /></label>
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}
      {message && <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}
      <button disabled={loading} type="submit" className="w-full rounded-xl bg-blue-500 px-4 py-3 font-bold text-white hover:bg-blue-600 disabled:opacity-60">{loading ? "Criando..." : "Continuar"}</button>
    </form>
    <p className="mt-6 text-center text-sm text-slate-500">Já tem uma conta? <Link href="/login" className="font-bold text-blue-500">Entrar</Link></p>
  </section></main>;
}
