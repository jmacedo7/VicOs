import Link from "next/link";
import { GoogleButton } from "@/components/auth/google-button";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12">
      <section className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
        <div className="mb-8">
          <div className="text-sm font-black tracking-widest text-blue-500">VICOS</div>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">Entrar na sua empresa</h1>
          <p className="mt-2 text-sm text-slate-500">Acesse o seu Business Operating System.</p>
        </div>

        <GoogleButton />
        <div className="my-6 flex items-center gap-3 text-xs text-slate-400">
          <div className="h-px flex-1 bg-slate-200" /><span>OU</span><div className="h-px flex-1 bg-slate-200" />
        </div>

        <form className="space-y-4">
          <input className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500" type="email" placeholder="E-mail" />
          <input className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500" type="password" placeholder="Senha" />
          <button className="w-full rounded-xl bg-blue-500 px-4 py-3 font-bold text-white transition hover:bg-blue-600" type="submit">Entrar</button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">
          <Link href="/" className="hover:text-blue-500">Voltar para o início</Link>
        </p>
      </section>
    </main>
  );
}
