export function emptyToNull(value: FormDataEntryValue | null): string | null {
  const text = String(value ?? "").trim();
  return text === "" ? null : text;
}

export function textValue(value: FormDataEntryValue | null): string {
  return String(value ?? "").trim();
}

export function numberValue(value: FormDataEntryValue | null, fallback = 0): number {
  const parsed = Number(String(value ?? "").trim());
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function booleanValue(value: FormDataEntryValue | null): boolean {
  return value === "on" || value === "true";
}
