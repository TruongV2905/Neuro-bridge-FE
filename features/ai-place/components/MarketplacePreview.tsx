import { ImageIcon, Sparkles, Video } from "lucide-react";

import type { PublicPreview } from "@/features/ai-place/types";

export function MarketplacePreview({
  preview,
  className = "",
  priority = false,
}: {
  preview?: PublicPreview;
  className?: string;
  priority?: boolean;
}) {
  if (!preview?.accessUrl) {
    return (
      <div className={`flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_25%_15%,rgba(129,140,248,0.42),transparent_32%),linear-gradient(135deg,#18254b,#351753)] text-indigo-100 ${className}`}>
        <div className="flex flex-col items-center gap-2 text-center"><Sparkles className="h-7 w-7" /><span className="text-xs font-medium text-indigo-100/85">Preview coming soon</span></div>
      </div>
    );
  }

  if (preview.type === "VIDEO") {
    return <video className={`h-full w-full bg-slate-950 object-cover ${className}`} controls preload="none" src={preview.accessUrl}>Your browser cannot play this preview.</video>;
  }

  return (
    // The marketplace API provides a temporary private access URL. Next Image cannot safely optimize an arbitrary signed host.
    // eslint-disable-next-line @next/next/no-img-element
    <img className={`h-full w-full object-cover ${className}`} src={preview.accessUrl} alt="AI product preview" loading={priority ? "eager" : "lazy"} />
  );
}

export function PreviewKindLabel({
  preview,
  className = "text-indigo-100/75",
}: {
  preview?: PublicPreview;
  className?: string;
}) {
  if (!preview) return null;
  return <span className={`inline-flex items-center gap-1 text-xs ${className}`}>{preview.type === "VIDEO" ? <Video className="h-3.5 w-3.5" /> : <ImageIcon className="h-3.5 w-3.5" />}{preview.type === "VIDEO" ? "Video preview" : "Image preview"}</span>;
}
