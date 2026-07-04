"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CalendarIcon, Eye, EyeOff } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";

import googleLogo from "@/public/img/google-logo.png";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  RegisterClientFormValues,
  RegisterClientPayload,
  registerClientSchema,
} from "@/schemas/user.schema";
import AvatarDropzoneField from "../fields/AvatarDropzoneField";
import { useRegisterClientMutation } from "@/services/authentication.service";
import { uploadFile } from "@/utils/uploadFile";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import moment from "moment";
import { useRouter } from "next/navigation";

function ClientRegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string>("");

  const { control, handleSubmit, reset } = useForm<RegisterClientFormValues>({
    resolver: zodResolver(registerClientSchema),
    defaultValues: {
      avatarUrl: "",
      fullName: "",
      gender: "MALE",
      address: "",
      dateOfBirth: "",
      phone: "",
      email: "",
      password: "",
      confirmPassword: "",
      companyName: "",
      industry: "",
      companyDescription: "",
    },
  });
  const navigate = useRouter();
  const fullName = useWatch({
    control,
    name: "fullName",
  });

  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const getFallbackName = (name?: string) => {
    if (!name?.trim()) return "CL";

    return name
      .trim()
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const registerClientMutation = useRegisterClientMutation();

  const onSubmit = async (data: RegisterClientFormValues) => {
    try {
      const { avatarUrl } = data;

      let uploadedAvatarUrl = "";

      if (avatarUrl instanceof File) {
        uploadedAvatarUrl = await uploadFile(avatarUrl, "avatars");
      } else if (typeof avatarUrl === "string") {
        uploadedAvatarUrl = avatarUrl;
      }

      const payload: RegisterClientPayload = {
        fullName: data.fullName,
        gender: data.gender,
        address: data.address,
        dateOfBirth: data.dateOfBirth,
        phone: data.phone,
        email: data.email,
        password: data.password,
        companyName: data.companyName,
        industry: data.industry,
        companyDescription: data.companyDescription,
        avatarUrl: uploadedAvatarUrl,
      };

      registerClientMutation.mutate(
        { data: payload },
        {
          onSuccess: (response) => {
            toast.success(response.result || "Client registered successfully!");
            reset();
            navigate.push("/login");
          },
          onError: (error) => {
            toast.error(
              error?.response?.data?.message ||
                "Register client failed. Please try again.",
            );
          },
        },
      );
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };
  return (
    <FieldGroup className="gap-3 pb-4">
      <Controller
        name="avatarUrl"
        control={control}
        render={({ field, fieldState }) => (
          <AvatarDropzoneField
            field={field}
            error={fieldState.error}
            invalid={fieldState.invalid}
            avatarPreview={avatarPreview}
            setAvatarPreview={setAvatarPreview}
            fullName={getFallbackName(fullName)}
          />
        )}
      />

      <Controller
        name="fullName"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="clientFullName" className="text-sm font-light">
              Full name
            </FieldLabel>

            <Input
              {...field}
              id="clientFullName"
              placeholder="Enter your full name"
              aria-invalid={fieldState.invalid}
              className="rounded-full border border-background bg-white px-5 py-8 text-sm text-foreground shadow-sm placeholder:text-[#b7b7b7] focus-visible:border-primary focus-visible:ring-0"
            />

            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="email"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="clientEmail" className="text-sm font-light">
              Email
            </FieldLabel>

            <Input
              {...field}
              id="clientEmail"
              type="email"
              placeholder="Enter your email"
              aria-invalid={fieldState.invalid}
              className="rounded-full border border-background bg-white px-5 py-8 text-sm text-foreground shadow-sm placeholder:text-[#b7b7b7] focus-visible:border-primary focus-visible:ring-0"
            />

            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="phone"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="clientPhone" className="text-sm font-light">
              Phone
            </FieldLabel>

            <Input
              {...field}
              id="clientPhone"
              placeholder="Enter your phone number"
              aria-invalid={fieldState.invalid}
              className="rounded-full border border-background bg-white px-5 py-8 text-sm text-foreground shadow-sm placeholder:text-[#b7b7b7] focus-visible:border-primary focus-visible:ring-0"
            />

            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="address"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="clientAddress" className="text-sm font-light">
              Address
            </FieldLabel>

            <Input
              {...field}
              id="clientAddress"
              placeholder="Enter your address"
              aria-invalid={fieldState.invalid}
              className="rounded-full border border-background bg-white px-5 py-8 text-sm text-foreground shadow-sm placeholder:text-[#b7b7b7] focus-visible:border-primary focus-visible:ring-0"
            />

            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <div className="grid grid-cols-2 gap-2">
        <Controller
          name="gender"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="clientGender" className="text-sm font-light">
                Gender
              </FieldLabel>

              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  id="clientGender"
                  aria-invalid={fieldState.invalid}
                  className="h-auto rounded-full border border-background bg-white px-5 py-8 text-sm text-foreground shadow-sm focus:border-primary focus:ring-0"
                >
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>

                <SelectContent
                  position="popper"
                  side="bottom"
                  align="start"
                  sideOffset={0}
                  className="z-50"
                >
                  <SelectItem value="MALE" className="p-3">
                    Male
                  </SelectItem>
                  <SelectItem value="FEMALE" className="p-3">
                    Female
                  </SelectItem>
                  <SelectItem value="OTHER" className="p-3">
                    Other
                  </SelectItem>
                </SelectContent>
              </Select>

              {fieldState.invalid && fieldState.error && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Controller
          name="dateOfBirth"
          control={control}
          render={({ field, fieldState }) => {
            const selectedDate = field.value
              ? moment(field.value, "YYYY-MM-DD").toDate()
              : undefined;

            return (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel
                  htmlFor="dateOfBirth"
                  className="text-sm font-light"
                >
                  Date of birth
                </FieldLabel>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      id="dateOfBirth"
                      aria-invalid={fieldState.invalid}
                      className={`h-auto w-full justify-start rounded-full border border-background bg-white px-5 py-5.5 text-left text-sm font-normal text-foreground shadow-sm hover:bg-white focus:border-primary focus:ring-0 ${
                        fieldState.invalid ? "border-red-500" : ""
                      }`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />

                      {selectedDate ? (
                        <span>{moment(selectedDate).format("LL")}</span>
                      ) : (
                        <span className="text-muted-foreground">
                          Pick a date
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      defaultMonth={selectedDate}
                      onSelect={(date) => {
                        field.onChange(
                          date ? moment(date).format("YYYY-MM-DD") : "",
                        );
                      }}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                    />
                  </PopoverContent>
                </Popover>

                {fieldState.invalid && fieldState.error && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            );
          }}
        />
      </div>

      <Controller
        name="companyName"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="companyName" className="text-sm font-light">
              Company name
            </FieldLabel>

            <Input
              {...field}
              id="companyName"
              placeholder="Enter your company name"
              aria-invalid={fieldState.invalid}
              className="rounded-full border border-background bg-white px-5 py-8 text-sm text-foreground shadow-sm placeholder:text-[#b7b7b7] focus-visible:border-primary focus-visible:ring-0"
            />

            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="industry"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="industry" className="text-sm font-light">
              Industry
            </FieldLabel>

            <Input
              {...field}
              id="industry"
              placeholder="Example: Software Development"
              aria-invalid={fieldState.invalid}
              className="rounded-full border border-background bg-white px-5 py-8 text-sm text-foreground shadow-sm placeholder:text-[#b7b7b7] focus-visible:border-primary focus-visible:ring-0"
            />

            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="companyDescription"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel
              htmlFor="companyDescription"
              className="text-sm font-light"
            >
              Company description
            </FieldLabel>

            <Textarea
              {...field}
              id="companyDescription"
              placeholder="Describe your company"
              aria-invalid={fieldState.invalid}
              className="min-h-28 resize-none rounded-3xl border border-background bg-white px-5 py-4 text-sm text-foreground shadow-sm placeholder:text-[#b7b7b7] focus-visible:border-primary focus-visible:ring-0"
            />

            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="password"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="clientPassword" className="text-sm font-light">
              Password
            </FieldLabel>

            <div className="relative">
              <Input
                {...field}
                id="clientPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                aria-invalid={fieldState.invalid}
                className="rounded-full border border-background bg-white px-5 py-8 pr-12 text-sm text-foreground shadow-sm placeholder:text-[#b7b7b7] focus-visible:border-primary focus-visible:ring-0"
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

            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="confirmPassword"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel
              htmlFor="clientConfirmPassword"
              className="text-sm font-light"
            >
              Confirm password
            </FieldLabel>

            <div className="relative">
              <Input
                {...field}
                id="clientConfirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Enter your password again"
                aria-invalid={fieldState.invalid}
                className="rounded-full border border-background bg-white px-5 py-8 pr-12 text-sm text-foreground shadow-sm placeholder:text-[#b7b7b7] focus-visible:border-primary focus-visible:ring-0"
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-4 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center text-foreground outline-none transition-none hover:bg-transparent"
                tabIndex={-1}
              >
                {showConfirmPassword ? (
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

            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Button
        type="button"
        onClick={handleSubmit(onSubmit)}
        disabled={registerClientMutation.isPending}
        className="h-12 w-full rounded-xl bg-primary text-sm font-medium text-white shadow-md hover:bg-[#4562f0]"
      >
        {registerClientMutation.isPending
          ? "Registering..."
          : "Register Client"}
      </Button>

      <div className="flex items-center justify-end gap-2 pt-0.5 text-[11px]">
        <span className="font-light text-foreground">
          Already have an account?
        </span>

        <Link
          href="/login"
          className="font-semibold text-primary hover:text-[#3155df]"
        >
          Login
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
        Sign up with Google
      </Button>
    </FieldGroup>
  );
}

export default ClientRegisterForm;
