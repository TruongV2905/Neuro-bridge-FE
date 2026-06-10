"use client";

import { useEffect, useRef } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import { MultiSelect } from "@/components/ui/multi-select";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import type { FilterConfig } from "@/types/dasboard";

type DateRangeValue = {
  from?: Date;
  to?: Date;
};

type NumberRangeValue = {
  min?: number;
  max?: number;
};

type FilterRendererProps<TFilter extends object = Record<string, unknown>> = {
  config: FilterConfig<TFilter>;
  value?: unknown;
  onChange: (value: unknown) => void;
};

export function FilterRenderer<
  TFilter extends object = Record<string, unknown>,
>({ config, value, onChange }: FilterRendererProps<TFilter>) {
  switch (config.type) {
    case "text":
      return (
        <DebouncedTextInput
          value={typeof value === "string" ? value : ""}
          placeholder={config.placeholder}
          onChange={onChange}
        />
      );

    case "number":
      return (
        <Input
          type="number"
          placeholder={config.placeholder}
          value={
            typeof value === "number" || typeof value === "string" ? value : ""
          }
          min={config.min}
          max={config.max}
          step={config.step}
          onChange={(event) => {
            const raw = event.target.value;
            onChange(raw === "" ? undefined : Number(raw));
          }}
          className="h-9"
        />
      );

    case "select":
      return (
        <Select
          value={
            value === undefined || value === null || value === ""
              ? "all"
              : String(value)
          }
          onValueChange={(selectedValue) => {
            if (selectedValue === "all") {
              onChange("all");
              return;
            }

            const selectedOption = config.options?.find(
              (option) => String(option.value) === selectedValue,
            );

            onChange(selectedOption?.value ?? selectedValue);
          }}
        >
          <SelectTrigger className="h-9 w-full">
            <SelectValue placeholder={config.placeholder ?? config.label} />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">All</SelectItem>

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
      );

    case "multi-select":
      return (
        <MultiSelect
          options={(config.options ?? []).map((option) => ({
            label: option.label,
            value: String(option.value),
          }))}
          defaultValue={Array.isArray(value) ? value.map(String) : []}
          onValueChange={(values) => {
            const originalValues = values.map((selectedValue) => {
              const selectedOption = config.options?.find(
                (option) => String(option.value) === selectedValue,
              );

              return selectedOption?.value ?? selectedValue;
            });

            onChange(originalValues);
          }}
          placeholder={config.placeholder ?? config.label}
        />
      );

    case "number-range": {
      const current = isNumberRangeValue(value) ? value : {};
      
      const minLimit = config.min ?? 0;
      const maxLimit = config.max ?? 100;
      const step = config.step ?? 1;

      const sliderValue = [current.min ?? minLimit, current.max ?? maxLimit];

      return (
        <div className="space-y-3">
          <Slider
            min={minLimit}
            max={maxLimit}
            step={step}
            value={sliderValue}
            onValueChange={(range) => {
              onChange({
                min: range[0],
                max: range[1],
              });
            }}
          />

          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={current.min ?? ""}
              min={minLimit}
              max={maxLimit}
              step={step}
              onChange={(event) => {
                const raw = event.target.value;

                onChange({
                  ...current,
                  min: raw === "" ? undefined : Number(raw),
                });
              }}
              className="h-9"
            />

            <Input
              type="number"
              placeholder="Max"
              value={current.max ?? ""}
              min={minLimit}
              max={maxLimit}
              step={step}
              onChange={(event) => {
                const raw = event.target.value;

                onChange({
                  ...current,
                  max: raw === "" ? undefined : Number(raw),
                });
              }}
              className="h-9"
            />
          </div>
        </div>
      );
    }

    case "date":
      return (
        <DatePicker
          value={value instanceof Date ? value : undefined}
          onChange={onChange}
          placeholder={config.placeholder ?? config.label}
        />
      );

    case "date-range":
      return (
        <DateRangePicker
          value={isDateRangeValue(value) ? value : {}}
          onChange={onChange}
          placeholder={config.placeholder ?? config.label}
        />
      );

    case "boolean":
      return (
        <Select
          value={
            value === undefined || value === null || value === ""
              ? "all"
              : String(value)
          }
          onValueChange={(selectedValue) => {
            if (selectedValue === "all") {
              onChange("all");
              return;
            }

            onChange(selectedValue === "true");
          }}
        >
          <SelectTrigger className="h-9 w-full">
            <SelectValue placeholder={config.placeholder ?? config.label} />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="true">Yes</SelectItem>
            <SelectItem value="false">No</SelectItem>
          </SelectContent>
        </Select>
      );

    default:
      return null;
  }
}

type DebouncedTextInputProps = {
  value: string;
  placeholder?: string;
  delay?: number;
  onChange: (value: string) => void;
};

function DebouncedTextInput({
  value,
  placeholder,
  delay = 400,
  onChange,
}: DebouncedTextInputProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (inputRef.current && inputRef.current.value !== value) {
      inputRef.current.value = value;
    }
  }, [value]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <Input
      ref={inputRef}
      defaultValue={value}
      placeholder={placeholder}
      className="h-9"
      onChange={(event) => {
        const nextValue = event.target.value;

        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }

        timerRef.current = setTimeout(() => {
          onChangeRef.current(nextValue);
        }, delay);
      }}
    />
  );
}

type DatePickerProps = {
  value?: Date;
  onChange: (value?: Date) => void;
  placeholder?: string;
};

function DatePicker({ value, onChange, placeholder }: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "h-9 w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, "dd/MM/yyyy") : (placeholder ?? "Pick a date")}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={value} onSelect={onChange} />
      </PopoverContent>
    </Popover>
  );
}

type DateRangePickerProps = {
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
  placeholder?: string;
};

function DateRangePicker({
  value,
  onChange,
  placeholder,
}: DateRangePickerProps) {
  const label =
    value.from && value.to
      ? `${format(value.from, "dd/MM/yyyy")} - ${format(
          value.to,
          "dd/MM/yyyy",
        )}`
      : value.from
        ? format(value.from, "dd/MM/yyyy")
        : (placeholder ?? "Pick date range");

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "h-9 w-full justify-start text-left font-normal",
            !value.from && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {label}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={{
            from: value.from,
            to: value.to,
          }}
          onSelect={(range) => {
            onChange({
              from: range?.from,
              to: range?.to,
            });
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

function isDateRangeValue(value: unknown): value is DateRangeValue {
  if (!value || typeof value !== "object") return false;

  return "from" in value || "to" in value;
}

function isNumberRangeValue(value: unknown): value is NumberRangeValue {
  if (!value || typeof value !== "object") return false;

  return "min" in value || "max" in value;
}
