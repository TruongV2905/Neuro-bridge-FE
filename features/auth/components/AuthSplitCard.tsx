"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import logo from "@/public/img/Logo.png";
import logoText from "@/public/img/LogoText.png";
import googleLogo from "@/public/img/google-logo.png";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
    <main className="flex h-screen items-center justify-center [background:var(--gradient)] ">
      <section className="mx-auto grid w-full max-w-4xl overflow-hidden rounded-[28px] bg-white/95 shadow-2xl md:h-170 md:grid-cols-[42%_58%]">
        <div className="relative hidden bg-[#0f0a29] md:block">
          <div className="relative h-full w-full overflow-hidden rounded-2xl">
            <video
              className="absolute h-full w-full object-cover transform scale-150"
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

        <div className="relative flex min-h-0 items-center justify-center p-10 md:p-4">
          <div className="flex h-full min-h-0 w-full max-w-md flex-col">
            <div className="flex items-center justify-center gap-2">
              <div className="h-20 w-30 shrink-0">
                <Image
                  src={logo}
                  alt="Neuro Bridge logo"
                  className="h-full w-full object-contain"
                  priority
                />
              </div>
              <div className="h-[7em] w-[20em] shrink-0">
                <Image
                  src={logoText}
                  alt="Neuro Bridge logo"
                  className="h-full w-full object-contain"
                  priority
                />
              </div>
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
                      <span className="mb-1 block text-sm font-medium text-slate-700">
                        Full name
                      </span>
                      <Input
                        className="h-12 rounded-full border-slate-200 px-4 text-sm focus-visible:border-blue-500 focus-visible:ring-0"
                        placeholder="Nguyen Van A"
                      />
                    </label>
                  )}

                  <label className="">
                    <span className="mb-1 block text-sm font-medium text-slate-700">
                      Email
                    </span>
                    <Input
                      type="email"
                      className="h-12 rounded-2xl border-slate-200 px-4 text-sm focus-visible:border-blue-500 focus-visible:ring-0"
                      placeholder="you@email.com"
                    />
                  </label>

                  <label className="">
                    <span className="mb-1 block text-sm font-medium text-slate-700">
                      Password
                    </span>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        className="h-12 rounded-2xl border-slate-200 px-4 pr-11 text-sm focus-visible:border-blue-500 focus-visible:ring-0"
                        placeholder="••••••••"
                      />
                      <Button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full text-slate-500 hover:bg-transparent hover:text-slate-700"
                        aria-label="toggle password"
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </Button>
                    </div>
                  </label>

                  {isRegister && (
                    <label className="">
                      <span className="mb-1 block text-sm font-medium text-slate-700">
                        Confirm password
                      </span>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          className="h-12 rounded-full border-slate-200 px-4 pr-11 text-sm focus-visible:border-blue-500 focus-visible:ring-0"
                          placeholder="••••••••"
                        />
                        <Button
                          type="button"
                          onClick={() => setShowPassword((s) => !s)}
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full text-slate-500 hover:bg-transparent hover:text-slate-700"
                          aria-label="toggle password"
                        >
                          {showPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </Button>
                      </div>
                    </label>
                  )}

                  <Button
                    type="submit"
                    variant="default"
                    className={`mt-3 h-12 w-full rounded-2xl text-sm font-semibold text-white transition ${
                      isRegister
                        ? "bg-fuchsia-600 hover:bg-fuchsia-500"
                        : "bg-blue-600 hover:bg-blue-500"
                    }`}
                  >
                    {isRegister ? "Create Account" : "Login"}
                  </Button>

                  <div className="mt-2 flex items-center gap-4">
                    <div className="h-px flex-1 bg-slate-300" />
                    <span className="text-sm font-semibold text-slate-600">
                      OR
                    </span>
                    <div className="h-px flex-1 bg-slate-300" />
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 w-full rounded-2xl border-slate-300 bg-white text-xl font-semibold text-slate-500 hover:bg-slate-50"
                  >
                    <Image
                      src={googleLogo}
                      alt="Google"
                      width={28}
                      height={28}
                    />
                    Continue with Google
                  </Button>
                </motion.form>
              </AnimatePresence>
            </div>

            <div className="mt-4 flex shrink-0 items-center justify-center gap-2 text-sm text-slate-500">
              <span>
                {isRegister
                  ? "Already have an account?"
                  : "Don't have an account?"}
              </span>
              <Button
                type="button"
                onClick={() => setMode(isRegister ? "login" : "register")}
                variant="link"
                className="h-auto p-0 font-semibold text-blue-600 hover:text-blue-500"
              >
                {isRegister ? "Sign in" : "Sign up"}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default AuthSplitCard;
