import { TasksFlowContent } from "@/components/dashboard/tasks-flow/tasks-flow-content";
import { listUsers } from "@/lib/workos";

export default async function RouteComponent() {
  const allUsers = await listUsers();

  return <TasksFlowContent allUsers={allUsers} />;
}
