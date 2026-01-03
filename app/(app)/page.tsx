import { fetchQuery, preloadQuery } from 'convex/nextjs';
import { api } from '@/convex/_generated/api';
import { HomeClient } from '../_components/home-client';
import { withAuth } from '@workos-inc/authkit-nextjs';
import { redirect } from 'next/navigation';

export default async function Home() {
  const { accessToken } = await withAuth();

  const userStatus = accessToken
    ? await fetchQuery(api.auth.getCurrentUserStatus, {}, { token: accessToken })
    : null;

  const isAdmin = userStatus?.isAdmin ?? false;
  const userId = userStatus?.userId ?? null;

  if (!userId) {
    redirect('/sign-in');
  }

  const prefetchProjects = 
    await preloadQuery(api.projects.listForUser, { userId }, { token: accessToken })

  return <HomeClient isAdmin={isAdmin} userId={userId} prefetchProjects={prefetchProjects} />;
}
