'use client'
import { Tabs, TabsList, TabsTab } from '@/components/ui/route-tabs';
import { Button, buttonVariants } from '../ui/button';
import Link from 'next/link';
import { IconChevronsLeft, IconEye } from '@tabler/icons-react';
import { useApplicationForm } from './context';
import { cn } from '@/lib/utils';

export function ApplicationNavbar({ id }: { id: string }) {
  const form = useApplicationForm()

  return (
    <header className="w-full h-10 flex flex-row justify-between">
      <div className="flex flex-row items-center gap-2">
        <Link href="/applications" className={cn('flex items-center text-muted-foreground hover:text-primary', buttonVariants({ variant: 'ghost' }))}>
          <IconChevronsLeft className="h-10 w-10" />
          Back
        </Link>
      <h1 className="text-md font-bold underline text-muted-foreground hover:text-primary">{form.title}</h1>
 
      {
        form.isPublished && (
            <Link className={buttonVariants({ variant: 'ghost' })} href={`/apply/${form.slug}`}>
              <IconEye className="h-4 w-4" />
              View Form
            </Link>
        )
      }


      </div>
      <div className="flex flex-row items-center gap-2">

      <Tabs>
        <TabsList variant="underline">
          <TabsTab href={`/applications/${id}/edit`}>Edit</TabsTab>
          <TabsTab href={`/applications/${id}/responses`}>Responses</TabsTab>
          <TabsTab href={`/applications/${id}/settings`}>Settings</TabsTab>
        </TabsList>
      </Tabs>
           </div>
    </header>
  );
}
