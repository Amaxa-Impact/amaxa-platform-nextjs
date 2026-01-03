import { BreadcrumbHeader } from "@/components/dashboard/breadcrumb-header";
import { DashboardProvider } from "@/components/dashboard/context";
import { AppSidebar } from "@/components/dashboard/sidebar/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import type { Id } from "@/convex/_generated/dataModel";

export default async function RouteComponent({
  params,
  children,
}: {
  params: Promise<{
    projectId: Id<"projects">;
  }>;
  children: React.ReactNode;
}) {
  const projectId = (await params).projectId;

  return (
    <DashboardProvider projectId={projectId}>
      <SidebarProvider>
        <AppSidebar projectId={projectId} />
        <main className="flex flex-1 flex-col">
          <BreadcrumbHeader />
          <div className="flex-1">{children}</div>
        </main>
      </SidebarProvider>
    </DashboardProvider>
  );
}
