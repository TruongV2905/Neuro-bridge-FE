"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const router = useRouter();

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error("[App Error Boundary]", error);
    }
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10 text-foreground">
      <section className="w-full max-w-lg rounded-2xl border bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="h-7 w-7" />
        </div>

        <h1 className="mt-5 text-2xl font-bold tracking-tight">
          Trang này đang gặp lỗi
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {error.message ||
            "Có lỗi xảy ra khi tải dữ liệu. Bạn có thể thử lại mà không bị đưa về trang chủ."}
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button onClick={reset} variant="default">
            <RotateCcw className="h-4 w-4" />
            Thử lại
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Quay lại
          </Button>
        </div>
      </section>
    </main>
  );
}
