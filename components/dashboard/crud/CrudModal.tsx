"use client"

import type { ComponentType } from "react"

import { Modal } from "@/components/ui/modal"
import type { CrudFormProps } from "./CrudPage"

type CrudModalProps<TData extends object> = {
  open: boolean
  onClose: () => void
  onSubmit: (values: TData) => void
  defaultValues?: Partial<TData>
  isEdit: boolean
  Form: ComponentType<CrudFormProps<TData>>
  entityName?: string
}

export function CrudModal<TData extends object>({
  open,
  onClose,
  onSubmit,
  defaultValues,
  isEdit,
  Form,
  entityName,
}: CrudModalProps<TData>) {
  const mode = isEdit ? "edit" : "create"
  return (
    <Modal open={open} onClose={onClose} title={`${isEdit ? "Edit" : "Create"} ${entityName ?? ""}`}>
      <Form
        mode={mode}
        defaultValues={defaultValues}
        onSubmit={onSubmit}
        onCancel={onClose}
        submitLabel={isEdit ? "Save Changes" : "Create"}
      />
    </Modal>
  )
}