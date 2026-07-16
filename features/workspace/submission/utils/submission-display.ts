export function normalizeText(value?: string | null) {
  if (typeof value !== "string") return null;

  const normalized = value.trim();

  return normalized.length > 0 ? normalized : null;
}

export function normalizeStatus(value?: string | null) {
  return normalizeText(value)?.toUpperCase() ?? "";
}

export function formatStatusLabel(status?: string | null) {
  const normalized = normalizeText(status);

  if (!normalized) return "Unknown";

  return normalized
    .replace(/[_-]+/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function formatDateTime(value?: string | null) {
  const normalized = normalizeText(value);

  if (!normalized) return null;

  const timestamp = Date.parse(normalized);

  if (Number.isNaN(timestamp)) return null;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

export function joinDisplayParts(parts: Array<string | null | undefined>) {
  const visibleParts = parts
    .map((part) => normalizeText(part))
    .filter((part): part is string => Boolean(part));

  return visibleParts.length > 0
    ? visibleParts.join(" - ")
    : "File metadata unavailable";
}

export function getRequestErrorMessage(error: unknown) {
  if (!isRecord(error)) {
    return "Please try again later.";
  }

  const response = isRecord(error.response) ? error.response : null;
  const data = response && isRecord(response.data) ? response.data : null;
  const message =
    data && typeof data.message === "string" ? data.message : null;

  if (message) return message;

  return typeof error.message === "string"
    ? error.message
    : "Please try again later.";
}

export function getBackendMessage(error: unknown) {
  if (!isRecord(error)) return null;

  const response = isRecord(error.response) ? error.response : null;
  const data = response && isRecord(response.data) ? response.data : null;
  const message =
    data && typeof data.message === "string" ? data.message.trim() : "";

  return message.length > 0 ? message : null;
}

export function getResponseStatus(error: unknown) {
  if (!isRecord(error)) return null;

  const response = isRecord(error.response) ? error.response : null;
  const status = response?.status;

  return typeof status === "number" ? status : null;
}

export function getTimeValue(value?: string | null) {
  const normalized = normalizeText(value);

  if (!normalized) return 0;

  const timestamp = Date.parse(normalized);

  return Number.isNaN(timestamp) ? 0 : timestamp;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
