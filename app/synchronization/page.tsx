import { DashboardNav } from "@/components/layout/dashboard-nav";
import { PageHeader } from "@/components/layout/page-header";
import { getCurrentUserContext } from "@/lib/db/context";
import { EmailIntegrations } from "@/components/synchronization/email-integrations";
import { getBillingContext } from "@/lib/billing/entitlements";

export default async function SynchronizationPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { supabase, membership } = await getCurrentUserContext();
  const { plan, subscription } = await getBillingContext();
  const isPro =
    plan?.code === "pro" &&
    ["active", "trialing"].includes(subscription?.status ?? "");

  const { data: integrations } = isPro
    ? await supabase
        .from("email_integrations")
        .select("id,provider,email,status,updated_at")
        .eq("company_id", membership.company_id)
        .order("updated_at", { ascending: false })
    : { data: [] };

  const googleConfigured = Boolean(
    process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.EMAIL_TOKEN_ENCRYPTION_KEY &&
      process.env.NEXT_PUBLIC_SITE_URL,
  );
  const microsoftConfigured = Boolean(
    process.env.MICROSOFT_CLIENT_ID &&
      process.env.MICROSOFT_CLIENT_SECRET &&
      process.env.EMAIL_TOKEN_ENCRYPTION_KEY &&
      process.env.NEXT_PUBLIC_SITE_URL,
  );

  const query = await searchParams;
  const message =
    query.email === "connected"
      ? "Conta de e-mail conectada com segurança."
      : query.email === "missing_config"
        ? "O provedor escolhido ainda não está configurado no ambiente."
        : query.email === "invalid_state"
          ? "A sessão OAuth expirou ou foi invalidada. Tente conectar novamente."
          : query.email === "error"
            ? "Não foi possível concluir a conexão. Revise as credenciais OAuth."
            : query.email === "invalid_callback"
              ? "O retorno do provedor foi incompleto."
              : query.email === "pro_required"
                ? "A integração de e-mail está disponível no plano Pro."
                : "";

  return (
    <div className="flex min-h-screen">
      <DashboardNav active="Sincronização" />
      <main className="vicos-mobile-main flex-1 px-5 py-7 md:px-8 lg:px-10 lg:py-9">
        <PageHeader
          eyebrow="Integrações"
          title="Sincronização"
          description="Conecte e acompanhe fontes externas. As credenciais sensíveis ficam no servidor e não são expostas ao navegador."
        />

        {message && (
          <div
            className={
              query.email === "connected"
                ? "mb-5 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700"
                : "mb-5 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700"
            }
          >
            {message}
          </div>
        )}

        {!isPro ? (
          <section className="vicos-card rounded-[24px] p-6 md:p-7">
            <p className="text-[11px] font-bold uppercase tracking-[.17em] text-blue-500">
              VicOs Pro
            </p>
            <h2 className="mt-1 text-xl font-black">
              Integrações são um recurso Pro
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Conecte Google/Microsoft, Excel e automações avançadas no plano
              Pro por R$ 49,90/mês.
            </p>
            <div className="mt-4 inline-flex rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-500">
              Plano atual: {plan?.name ?? "Free"}
            </div>
          </section>
        ) : (
          <>
            <EmailIntegrations
              integrations={integrations ?? []}
              googleConfigured={googleConfigured}
              microsoftConfigured={microsoftConfigured}
            />

            <section className="vicos-card rounded-[24px] p-6 md:p-7">
              <p className="text-[11px] font-bold uppercase tracking-[.17em] text-slate-400">
                Automação
              </p>
              <h2 className="mt-1 text-xl font-black">
                Sincronização de dados
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                A camada de provedores do VicOs está preparada para contatos,
                contas e conectores futuros. A autenticação de e-mail fica
                isolada desta camada operacional.
              </p>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold text-slate-500">Contatos</p>
                  <p className="mt-1 text-sm font-black">Provider-ready</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold text-slate-500">Contas</p>
                  <p className="mt-1 text-sm font-black">Provider-ready</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold text-slate-500">E-mail</p>
                  <p className="mt-1 text-sm font-black">OAuth conectado</p>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
