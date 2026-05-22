"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

import logo from "@/public/img/LogoFull.png";
import googleLogo from "@/public/img/google-logo.png";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex h-full w-full items-start justify-center bg-background pt-2 md:pt-4">
      <div className="w-full max-w-[420px]">
        <div className="mb-4 flex items-center justify-center gap-2">
          <div className="shrink-0">
            <Image
              src={logo}
              alt="Neuro Bridge logo"
              className="h-full w-full object-contain"
              priority
            />
          </div>
        </div>

        <form
          className="space-y-2.5"
          onSubmit={(e) => {
            e.preventDefault();
            console.log("Login");
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="username" className="text-sm font-bold text-foreground">
              Username
            </Label>
            <Input
              id="username"
              type="text"
              placeholder="Enter your username"
              className="h-10 rounded-full border border-background bg-white px-5 text-sm text-foreground shadow-sm placeholder:text-[#b7b7b7] focus-visible:border-primary focus-visible:ring-0"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm font-bold text-foreground">
              Password
            </Label>

            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="h-10 rounded-full border border-background bg-white px-5 pr-12 text-sm text-foreground shadow-sm placeholder:text-[#b7b7b7] focus-visible:border-primary focus-visible:ring-0"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-4 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center text-foreground outline-none transition-none hover:bg-transparent"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" strokeWidth={2.5} />
                ) : (
                  <Eye className="h-5 w-5" strokeWidth={2.5} />
                )}
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-0.5">
            <button
              type="button"
              className="text-[11px] font-medium text-primary underline hover:text-[#3155df]"
            >
              Forgot Password?
            </button>
          </div>

          <Button
            type="submit"
            className="h-10 w-full rounded-xl bg-primary text-sm font-medium text-white shadow-md hover:bg-[#4562f0]"
          >
            Login
          </Button>

          <div className="flex items-center justify-end gap-2 pt-0.5 text-[11px]">
            <span className="font-semibold text-foreground">Don&apos;t have an account?</span>
            <Link href="/register" className="font-semibold text-primary hover:text-[#3155df]">
              Sign Up
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-foreground" />
            <span className="text-xs font-medium text-foreground">OR</span>
            <div className="h-px flex-1 bg-foreground" />
          </div>

          <Button
            type="button"
            variant="outline"
            className="h-10 w-full rounded-md border border-background bg-white text-sm font-semibold text-[#777] shadow-sm hover:bg-slate-50"
          >
            <Image src={googleLogo} alt="Google" width={24} height={24} />
            Continue with Google
          </Button>
        </form>
      </div>
    </div>
  );
}

export default LoginForm;
