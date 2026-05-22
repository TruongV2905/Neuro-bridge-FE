"use client";

import { useState } from "react";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";

import logo from "@/public/img/LogoFull.png";
import googleLogo from "@/public/img/google-logo.png";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex h-full w-full items-center justify-center bg-background px-12">
      <div className="w-full max-w-126.25">
        {/* Logo */}
        <div className="mb-7 flex items-center justify-center gap-2">
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
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            console.log("Login");
          }}
        >
          {/* Username */}
          <div className="space-y-2">
            <Label
              htmlFor="username"
              className="text-base font-bold text-foreground"
            >
              Username
            </Label>

            <Input
              id="username"
              type="text"
              placeholder="Enter your username"
              className="h-14.5 rounded-full border border-background bg-white px-8 text-base text-foreground shadow-sm placeholder:text-[#b7b7b7] focus-visible:border-primary focus-visible:ring-0"
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-base font-bold text-foreground"
            >
              Password
            </Label>

            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="h-14.5 rounded-full border border-background bg-white px-8 pr-14 text-base text-foreground shadow-sm placeholder:text-[#b7b7b7] focus-visible:border-primary focus-visible:ring-0"
              />

              {/* Không dùng shadcn Button ở đây để tránh bị giật */}
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center text-foreground outline-none transition-none hover:bg-transparent"
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

          {/* Forgot password */}
          <div className="flex justify-end pt-1">
            <button
              type="button"
              className="text-sm font-medium text-primary hover:text-[#3155df] underline"
            >
              Forgot Password ?
            </button>
          </div>

          {/* Login button */}
          <Button
            type="submit"
            className="h-14.5 w-full rounded-2xl bg-primary text-base font-medium text-white shadow-md hover:bg-[#4562f0]"
          >
            Login
          </Button>

          {/* Sign up */}
          <div className="flex items-center justify-center gap-2 pt-1 text-sm">
            <span className="font-semibold text-foreground">
              Don’t have a account?
            </span>

            <button
              type="button"
              className="font-semibold text-primary hover:text-[#3155df]"
            >
              Sign Up
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-foreground" />
            <span className="text-sm font-medium text-foreground">OR</span>
            <div className="h-px flex-1 bg-foreground" />
          </div>

          {/* Google button */}
          <Button
            type="button"
            variant="outline"
            className="h-14.5 w-full rounded-xl border border-background bg-white text-lg font-bold text-[#777] shadow-sm hover:bg-slate-50"
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
