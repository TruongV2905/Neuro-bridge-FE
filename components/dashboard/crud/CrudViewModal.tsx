"use client";

import type { ReactNode } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type CrudViewModalProps<TData extends object> = {
  open: boolean;
  onClose: () => void;
  record: TData | null;
  title: string;
  render?: (record: TData) => ReactNode;
};

export function CrudViewModal<TData extends object>({
  open,
  onClose,
  record,
  title,
  render,
}: CrudViewModalProps<TData>) {
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) {
          onClose();
        }
      }}
    >
      <DialogContent className="max-h-[90vh] w-[calc(100vw-2rem)] overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
        </DialogHeader>

        <div className="max-h-[calc(90vh-73px)] overflow-y-auto px-6 py-5">
          {record ? (
            render ? (
              render(record)
            ) : (
              <pre className="max-h-[500px] overflow-auto rounded-md bg-muted p-4 text-sm">
                {JSON.stringify(record, null, 2)}
              </pre>
            )
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
