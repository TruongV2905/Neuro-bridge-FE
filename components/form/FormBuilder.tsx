"use client";

import type { FieldConfig } from "@/types/crud"
import { Input } from "@/components/ui/input"
import { DatePicker } from "@/components/ui/date-picker"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"

interface Props<T extends Record<string, unknown>> {
  fields: FieldConfig[]
  formData: T
  onChange: (name: keyof T, value: unknown) => void
}

const spanClassMap: Record<number, string> = {
  1: "col-span-1",
  2: "col-span-2",
  3: "col-span-3",
  4: "col-span-4",
  5: "col-span-5",
  6: "col-span-6",
  7: "col-span-7",
  8: "col-span-8",
  9: "col-span-9",
  10: "col-span-10",
  11: "col-span-11",
  12: "col-span-12",
}

export function FormBuilder<T extends Record<string, unknown>>({
  fields,
  formData,
  onChange,
}: Props<T>) {
  return (
    <div className="grid grid-cols-12 gap-4">
      {fields.map((field) => {
        const span = field.span || 12

        return (
          <div key={field.name} className={spanClassMap[span]}>
            <label className="text-sm mb-1 block">{field.label}</label>

            {field.type === "text" && (
              <Input
                value={(formData[field.name] ?? "") as string}
                onChange={(e) =>
                  onChange(field.name as keyof T, e.target.value)
                }
              />
            )}

            {field.type === "date" && (
              <DatePicker
                value={(formData[field.name] ?? "") as string}
                onChange={(val) =>
                  onChange(field.name as keyof T, val)
                }
              />
            )}

            {field.type === "select" && (
              <Select
                value={(formData[field.name] ?? "") as string}
                onValueChange={(value) =>
                  onChange(field.name as keyof T, value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>

                <SelectContent>
                  {field.options?.map((opt) => (
                    <SelectItem key={opt.value} value={String(opt.value)}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        )
      })}
      
      
    </div>
  )
}