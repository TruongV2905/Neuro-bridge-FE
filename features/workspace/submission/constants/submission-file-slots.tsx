import type { ReactNode } from "react";
import { Code2, Database, FileText, Video } from "lucide-react";

import type { SubmissionFileType } from "@/types/submission-package.type";

export type SubmissionFileSlot = {
  type: SubmissionFileType;
  label: string;
  description: string;
  accept?: string;
  icon: ReactNode;
};

export const submissionFileSlots: SubmissionFileSlot[] = [
  {
    type: "SOURCE_CODE",
    label: "Source Code",
    description: "Upload source code archive or repository export.",
    accept: ".zip,.rar,.7z",
    icon: <Code2 className="h-5 w-5" />,
  },
  {
    type: "DOCUMENT",
    label: "Document",
    description: "Upload project report, guide, or technical document.",
    accept: ".pdf,.doc,.docx",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    type: "VIDEO",
    label: "Video",
    description: "Upload demo video or product walkthrough.",
    accept: "video/*",
    icon: <Video className="h-5 w-5" />,
  },
  {
    type: "DATASET",
    label: "Dataset",
    description: "Upload dataset, sample data, or related resources.",
    accept: ".zip,.rar,.7z,.csv,.xlsx,.json",
    icon: <Database className="h-5 w-5" />,
  },
];

export function getSubmissionFileSlot(fileType: SubmissionFileType) {
  const normalizedType = String(fileType).toUpperCase();

  return (
    submissionFileSlots.find(
      (slot) => slot.type.toUpperCase() === normalizedType,
    ) ?? {
      type: fileType,
      label: formatUnknownFileType(fileType),
      description: "Submitted deliverable file.",
      icon: <FileText className="h-5 w-5" />,
    }
  );
}

function formatUnknownFileType(fileType: SubmissionFileType) {
  const normalized = String(fileType).trim();

  if (!normalized) return "File";

  return normalized
    .replace(/[_-]+/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
