"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { GoogleButton } from "@/components/auth/google-button";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("E-mail ou senha inválidos. Confira os dados e tente novamente.");
      setLoading(false);
      return;
    }
    window.location.href = "/dashboard";
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12">
      <section className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
        <div className="mb-8">
          <Link href="/" className="text-xl font-black tracking-tight"><span className="text-blue-500">Vic</span>Os</Link>
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-blue-500">Acesso seguro</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Entrar no VicOs</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">Use sua conta Google ou entre com e-mail e senha.</p>
        </div>
        <GoogleButton />
        <div className="my-6 flex items-center gap-3 text-xs font-semibold text-slate-400"><div className="h-px flex-1 bg-slate-200" /><span>OU ENTRE COM E-MAIL</span><div className="h-px flex-1 bg-slate-200" /></div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">E-mail</span><input className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" name="email" type="email" autoComplete="email" placeholder="voce@empresa.com" required /></label>
          <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">Senha</span><input className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" name="password" type="password" autoComplete="current-password" placeholder="Digite sua senha" required /></label>
          <div className="flex justify-end"><Link href="/forgot-password" className="text-xs font-semibold text-blue-500 hover:text-blue-600">Esqueci minha senha</Link></div>
          {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-600">{error}</p>}
          <button disabled={loading} className="w-full rounded-xl bg-blue-500 px-4 py-3 font-bold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60" type="submit">{loading ? "Entrando..." : "Entrar"}</button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">Ainda não tem acesso? <Link href="/signup" className="font-bold text-blue-500 hover:text-blue-600">Criar conta</Link></p>
        <p className="mt-5 text-center text-xs text-slate-400"><Link href="/" className="hover:text-blue-500">Voltar para o início</Link></p>
      </section>
    </main>
  );
}
