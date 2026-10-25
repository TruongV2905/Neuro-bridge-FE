import { Database, FileCode2, FileText, Film, type LucideIcon } from "lucide-react";

import type { ProductAssetType } from "@/features/ai-place/types";

export type ProtectedAssetPreviewKind = "image" | "video" | "pdf" | "unsupported";

export type ProtectedAssetSlot = {
  type: ProductAssetType;
  label: string;
  description: string;
  icon: LucideIcon;
  supportsPreview: boolean;
};

export const PROTECTED_ASSET_SLOTS: ProtectedAssetSlot[] = [
  {
    type: "SOURCE_CODE",
    label: "Source code",
    description: "Protected source deliverable",
    icon: FileCode2,
    supportsPreview: false,
  },
  {
    type: "VIDEO",
    label: "Video",
    description: "Protected video deliverable",
    icon: Film,
    supportsPreview: true,
  },
  {
    type: "DATASET",
    label: "Dataset",
    description: "Protected data deliverable",
    icon: Database,
    supportsPreview: false,
  },
  {
    type: "DOCUMENT",
    label: "Document",
    description: "Protected document deliverable",
    icon: FileText,
    supportsPreview: true,
  },
];

export function getProtectedAssetPreviewKind(contentType?: string): ProtectedAssetPreviewKind {
  const normalizedContentType = contentType?.trim().toLowerCase() ?? "";

  if (normalizedContentType.startsWith("image/")) {
    return "image";
  }

  if (normalizedContentType.startsWith("video/")) {
    return "video";
  }

  if (normalizedContentType === "application/pdf") {
    return "pdf";
  }

  return "unsupported";
}

export function isTemporaryHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}
