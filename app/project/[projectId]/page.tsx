import { withAuth } from "@workos-inc/authkit-nextjs";
import { preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { listUsers } from "@/lib/workos";
import { HomePage } from "./_components/home-page";

export default async function Page({
  params,
}: {
  params: Promise<{
    projectId: Id<"projects">;
  }>;
}) {
  const projectId = (await params).projectId;

  const { accessToken } = await withAuth();
  const [allUsers, preloadedData] = await Promise.all([
    listUsers(),
    preloadQuery(
      api.dashboard.getTaskStatusCounts,
      { projectId },
      {
        token: accessToken,
      }
    ),
  ]);

  return (
    <HomePage allUsers={allUsers} statusCountsPrefetched={preloadedData} />
  );
}
