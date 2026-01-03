"use client";
import { useQuery } from "convex/react";
import { createContext, useContext, useMemo } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

interface Project {
  name: string;
  id: Id<"projects">;
}

export type UserRole = "coach" | "member" | null;

export const DashboardContext = createContext<{
  project: Project;
  userRole: UserRole;
}>({
  project: {
    name: "",
    //@ts-expect-error - This is a workaround to fix the linting error.
    id: "",
  },
  userRole: null,
});

export const useDashboardContext = () => {
  return useContext(DashboardContext);
};

export const DashboardProvider = ({
  children,
  projectId,
}: {
  children: React.ReactNode;
  projectId: Id<"projects">;
}) => {
  const project = useQuery(api.projects.get, { projectId });
  const userRole = useQuery(api.userToProjects.getUserRole, { projectId });

  const contextValue = useMemo(
    () => ({
      project: project
        ? { name: project.name, id: project._id }
        : { name: "", id: "" as Id<"projects"> },
      userRole: (userRole ?? null) as UserRole,
    }),
    [project, userRole]
  );

  if (project === undefined) {
    return <div>Loading...</div>;
  }

  if (project === null) {
    return <div>Project not found</div>;
  }

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
};
