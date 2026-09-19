import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createCompany, joinCompany } from "./actions";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <main className="grid min-h-screen place-items-center p-6"><Link className="font-bold text-blue-600" href="/login">Entrar no VicOs</Link></main>;

  const { data: membership } = await supabase.from("users").select("company_id,role").eq("id", user.id).maybeSingle();
  if (membership) return <main className="grid min-h-screen place-items-center p-6"><Link className="font-bold text-blue-600" href="/dashboard">Ir para o dashboard</Link></main>;

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-10 text-slate-950">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-white"><Link href="/" className="text-xl font-black"><span className="text-blue-400">Vic</span>Os</Link><p className="mt-8 text-xs font-bold uppercase tracking-[.2em] text-blue-400">Primeiro acesso</p><h1 className="mt-2 text-3xl font-black md:text-4xl">Vamos preparar seu workspace.</h1><p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">Crie uma empresa nova ou entre em uma empresa existente usando o código de 6 caracteres.</p></div>
        <div className="grid gap-4 md:grid-cols-2">
          <section className="rounded-3xl bg-white p-6 shadow-2xl">
            <p className="text-xs font-bold uppercase tracking-[.16em] text-blue-500">Nova empresa</p>
            <h2 className="mt-2 text-2xl font-black">Criar workspace</h2>
            <p className="mt-2 text-sm text-slate-500">Você será o administrador da empresa.</p>
            <form action={createCompany} className="mt-6 space-y-4"><input name="name" required minLength={2} maxLength={200} placeholder="Nome da empresa" className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"/><button className="w-full rounded-xl bg-blue-600 px-4 py-3 font-bold text-white hover:bg-blue-700">Criar empresa</button></form>
          </section>
          <section className="rounded-3xl bg-white p-6 shadow-2xl">
            <p className="text-xs font-bold uppercase tracking-[.16em] text-slate-500">Já tenho empresa</p>
            <h2 className="mt-2 text-2xl font-black">Entrar com código</h2>
            <p className="mt-2 text-sm text-slate-500">Digite o código de 6 caracteres enviado pelo administrador.</p>
            <form action={joinCompany} className="mt-6 space-y-4"><input name="code" required maxLength={6} minLength={6} autoCapitalize="characters" placeholder="ABC123" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-center text-xl font-black uppercase tracking-[.3em] outline-none focus:border-blue-500"/><button className="w-full rounded-xl border border-slate-900 bg-slate-900 px-4 py-3 font-bold text-white hover:bg-slate-800">Entrar na empresa</button></form>
          </section>
        </div>
      </div>
    </main>
  );
}
