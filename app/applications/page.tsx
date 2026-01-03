import { ApplicationsPageClient } from './client'
import { preloadQuery } from 'convex/nextjs'
import { api } from '@/convex/_generated/api'
import { withAuth } from '@workos-inc/authkit-nextjs'
import { TopNavbar } from '@/components/navbar/top-navbar'

export default async function ApplicationsPage() {
    const { accessToken } = await withAuth();
  const prefetchForms = await preloadQuery(api.applicationForms.list, {}, { token: accessToken });
  return (
    <div>
      <TopNavbar />
      <ApplicationsPageClient prefetchForms={prefetchForms} />
    </div>
  )
}
