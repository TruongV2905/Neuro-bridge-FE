"use client";

import { useEffect } from "react";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ZodType } from "zod";

import type { FieldConfig } from "@/types/dasboard";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

interface Props {
  fields: FieldConfig[];
  schema: ZodType<Record<string, unknown>>;
  defaultValues: Record<string, unknown>;
  onSubmit: (values: Record<string, unknown>) => void;
  onCancel?: () => void;
  submitLabel?: string;
}

const spanClassMap: Record<number, string> = {
  1: "md:col-span-1",
  2: "md:col-span-2",
  3: "md:col-span-3",
  4: "md:col-span-4",
  5: "md:col-span-5",
  6: "md:col-span-6",
  7: "md:col-span-7",
  8: "md:col-span-8",
  9: "md:col-span-9",
  10: "md:col-span-10",
  11: "md:col-span-11",
  12: "md:col-span-12",
};

export function FormBuilder({
  fields,
  schema,
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel = "Submit",
}: Props) {
  const form = useForm<Record<string, unknown>>({
    resolver: zodResolver(schema as never) as Resolver<Record<string, unknown>>,
    defaultValues,
  });

  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <FieldGroup>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
          {fields.map((config) => {
            const span = config.span || 12;

            return (
              <Controller
                key={config.name}
                name={config.name}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className={spanClassMap[span]}
                  >
                    <FieldLabel htmlFor={config.name}>
                      {config.label}
                    </FieldLabel>

                    {config.type === "text" && (
                      <Input
                        id={config.name}
                        placeholder={config.placeholder}
                        disabled={config.disabled}
                        value={String(field.value ?? "")}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                      />
                    )}

                    {config.type === "number" && (
                      <Input
                        id={config.name}
                        type="number"
                        placeholder={config.placeholder}
                        disabled={config.disabled}
                        value={String(field.value ?? "")}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ""
                              ? undefined
                              : Number(e.target.value),
                          )
                        }
                        onBlur={field.onBlur}
                      />
                    )}

                    {config.type === "textarea" && (
                      <textarea
                        id={config.name}
                        placeholder={config.placeholder}
                        disabled={config.disabled}
                        value={String(field.value ?? "")}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        className="min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    )}

                    {config.type === "select" && (
                      <Select
                        value={String(field.value ?? "")}
                        onValueChange={field.onChange}
                        disabled={config.disabled}
                      >
                        <SelectTrigger id={config.name} className="w-full">
                          <SelectValue
                            placeholder={
                              config.placeholder || `Select ${config.label}`
                            }
                          />
                        </SelectTrigger>

                        <SelectContent>
                          {config.options?.map((option) => (
                            <SelectItem
                              key={String(option.value)}
                              value={String(option.value)}
                            >
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            );
          })}
        </div>
      </FieldGroup>

      <div className="flex justify-end gap-2 border-t pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}

        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
