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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {title}
        </h1>

        {description && (
          <p className="mt-1 text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>

      {children}
    </div>
  );
}