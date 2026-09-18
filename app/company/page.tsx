import Link from "next/link";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import { PageHeader } from "@/components/layout/page-header";
import { getCurrentUserContext } from "@/lib/db/context";

export default async function CompanyPage() {
  const { supabase, membership } = await getCurrentUserContext();
  const { data: company } = await supabase.from("companies").select("*").eq("id", membership.company_id).single();
  const logo = company?.logo_url ? (await supabase.storage.from("company-assets").createSignedUrl(company.logo_url, 3600)).data?.signedUrl : null;
  return <div className="flex min-h-screen bg-transparent"><DashboardNav active="Empresa"/><main className="vicos-mobile-main flex-1 px-5 py-7 md:px-8 lg:px-10 lg:py-9">
    <PageHeader eyebrow="Organização" title={company?.name ?? "Sua empresa"} description="Centralize identidade, dados e preferências da organização em um único lugar." action="Personalizar" href="/company/personalization"/>
    <section className="grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
      <div className="vicos-card rounded-[24px] p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          {logo ? <img src={logo} alt="" className="h-20 w-20 rounded-[22px] object-cover ring-1 ring-slate-200"/> : <div className="vicos-orb h-20 w-20 rounded-[22px] text-2xl font-black text-blue-600">{company?.name?.slice(0,1).toUpperCase() ?? "V"}</div>}
          <div><h2 className="text-xl font-black">{company?.name ?? "Minha empresa"}</h2><p className="mt-1 text-sm text-slate-500">{company?.description ?? "Adicione uma descrição para apresentar sua empresa dentro do VicOs."}</p><div className="mt-3 flex flex-wrap gap-2">{company?.industry && <span className="vicos-chip">{company.industry}</span>}{company?.business_segment && <span className="vicos-chip">{company.business_segment}</span>}</div></div>
        </div>
        <div className="mt-7 grid gap-4 border-t border-slate-200/70 pt-6 sm:grid-cols-2">
          {[
            ["Documento", company?.document],
            ["Telefone", company?.phone],
            ["E-mail", company?.email],
            ["Localização", [company?.city, company?.state].filter(Boolean).join(" / ")],
          ].map(([label,value]) => <div key={String(label)}><p className="text-[10px] font-bold uppercase tracking-[.16em] text-slate-400">{label}</p><p className="mt-1 text-sm font-semibold text-slate-700">{value || "Não informado"}</p></div>)}
        </div>
      </div>
      <div className="space-y-5">
        <Link href="/company/personalization" className="vicos-card block rounded-[24px] p-6"><p className="text-xs font-bold text-blue-600">Identidade</p><h2 className="mt-1 text-lg font-black">Personalização →</h2><p className="mt-2 text-sm leading-6 text-slate-500">Logo, descrição, nicho, cores e apresentação da empresa.</p></Link>
        <Link href="/profile" className="vicos-card block rounded-[24px] p-6"><p className="text-xs font-bold text-blue-600">Equipe</p><h2 className="mt-1 text-lg font-black">Meu perfil →</h2><p className="mt-2 text-sm leading-6 text-slate-500">Foto, cargo, bio, status e preferências pessoais.</p></Link>
      </div>
    </section>
  </main></div>;
}