import { Id } from '@/convex/_generated/dataModel';
import { DashboardProvider } from '@/components/dashboard/context';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/dashboard/sidebar/app-sidebar';
import { BreadcrumbHeader } from '@/components/dashboard/breadcrumb-header';

export default async function RouteComponent({
  params,
  children,
}: {
  params: Promise<{
    projectId: Id<'projects'>;
  }>;
  children: React.ReactNode;
}) {
  const projectId = (await params).projectId;

  return (
    <DashboardProvider projectId={projectId}>
      <SidebarProvider>
        <AppSidebar projectId={projectId} />
        <main className="flex-1 flex flex-col">
          <BreadcrumbHeader />
          <div className="flex-1">{children}</div>
        </main>
      </SidebarProvider>
    </DashboardProvider>
  );
}
