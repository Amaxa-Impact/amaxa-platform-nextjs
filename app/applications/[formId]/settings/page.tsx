"use client";
import { FieldDescription } from "@base-ui/react";
import { Field, useForm } from "@tanstack/react-form";
import { useMutation } from "convex/react";
import { z } from "zod";
import { useApplicationForm } from "@/components/application/context";
import { FieldGroup, FieldLabel } from "@/components/ui/field";
import { api } from "@/convex/_generated/api";

export default function SettingsPage() {
  const applicationFormData = useApplicationForm();
  const mutation = useMutation(api.applicationForms.update);
  const form = useForm({
    defaultValues: {
      slug: applicationFormData.slug,
      isPublished: applicationFormData.isPublished,
    },
    validators: {
      onChange: z.object({
        slug: z.string().min(1),
        isPublished: z.boolean(),
      }),
    },
    onSubmit: async ({ value }) => {
      try {
        await mutation({
          formId: applicationFormData._id,
          slug: value.slug,
          isPublished: value.isPublished,
        });
      } catch (error) {
        console.error(error);
      }
    },
  });

  return (
    <div className="flex h-screen flex-col">
      <FieldGroup>
        <form.Field
          children={(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>URL Slug</FieldLabel>
              <Input
                id={field.name}
                name={field.name}
                onBlur={field.handleBlur}
                onChange={field.handleChange}
                value={field.state.value}
              />
              <FieldDescription>
                The URL slug for the application form.
              </FieldDescription>
            </Field>
          )}
          name="slug"
        />
      </FieldGroup>
    </div>
  );
}
