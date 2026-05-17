"use client";

import { Modal } from "@/components/ui/modal"
import { FormBuilder } from "@/components/form/FormBuilder"
import { Button } from "@/components/ui/button"
import type { FieldConfig } from "@/types/crud"

interface Props<T extends object> {
  open: boolean
  onClose: () => void
  onSubmit: () => void
  fields: FieldConfig[]
  formData: Partial<T>
  setFormData: React.Dispatch<React.SetStateAction<Partial<T>>>
  isEdit: boolean
}


export function CrudModal<T extends object>({
  open,
  onClose,
  onSubmit,
  fields,
  formData,
  setFormData,
  isEdit,
}: Props<T>) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit" : "Create"}
    >
      <FormBuilder
        fields={fields}
        formData={formData}
        onChange={(name, value) =>
          setFormData((prev) => ({ ...prev, [name]: value }))
        }
      />

      <div className="mt-6 flex justify-end gap-2 border-t pt-4">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={onSubmit}>
          {isEdit ? "Update" : "Create"}
        </Button>
      </div>
    </Modal>
  )
}