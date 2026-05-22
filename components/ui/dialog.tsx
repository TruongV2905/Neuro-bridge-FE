"use client"

import * as React from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const DialogRoot = Dialog.Root

const DialogTrigger = Dialog.Trigger

const DialogPortal = Dialog.Portal

const DialogClose = Dialog.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof Dialog.Overlay>,
  React.ComponentPropsWithoutRef<typeof Dialog.Overlay>
>(({ className, ...props }, ref) => (
  <Dialog.Overlay
    ref={ref}
    className={cn(
      `
      fixed inset-0
      z-50

      bg-black/25
      backdrop-blur-[2px]

      data-[state=open]:animate-in
      data-[state=closed]:animate-out

      data-[state=open]:fade-in-0
      data-[state=closed]:fade-out-0

      duration-200
      `,
      className
    )}
    {...props}
  />
))

DialogOverlay.displayName = Dialog.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof Dialog.Content>,
  React.ComponentPropsWithoutRef<typeof Dialog.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>

    <DialogOverlay />

    <Dialog.Content
      ref={ref}
      className={cn(
        `
        fixed left-[50%] top-[50%]
        z-50

        w-[92vw]
        max-w-[980px]

        h-[90vh]

        translate-x-[-50%]
        translate-y-[-50%]

        overflow-hidden

        outline-none

        data-[state=open]:animate-in
        data-[state=closed]:animate-out

        data-[state=open]:fade-in-0
        data-[state=closed]:fade-out-0

        data-[state=open]:zoom-in-95
        data-[state=closed]:zoom-out-95

        duration-200
        `,
        className
      )}
      {...props}
    >
      {children}

      <DialogClose
        className="
        absolute right-4 top-4
        z-50

        rounded-lg

        p-2

        text-slate-400

        transition-all

        hover:bg-white/10
        hover:text-white
        "
      >
        <X className="h-4 w-4" />
      </DialogClose>

    </Dialog.Content>

  </DialogPortal>
))

DialogContent.displayName = Dialog.Content.displayName

const DialogTitle = Dialog.Title

export {
    DialogRoot,
    DialogTrigger,
    DialogContent,
    DialogTitle,
    DialogClose,
}