"use client";

import { useRouter } from "next/navigation";
import { useState, type ChangeEvent } from "react";

import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { buttonSmall, FormError } from "@/components/admin/form-controls";
import { Card } from "@/components/admin/ui";
import {
  MAX_ATTACHMENTS_PER_KIND,
  validateAttachment,
  type AttachmentKind,
} from "@/lib/admin/attachments";
import type { OrderAttachment } from "@/lib/admin/types";
import { cn } from "@/lib/cn";

type Photo = OrderAttachment & { url: string | null };

export function OrderAttachments({
  orderId,
  attachments,
  canUpload,
  canDelete,
}: {
  orderId: string;
  attachments: Photo[];
  canUpload: boolean;
  canDelete: boolean;
}) {
  return (
    <Card>
      <h2 className="text-[13.5px] font-semibold">Foto sebelum &amp; sesudah</h2>
      <p className="mt-0.5 text-[12px] text-[color:var(--bjork-text-muted)]">
        Bukti kondisi unit saat diterima dan setelah servis.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <PhotoGroup
          orderId={orderId}
          kind="before"
          label="Sebelum"
          photos={attachments.filter((item) => item.kind === "before")}
          canUpload={canUpload}
          canDelete={canDelete}
        />
        <PhotoGroup
          orderId={orderId}
          kind="after"
          label="Sesudah"
          photos={attachments.filter((item) => item.kind === "after")}
          canUpload={canUpload}
          canDelete={canDelete}
        />
      </div>
    </Card>
  );
}

function PhotoGroup({
  orderId,
  kind,
  label,
  photos,
  canUpload,
  canDelete,
}: {
  orderId: string;
  kind: AttachmentKind;
  label: string;
  photos: Photo[];
  canUpload: boolean;
  canDelete: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  async function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const invalid = validateAttachment(file);
    if (invalid) {
      setError(invalid);
      return;
    }

    setBusy(true);
    setError(null);

    const body = new FormData();
    body.append("kind", kind);
    body.append("file", file);

    try {
      const response = await fetch(`/api/admin/orders/${orderId}/attachments`, {
        method: "POST",
        body,
      });
      const payload = (await response.json().catch(() => null)) as
        | { error?: { message?: string } }
        | null;

      if (!response.ok) {
        setError(payload?.error?.message ?? "Gagal mengunggah foto.");
        return;
      }

      router.refresh();
    } catch {
      setError("Gagal menghubungi server. Coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: string) {
    setBusy(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/orders/${orderId}/attachments/${id}`,
        { method: "DELETE" },
      );
      const payload = (await response.json().catch(() => null)) as
        | { error?: { message?: string } }
        | null;

      if (!response.ok) {
        setError(payload?.error?.message ?? "Gagal menghapus foto.");
        return;
      }

      router.refresh();
    } catch {
      setError("Gagal menghubungi server. Coba lagi.");
    } finally {
      setBusy(false);
      setConfirmId(null);
    }
  }

  return (
    <div className="rounded-lg border border-[color:var(--bjork-border)] p-3">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[color:var(--bjork-text-muted)]">
          {label}
        </h3>
        <span className="font-mono text-[11px] text-[color:var(--bjork-text-soft)]">
          {photos.length}/{MAX_ATTACHMENTS_PER_KIND}
        </span>
      </div>

      {photos.length === 0 ? (
        <p className="mt-3 text-[12px] text-[color:var(--bjork-text-muted)]">
          Belum ada foto {label.toLowerCase()}.
        </p>
      ) : (
        <ul className="mt-3 grid grid-cols-3 gap-2">
          {photos.map((photo, index) => (
            <li
              key={photo.id}
              className="relative aspect-square overflow-hidden rounded-lg border border-[color:var(--bjork-border)] bg-[var(--bjork-panel)]"
            >
              {photo.url ? (
                // eslint-disable-next-line @next/next/no-img-element -- signed URL Supabase, tidak lewat optimizer
                <img
                  src={photo.url}
                  alt={`Foto ${label.toLowerCase()} ${index + 1}`}
                  className="size-full object-cover"
                  loading="lazy"
                />
              ) : (
                <span className="grid size-full place-items-center text-[11px] text-[color:var(--bjork-text-muted)]">
                  Gagal dimuat
                </span>
              )}
              {canDelete ? (
                <button
                  type="button"
                  onClick={() => setConfirmId(photo.id)}
                  aria-label={`Hapus foto ${label.toLowerCase()} ${index + 1}`}
                  className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-black/70 text-[13px] text-white transition-colors hover:bg-[var(--blk-error)]"
                >
                  ×
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {canUpload && photos.length < MAX_ATTACHMENTS_PER_KIND ? (
        <label
          className={cn(
            buttonSmall,
            "mt-3 inline-flex cursor-pointer",
            busy && "pointer-events-none opacity-50",
          )}
        >
          {busy ? "Memproses…" : "+ Unggah foto"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFiles}
            disabled={busy}
            className="sr-only"
          />
        </label>
      ) : null}

      <div className="mt-2">
        <FormError message={error} />
      </div>

      <ConfirmDialog
        open={confirmId !== null}
        title="Hapus foto?"
        description="Foto yang dihapus tidak bisa dikembalikan."
        confirmLabel="Hapus foto"
        tone="danger"
        busy={busy}
        onConfirm={() => confirmId && handleDelete(confirmId)}
        onClose={() => {
          if (!busy) setConfirmId(null);
        }}
      />
    </div>
  );
}
