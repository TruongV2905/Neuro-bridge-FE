// modules/jobpost/components/AttachmentUploader.tsx

"use client"

import { Upload, X, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"

type AttachmentUploaderProps = {
  files: File[]
  onChange: (files: File[]) => void
}

export function AttachmentUploader({
  files,
  onChange,
}: AttachmentUploaderProps) {
  const handleFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? [])
    onChange([...files, ...selectedFiles])
  }

  const removeFile = (index: number) => {
    onChange(files.filter((_, fileIndex) => fileIndex !== index))
  }

  return (
    <div className="space-y-3">
      <label
        htmlFor="attachments"
        className="flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-white/60 px-6 text-center transition hover:border-primary hover:bg-primary/5"
      >
        <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Upload size={18} />
        </div>

        <p className="text-sm font-medium text-zinc-800">
          Drop files here or click to browse
        </p>

        <p className="mt-1 text-xs text-zinc-400">
          PDF, DOCX, PNG, Figma — up to 25 MB each
        </p>

        <input
          id="attachments"
          type="file"
          multiple
          className="hidden"
          onChange={handleFilesChange}
        />
      </label>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center justify-between rounded-xl border bg-white px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-primary" />
                <span className="max-w-[320px] truncate text-sm">
                  {file.name}
                </span>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeFile(index)}
              >
                <X size={16} />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}