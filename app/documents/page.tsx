import { DashboardNav } from "@/components/layout/dashboard-nav";
import { PageHeader } from "@/components/layout/page-header";
import { getDocumentsPage } from "@/lib/services/documents";
import { DocumentsClient } from "@/components/documents/documents-client";

export default async function DocumentsPage() {
  const data = await getDocumentsPage();
  return (
    <div className="flex min-h-screen">
      <DashboardNav active="Documentos" />
      <main className="vicos-mobile-main flex-1 px-5 py-7 md:px-8 lg:px-10 lg:py-9">
        <PageHeader eyebrow="Workspace" title="Documentos" description="Crie, edite e acompanhe documentos da empresa com atualização em tempo real e histórico de versões." />
        <DocumentsClient initialData={data} />
      </main>
    </div>
  );
}
