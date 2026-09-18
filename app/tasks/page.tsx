import { DashboardNav } from "@/components/layout/dashboard-nav";
import { PageHeader } from "@/components/layout/page-header";
import { getTasksPage } from "@/lib/services/tasks";
import { TasksClient } from "@/components/tasks/tasks-client";

export default async function TasksPage(){
  const data=await getTasksPage();
  return <div className="flex min-h-screen"><DashboardNav active="Tarefas"/><main className="vicos-mobile-main flex-1 px-5 py-7 md:px-8 lg:px-10 md:py-9"><PageHeader eyebrow="Workspace" title="Tarefas" description="Organize responsabilidades, prazos e prioridades da equipe com atualização em tempo real."/><TasksClient initialData={data}/></main></div>;
}
