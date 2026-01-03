"use client"
import {
  FormBuilder,
  FormHeader,
} from '@/components/form-builder'
import { useParams } from 'next/navigation'
import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import { useQuery} from 'convex/react'
import { useApplicationForm } from '@/components/application/context'


export default function FormEditorClient() {
  const { formId } = useParams<{ formId: Id<'applicationForms'> }>()
  const fields = useQuery(api.applicationFormFields.listByForm, { formId })
  const form = useApplicationForm()


  if (!form) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Form not found</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen">
      <main className="flex-1 overflow-auto bg-background">
        <div className="max-w-3xl mx-auto py-6 px-4 space-y-4">
          <FormHeader form={form} formId={formId} />

          <FormBuilder formId={formId} fields={fields}  />
        </div>
      </main>
    </div>
  )
}
