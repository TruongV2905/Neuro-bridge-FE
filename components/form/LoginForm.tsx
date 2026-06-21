"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

import logo from "@/public/img/MainLogo.png";
import googleLogo from "@/public/img/google-logo.png";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormValues } from "@/schemas/loginSchema";
import { useLoginMutation } from "@/services/authentication.service";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { login } from "@/redux/features/userSlice";
import { useRouter } from "next/navigation";
function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLoginMutation();
  const dispatch = useDispatch();
  const router = useRouter();
  const { control, handleSubmit } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    console.log("Login data:", data);
    loginMutation.mutate(
      { data },
      {
        onSuccess: (response) => {
          toast.success("Login successful! Welcome back.");
          const { refreshToken, accessToken, ...userData } = response.result;
          localStorage.setItem("accessToken", accessToken || "");
          localStorage.setItem("refreshToken", refreshToken || "");
          dispatch(login(userData));
          router.push("/");
        },
        onError: (error) => {
          console.error("Login failed:", error);
          toast.error(
            error?.response?.data?.message || "Login failed. Please try again.",
          );
        },
      },
    );
  };

  return (
    <div className="flex h-full w-full items-center justify-center bg-background">
      <div className="w-full">
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

        <FieldGroup className="gap-3">
          <Controller
            name="email"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="email" className="text-sm font-light">
                  Email
                </FieldLabel>

                <Input
                  {...field}
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  aria-invalid={fieldState.invalid}
                  className=" rounded-full border border-background bg-white px-5 py-8 text-sm text-foreground shadow-sm placeholder:text-[#b7b7b7] focus-visible:border-primary focus-visible:ring-0"
                />

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="password"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="password" className="text-sm font-light">
                  Password
                </FieldLabel>

                <div className="relative">
                  <Input
                    {...field}
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    aria-invalid={fieldState.invalid}
                    className="py-8 rounded-full border border-background bg-white px-5 pr-12 text-sm text-foreground shadow-sm placeholder:text-[#b7b7b7] focus-visible:border-primary focus-visible:ring-0"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center text-foreground outline-none transition-none hover:bg-transparent"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff
                        className="h-5 w-5"
                        color={fieldState.invalid ? "#ef4444" : undefined}
                        strokeWidth={2}
                      />
                    ) : (
                      <Eye
                        className="h-5 w-5"
                        color={fieldState.invalid ? "#ef4444" : undefined}
                        strokeWidth={2}
                      />
                    )}
                  </button>
                </div>

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <div className="flex justify-end">
            <button
              type="button"
              className="text-[11px] font-medium text-primary underline hover:text-[#3155df]"
            >
              Forgot Password?
            </button>
          </div>

          <Button
            type="button"
            onClick={handleSubmit(onSubmit)}
            className="h-12 w-full rounded-xl bg-primary text-sm font-medium text-white shadow-md hover:bg-[#4562f0]"
          >
            Login
          </Button>

          <div className="flex items-center justify-end gap-2 pt-0.5 text-[11px]">
            <span className="font-light text-foreground">
              Don&apos;t have an account?
            </span>

            <Link
              href="/register"
              className="font-semibold text-primary hover:text-[#3155df]"
            >
              Sign Up
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <div className="h-[0.5px] flex-1 bg-foreground" />
            <span className="text-xs font-medium text-foreground">OR</span>
            <div className="h-[0.5px] flex-1 bg-foreground" />
          </div>

          <Button
            type="button"
            variant="outline"
            className="h-12 w-full rounded-xl border border-background bg-white text-sm font-semibold text-[#777] shadow-sm hover:bg-slate-50"
          >
            <Image src={googleLogo} alt="Google" width={24} height={24} />
            Continue with Google
          </Button>
        </FieldGroup>
      </div>
    </div>
  );
}

export default LoginForm;
