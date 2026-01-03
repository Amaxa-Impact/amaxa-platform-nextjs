"use client"

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from '@/components/ui/field'
import { useForm } from '@tanstack/react-form'
import { toast } from 'sonner'
import { useMutation, usePreloadedQuery, type Preloaded} from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { z } from 'zod'

export function ApplicationsPageClient({ prefetchForms }: { prefetchForms: Preloaded<typeof api.applicationForms.list> }) {
  const forms = usePreloadedQuery(prefetchForms);
  const router = useRouter();

  return (
    <div className="flex h-full flex-col">
      <div className="bg-background sticky top-0 z-10 flex flex-row items-center justify-between p-6">
        <h1 className="text-xl font-bold">Application Forms</h1>
        <Dialog>
          <DialogTrigger>
            <Button variant="outline" size="sm" className="ml-2">
              <Plus className="w-4 h-4" />
              Create Form
            </Button>
          </DialogTrigger>
          <DialogContent>
            <CreateFormDialog />
          </DialogContent>
        </Dialog>
      </div>

      <main className="flex-1 p-6">
        {forms.length === 0 ? (
          <div className="text-muted-foreground py-12 text-center">
            <p>No application forms yet.</p>
            <p>Create your first form to start collecting applications.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Responses</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {forms.map((form) => (
                <TableRow
                  key={form._id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => router.push(`/applications/${form._id}/edit`)}
                >
                  <TableCell className="font-medium">{form.title}</TableCell>
                  <TableCell className="text-muted-foreground">
                    /apply/{form.slug}
                  </TableCell>
                  <TableCell>
                    <Badge variant={form.isPublished ? 'default' : 'secondary'}>
                      {form.isPublished ? 'Published' : 'Draft'}
                    </Badge>
                  </TableCell>
                  <TableCell>{form.responseCount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </main>
    </div>
  )
}

const createFormSchema = z.object({
  title: z.string().min(1, 'Title is required.').trim(),
  description: z.string(),
  slug: z
    .string()
    .min(1, 'Slug is required.')
    .regex(
      /^[a-z0-9-]+$/,
      'Slug can only contain lowercase letters, numbers, and hyphens',
    ),
})

type CreateFormSchema = z.infer<typeof createFormSchema>

function CreateFormDialog() {
  const createForm = useMutation(api.applicationForms.create)

  const form = useForm({
    defaultValues: {
      title: '',
      description: '',
      slug: '',
    } satisfies CreateFormSchema,
    validators: {
      onChange: createFormSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await createForm({
          title: value.title.trim(),
          description: value.description?.trim() || undefined,
          slug: value.slug.trim(),
        })
        toast.success('Form created successfully')
        form.reset()
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : 'Failed to create form',
        )
      }
    },
  })

  const generateSlug = () => {
    const title = form.state.values.title || ''
    const generatedSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
    form.setFieldValue('slug', generatedSlug)
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
    >
      <DialogHeader>
        <DialogTitle>Create Application Form</DialogTitle>
        <DialogDescription>
          Create a new form to collect applications.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 py-4">
        <form.Field name="title">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Title</FieldLabel>
              <FieldContent>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="e.g., Summer 2025 Program Application"
                />
                <FieldError
                  errors={field.state.meta.errors.map((error) => {
                    if (typeof error === 'string') {
                      return { message: error }
                    }
                    return undefined
                  })}
                />
              </FieldContent>
            </Field>
          )}
        </form.Field>

        <form.Field name="description">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Description (optional)</FieldLabel>
              <FieldContent>
                <Textarea
                  id={field.name}
                  name={field.name}
                  value={field.state.value || ''}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="Describe what this application is for..."
                  rows={3}
                />
              </FieldContent>
            </Field>
          )}
        </form.Field>

        <form.Field name="slug">
          {(field) => (
            <Field>
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor={field.name}>URL Slug</FieldLabel>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={generateSlug}
                >
                  Generate from title
                </Button>
              </div>
              <FieldContent>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">/apply/</span>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onChange={(e) => {
                      const lowerValue = e.target.value.toLowerCase()
                      field.handleChange(lowerValue)
                    }}
                    onBlur={field.handleBlur}
                    placeholder="summer-2025"
                  />
                </div>
                <FieldError
                  errors={field.state.meta.errors.map((error) => {
                    if (typeof error === 'string') {
                      return { message: error }
                    }
                    return undefined
                  })}
                />
              </FieldContent>
            </Field>
          )}
        </form.Field>
      </div>

      <DialogFooter>
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
        >
          {([canSubmit, isSubmitting]) => (
            <Button type="submit" disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Form'}
            </Button>
          )}
        </form.Subscribe>
      </DialogFooter>
    </form>
  )
}
