"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import clsx from "clsx";
import logo from "@/public/img/Logo.png"
import Image from "next/image";

type AuthMode = "login" | "register";

const panelVariants = {
  left: { x: "0%" },
  right: { x: "100%" },
};

const formMotion = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -18 },
};



const AuthSplitCard = () => {

  const [mode, setMode] = useState<AuthMode>("login");
  const [showPassword, setShowPassword] = useState(false);

  const isRegister = mode === "register";

  const title = useMemo(
    () => (isRegister ? "Create your account" : "Welcome back"),
    [isRegister],
  );

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[radial-gradient(circle_at_15%_15%,#5f7bff_0%,#3e5ee0_35%,#8b5cf6_65%,#ec4899_100%)] p-4 md:p-6">
      <section className="mx-auto grid w-full max-w-4xl overflow-hidden rounded-[28px] bg-white/95 shadow-2xl md:h-[min(600px,calc(100dvh-2rem))] md:grid-cols-[42%_58%]">
        <div className="relative hidden bg-[#0f0a29] p-4 md:block">
          <div className="relative h-full w-full overflow-hidden rounded-2xl">
            <video
              className="absolute h-full w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
            >
              <source src="/video/auth-bg.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          <motion.div
            className="absolute inset-y-0 w-full"
            animate={isRegister ? "right" : "left"}
            variants={panelVariants}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>

        <div className="relative flex min-h-0 items-center justify-center p-10 md:p-14">
          <div className="flex h-full min-h-0 w-full max-w-md flex-col">
            <div className="flex items-center justify-center gap-2">
              <div className="h-[5em] w-[5em] shrink-0">
                <Image
                  src={logo}
                  alt="Neuro Bridge logo"
                  className="h-full w-full object-contain"
                  priority
                />
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">
                Neuro Bridge
              </p>
            </div>
            <h1 className="text-3xl font-semibold text-slate-900">{title}</h1>


            <div className="mt-2 pr-1">
              <AnimatePresence mode="wait" initial={false}>
                <motion.form
                  key={mode}
                  className="space-y-4"
                  {...formMotion}
                  transition={{ duration: 0.28, ease: "easeOut" }}
                  onSubmit={(e) => e.preventDefault()}
                >
                  {isRegister && (
                    <label className="">
                      <span className="mb-1 block text-sm font-medium text-slate-700">Full name</span>
                      <input
                        className="h-12 w-full rounded-full border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-500"
                        placeholder="Nguyen Van A"
                      />
                    </label>
                  )}

                  

                  <label className="">
                    <span className="mb-1 block text-sm font-medium text-slate-700">Email</span>
                    <input
                      type="email"
                      className="h-12 w-full rounded-full border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-500"
                      placeholder="you@email.com"
                    />
                  </label>

                  <label className="">
                    <span className="mb-1 block text-sm font-medium text-slate-700">Password</span>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        className="h-12 w-full rounded-full border border-slate-200 px-4 pr-11 text-sm outline-none transition focus:border-blue-500"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
                        aria-label="toggle password"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </label>

                  {isRegister && (
                    <label className="">
                      <span className="mb-1 block text-sm font-medium text-slate-700">Confirm password</span>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          className="h-12 w-full rounded-full border border-slate-200 px-4 pr-11 text-sm outline-none transition focus:border-blue-500"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((s) => !s)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
                          aria-label="toggle password"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </label>
                  )}

                  <button
                    className={clsx(
                      "mt-3 h-12 w-full rounded-full text-sm font-semibold text-white transition",
                      isRegister
                        ? "bg-fuchsia-600 hover:bg-fuchsia-500"
                        : "bg-blue-600 hover:bg-blue-500",
                    )}
                  >
                    {isRegister ? "Create Account" : "Login"}
                  </button>
                </motion.form>
              </AnimatePresence>
            </div>

            <div className="mt-4 flex shrink-0 items-center justify-center gap-2 text-sm text-slate-500">
              <span>{isRegister ? "Already have an account?" : "Don't have an account?"}</span>
              <button
                type="button"
                onClick={() => setMode(isRegister ? "login" : "register")}
                className="font-semibold text-blue-600 hover:text-blue-500"
              >
                {isRegister ? "Sign in" : "Sign up"}
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default AuthSplitCard
