import Link from "next/link";
import { getCurrentUserContext } from "@/lib/db/context";
import { createInvite } from "@/app/onboarding/actions";

export default async function InviteTeamPage() {
  const { membership } = await getCurrentUserContext();

  if (membership.role !== "admin" && membership.role !== "manager") {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-10">
        <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8">
          <Link href="/team" className="text-sm font-bold text-blue-500">← Voltar para equipe</Link>
          <h1 className="mt-5 text-3xl font-black">Acesso restrito</h1>
          <p className="mt-2 text-sm text-slate-500">Somente administradores e gerentes podem convidar novos membros.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8">
        <Link href="/team" className="text-sm font-bold text-blue-500">← Voltar para equipe</Link>
        <h1 className="mt-5 text-3xl font-black">Convidar membro</h1>
        <p className="mt-2 text-sm text-slate-500">
          Gere um link seguro. A pessoa poderá abrir o link, autenticar com Google ou e-mail
          e será adicionada automaticamente à empresa.
        </p>

        <form action={createInvite} className="mt-8 space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold">E-mail (opcional)</span>
            <input
              name="email"
              type="email"
              className="w-full rounded-xl border border-slate-200 px-4 py-3"
              placeholder="colaborador@empresa.com"
            />
          </label>

          <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
            O convite expira em 7 dias e fica vinculado ao e-mail quando você informar um.
          </div>

          <div className="flex justify-end gap-3">
            <Link href="/team" className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold">
              Cancelar
            </Link>
            <button type="submit" className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700">
              Gerar link de convite
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
