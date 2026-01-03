"use client";
import { z } from "zod";
import { useApplicationForm } from "@/components/application/context";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Field, useForm } from "@tanstack/react-form";
import { FieldGroup, FieldLabel } from "@/components/ui/field";
import { FieldDescription } from "@base-ui/react";

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
				})
			} catch (error) {
				console.error(error);
			}
		}
	});

	return (
		<div className="flex flex-col h-screen">
            <FieldGroup>
                <form.Field
                name="slug"
                children={(field) => (
                    <Field>
                        <FieldLabel htmlFor={field.name}>URL Slug</FieldLabel>
                        <Input id={field.name} name={field.name} value={field.state.value} onChange={field.handleChange} onBlur={field.handleBlur} />
                        <FieldDescription>The URL slug for the application form.</FieldDescription>
                    </Field>
                )}
                />

            </FieldGroup>

		</div>
	);
}
