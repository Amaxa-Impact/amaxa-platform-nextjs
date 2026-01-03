'use client';

import Link from 'next/link';
import { Preloaded, usePreloadedQuery, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface HomeClientProps {
  userId: string | null;
  isAdmin: boolean;
  prefetchProjects: Preloaded<typeof api.projects.listForUser>;
}

export function HomeClient({ userId, isAdmin, prefetchProjects }: HomeClientProps) {
  const projects = usePreloadedQuery(prefetchProjects);

  if (!userId) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Welcome to Amaxa</CardTitle>
            <CardDescription>
              Please sign in to access your projects
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isAdmin) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome, Admin</h1>
          <p className="text-muted-foreground">
            Manage your platform from the dashboard
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Projects</CardTitle>
              <CardDescription>Manage all projects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {projects === undefined ? (
                  <Skeleton className="h-10 w-20" />
                ) : (
                  projects.length
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Applications</CardTitle>
              <CardDescription>Review submissions</CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                href="/applications"
                className="text-primary hover:underline"
              >
                View Applications →
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (projects === undefined) {
    return (
      <div className="container mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-6">My Projects</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>No Projects Yet</CardTitle>
            <CardDescription>
              You haven&apos;t been assigned to any projects yet. Contact your
              coach to get started.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-6">My Projects</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Link href={`/project/${project._id}`} key={project._id}>
            <Card className="hover:ring-2 hover:ring-primary transition-all cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-xl">{project.name}</CardTitle>
                  <Badge
                    variant={project.role === 'coach' ? 'default' : 'secondary'}
                  >
                    {project.role}
                  </Badge>
                </div>
                <CardDescription>{project.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
