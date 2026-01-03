"use client";
import { IconChevronsLeft, IconEye } from "@tabler/icons-react";
import Link from "next/link";
import { Tabs, TabsList, TabsTab } from "@/components/ui/route-tabs";
import { cn } from "@/lib/utils";
import { buttonVariants } from "../ui/button";
import { useApplicationForm } from "./context";

export function ApplicationNavbar({ id }: { id: string }) {
  const form = useApplicationForm();

  return (
    <header className="flex h-10 w-full flex-row justify-between">
      <div className="flex flex-row items-center gap-2">
        <Link
          className={cn(
            "flex items-center text-muted-foreground hover:text-primary",
            buttonVariants({ variant: "ghost" })
          )}
          href="/applications"
        >
          <IconChevronsLeft className="h-10 w-10" />
          Back
        </Link>
        <h1 className="font-bold text-md text-muted-foreground underline hover:text-primary">
          {form.title}
        </h1>

        {form.isPublished && (
          <Link
            className={buttonVariants({ variant: "ghost" })}
            href={`/apply/${form.slug}`}
          >
            <IconEye className="h-4 w-4" />
            View Form
          </Link>
        )}
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
