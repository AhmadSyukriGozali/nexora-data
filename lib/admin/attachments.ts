export const ATTACHMENT_BUCKET = "service-photos";

export const ATTACHMENT_KINDS = ["before", "after"] as const;
export type AttachmentKind = (typeof ATTACHMENT_KINDS)[number];

export const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;
export const MAX_ATTACHMENTS_PER_KIND = 6;

const MIME_EXTENSION: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function attachmentExtension(mime: string): string | null {
  return MIME_EXTENSION[mime] ?? null;
}

/** Pesan kesalahan untuk berkas yang tidak boleh diunggah, atau null bila lolos. */
export function validateAttachment(file: {
  type: string;
  size: number;
}): string | null {
  if (!attachmentExtension(file.type)) {
    return "Format foto harus JPG, PNG, atau WebP.";
  }
  if (file.size <= 0) return "Berkas kosong.";
  if (file.size > MAX_ATTACHMENT_BYTES) return "Ukuran foto maksimal 5 MB.";
  return null;
}

/** Path Storage: `<order_id>/<kind>/<uuid>.<ext>`. */
export function attachmentPath(
  orderId: string,
  kind: AttachmentKind,
  mime: string,
): string {
  const extension = attachmentExtension(mime) ?? "bin";
  return `${orderId}/${kind}/${crypto.randomUUID()}.${extension}`;
}
