'use client';

import { memo, useMemo } from 'react';
import Link from 'next/link';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export const TopNavbar = memo(function TopNavbar() {
  const userStatus = useQuery(api.auth.getCurrentUserStatus);

  const links = useMemo(() => {
    const baseLinks = [{ href: '/', label: 'Home' }];

    if (userStatus?.isAdmin) {
      baseLinks.push({ href: '/applications', label: 'Applications' });
    }

    return baseLinks;
  }, [userStatus?.isAdmin]);

  if (userStatus === undefined) {
    return (
      <nav className="h-14 border-b border-border bg-card">
        <div className="flex items-center gap-4 px-6 h-full">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-32" />
        </div>
      </nav>
    );
  }

  return (
    <nav className="h-14 border-b border-border bg-card">
      <div className="flex items-center justify-between px-6 h-full">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-lg">Amaxa</span>
        </div>

        <div className="flex items-center gap-2">
          {links.map((link) => (
            <Button key={link.href} variant="ghost" >
              <Link href={link.href}>{link.label}</Link>
            </Button>
          ))}
        </div>
      </div>
    </nav>
  );
});
