import { Id } from "@/convex/_generated/dataModel";
import { HomePage } from "./_components/home-page";
import { preloadQuery } from "convex/nextjs";
import { listUsers } from "@/lib/workos";
import { api } from "@/convex/_generated/api";
import { withAuth } from "@workos-inc/authkit-nextjs";

export default async function Page({
  params
}: {
  params: Promise<{
    projectId: Id<'projects'>;
  }>;
}) {
  const projectId = (await params).projectId;

  const { accessToken } = await withAuth();
  const [allUsers, preloadedData] = await Promise.all([
    listUsers(),
    preloadQuery(api.dashboard.getTaskStatusCounts, { projectId }, {
      token: accessToken,
    }),
  ]);

  return (
    <HomePage allUsers={allUsers} statusCountsPrefetched={preloadedData} />
  );
}