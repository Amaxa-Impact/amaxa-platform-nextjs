'use client';
import { useState, useCallback, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { IconCircle, IconPlus, IconSquare, IconX } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

interface FormQuestionOptionsProps {
  options: string[];
  onOptionsChange: (options: string[]) => void;
  type: 'select' | 'multiselect';
}

export function FormQuestionOptions({ options, onOptionsChange, type }: FormQuestionOptionsProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const OptionIcon = type === 'select' ? IconCircle : IconSquare;

  const addOption = useCallback(() => {
    const newOptions = [...options, `Option ${options.length + 1}`];
    onOptionsChange(newOptions);
    // Focus the new option after render
    setTimeout(() => {
      const newIndex = newOptions.length - 1;
      setEditingIndex(newIndex);
      inputRefs.current[newIndex]?.focus();
      inputRefs.current[newIndex]?.select();
    }, 0);
  }, [options, onOptionsChange]);

  const updateOption = useCallback(
    (index: number, value: string) => {
      const newOptions = [...options];
      newOptions[index] = value;
      onOptionsChange(newOptions);
    },
    [options, onOptionsChange],
  );

  const removeOption = useCallback(
    (index: number) => {
      if (options.length <= 1) return;
      const newOptions = options.filter((_, i) => i !== index);
      onOptionsChange(newOptions);
    },
    [options, onOptionsChange],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (index === options.length - 1) {
          addOption();
        } else {
          // Move to next option
          setEditingIndex(index + 1);
          inputRefs.current[index + 1]?.focus();
        }
      } else if (e.key === 'Backspace' && options[index] === '' && options.length > 1) {
        e.preventDefault();
        removeOption(index);
        // Focus previous option
        const prevIndex = Math.max(0, index - 1);
        setEditingIndex(prevIndex);
        setTimeout(() => {
          inputRefs.current[prevIndex]?.focus();
        }, 0);
      }
    },
    [options, addOption, removeOption],
  );

  // Initialize with at least one option
  useEffect(() => {
    if (options.length === 0) {
      onOptionsChange(['Option 1']);
    }
  }, [options, onOptionsChange]);

  return (
    <div className="space-y-2">
      {options.map((option, index) => (
        <div key={index} className="flex items-center gap-2 group">
          <OptionIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <Input
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            value={option}
            onChange={(e) => updateOption(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onFocus={() => setEditingIndex(index)}
            onBlur={() => setEditingIndex(null)}
            placeholder={`Option ${index + 1}`}
            className={cn(
              'flex-1 border-0 border-b rounded-none focus-visible:ring-0 focus-visible:border-primary px-0',
              editingIndex === index ? 'border-b-2 border-primary' : '',
            )}
          />
          {options.length > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => removeOption(index)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              title="Remove option"
            >
              <IconX className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={addOption}
        className="text-muted-foreground hover:text-foreground"
      >
        <IconPlus className="h-4 w-4 mr-1" />
        Add option
      </Button>
    </div>
  );
}
