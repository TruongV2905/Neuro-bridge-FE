"use client";

import type { FieldValues, UseFormReturn } from "react-hook-form";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import type { FieldConfig } from "@/types/dasboard";
import DataForm from "@/components/form/DataForm";

type CrudModalMode = "create" | "edit";

type CrudModalProps<TSubmit extends FieldValues> = {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: TSubmit) => void | Promise<void>;

  mode: CrudModalMode;

  form: UseFormReturn<TSubmit>;
  fields: FieldConfig<TSubmit>[];

  entityName?: string;
  isSubmitting?: boolean;

  title?: string;
  description?: string;
};

export function CrudModal<TSubmit extends FieldValues>({
  open,
  onClose,
  onSubmit,
  mode,
  form,
  fields,
  entityName,
  isSubmitting = false,
  title,
  description,
}: CrudModalProps<TSubmit>) {
  const isEdit = mode === "edit";

  const modalTitle =
    title ?? `${isEdit ? "Edit" : "Create"} ${entityName ?? "Item"}`;

  const modalDescription =
    description ??
    (isEdit
      ? `Update ${entityName ?? "item"} information.`
      : `Create a new ${entityName ?? "item"}.`);

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values);
  });

  const handleOpenChange = (value: boolean) => {
    if (isSubmitting) return;

    if (!value) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-150">
        <DialogHeader>
          <DialogTitle>{modalTitle}</DialogTitle>
          <DialogDescription>{modalDescription}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <DataForm form={form} fields={fields} isSubmitting={isSubmitting} />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Submitting..."
                : isEdit
                  ? "Save Changes"
                  : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
