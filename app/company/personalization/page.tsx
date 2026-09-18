import { DashboardNav } from "@/components/layout/dashboard-nav";
import { getCurrentUserContext } from "@/lib/db/context";
import { CompanyPersonalization } from "@/components/company/company-personalization";

export default async function CompanyPersonalizationPage() {
  const { supabase, membership } = await getCurrentUserContext();
  const { data } = await supabase.from("companies").select("*").eq("id", membership.company_id).single();
  return <div className="flex min-h-screen bg-transparent"><DashboardNav active="Empresa"/><main className="vicos-mobile-main flex-1 px-5 py-7 md:px-8 lg:px-10 lg:py-9"><CompanyPersonalization initialCompany={data} canEdit={membership.role === "admin"} /></main></div>;
}