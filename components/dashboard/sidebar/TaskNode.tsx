"use client";
import { IconCheck, IconPencil, IconX } from "@tabler/icons-react";
import { Handle, type NodeProps, Position } from "@xyflow/react";
import { memo, useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export interface TaskNodeData {
  label: string;
  description?: string;
  status?: "todo" | "in_progress" | "completed" | "blocked";
  assignedTo?: string;
  dueDate?: number;
  priority?: "low" | "medium" | "high";
  onStatusChange?: (status: TaskNodeData["status"]) => void;
  onDataChange?: (data: Partial<TaskNodeData>) => void;
  projectMembers?: Array<{ userId: string; name?: string }>;
}

const statusColors = {
  todo: "bg-card border-border",
  in_progress:
    "bg-blue-50 dark:bg-blue-950 border-blue-400 dark:border-blue-600",
  completed:
    "bg-green-50 dark:bg-green-950 border-green-400 dark:border-green-600",
  blocked: "bg-red-50 dark:bg-red-950 border-red-400 dark:border-red-600",
};

const priorityColors = {
  low: "text-muted-foreground",
  medium: "text-yellow-600 dark:text-yellow-500",
  high: "text-red-600 dark:text-red-500",
};

const statusOptions = [
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "blocked", label: "Blocked" },
] as const;

const priorityOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
] as const;

export const TaskNode = memo(({ data, id }: NodeProps) => {
  const taskData = data as TaskNodeData;
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    label: taskData.label,
    description: taskData.description || "",
    assignedTo: taskData.assignedTo || "",
    priority: taskData.priority || "medium",
  });

  const status = taskData.status || "todo";
  const priority = taskData.priority || "medium";

  const handleStatusChange = useCallback(
    (newStatus: string) => {
      if (taskData.onStatusChange) {
        taskData.onStatusChange(newStatus as TaskNodeData["status"]);
      }
    },
    [taskData]
  );

  const handleEditClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsEditing(true);
      setEditForm({
        label: taskData.label,
        description: taskData.description || "",
        assignedTo: taskData.assignedTo || "",
        priority: taskData.priority || "medium",
      });
    },
    [taskData]
  );

  const handleSave = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (taskData.onDataChange) {
        taskData.onDataChange({
          label: editForm.label,
          description: editForm.description || undefined,
          assignedTo: editForm.assignedTo || undefined,
          priority: editForm.priority,
        });
      }
      setIsEditing(false);
    },
    [taskData, editForm]
  );

  const handleCancel = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsEditing(false);
      setEditForm({
        label: taskData.label,
        description: taskData.description || "",
        assignedTo: taskData.assignedTo || "",
        priority: taskData.priority || "medium",
      });
    },
    [taskData]
  );

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsEditing(false);
    }
  }, []);

  if (isEditing) {
    return (
      <div
        className={
          "min-w-[280px] rounded-lg border-2 bg-card px-3 py-3 text-card-foreground shadow-md"
        }
        onKeyDown={handleKeyDown}
      >
        <Handle className="h-3 w-3" position={Position.Left} type="target" />

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium text-muted-foreground text-xs">
              Edit Task
            </span>
            <div className="flex gap-1">
              <Button
                className="h-6 w-6 p-0"
                onClick={handleSave}
                size="sm"
                variant="ghost"
              >
                <IconCheck className="h-3.5 w-3.5 text-green-600" />
              </Button>
              <Button
                className="h-6 w-6 p-0"
                onClick={handleCancel}
                size="sm"
                variant="ghost"
              >
                <IconX className="h-3.5 w-3.5 text-red-600" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Input
              autoFocus
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, label: e.target.value }))
              }
              onClick={(e) => e.stopPropagation()}
              placeholder="Task name"
              value={editForm.label}
            />

            <Textarea
              className="min-h-[60px]"
              onChange={(e) =>
                setEditForm((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              onClick={(e) => e.stopPropagation()}
              placeholder="Description (optional)"
              value={editForm.description}
            />

            <div className="flex gap-2">
              <div className="flex-1">
                <label className="mb-1 block text-muted-foreground text-xs">
                  Priority
                </label>
                <Select
                  onValueChange={(value) =>
                    setEditForm((prev) => ({
                      ...prev,
                      priority: value as TaskNodeData["priority"],
                    }))
                  }
                  value={editForm.priority}
                >
                  <SelectTrigger
                    className="w-full"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <label className="mb-1 block text-muted-foreground text-xs">
                  Assigned To
                </label>
                <Input
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      assignedTo: e.target.value,
                    }))
                  }
                  onClick={(e) => e.stopPropagation()}
                  placeholder="User ID"
                  value={editForm.assignedTo}
                />
              </div>
            </div>
          </div>
        </div>

        <Handle className="h-3 w-3" position={Position.Right} type="source" />
      </div>
    );
  }

  return (
    <div
      className={`min-w-[200px] rounded-lg border-2 px-3 py-2.5 text-foreground shadow-md ${statusColors[status]}`}
    >
      <Handle className="h-3 w-3" position={Position.Left} type="target" />

      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="flex-1 font-semibold text-sm leading-tight">
            {taskData.label}
          </h3>
          <div className="flex items-center gap-1">
            <span className={`font-medium text-xs ${priorityColors[priority]}`}>
              {priority.toUpperCase()}
            </span>
            <Button
              className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
              onClick={handleEditClick}
              size="sm"
              variant="ghost"
            >
              <IconPencil className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {taskData.description && (
          <p className="line-clamp-2 text-muted-foreground text-xs">
            {taskData.description}
          </p>
        )}

        <div className="flex items-center gap-2">
          <Select onValueChange={handleStatusChange} value={status}>
            <SelectTrigger
              className="h-6 w-auto text-xs"
              onClick={(e) => e.stopPropagation()}
              size="sm"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {taskData.assignedTo && (
          <div className="text-muted-foreground text-xs">
            Assigned to: {taskData.assignedTo}
          </div>
        )}
      </div>

      <Handle className="h-3 w-3" position={Position.Right} type="source" />
    </div>
  );
});

TaskNode.displayName = "TaskNode";
