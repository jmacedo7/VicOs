import { DashboardNav } from "@/components/layout/dashboard-nav";
import { PageHeader } from "@/components/layout/page-header";
import { getMessagesPage } from "@/lib/services/messages";
import { MessagesClient } from "@/components/messages/messages-client";

export default async function MessagesPage() {
  const data = await getMessagesPage();
  return (
    <div className="flex min-h-screen bg-transparent">
      <DashboardNav active="Mensagens" />
      <main className="vicos-mobile-main flex-1 px-5 py-7 md:px-8 lg:px-10 lg:py-9">
        <PageHeader eyebrow="Comunicação" title="Mensagens" description="Converse em privado com outro membro da sua empresa. O conteúdo das mensagens é cifrado no dispositivo antes de ser enviado." />
        <MessagesClient initialData={data} />
      </main>
    </div>
  );
}
