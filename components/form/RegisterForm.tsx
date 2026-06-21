"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { BriefcaseBusiness, UserRound } from "lucide-react";
import gsap from "gsap";

import logo from "@/public/img/MainLogo.png";

import ClientRegisterForm from "./ClientRegisterForm";
import ExpertRegisterForm from "./ExpertRegisterForm";

type RegisterRole = "CLIENT" | "EXPERT";

function RegisterForm() {
  const [role, setRole] = useState<RegisterRole>("CLIENT");

  const indicatorRef = useRef<HTMLSpanElement | null>(null);

  useLayoutEffect(() => {
    if (!indicatorRef.current) return;

    gsap.to(indicatorRef.current, {
      xPercent: role === "EXPERT" ? 100 : 0,
      duration: 0.45,
      ease: "back.out(1.7)",
    });
  }, [role]);

  return (
    <div className="min-h-dvh w-full bg-background px-4 py-4">
      <div className="sticky top-0 z-20 bg-background pb-3">
        <div className="mb-4 flex items-center justify-center gap-2">
          <div className="shrink-0">
            <Image
              src={logo}
              alt="Neuro Bridge logo"
              className="h-13 w-full object-contain"
              priority
            />
          </div>
        </div>

        <div className="relative grid grid-cols-2 rounded-2xl bg-white p-1 shadow-sm">
          {/* Nền xanh trượt qua lại bằng GSAP */}
          <span
            ref={indicatorRef}
            className="pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-xl bg-primary shadow-md"
          />

          <button
            type="button"
            onClick={() => setRole("CLIENT")}
            className={`relative z-10 flex h-12 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors duration-300 ${
              role === "CLIENT"
                ? "text-white"
                : "text-foreground hover:text-primary"
            }`}
          >
            <BriefcaseBusiness className="h-4 w-4" />
            Client
          </button>

          <button
            type="button"
            onClick={() => setRole("EXPERT")}
            className={`relative z-10 flex h-12 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors duration-300 ${
              role === "EXPERT"
                ? "text-white"
                : "text-foreground hover:text-primary"
            }`}
          >
            <UserRound className="h-4 w-4" />
            Expert
          </button>
        </div>
      </div>

      {role === "CLIENT" ? (
        <ClientRegisterForm key="client-register-form" />
      ) : (
        <ExpertRegisterForm key="expert-register-form" />
      )}
    </div>
  );
}

export default RegisterForm;
