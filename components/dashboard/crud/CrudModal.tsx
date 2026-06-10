"use client";

import type { FieldValues, UseFormReturn } from "react-hook-form";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import type { FieldConfig } from "@/types/dasboard";
import DataForm from "@/components/form/DataForm";

type CrudModalProps<TSubmit extends FieldValues> = {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: TSubmit) => void | Promise<void>;
  isEdit: boolean;
  form: UseFormReturn<TSubmit>;
  fields: FieldConfig<TSubmit>[];
  entityName?: string;
  isSubmitting?: boolean;
};

export function CrudModal<TSubmit extends FieldValues>({
  open,
  onClose,
  onSubmit,
  isEdit,
  form,
  fields,
  entityName,
  isSubmitting = false,
}: CrudModalProps<TSubmit>) {
  const handleSubmit = form.handleSubmit((values) => {
    onSubmit(values);
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) onClose();
      }}
    >
      <DialogContent className="sm:max-w-150">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit" : "Create"} {entityName ?? ""}
          </DialogTitle>
        </DialogHeader>

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

          <Button type="button" disabled={isSubmitting} onClick={handleSubmit}>
            {isSubmitting
              ? "Submitting..."
              : isEdit
                ? "Save Changes"
                : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
