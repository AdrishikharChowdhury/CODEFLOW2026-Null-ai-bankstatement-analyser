export function formatTimestamp(
  ts: string | Date | null | undefined,
  fmt: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  },
): string {
  if (!ts) return "";
  const date = typeof ts === "string" ? new Date(ts) : ts;
  return date.toLocaleString("en-IN", fmt);
}

export function formatRedacted(text: string): string {
  return text.replace(/redact(?:ed)?/gi, "***");
}