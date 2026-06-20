import { cn } from "@/lib/utils";
import { jobPostFieldLabelClassName } from "./form-field-styles";
type FormFieldProps = {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
};
export function FormField({
  label,
  required,
  error,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("group/field", className)}>
      <label className={cn(jobPostFieldLabelClassName, "transition-colors duration-300 group-hover/field:text-indigo-600")}>
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      <div className="relative">{children}</div>
      {error && (
        <p className="mt-2 text-sm text-red-500 animate-in fade-in slide-in-from-top-1 duration-200">
          {error}
        </p>
      )}
    </div>
  );
}