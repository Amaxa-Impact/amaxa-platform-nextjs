"use client";

import { IconEdit, IconTrash } from "@tabler/icons-react";
import { useMutation, useQuery } from "convex/react";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { User } from "@/lib/workos";

interface TimeSlot {
  _id: Id<"interviewTimeSlots">;
  startTime: number;
  endTime: number;
  timezone: string;
  assignedAdminId?: string;
  isBooked: boolean;
}

interface TimeSlotListProps {
  formId: Id<"applicationForms">;
  onEdit: (slot: TimeSlot) => void;
}

export function TimeSlotList({ formId, onEdit }: TimeSlotListProps) {
  const slots = useQuery(api.interviewTimeSlots.listByForm, { formId });
  const deleteSlot = useMutation(api.interviewTimeSlots.remove);
  const [allUsers, setAllUsers] = useState<User>([]);
  const [deletingSlotId, setDeletingSlotId] =
    useState<Id<"interviewTimeSlots"> | null>(null);

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
      }
    };
    fetchUsers();
  }, []);

  const getAdminName = (adminId?: string) => {
    if (!adminId) {
      return "—";
    }
    const workosUserId = adminId.split("|")[1];
    const user = allUsers.find((u) => u.id === workosUserId);
    return user?.email || user?.firstName || adminId;
  };

  const handleDelete = async () => {
    if (!deletingSlotId) {
      return;
    }

    try {
      await deleteSlot({ slotId: deletingSlotId });
      toast.success("Time slot deleted");
    } catch (error) {
      toast.error("Failed to delete time slot", {
        description:
          error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      setDeletingSlotId(null);
    }
  };

  if (!slots) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div className="h-12 animate-pulse rounded-md bg-muted" key={i} />
        ))}
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground text-sm">
          No time slots created yet. Add your first slot to get started.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date & Time</TableHead>
              <TableHead>Timezone</TableHead>
              <TableHead>Assigned Admin</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {slots.map((slot) => (
              <TableRow key={slot._id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {format(new Date(slot.startTime), "MMM d, yyyy")}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {format(new Date(slot.startTime), "h:mm a")} -{" "}
                      {format(new Date(slot.endTime), "h:mm a")}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-muted-foreground text-sm">
                    {slot.timezone}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {getAdminName(slot.assignedAdminId)}
                  </span>
                </TableCell>
                <TableCell>
                  {slot.isBooked ? (
                    <Badge variant="secondary">Booked</Badge>
                  ) : (
                    <Badge variant="outline">Available</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      disabled={slot.isBooked}
                      onClick={() => onEdit(slot)}
                      size="icon"
                      title={
                        slot.isBooked ? "Cannot edit booked slot" : "Edit slot"
                      }
                      variant="ghost"
                    >
                      <IconEdit className="size-4" />
                    </Button>
                    <Button
                      disabled={slot.isBooked}
                      onClick={() => setDeletingSlotId(slot._id)}
                      size="icon"
                      title={
                        slot.isBooked
                          ? "Cannot delete booked slot"
                          : "Delete slot"
                      }
                      variant="ghost"
                    >
                      <IconTrash className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        onOpenChange={() => setDeletingSlotId(null)}
        open={!!deletingSlotId}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Time Slot</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this time slot? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
