import type { Id } from "@/convex/_generated/dataModel";
import { ApplyPageClient } from "./client";

export default async function ApplyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const formId = id as Id<"applicationForms">;

  return <ApplyPageClient formId={formId} />;
}

export const metadata = {
  title: "Apply",
  description: "Submit your application",
};
