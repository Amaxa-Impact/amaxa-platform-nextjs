/* eslint-disable react/no-children-prop */
/** biome-ignore-all lint/correctness/noChildrenProp: <explanation> */
'use client';
import { useCallback, useRef, useState, useEffect } from 'react';
import { useForm } from '@tanstack/react-form';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { FormData } from './types';
import { useMutation } from 'convex/react';

interface FormHeaderProps {
  form: FormData;
  formId: Id<'applicationForms'>;
}

export function FormHeader({ form, formId }: FormHeaderProps) {
  const [isActive, setIsActive] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const updateForm = useMutation(api.applicationForms.update);

  const formState = useForm({
    defaultValues: {
      title: form.title,
      description: form.description ?? '',
    },
  });

  const saveChanges = useCallback(
    async (values: { title: string; description: string }) => {
      if (!values.title.trim()) return;

      setIsSaving(true);
      try {
        await updateForm({
          formId,
          title: values.title.trim(),
          description: values.description.trim() || undefined,
        });
      } catch (error) {
        toast.error('Failed to save form');
      } finally {
        setIsSaving(false);
      }
    },
    [formId, updateForm],
  );

  const debouncedSave = useCallback(
    (values: { title: string; description: string }) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        saveChanges(values);
      }, 500);
    },
    [saveChanges],
  );

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Card
      className={cn(
        'transition-all border-t-4',
        isActive ? 'border-t-primary ring-1 ring-primary/20' : 'border-t-primary/50',
      )}
      onClick={() => setIsActive(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setIsActive(false);
        }
      }}
    >
      <CardContent className="pt-6 space-y-4">
        {isSaving && <div className="text-xs text-muted-foreground text-right">Saving...</div>}

        <formState.Field
          name="title"
          children={(field) => (
            <Input
              ref={titleInputRef}
              id="form-title"
              name={field.name}
              value={field.state.value}
              onChange={(e) => {
                field.handleChange(e.target.value);
                debouncedSave({
                  title: e.target.value,
                  description: formState.state.values.description,
                });
              }}
              onBlur={field.handleBlur}
              placeholder="Form title"
              className={cn(
                'border-0 border-b rounded-none focus-visible:ring-0 focus-visible:border-primary px-0 text-2xl font-bold',
                isActive ? 'border-b-2' : '',
              )}
            />
          )}
        />

        <formState.Field
          name="description"
          children={(field) => (
            <Textarea
              id="form-description"
              name={field.name}
              value={field.state.value}
              onChange={(e) => {
                field.handleChange(e.target.value);
                debouncedSave({
                  title: formState.state.values.title,
                  description: e.target.value,
                });
              }}
              onBlur={field.handleBlur}
              placeholder="Form description (optional)"
              rows={2}
              className={cn(
                'border-0 border-b rounded-none focus-visible:ring-0 focus-visible:border-primary px-0 resize-none',
                isActive ? 'border-b-2' : '',
              )}
            />
          )}
        />
      </CardContent>
    </Card>
  );
}
