"use client"

import { AlertTriangle } from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type ConfirmActionDialogProps = {
  open: boolean
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  loading?: boolean
  variant?: "default" | "danger"
  onOpenChange: (open: boolean) => void
  onConfirm: () => void | Promise<void>
}

export function ConfirmActionDialog({
  open,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  loading = false,
  variant = "default",
  onOpenChange,
  onConfirm,
}: ConfirmActionDialogProps) {
  const isDanger = variant === "danger"

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-[420px] rounded-2xl">
        <AlertDialogHeader>
          <div
            className={`mb-2 flex h-12 w-12 items-center justify-center rounded-full ${
              isDanger
                ? "bg-red-100 text-red-600"
                : "bg-primary/10 text-primary"
            }`}
          >
            <AlertTriangle className="h-6 w-6" />
          </div>

          <AlertDialogTitle className="text-lg font-semibold text-slate-900">
            {title}
          </AlertDialogTitle>

          <AlertDialogDescription className="text-sm leading-6 text-slate-500">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-4 gap-2 sm:gap-2">
          <AlertDialogCancel disabled={loading}>
            {cancelText}
          </AlertDialogCancel>

          <AlertDialogAction
            disabled={loading}
            onClick={(event) => {
              event.preventDefault()
              void onConfirm()
            }}
            className={
              isDanger
                ? "bg-red-600 text-white hover:bg-red-700"
                : undefined
            }
          >
            {loading ? "Processing..." : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}