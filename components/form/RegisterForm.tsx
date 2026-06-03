"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

import logo from "@/public/img/MainLogo.png";
import googleLogo from "@/public/img/google-logo.png";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="flex h-full w-full items-start justify-center bg-background pt-2 md:pt-4">
      <div className="w-full max-w-105">
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

        <form
          className="space-y-2.5"
          onSubmit={(e) => {
            e.preventDefault();
            console.log("Register");
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="fullName" className="text-sm font-bold text-foreground">
              Họ và tên
            </Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Nhập họ và tên"
              className="h-10 rounded-full border border-background bg-white px-5 text-sm text-foreground shadow-sm placeholder:text-[#b7b7b7] focus-visible:border-primary focus-visible:ring-0"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-bold text-foreground">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Nhập email"
              className="h-10 rounded-full border border-background bg-white px-5 text-sm text-foreground shadow-sm placeholder:text-[#b7b7b7] focus-visible:border-primary focus-visible:ring-0"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm font-bold text-foreground">
              Mật khẩu
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu"
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

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className="text-sm font-bold text-foreground">
              Xác thực mật khẩu
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Nhập lại mật khẩu"
                className="h-10 rounded-full border border-background bg-white px-5 pr-12 text-sm text-foreground shadow-sm placeholder:text-[#b7b7b7] focus-visible:border-primary focus-visible:ring-0"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-4 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center text-foreground outline-none transition-none hover:bg-transparent"
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" strokeWidth={2.5} />
                ) : (
                  <Eye className="h-5 w-5" strokeWidth={2.5} />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="h-10 w-full rounded-xl bg-primary text-sm font-medium text-white shadow-md hover:bg-[#4562f0]"
          >
            Register
          </Button>

          <div className="flex items-center justify-end gap-2 pt-0.5 text-[11px]">
            <span className="font-semibold text-foreground">Have an account? </span>
            <Link href="/login" className="font-semibold text-primary hover:text-[#3155df]">
              Login
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

export default RegisterForm;
