"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { userSchema, type UserSchema } from "../schemas/user.schema"
import type { User } from "../types/user.type"
import { UserGender, UserRole, UserStatus } from "../types/user.type"

type UserFormMode = "create" | "edit"

type UserFormProps = {
  mode?: UserFormMode
  defaultValues?: Partial<User>
  onSubmit?: (values: UserSchema) => void | Promise<void>
  onCancel?: () => void
  submitLabel?: string
  isSubmitting?: boolean
}

const generateMockUserId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  return `UUID-${Date.now()}`
}

const getDefaultValues = (
  mode: UserFormMode,
  defaultValues?: Partial<User>
): UserSchema => {
  return {
    userId:
      defaultValues?.userId ??
      (mode === "create" ? generateMockUserId() : ""),

    name: defaultValues?.name ?? "",
    userName: defaultValues?.userName ?? "",
    email: defaultValues?.email ?? "",

    gender: defaultValues?.gender ?? undefined,
    avatarUrl: defaultValues?.avatarUrl ?? "",
    phoneNumber: defaultValues?.phoneNumber ?? "",
    address: defaultValues?.address ?? "",

    role: defaultValues?.role ?? UserRole.CLIENT,
    status: defaultValues?.status ?? UserStatus.ACTIVE,

    createdAt: defaultValues?.createdAt ?? "",
    updatedAt: defaultValues?.updatedAt ?? "",
  }
}

export function UserForm({
  mode = "create",
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel,
  isSubmitting = false,
}: UserFormProps) {
  const form = useForm<UserSchema>({
    resolver: zodResolver(userSchema),
    defaultValues: getDefaultValues(mode, defaultValues),
  })

  const handleSubmit = async (values: UserSchema) => {
    await onSubmit?.(values)
  }

  const buttonLabel =
    submitLabel ?? (mode === "create" ? "Create User" : "Save Changes")

  return (
    <Card className="w-full">
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <CardContent>
          <FieldGroup>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Controller
                name="userId"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>User ID</FieldLabel>

                    <Input
                      {...field}
                      id={field.name}
                      disabled
                      placeholder="Auto generated"
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Full Name</FieldLabel>

                    <Input
                      {...field}
                      id={field.name}
                      placeholder="Enter full name"
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="userName"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Username</FieldLabel>

                    <Input
                      {...field}
                      id={field.name}
                      placeholder="Enter username"
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Email</FieldLabel>

                    <Input
                      {...field}
                      id={field.name}
                      type="email"
                      placeholder="Enter email"
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="gender"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Gender</FieldLabel>

                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger id={field.name} className="w-full">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value={UserGender.MALE}>Male</SelectItem>
                        <SelectItem value={UserGender.FEMALE}>
                          Female
                        </SelectItem>
                        <SelectItem value={UserGender.OTHER}>
                          Other
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="avatarUrl"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Avatar URL</FieldLabel>

                    <Input
                      {...field}
                      id={field.name}
                      value={field.value ?? ""}
                      placeholder="Enter avatar URL"
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="phoneNumber"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Phone Number</FieldLabel>

                    <Input
                      {...field}
                      id={field.name}
                      value={field.value ?? ""}
                      placeholder="Enter phone number"
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="address"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Address</FieldLabel>

                    <Input
                      {...field}
                      id={field.name}
                      value={field.value ?? ""}
                      placeholder="Enter address"
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="role"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Role</FieldLabel>

                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger id={field.name} className="w-full">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value={UserRole.ADMINISTRATOR}>
                          Administrator
                        </SelectItem>
                        <SelectItem value={UserRole.AI_EXPERT}>
                          AI Expert
                        </SelectItem>
                        <SelectItem value={UserRole.CLIENT}>
                          Client
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="status"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Status</FieldLabel>

                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger id={field.name} className="w-full">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value={UserStatus.ACTIVE}>
                          Active
                        </SelectItem>
                        <SelectItem value={UserStatus.INACTIVE}>
                          Inactive
                        </SelectItem>
                        <SelectItem value={UserStatus.BANNED}>
                          Banned
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>
          </FieldGroup>
        </CardContent>

        <CardFooter className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="secondary"
            onClick={() => form.reset(getDefaultValues(mode, defaultValues))}
            disabled={isSubmitting}
          >
            Reset
          </Button>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : buttonLabel}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

export default UserForm