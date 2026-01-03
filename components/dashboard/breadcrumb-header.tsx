"use client";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useDashboardContext } from "./context";

const PAGE_NAMES: Record<string, string> = {
  "": "Dashboard",
  tasks: "Tasks",
  users: "Users",
  settings: "Settings",
};

export function BreadcrumbHeader() {
  const { project } = useDashboardContext();
  const pathname = usePathname();
  const { projectId } = useParams();

  const pathParts = pathname.split("/").filter(Boolean);
  const projectIdFromPath = pathParts[1];
  const currentPageFromPath = pathParts[2];

  const currentPage = currentPageFromPath || "";
  const pageName = PAGE_NAMES[currentPage] || currentPage;

  return (
    <header className="sticky top-0 z-10 border-border border-b bg-background">
      <div className="flex items-center gap-2 px-4 py-3">
        <SidebarTrigger className="-ml-1" />
        <div className="h-5 w-px bg-border" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink>
                <Link href="/">Platform</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>
                <Link href={`/project/${projectId || projectIdFromPath}`}>
                  {project.name || "No Project Found"}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{pageName}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  );
}
