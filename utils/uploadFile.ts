import { supabase } from "@/configs/supabase";

const BUCKET_NAME = "image_url";

/**
 * Làm sạch tên folder để tránh lỗi path
 * VD: "/vehicles/" => "vehicles"
 * VD: "job posts/banner" => "job-posts/banner"
 */
const normalizeFolder = (folder?: string) => {
  if (!folder?.trim()) return "uploads";

  return folder
    .trim()
    .replace(/^\/+|\/+$/g, "")
    .split("/")
    .map((part) =>
      part
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-_]/g, ""),
    )
    .filter(Boolean)
    .join("/");
};

/**
 * Làm sạch tên file
 */
const normalizeFileName = (fileName: string) => {
  const lastDotIndex = fileName.lastIndexOf(".");

  const name = lastDotIndex !== -1 ? fileName.slice(0, lastDotIndex) : fileName;

  const ext =
    lastDotIndex !== -1 ? fileName.slice(lastDotIndex).toLowerCase() : "";

  const safeName = name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "");

  return `${safeName || "file"}${ext}`;
};

/**
 * Upload 1 file lên Supabase Storage
 * Có thể truyền folder để lưu vào thư mục mong muốn
 */
export const uploadFile = async (
  file: File,
  folder = "avatars",
): Promise<string> => {
  if (!file) throw new Error("No file to upload");

  const cleanFolder = normalizeFolder(folder);

  // Tạo folder theo ngày cho gọn: yyyy/mm/dd
  const dateFolder = new Date().toISOString().slice(0, 10).replace(/-/g, "/");

  const safeName = normalizeFileName(file.name);

  const uniqueId =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const path = `${cleanFolder}/${dateFolder}/${uniqueId}_${safeName}`;

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(path, file, {
      upsert: false,
      contentType: file.type || "application/octet-stream",
    });

  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);

  return data.publicUrl;
};

/**
 * Upload nhiều file một lượt
 * Có thể truyền folder để lưu vào thư mục mong muốn
 */
export const uploadFiles = async (
  files: (File | null | undefined)[],
  folder = "avatars",
): Promise<string[]> => {
  const realFiles = files.filter((f): f is File => f instanceof File);

  if (!realFiles.length) return [];

  const urls = await Promise.all(
    realFiles.map((file) => uploadFile(file, folder)),
  );

  return urls;
};
