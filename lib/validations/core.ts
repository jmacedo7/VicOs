export function requiredText(value: unknown, field: string, max = 500) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${field} is required`);
  }
  const normalized = value.trim();
  if (normalized.length > max) {
    throw new Error(`${field} is too long`);
  }
  return normalized;
}

export function optionalText(value: unknown, max = 2000) {
  if (value == null || value === "") return null;
  if (typeof value !== "string") throw new Error("Invalid text value");
  const normalized = value.trim();
  if (normalized.length > max) throw new Error("Text value is too long");
  return normalized || null;
}

export function normalizePhone(value: string) {
  const digits = value.replace(/\\D/g, "");
  if (digits.length < 8 || digits.length > 15) {
    throw new Error("Invalid phone number");
  }
  return digits;
}

export function positiveAmount(value: unknown) {
  const amount = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error("Invalid amount");
  }
  return Math.round(amount * 100) / 100;
}
