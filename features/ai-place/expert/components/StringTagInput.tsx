"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type StringTagInputProps = {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder: string;
  disabled?: boolean;
  id: string;
};

export function StringTagInput({
  value,
  onChange,
  placeholder,
  disabled = false,
  id,
}: StringTagInputProps) {
  const [pendingValue, setPendingValue] = useState("");

  const addValue = () => {
    const normalizedValue = pendingValue.trim();

    if (
      !normalizedValue ||
      value.some((item) => item.toLocaleLowerCase() === normalizedValue.toLocaleLowerCase())
    ) {
      return;
    }

    onChange([...value, normalizedValue]);
    setPendingValue("");
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          id={id}
          value={pendingValue}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(event) => setPendingValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addValue();
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          disabled={disabled || !pendingValue.trim()}
          onClick={addValue}
        >
          <Plus />
          Add
        </Button>
      </div>

      {value.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {value.map((item) => (
            <span
              key={item}
              className="inline-flex max-w-full items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-800"
            >
              <span className="truncate">{item}</span>
              <button
                type="button"
                disabled={disabled}
                aria-label={`Remove ${item}`}
                className="rounded-full p-0.5 hover:bg-indigo-100 disabled:cursor-not-allowed"
                onClick={() => onChange(value.filter((current) => current !== item))}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className="text-xs text-slate-500">No items added yet.</p>
      )}
    </div>
  );
}
