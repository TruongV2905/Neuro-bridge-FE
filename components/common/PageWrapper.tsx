import type { ReactNode } from "react";

interface Props {
  title: string;
  description?: string;
  children: ReactNode;
}

export default function PageWrapper({
  title,
  description,
  children,
}: Props) {
  return (
    <div className="p-6 md:p-8 space-y-6 w-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {title}
        </h1>

        {description && (
          <p className="mt-1 text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>

      <div className="w-full">
        {children}
      </div>
    </div>
  );
} 