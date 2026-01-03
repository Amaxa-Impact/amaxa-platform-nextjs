
"use client"
import type { User } from '@workos-inc/node';
import { TaskStatusChart } from '@/components/dashboard/task-status-chart';
import { TasksTable } from '@/components/dashboard/tasks-table';
import { useDashboardContext } from '@/components/dashboard/context';
import { type Preloaded, usePreloadedQuery } from 'convex/react';
import type { api } from '@/convex/_generated/api';

export function HomePage({
    allUsers,
    statusCountsPrefetched,
}: {
    allUsers: User[];
    statusCountsPrefetched: Preloaded<typeof api.dashboard.getTaskStatusCounts>;
}) {
  const { project } = useDashboardContext();

  const statusCounts = usePreloadedQuery(statusCountsPrefetched);

  return (
    <div className="flex flex-col gap-6 p-6 bg-background">
      <div>
        <h1 className="text-3xl font-bold">{project.name}</h1>
        <p className="text-muted-foreground">Project Dashboard</p>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <TaskStatusChart
          title="All Tasks"
          description="Task breakdown by status"
          data={statusCounts?.allTasks}
          total={statusCounts?.totalAll}
        />
        <TaskStatusChart
          title="My Tasks"
          description="Your assigned tasks by status"
          data={statusCounts?.userTasks}
          total={statusCounts?.totalUser}
        />
      </div>

      {/* Tasks Table */}
      <TasksTable projectId={project.id} allUsers={allUsers} />
    </div>
  );
}