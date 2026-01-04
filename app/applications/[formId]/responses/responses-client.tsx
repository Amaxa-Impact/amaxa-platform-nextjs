"use client";
import { useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { confirmDialog } from "@/components/ui/confirm-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
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

type ResponseStatus = "pending" | "reviewed" | "accepted" | "rejected";

export default function ResponsesPageClient() {
  const { formId } = useParams<{ formId: Id<"applicationForms"> }>();
  const form = useQuery(api.applicationForms.get, { formId });
  const responses = useQuery(api.applicationResponses.list, { formId });

  const [statusFilter, setStatusFilter] = useState<ResponseStatus | "all">(
    "all"
  );

  if (!form) {
    return <div className="p-6">Form not found</div>;
  }

  const filteredResponses =
    statusFilter === "all"
      ? responses
      : responses?.filter((r) => r.status === statusFilter);

  const statusCounts = {
    all: responses?.length ?? 0,
    pending: responses?.filter((r) => r.status === "pending").length ?? 0,
    reviewed: responses?.filter((r) => r.status === "reviewed").length ?? 0,
    accepted: responses?.filter((r) => r.status === "accepted").length ?? 0,
    rejected: responses?.filter((r) => r.status === "rejected").length ?? 0,
  };

  return (
    <div className="flex h-full flex-col">
      <main className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="flex gap-2">
            <Button
              onClick={() => setStatusFilter("all")}
              size="sm"
              variant={statusFilter === "all" ? "default" : "outline"}
            >
              All ({statusCounts.all})
            </Button>
            <Button
              onClick={() => setStatusFilter("pending")}
              size="sm"
              variant={statusFilter === "pending" ? "default" : "outline"}
            >
              Pending ({statusCounts.pending})
            </Button>
            <Button
              onClick={() => setStatusFilter("reviewed")}
              size="sm"
              variant={statusFilter === "reviewed" ? "default" : "outline"}
            >
              Reviewed ({statusCounts.reviewed})
            </Button>
            <Button
              onClick={() => setStatusFilter("accepted")}
              size="sm"
              variant={statusFilter === "accepted" ? "default" : "outline"}
            >
              Accepted ({statusCounts.accepted})
            </Button>
            <Button
              onClick={() => setStatusFilter("rejected")}
              size="sm"
              variant={statusFilter === "rejected" ? "default" : "outline"}
            >
              Rejected ({statusCounts.rejected})
            </Button>
          </div>

          {filteredResponses?.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                {responses?.length === 0
                  ? "No applications have been submitted yet."
                  : "No applications match the selected filter."}
              </CardContent>
            </Card>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResponses?.map((response) => (
                  <ResponseRow
                    formId={formId}
                    key={response._id}
                    response={response}
                  />
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </main>
    </div>
  );
}

function ResponseRow({
  response,
  formId,
}: {
  response: {
    _id: Id<"applicationResponses">;
    applicantName: string;
    applicantEmail: string;
    submittedAt: number;
    status: ResponseStatus;
  };
  formId: Id<"applicationForms">;
}) {
  const updateStatus = useMutation(api.applicationResponses.updateStatus);
  const deleteResponse = useMutation(api.applicationResponses.remove);

  const handleStatusChange = async (newStatus: ResponseStatus) => {
    try {
      await updateStatus({
        responseId: response._id,
        status: newStatus,
      });
      toast.success("Status updated");
    } catch (_error) {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = () => {
    confirmDialog({
      title: "Delete Application",
      description:
        "Are you sure you want to delete this application? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "destructive",
      onConfirm: async () => {
        try {
          await deleteResponse({ responseId: response._id });
          toast.success("Application deleted");
        } catch (_error) {
          toast.error("Failed to delete application");
        }
      },
    });
  };

  const statusVariants: Record<
    ResponseStatus,
    "default" | "secondary" | "destructive" | "outline"
  > = {
    pending: "secondary",
    reviewed: "outline",
    accepted: "default",
    rejected: "destructive",
  };

  return (
    <TableRow>
      <TableCell className="font-medium">{response.applicantName}</TableCell>
      <TableCell>{response.applicantEmail}</TableCell>
      <TableCell>
        {new Date(response.submittedAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </TableCell>
      <TableCell>
        <Select
          onValueChange={(v) => handleStatusChange(v as ResponseStatus)}
          value={response.status}
        >
          <SelectTrigger className="w-32">
            <Badge variant={statusVariants[response.status]}>
              {response.status.charAt(0).toUpperCase() +
                response.status.slice(1)}
            </Badge>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="reviewed">Reviewed</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Button
            render={
              <Link
                href={`/applications/${formId}/responses/response/${response._id}`}
              >
                View
              </Link>
            }
            size="sm"
            variant="outline"
          />
          <Button
            className="text-destructive"
            onClick={handleDelete}
            size="sm"
            variant="ghost"
          >
            Delete
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
