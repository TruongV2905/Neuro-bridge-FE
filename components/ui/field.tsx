import * as React from "react"
import { FieldError as FormError } from "react-hook-form"
import { cn } from "@/lib/utils" // Thay đổi đường dẫn nếu hàm cn của bạn ở @/utils

const FieldGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("space-y-4 w-full", className)} {...props} />
))
FieldGroup.displayName = "FieldGroup"

const Field = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col gap-2 b-white data-[invalid=true]:text-destructive",
      className
    )}
    {...props}
  />
))
Field.displayName = "Field"

const FieldLabel = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "text-sm font-medium leading-none text-foreground cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      className
    )}
    {...props}
  />
))
FieldLabel.displayName = "FieldLabel"

interface FieldErrorProps extends React.HTMLAttributes<HTMLParagraphElement> {
  errors?: (FormError | undefined)[]
}

const FieldError = React.forwardRef<HTMLParagraphElement, FieldErrorProps>(
  ({ className, errors, children, ...props }, ref) => {
    const configError = errors?.find((e) => e?.message)
    const errorMessage = configError ? configError.message : children

    if (!errorMessage) return null

    return (
      <p
        ref={ref}
        className={cn("text-xs font-medium text-destructive", className)}
        {...props}
      >
        {errorMessage}
      </p>
    )
  }
)
FieldError.displayName = "FieldError"

export { FieldGroup, Field, FieldLabel, FieldError }