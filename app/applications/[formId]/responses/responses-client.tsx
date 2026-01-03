"use client";
import { useMutation, useQuery } from "convex/react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

  const [selectedResponseId, setSelectedResponseId] =
    useState<Id<"applicationResponses"> | null>(null);
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
          {/* Filters */}
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

          {/* Responses Table */}
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
                    key={response._id}
                    onView={() => setSelectedResponseId(response._id)}
                    response={response}
                  />
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Response Detail Dialog */}
        <Dialog
          onOpenChange={(open) => !open && setSelectedResponseId(null)}
          open={selectedResponseId !== null}
        >
          {selectedResponseId && (
            <ResponseDetailDialog responseId={selectedResponseId} />
          )}
        </Dialog>
      </main>
    </div>
  );
}

function ResponseRow({
  response,
  onView,
}: {
  response: {
    _id: Id<"applicationResponses">;
    applicantName: string;
    applicantEmail: string;
    submittedAt: number;
    status: ResponseStatus;
  };
  onView: () => void;
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

  const handleDelete = async () => {
    // biome-ignore lint/suspicious/noAlert: <explanation>
    if (!confirm("Are you sure you want to delete this application?")) {
      return;
    }
    try {
      await deleteResponse({ responseId: response._id });
      toast.success("Application deleted");
    } catch (_error) {
      toast.error("Failed to delete application");
    }
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
          <Button onClick={onView} size="sm" variant="outline">
            View
          </Button>
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

function ResponseDetailDialog({
  responseId,
}: {
  responseId: Id<"applicationResponses">;
}) {
  const response = useQuery(api.applicationResponses.get, { responseId });
  const updateStatus = useMutation(api.applicationResponses.updateStatus);

  if (!response) {
    return (
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Response not found</DialogTitle>
        </DialogHeader>
      </DialogContent>
    );
  }

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
    <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Application from {response.applicantName}</DialogTitle>
        <DialogDescription>
          Submitted on{" "}
          {new Date(response.submittedAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6">
        {/* Status */}
        <div className="flex items-center gap-4">
          <span className="font-medium text-sm">Status:</span>
          <Select
            onValueChange={(v) => handleStatusChange(v as ResponseStatus)}
            value={response.status}
          >
            <SelectTrigger className="w-40">
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
        </div>

        {/* Applicant Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Applicant Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="text-muted-foreground text-sm">Name:</span>
              <p className="font-medium">{response.applicantName}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-sm">Email:</span>
              <p className="font-medium">
                <a
                  className="text-primary hover:underline"
                  href={`mailto:${response.applicantEmail}`}
                >
                  {response.applicantEmail}
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Field Responses */}
        {response.fieldResponses.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Responses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {response.fieldResponses.map((fr) => (
                <div
                  className="border-b pb-4 last:border-0 last:pb-0"
                  key={fr.fieldId}
                >
                  <span className="text-muted-foreground text-sm">
                    {fr.fieldLabel}
                  </span>
                  <div className="mt-1">
                    {Array.isArray(fr.value) ? (
                      <div className="flex flex-wrap gap-1">
                        {fr.value.map((v, i) => (
                          <Badge key={`${fr.fieldId}-${i}`} variant="secondary">
                            {v}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{fr.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </DialogContent>
  );
}
