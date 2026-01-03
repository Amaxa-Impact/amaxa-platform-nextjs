import { withAuth } from "@workos-inc/authkit-nextjs";
import { preloadQuery } from "convex/nextjs";
import { TopNavbar } from "@/components/navbar/top-navbar";
import { api } from "@/convex/_generated/api";
import { ApplicationsPageClient } from "./client";

export default async function ApplicationsPage() {
  const { accessToken } = await withAuth();
  const prefetchForms = await preloadQuery(
    api.applicationForms.list,
    {},
    { token: accessToken }
  );
  return (
    <div>
      <TopNavbar />
      <ApplicationsPageClient prefetchForms={prefetchForms} />
    </div>
  );
}
