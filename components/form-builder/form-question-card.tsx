/* eslint-disable react/no-children-prop */
'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { IconCopy, IconGripVertical, IconTrash } from '@tabler/icons-react';
import { FormFieldTypeSelector } from './form-field-type-selector';
import { FormQuestionOptions } from './form-question-options';
import { useFieldTypeInference } from './use-field-type-inference';
import type { FormField, QuestionFormValues } from './types';
import { useMutation } from 'convex/react';

interface FormQuestionCardProps {
  field: FormField;
  isActive: boolean;
  onActivate: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}

export function FormQuestionCard({
  field,
  isActive,
  onActivate,
  onDelete,
  onDuplicate,
  dragHandleProps,
}: FormQuestionCardProps) {
  const updateField = useMutation(api.applicationFormFields.update);
  const [isSaving, setIsSaving] = useState(false);
  const labelInputRef = useRef<HTMLInputElement>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { inferFieldType, isInferring } = useFieldTypeInference();

  const form = useForm({
    defaultValues: {
      label: field.label,
      description: field.description ?? '',
      type: field.type,
      required: field.required,
      options: field.options ?? [],
      min: field.min,
      max: field.max,
    },
  });

  // Auto-save with debounce
  const saveField = useCallback(
    async (values: QuestionFormValues) => {
      setIsSaving(true);
      try {
        await updateField({
          fieldId: field._id,
          label: values.label,
          description: values.description || undefined,
          type: values.type,
          required: values.required,
          options: values.type === 'select' || values.type === 'multiselect' ? values.options : undefined,
          min: values.type === 'number' ? values.min : undefined,
          max: values.type === 'number' ? values.max : undefined,
        });
      } catch (error) {
        toast.error('Failed to save changes');
      } finally {
        setIsSaving(false);
      }
    },
    [field._id, updateField],
  );

  const debouncedSave = useCallback(
    (values: QuestionFormValues) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        saveField(values);
      }, 500);
    },
    [saveField],
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Handle label blur - infer field type
  const handleLabelBlur = useCallback(async () => {
    const label = form.getFieldValue('label');
    if (label && label.length > 3) {
      const result = await inferFieldType(label);
      if (result) {
        form.setFieldValue('type', result.fieldType);
        // Auto-save after type inference
        debouncedSave({
          ...form.state.values,
          type: result.fieldType,
        });
      }
    }
  }, [form, inferFieldType, debouncedSave]);

  // Focus label input when activated
  useEffect(() => {
    if (isActive && labelInputRef.current) {
      labelInputRef.current.focus();
    }
  }, [isActive]);

  const showOptions = form.state.values.type === 'select' || form.state.values.type === 'multiselect';

  const showNumberConfig = form.state.values.type === 'number';

  return (
    <div
      className={cn(
        'group relative rounded-lg border bg-card transition-all',
        isActive ? 'border-primary ring-1 ring-primary/20' : 'border-border hover:border-muted-foreground/30',
      )}
      onClick={onActivate}
    >
      {/* Drag Handle */}
      <div
        {...dragHandleProps}
        className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <IconGripVertical className="h-5 w-5 text-muted-foreground" />
      </div>

      {/* Saving Indicator */}
      {isSaving && <div className="absolute top-2 right-2 text-xs text-muted-foreground">Saving...</div>}

      <div className="p-4 space-y-4">
        {/* Question Label and Type Selector Row */}
        <div className="flex gap-4">
          <div className="flex-1">
            <form.Field
              name="label"
              children={(fieldApi) => (
                <Field>
                  <Input
                    ref={labelInputRef}
                    id={`field-${field._id}-label`}
                    name={fieldApi.name}
                    value={fieldApi.state.value}
                    onChange={(e) => {
                      fieldApi.handleChange(e.target.value);
                      debouncedSave({
                        ...form.state.values,
                        label: e.target.value,
                      });
                    }}
                    onBlur={() => {
                      fieldApi.handleBlur();
                      handleLabelBlur();
                    }}
                    placeholder="Question"
                    className={cn(
                      'border-0 border-b rounded-none focus-visible:ring-0 focus-visible:border-primary px-0 text-base font-medium',
                      isActive ? 'border-b-2' : '',
                    )}
                    disabled={isInferring}
                  />
                  {fieldApi.state.meta.isTouched && !fieldApi.state.meta.isValid && (
                    <FieldError errors={fieldApi.state.meta.errors} />
                  )}
                </Field>
              )}
            />
          </div>
          <form.Field
            name="type"
            children={(fieldApi) => (
              <FormFieldTypeSelector
                value={fieldApi.state.value}
                onChange={(value) => {
                  fieldApi.handleChange(value);
                  debouncedSave({
                    ...form.state.values,
                    type: value,
                  });
                }}
                disabled={isInferring}
              />
            )}
          />
        </div>

        {/* Description (shown when active) */}
        {isActive && (
          <form.Field
            name="description"
            children={(fieldApi) => (
              <Field>
                <Input
                  id={`field-${field._id}-description`}
                  name={fieldApi.name}
                  value={fieldApi.state.value ?? ''}
                  onChange={(e) => {
                    fieldApi.handleChange(e.target.value);
                    debouncedSave({
                      ...form.state.values,
                      description: e.target.value,
                    });
                  }}
                  onBlur={fieldApi.handleBlur}
                  placeholder="Description (optional)"
                  className="text-sm text-muted-foreground"
                />
              </Field>
            )}
          />
        )}

        {/* Options for select/multiselect */}
        {showOptions && (
          <form.Field
            name="options"
            mode="array"
            children={(fieldApi) => (
              <FormQuestionOptions
                options={fieldApi.state.value ?? []}
                onOptionsChange={(options) => {
                  fieldApi.setValue(options);
                  debouncedSave({
                    ...form.state.values,
                    options,
                  });
                }}
                type={form.state.values.type as 'select' | 'multiselect'}
              />
            )}
          />
        )}

        {/* Number config */}
        {showNumberConfig && isActive && (
          <div className="flex gap-4">
            <form.Field
              name="min"
              children={(fieldApi) => (
                <Field className="flex-1">
                  <FieldLabel htmlFor={`field-${field._id}-min`}>Minimum</FieldLabel>
                  <Input
                    id={`field-${field._id}-min`}
                    type="number"
                    value={fieldApi.state.value ?? ''}
                    onChange={(e) => {
                      const value = e.target.value ? parseFloat(e.target.value) : undefined;
                      fieldApi.handleChange(value);
                      debouncedSave({
                        ...form.state.values,
                        min: value,
                      });
                    }}
                    placeholder="No minimum"
                  />
                </Field>
              )}
            />
            <form.Field
              name="max"
              children={(fieldApi) => (
                <Field className="flex-1">
                  <FieldLabel htmlFor={`field-${field._id}-max`}>Maximum</FieldLabel>
                  <Input
                    id={`field-${field._id}-max`}
                    type="number"
                    value={fieldApi.state.value ?? ''}
                    onChange={(e) => {
                      const value = e.target.value ? parseFloat(e.target.value) : undefined;
                      fieldApi.handleChange(value);
                      debouncedSave({
                        ...form.state.values,
                        max: value,
                      });
                    }}
                    placeholder="No maximum"
                  />
                </Field>
              )}
            />
          </div>
        )}

        {/* Footer: Required toggle and actions */}
        <div className="flex items-center justify-between pt-2 border-t">
          <form.Field
            name="required"
            children={(fieldApi) => (
              <Field orientation="horizontal">
                <FieldLabel htmlFor={`field-${field._id}-required`} className="text-sm font-normal">
                  Required
                </FieldLabel>
                <Switch
                  id={`field-${field._id}-required`}
                  checked={fieldApi.state.value}
                  onCheckedChange={(checked) => {
                    fieldApi.handleChange(checked);
                    debouncedSave({
                      ...form.state.values,
                      required: checked,
                    });
                  }}
                />
              </Field>
            )}
          />

          <div className="flex gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate();
              }}
              title="Duplicate"
            >
              <IconCopy className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              title="Delete"
              className="text-destructive hover:text-destructive"
            >
              <IconTrash className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
