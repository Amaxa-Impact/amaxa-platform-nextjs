"use client";

import { IconPlus } from "@tabler/icons-react";
import { useQuery } from "convex/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { TimeSlotForm } from "./_components/time-slot-form";
import { TimeSlotList } from "./_components/time-slot-list";

const MAX_SLOTS = 15;

interface SchedulingSettingsProps {
  formId: Id<"applicationForms">;
}

interface EditingSlot {
  _id: Id<"interviewTimeSlots">;
  startTime: number;
  timezone: string;
  assignedAdminId?: string;
}

export function SchedulingSettings({ formId }: SchedulingSettingsProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<EditingSlot | undefined>();

  const slots = useQuery(api.interviewTimeSlots.listByForm, { formId });
  const slotCount = slots?.length ?? 0;
  const canAddMore = slotCount < MAX_SLOTS;

  const handleEdit = (slot: EditingSlot) => {
    setEditingSlot(slot);
    setIsFormOpen(true);
  };

  const handleFormClose = (open: boolean) => {
    setIsFormOpen(open);
    if (!open) {
      setEditingSlot(undefined);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-sm">Interview Time Slots</h3>
          <p className="text-muted-foreground text-xs">
            Create up to {MAX_SLOTS} available time slots for interviews. Each
            slot is 30 minutes.
          </p>
        </div>
        <Button
          disabled={!canAddMore}
          onClick={() => setIsFormOpen(true)}
          size="sm"
        >
          <IconPlus className="mr-1.5 size-4" />
          Add Slot
        </Button>
      </div>

      {slotCount > 0 && (
        <p className="text-muted-foreground text-xs">
          {slotCount} of {MAX_SLOTS} slots used
        </p>
      )}

      <TimeSlotList formId={formId} onEdit={handleEdit} />

      <TimeSlotForm
        editingSlot={editingSlot}
        formId={formId}
        onOpenChange={handleFormClose}
        open={isFormOpen}
      />
    </div>
  );
}
