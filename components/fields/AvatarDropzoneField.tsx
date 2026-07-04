"use client";

import { useCallback, useEffect } from "react";
import { Camera, UploadCloud, X } from "lucide-react";
import { useDropzone, type FileRejection } from "react-dropzone";
import type { FieldError as RHFFieldError } from "react-hook-form";
import { toast } from "react-toastify";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
const revokePreviewUrl = (url?: string) => {
  if (url?.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
};

type AvatarDropzoneFieldProps = {
  field: {
    value?: File | string | null;
    onChange: (value: File | null) => void;
  };
  error?: RHFFieldError;
  invalid: boolean;
  avatarPreview: string;
  setAvatarPreview: (value: string) => void;
  fullName?: string;
};

function AvatarDropzoneField({
  field,
  error,
  invalid,
  avatarPreview,
  setAvatarPreview,
  fullName,
}: AvatarDropzoneFieldProps) {
  const onDropAccepted = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];

      if (!file) return;

      revokePreviewUrl(avatarPreview);

      field.onChange(file);
      setAvatarPreview(URL.createObjectURL(file));
    },
    [avatarPreview, field, setAvatarPreview],
  );

  const onDropRejected = useCallback((fileRejections: FileRejection[]) => {
    const firstError = fileRejections[0]?.errors[0];

    if (firstError) {
      toast.error(firstError.message);
    }
  }, []);

  const handleRemoveAvatar = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();

      revokePreviewUrl(avatarPreview);

      field.onChange(null);
      setAvatarPreview("");
    },
    [avatarPreview, field, setAvatarPreview],
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDropAccepted,
      onDropRejected,
      multiple: false,
      maxFiles: 1,
      maxSize: 5 * 1024 * 1024,
      accept: {
        "image/*": [".png", ".jpg", ".jpeg", ".webp"],
      },
    });

  useEffect(() => {
    return () => {
      revokePreviewUrl(avatarPreview);
    };
  }, [avatarPreview]);

  return (
    <Field data-invalid={invalid}>
      <FieldLabel className="text-sm font-light">Avatar</FieldLabel>

      <div
        {...getRootProps()}
        className={`group relative flex cursor-pointer items-center gap-4 rounded-3xl border border-dashed bg-white p-4 shadow-sm transition ${
          invalid || isDragReject
            ? "border-red-500 bg-red-50/40"
            : isDragActive
              ? "border-primary bg-primary/5 shadow-md"
              : "border-background hover:border-primary hover:bg-primary/5 hover:shadow-md"
        }`}
      >
        <input {...getInputProps()} />

        {avatarPreview && (
          <button
            type="button"
            onClick={handleRemoveAvatar}
            className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white shadow-md transition hover:bg-red-600"
            aria-label="Remove avatar"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        <div className="relative shrink-0">
          <Avatar className="h-20 w-20 border border-background shadow-sm ring-4 ring-background">
            <AvatarImage src={avatarPreview} alt="Client avatar" />

            <AvatarFallback  className="bg-primary text-lg font-semibold text-white">
              {fullName}
            </AvatarFallback>
          </Avatar>

          <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-md ring-4 ring-white">
            <Camera className="h-4 w-4" />
          </div>
        </div>

        <div className="min-w-0 flex-1 pr-8">
          <div className="flex items-center gap-2">
            <UploadCloud className="h-4 w-4 text-primary" />

            <p className="text-sm font-semibold text-foreground">
              {isDragActive
                ? "Drop image here"
                : avatarPreview
                  ? "Change avatar"
                  : "Upload avatar"}
            </p>
          </div>

          <p className="mt-1 text-xs font-light text-muted-foreground">
            Drag and drop your image here, or click to choose avatar.
          </p>

          <p className="mt-1 text-xs font-light text-muted-foreground">
            PNG, JPG, JPEG or WEBP. Maximum size: 5MB.
          </p>

          {avatarPreview && (
            <p className="mt-1 truncate text-[11px] font-medium text-primary">
              Avatar selected successfully
            </p>
          )}

          {isDragReject && (
            <p className="mt-1 text-[11px] font-medium text-red-500">
              Invalid file. Please choose an image under 5MB.
            </p>
          )}
        </div>
      </div>

      {invalid && error && <FieldError errors={[error]} />}
    </Field>
  );
}

export default AvatarDropzoneField;
