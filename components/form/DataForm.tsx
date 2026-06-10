"use client"

import {
  Controller,
  type FieldValues,
  type UseFormReturn,
} from "react-hook-form"

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

import type { FieldConfig } from "@/types/dasboard"

type DataFormProps<TFormValues extends FieldValues> = {
  form: UseFormReturn<TFormValues>
  fields: FieldConfig<TFormValues>[]
  isSubmitting?: boolean
}

function DataForm<TFormValues extends FieldValues>({
  form,
  fields,
  isSubmitting = false,
}: DataFormProps<TFormValues>) {
  return (
    <FieldGroup>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {fields.map((config) => (
          <Controller
            key={config.name}
            name={config.name}
            control={form.control}
            render={({ field, fieldState }) => (
              <Field
                data-invalid={fieldState.invalid}
                className={config.span === 2 ? "md:col-span-2" : ""}
              >
                <FieldLabel htmlFor={field.name}>
                  {config.label}

                  {config.required && (
                    <span className="ml-1 text-destructive">*</span>
                  )}
                </FieldLabel>

                {config.type === "text" && (
                  <Input
                    {...field}
                    id={field.name}
                    type="text"
                    value={field.value ?? ""}
                    disabled={config.disabled || isSubmitting}
                    placeholder={config.placeholder}
                  />
                )}

                {config.type === "email" && (
                  <Input
                    {...field}
                    id={field.name}
                    type="email"
                    value={field.value ?? ""}
                    disabled={config.disabled || isSubmitting}
                    placeholder={config.placeholder}
                  />
                )}

                {config.type === "password" && (
                  <Input
                    {...field}
                    id={field.name}
                    type="password"
                    value={field.value ?? ""}
                    disabled={config.disabled || isSubmitting}
                    placeholder={config.placeholder}
                  />
                )}

                {config.type === "date" && (
                  <Input
                    {...field}
                    id={field.name}
                    type="date"
                    value={field.value ?? ""}
                    disabled={config.disabled || isSubmitting}
                    placeholder={config.placeholder}
                  />
                )}

                {config.type === "number" && (
                  <Input
                    {...field}
                    id={field.name}
                    type="number"
                    value={field.value ?? ""}
                    disabled={config.disabled || isSubmitting}
                    placeholder={config.placeholder}
                    onChange={(e) => {
                      const value = e.target.value
                      field.onChange(value === "" ? undefined : Number(value))
                    }}
                  />
                )}

                {config.type === "textarea" && (
                  <Textarea
                    {...field}
                    id={field.name}
                    value={field.value ?? ""}
                    disabled={config.disabled || isSubmitting}
                    placeholder={config.placeholder}
                  />
                )}

                {config.type === "select" && (
                  <Select
                    value={
                      field.value !== undefined && field.value !== null
                        ? String(field.value)
                        : ""
                    }
                    onValueChange={field.onChange}
                    disabled={config.disabled || isSubmitting}
                  >
                    <SelectTrigger id={field.name} className="w-full">
                      <SelectValue placeholder={config.placeholder} />
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

                {config.type === "checkbox" && (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={field.name}
                      checked={Boolean(field.value)}
                      disabled={config.disabled || isSubmitting}
                      onCheckedChange={field.onChange}
                    />

                    {config.placeholder && (
                      <span className="text-sm text-muted-foreground">
                        {config.placeholder}
                      </span>
                    )}
                  </div>
                )}

                {config.type === "switch" && (
                  <div className="flex items-center gap-2">
                    <Switch
                      id={field.name}
                      checked={Boolean(field.value)}
                      disabled={config.disabled || isSubmitting}
                      onCheckedChange={field.onChange}
                    />

                    {config.placeholder && (
                      <span className="text-sm text-muted-foreground">
                        {config.placeholder}
                      </span>
                    )}
                  </div>
                )}

                {config.type === "radio" && (
                  <RadioGroup
                    value={
                      field.value !== undefined && field.value !== null
                        ? String(field.value)
                        : ""
                    }
                    onValueChange={field.onChange}
                    disabled={config.disabled || isSubmitting}
                  >
                    {config.options?.map((option) => (
                      <div
                        key={String(option.value)}
                        className="flex items-center gap-2"
                      >
                        <RadioGroupItem
                          id={`${field.name}-${String(option.value)}`}
                          value={String(option.value)}
                        />

                        <label
                          htmlFor={`${field.name}-${String(option.value)}`}
                          className="text-sm"
                        >
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </RadioGroup>
                )}

                {config.type === "custom" &&
                  config.render?.({
                    field,
                    fieldState,
                    form,
                    config,
                    isSubmitting,
                  })}

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        ))}
      </div>
    </FieldGroup>
  )
}

export default DataForm