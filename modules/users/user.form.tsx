import FileUpload03 from "@/components/file-upload-03";
import type { UserSchema } from "@/schemas/user.schema";
import { FieldConfig } from "@/types/dasboard";
import { UserGender, UserRole, UserStatus } from "@/types/user/user.type";

export const userFields: FieldConfig<UserSchema>[] = [
  {
    name: "code",
    label: "User Code",
    type: "text",
    placeholder: "User code",
    disabled: true,
  },
  {
    name: "fullName",
    label: "Full Name",
    type: "text",
    placeholder: "Enter full name",
    required: true,
  },
  {
    name: "email",
    label: "Email",
    type: "text",
    placeholder: "Enter email",
    required: true,
  },
  {
    name: "gender",
    label: "Gender",
    type: "select",
    placeholder: "Select gender",
    options: [
      { label: "Male", value: UserGender.MALE },
      { label: "Female", value: UserGender.FEMALE },
      { label: "Other", value: UserGender.OTHER },
    ],
  },
  {
    name: "avatarUrl",
    label: "Avatar URL",
    type: "custom",
    placeholder: "Enter avatar URL",
    render: () => <FileUpload03 />,
  },
  {
    name: "phone",
    label: "Phone Number",
    type: "text",
    placeholder: "Enter phone number",
  },
  {
    name: "address",
    label: "Address",
    type: "text",
    placeholder: "Enter address",
  },
  {
    name: "role",
    label: "Role",
    type: "select",
    placeholder: "Select role",
    options: [
      { label: "Administrator", value: UserRole.ADMINISTRATOR },
      { label: "Expert", value: UserRole.EXPERT },
      { label: "Client", value: UserRole.CLIENT },
    ],
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    placeholder: "Select status",
    options: [
      { label: "Active", value: UserStatus.ACTIVE },
      { label: "Inactive", value: UserStatus.INACTIVE },
      { label: "Banned", value: UserStatus.BANNED },
    ],
  },
];
