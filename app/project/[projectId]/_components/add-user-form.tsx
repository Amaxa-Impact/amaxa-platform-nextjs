/** biome-ignore-all lint/correctness/noChildrenProp: This is a workaround to fix the linting error. */
"use client";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "convex/react";
import * as React from "react";
import { toast } from "sonner";
import * as z from "zod";
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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { User } from "@/lib/workos";

const formSchema = z.object({
  userId: z.string().min(1, "Please select a user."),
  role: z.enum(["coach", "member"], {
    message: "Please select a role.",
  }),
});

export function AddUserForm({
  allUsers,
  projectId,
  open,
  onOpenChange,
  existingUserIds,
}: {
  allUsers: User;
  projectId: Id<"projects">;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingUserIds?: string[];
}) {
  const assignUser = useMutation(api.userToProject.assign);

  const availableUsers = React.useMemo(() => {
    return allUsers
      .filter((user) => !existingUserIds?.includes(user.id))
      .map((user) => ({
        label: user.email || user.firstName || user.id,
        value: user.id,
      }));
  }, [allUsers, existingUserIds]);

  const form = useForm({
    defaultValues: {
      userId: "",
      role: "member" as "coach" | "member",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await assignUser({
          userId: value.userId,
          projectId,
          role: value.role,
        });
        toast.success("User added successfully", {
          description: `User has been added to the project as ${value.role}.`,
        });
        form.reset();
        onOpenChange(false);
      } catch (error) {
        toast.error("Failed to add user", {
          description:
            error instanceof Error
              ? error.message
              : "An unknown error occurred.",
        });
      }
    },
  });

  React.useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add User to Project</DialogTitle>
          <DialogDescription>
            Select a user and assign them a role in this project.
          </DialogDescription>
        </DialogHeader>

        <form
          id="add-user-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.Field
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor="add-user-form-userId">User</FieldLabel>
                    <Combobox
                      data={availableUsers}
                      onOpenChange={undefined}
                      onValueChange={field.handleChange}
                      open={undefined}
                      type="user"
                      value={field.state.value}
                    >
                      <ComboboxTrigger
                        aria-invalid={isInvalid}
                        className="w-full"
                        id="add-user-form-userId"
                      />
                      <ComboboxContent>
                        <ComboboxInput />
                        <ComboboxList>
                          <ComboboxEmpty>No users found.</ComboboxEmpty>
                          <ComboboxGroup>
                            {availableUsers.map((user) => (
                              <ComboboxItem key={user.value} value={user.value}>
                                {user.label}
                              </ComboboxItem>
                            ))}
                          </ComboboxGroup>
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                    <FieldDescription>
                      Search and select a user to add to this project.
                    </FieldDescription>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
              name="userId"
            />

            <form.Field
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                const roleOptions = [
                  { label: "Member", value: "member" },
                  { label: "Coach", value: "coach" },
                ];

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor="add-user-form-role">Role</FieldLabel>
                    <Combobox
                      data={roleOptions}
                      onOpenChange={undefined}
                      onValueChange={(value) =>
                        field.handleChange(value as "coach" | "member")
                      }
                      open={undefined}
                      type="role"
                      value={field.state.value}
                    >
                      <ComboboxTrigger
                        aria-invalid={isInvalid}
                        className="w-full"
                        id="add-user-form-role"
                      />
                      <ComboboxContent>
                        <ComboboxInput />
                        <ComboboxList>
                          <ComboboxEmpty>No roles found.</ComboboxEmpty>
                          <ComboboxGroup>
                            {roleOptions.map((role) => (
                              <ComboboxItem key={role.value} value={role.value}>
                                {role.label}
                              </ComboboxItem>
                            ))}
                          </ComboboxGroup>
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                    <FieldDescription>
                      Choose the role for this user in the project.
                    </FieldDescription>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
              name="role"
            />
          </FieldGroup>
        </form>

        <DialogFooter>
          <Button
            onClick={() => {
              form.reset();
              onOpenChange(false);
            }}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button form="add-user-form" type="submit">
            Add User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
