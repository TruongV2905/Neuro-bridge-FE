import React from "react";
import { AuthFormTransition } from "@/features/auth";

function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex min-h-screen items-center justify-center p-6 [background:var(--gradient)] md:p-10">
      <section className="mx-auto grid w-full max-w-[45vw] grid-cols-1 overflow-hidden rounded-[24px] bg-primary shadow-2xl md:min-h-[640px] md:grid-cols-[2fr_3fr]">
        {/* Left side */}
        <div className="relative hidden h-full overflow-hidden bg-[#0f0a29] md:block">
          <video
            className="absolute inset-0 h-full w-full object-cover transform scale-120"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          >
            <source src="/video/auth-bg.mp4" type="video/mp4" />
          </video>
        </div>
        {/* Right side */}
        <div className="flex h-full items-start justify-center overflow-hidden bg-background px-6 py-8 md:px-10">
          <AuthFormTransition>{children}</AuthFormTransition>
        </div>
      </section>
    </main>
  );
}

export default AuthLayout;
