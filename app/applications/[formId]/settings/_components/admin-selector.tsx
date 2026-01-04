"use client";

import { useQuery } from "convex/react";
import { useEffect, useState } from "react";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from "@/components/kibo-ui/combobox";
import { api } from "@/convex/_generated/api";
import type { User } from "@/lib/workos";

interface AdminSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

export function AdminSelector({
  value,
  onValueChange,
  className,
}: AdminSelectorProps) {
  const siteAdmins = useQuery(api.interviewTimeSlots.listSiteAdmins);
  const [allUsers, setAllUsers] = useState<User>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users");
        if (response.ok) {
          const data = await response.json();
          setAllUsers(data.users || []);
        }
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const adminOptions =
    siteAdmins
      ?.map((admin) => {
        const workosUserId = admin.userId.split("|")[1];
        const user = allUsers.find((u) => u.id === workosUserId);
        return {
          value: admin.userId,
          label: user?.email || user?.firstName || admin.userId,
        };
      })
      .filter(Boolean) ?? [];

  if (isLoading || !siteAdmins) {
    return (
      <div className={className}>
        <div className="h-7 w-full animate-pulse rounded-md bg-muted" />
      </div>
    );
  }

  return (
    <Combobox
      data={adminOptions}
      onValueChange={onValueChange}
      type="admin"
      value={value}
    >
      <ComboboxTrigger className={className} />
      <ComboboxContent>
        <ComboboxInput placeholder="Search admins..." />
        <ComboboxList>
          <ComboboxEmpty>No admins found.</ComboboxEmpty>
          <ComboboxGroup>
            {adminOptions.map((admin) => (
              <ComboboxItem key={admin.value} value={admin.value}>
                {admin.label}
              </ComboboxItem>
            ))}
          </ComboboxGroup>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
