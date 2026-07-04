"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CalendarIcon, Eye, EyeOff } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import moment from "moment";

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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

import AvatarDropzoneField from "../fields/AvatarDropzoneField";

import {
  RegisterExpertFormValues,
  RegisterExpertPayload,
  registerExpertSchema,
} from "@/schemas/user.schema";

// sửa lại path này theo project của bạn
import { uploadFile } from "@/utils/uploadFile";
import { useRegisterExpertMutation } from "@/services/authentication.service";
import { useRouter } from "next/navigation";
import { useInfiniteGetAllSkills } from "@/services/skill.service";
import { MultiSelect, MultiSelectOption } from "../ui/multi-select";
import { useDebounce } from "@/hooks/useDebounce";
import type { SkillResponse } from "@/types/skill.types";

function ExpertRegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [skillSearch, setSkillSearch] = useState("");

  const debouncedSkillSearch = useDebounce(skillSearch, 400);
  const registerExpertMutation = useRegisterExpertMutation();

  const navigate = useRouter();
  const { control, handleSubmit, reset } = useForm<RegisterExpertFormValues>({
    resolver: zodResolver(registerExpertSchema),
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
      skillIds: [],
    },
  });

  const skillsQuery = useInfiniteGetAllSkills({
    size: 10,
    search: debouncedSkillSearch,
    sortBy: "skillName",
    direction: "ASCENDING",
  });

  const skillOptions = useMemo<MultiSelectOption[]>(() => {
    const skills =
      skillsQuery.data?.pages.flatMap((page) => page.result.data) ?? [];

    const skillMap = new Map<number, SkillResponse>();

    skills.forEach((skill: SkillResponse) => {
      skillMap.set(skill.id, skill);
    });

    return Array.from(skillMap.values()).map((skill) => ({
      label: skill.skillName,
      value: String(skill.id),
    }));
  }, [skillsQuery.data?.pages]);
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
    if (!name?.trim()) return "EX";

    return name
      .trim()
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const onSubmit = async (data: RegisterExpertFormValues) => {
    try {
      const { avatarUrl } = data;

      let uploadedAvatarUrl = "";

      if (avatarUrl instanceof File) {
        uploadedAvatarUrl = await uploadFile(avatarUrl, "avatars");
      } else if (typeof avatarUrl === "string") {
        uploadedAvatarUrl = avatarUrl;
      }

      const payload: RegisterExpertPayload = {
        fullName: data.fullName,
        gender: data.gender,
        address: data.address,
        dateOfBirth: data.dateOfBirth,
        phone: data.phone,
        email: data.email,
        password: data.password,
        skillIds: data.skillIds,
        avatarUrl: uploadedAvatarUrl,
      };

      registerExpertMutation.mutate(
        { data: payload },
        {
          onSuccess: (response) => {
            toast.success(response.result || "Expert registered successfully!");
            reset();
            navigate.push("/login");
          },
          onError: (error) => {
            toast.error(
              error?.response?.data?.message ||
                "Register expert failed. Please try again.",
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
            <FieldLabel htmlFor="expertFullName" className="text-sm font-light">
              Full name
            </FieldLabel>

            <Input
              {...field}
              id="expertFullName"
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
            <FieldLabel htmlFor="expertEmail" className="text-sm font-light">
              Email
            </FieldLabel>

            <Input
              {...field}
              id="expertEmail"
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
            <FieldLabel htmlFor="expertPhone" className="text-sm font-light">
              Phone
            </FieldLabel>

            <Input
              {...field}
              id="expertPhone"
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
            <FieldLabel htmlFor="expertAddress" className="text-sm font-light">
              Address
            </FieldLabel>

            <Input
              {...field}
              id="expertAddress"
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
              <FieldLabel htmlFor="expertGender" className="text-sm font-light">
                Gender
              </FieldLabel>

              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  id="expertGender"
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
                  htmlFor="expertDateOfBirth"
                  className="text-sm font-light"
                >
                  Date of birth
                </FieldLabel>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      id="expertDateOfBirth"
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
        name="skillIds"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="skillIds" className="text-sm font-light">
              Skills
            </FieldLabel>

            <MultiSelect
              options={skillOptions}
              value={(field.value ?? []).map(String)}
              onValueChange={(values) => {
                field.onChange(
                  values
                    .map((value) => Number(value))
                    .filter((value) => !Number.isNaN(value)),
                );
              }}
              searchable
              serverSearch
              searchValue={skillSearch}
              onSearchChange={setSkillSearch}
              onLoadMore={() => {
                if (
                  skillsQuery.hasNextPage &&
                  !skillsQuery.isFetchingNextPage
                ) {
                  skillsQuery.fetchNextPage();
                }
              }}
              hasMore={!!skillsQuery.hasNextPage}
              loadingMore={skillsQuery.isFetchingNextPage}
              placeholder={
                skillsQuery.isLoading ? "Loading skills..." : "Select skills"
              }
              disabled={skillsQuery.isLoading}
              className={`min-h-[66px] rounded-full border bg-white px-5 py-3 text-sm text-foreground shadow-sm transition-none ${
                fieldState.invalid ? "border-red-500" : "border-background"
              }`}
              popoverClassName="rounded-2xl border border-background bg-white shadow-lg"
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
            <FieldLabel htmlFor="expertPassword" className="text-sm font-light">
              Password
            </FieldLabel>

            <div className="relative">
              <Input
                {...field}
                id="expertPassword"
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
              htmlFor="expertConfirmPassword"
              className="text-sm font-light"
            >
              Confirm password
            </FieldLabel>

            <div className="relative">
              <Input
                {...field}
                id="expertConfirmPassword"
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
        disabled={registerExpertMutation.isPending}
        className="h-12 w-full rounded-xl bg-primary text-sm font-medium text-white shadow-md hover:bg-[#4562f0]"
      >
        {registerExpertMutation.isPending
          ? "Registering..."
          : "Register Expert"}
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

export default ExpertRegisterForm;
