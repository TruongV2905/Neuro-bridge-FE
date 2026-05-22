import React from "react";

function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex h-screen items-center justify-center [background:var(--gradient)] ">
      <section className="mx-auto grid h-5/6 w-2/4 grid-cols-[3fr_4fr] overflow-hidden rounded-[28px] bg-primary shadow-2xl">
        {/* Left side */}
        <div className="relative h-full overflow-hidden bg-[#0f0a29]">
          <video
            className="absolute inset-0 h-full w-full object-cover"
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
        <div className="h-full bg-background flex justify-center items-center">
          {children}
        </div>
      </section>
    </main>
  );
}

export default AuthLayout;
