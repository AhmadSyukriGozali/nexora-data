"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import {
  buttonDanger,
  buttonPrimary,
  buttonSmallDanger,
  Field,
  FormActions,
  FormError,
  inputClass,
} from "@/components/admin/form-controls";
import {
  Card,
  InvoiceStatusBadge,
} from "@/components/admin/ui";
import { apiRequest } from "@/lib/admin/client-api";
import { emptyToNull, numberValue, textValue } from "@/lib/admin/form-utils";
import {
  formatDateTime,
  formatRupiah,
  fromJakartaInput,
  paymentMethodLabels,
  toJakartaInput,
} from "@/lib/admin/format";
import type {
  InvoiceDetail,
  InvoiceItem,
  InvoiceStatus,
  Payment,
  PaymentMethod,
  Sparepart,
} from "@/lib/admin/types";
import { cn } from "@/lib/cn";

const PAYMENT_METHODS = Object.keys(paymentMethodLabels) as PaymentMethod[];

const STATUS_RANK: Record<InvoiceStatus, number> = {
  draft: 0,
  terkirim: 1,
  lunas: 2,
  batal: -1,
};

type PendingAction =
  | { kind: "send" }
  | { kind: "cancel" }
  | { kind: "delete-invoice" }
  | { kind: "delete-item"; item: InvoiceItem }
  | { kind: "delete-payment"; payment: Payment };

export function InvoiceDetailManager({
  invoice,
  spareparts,
  canManage,
  canDelete,
  canDeletePayments,
}: {
  invoice: InvoiceDetail;
  spareparts: Sparepart[];
  canManage: boolean;
  canDelete: boolean;
  canDeletePayments: boolean;
}) {
  const router = useRouter();

  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [settingsBusy, setSettingsBusy] = useState(false);

  const [itemSparepartId, setItemSparepartId] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [itemQuantity, setItemQuantity] = useState("1");
  const [itemUnitPrice, setItemUnitPrice] = useState("0");
  const [itemError, setItemError] = useState<string | null>(null);
  const [itemBusy, setItemBusy] = useState(false);

  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("tunai");
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentPaidAt, setPaymentPaidAt] = useState("");
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentBusy, setPaymentBusy] = useState(false);

  const [pending, setPending] = useState<PendingAction | null>(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const remaining = invoice.total_amount - invoice.paid_amount;
  const isDraft = invoice.status === "draft";
  const isSent = invoice.status === "terkirim";
  const isPaid = invoice.status === "lunas";
  const isCancelled = invoice.status === "batal";
  const canEditItems = canManage && !isCancelled && !isPaid;
  const canRecordPayment = canManage && isSent && remaining > 0;

  async function patchInvoice(
    payload: Record<string, unknown>,
  ): Promise<string | null> {
    const result = await apiRequest<InvoiceDetail>(
      `/api/admin/invoices/${invoice.id}`,
      { method: "PATCH", body: JSON.stringify(payload) },
    );
    return result.ok ? null : result.message;
  }

  async function handleSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSettingsError(null);
    setSettingsBusy(true);

    const form = new FormData(event.currentTarget);
    const error = await patchInvoice({
      discount_amount: numberValue(form.get("discount_amount"), 0),
      due_at: fromJakartaInput(textValue(form.get("due_at"))),
      notes: emptyToNull(form.get("notes")),
    });

    setSettingsBusy(false);
    if (error) {
      setSettingsError(error);
      return;
    }
    router.refresh();
  }

  function pickSparepart(id: string) {
    setItemSparepartId(id);
    const sparepart = spareparts.find((item) => item.id === id);
    if (!sparepart) return;
    setItemDescription(sparepart.name);
    setItemUnitPrice(String(sparepart.sell_price));
  }

  async function handleAddItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setItemError(null);

    const quantity = Number(itemQuantity);
    const unitPrice = Number(itemUnitPrice);

    if (!Number.isInteger(quantity) || quantity < 1) {
      setItemError("Jumlah minimal 1.");
      return;
    }
    if (!Number.isInteger(unitPrice) || unitPrice < 0) {
      setItemError("Harga satuan tidak valid.");
      return;
    }
    if (itemDescription.trim().length === 0) {
      setItemError("Deskripsi item wajib diisi.");
      return;
    }

    setItemBusy(true);
    const result = await apiRequest<InvoiceItem>(
      `/api/admin/invoices/${invoice.id}/items`,
      {
        method: "POST",
        body: JSON.stringify({
          sparepart_id: itemSparepartId || null,
          description: itemDescription.trim(),
          quantity,
          unit_price: unitPrice,
        }),
      },
    );
    setItemBusy(false);

    if (!result.ok) {
      setItemError(result.message);
      return;
    }

    setItemSparepartId("");
    setItemDescription("");
    setItemQuantity("1");
    setItemUnitPrice("0");
    router.refresh();
  }

  async function handleAddPayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPaymentError(null);

    const amount = Number(paymentAmount);
    if (!Number.isInteger(amount) || amount < 1) {
      setPaymentError("Jumlah pembayaran minimal Rp1.");
      return;
    }

    const paidAt = fromJakartaInput(paymentPaidAt);
    const payload: Record<string, unknown> = {
      amount,
      method: paymentMethod,
      reference: emptyToNull(paymentReference),
    };
    if (paidAt) payload.paid_at = paidAt;

    setPaymentBusy(true);
    const result = await apiRequest<Payment>(
      `/api/admin/invoices/${invoice.id}/payments`,
      { method: "POST", body: JSON.stringify(payload) },
    );
    setPaymentBusy(false);

    if (!result.ok) {
      setPaymentError(result.message);
      return;
    }

    setPaymentAmount("");
    setPaymentMethod("tunai");
    setPaymentReference("");
    setPaymentPaidAt("");
    router.refresh();
  }

  async function runPending() {
    if (!pending) return;
    setActionError(null);
    setActionBusy(true);

    let message: string | null = null;

    if (pending.kind === "send") {
      message = await patchInvoice({ status: "terkirim" satisfies InvoiceStatus });
    } else if (pending.kind === "cancel") {
      message = await patchInvoice({ status: "batal" satisfies InvoiceStatus });
    } else if (pending.kind === "delete-invoice") {
      const result = await apiRequest<{ deleted: boolean }>(
        `/api/admin/invoices/${invoice.id}`,
        { method: "DELETE" },
      );
      if (!result.ok) message = result.message;
      else {
        setActionBusy(false);
        router.push("/admin/invoice");
        router.refresh();
        return;
      }
    } else if (pending.kind === "delete-item") {
      const result = await apiRequest<{ deleted: boolean }>(
        `/api/admin/invoice-items/${pending.item.id}`,
        { method: "DELETE" },
      );
      if (!result.ok) message = result.message;
    } else {
      const result = await apiRequest<{ deleted: boolean }>(
        `/api/admin/payments/${pending.payment.id}`,
        { method: "DELETE" },
      );
      if (!result.ok) message = result.message;
    }

    setActionBusy(false);

    if (message) {
      setActionError(message);
      return;
    }

    setPending(null);
    router.refresh();
  }

  const pendingCopy = (() => {
    if (!pending) return null;
    switch (pending.kind) {
      case "send":
        return {
          title: "Kirim invoice ke pelanggan?",
          description:
            "Status menjadi Terkirim. Pembayaran baru bisa dicatat setelah invoice terkirim, dan status ini tidak bisa kembali ke draft.",
          confirmLabel: "Ya, kirim",
          tone: "default" as const,
        };
      case "cancel":
        return {
          title: "Batalkan invoice?",
          description:
            "Invoice batal tidak bisa diubah lagi. Hanya owner yang boleh melakukan ini.",
          confirmLabel: "Ya, batalkan",
          tone: "danger" as const,
        };
      case "delete-invoice":
        return {
          title: `Hapus invoice ${invoice.invoice_number}?`,
          description:
            "Item dan pembayaran harus sudah dihapus. Tindakan ini tidak bisa dibatalkan.",
          confirmLabel: "Hapus permanen",
          tone: "danger" as const,
        };
      case "delete-item":
        return {
          title: `Hapus item "${pending.item.description}"?`,
          description: "Stok sparepart pada item ini dikembalikan otomatis.",
          confirmLabel: "Hapus item",
          tone: "danger" as const,
        };
      case "delete-payment":
        return {
          title: `Hapus pembayaran ${formatRupiah(pending.payment.amount)}?`,
          description:
            "Status lunas akan kembali menjadi Terkirim bila total pembayaran turun di bawah total invoice.",
          confirmLabel: "Hapus pembayaran",
          tone: "danger" as const,
        };
    }
  })();

  return (
    <div className="grid gap-4 xl:grid-cols-[1.55fr_1fr]">
      <div className="space-y-4">
        <Card className="p-0">
          <div className="flex items-center justify-between border-b border-[color:var(--bjork-border)] px-5 py-4">
            <div>
              <h2 className="text-[13.5px] font-semibold">Item invoice</h2>
              <p className="text-[12px] text-[color:var(--bjork-text-muted)]">
                Item sparepart otomatis memotong stok.
              </p>
            </div>
            <span className="text-xs text-[color:var(--bjork-text-muted)]">
              {invoice.invoice_items.length} item
            </span>
          </div>

          {invoice.invoice_items.length === 0 ? (
            <p className="px-5 py-6 text-sm text-[color:var(--bjork-text-muted)]">
              Belum ada item. Tambahkan jasa atau sparepart di bawah.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-[11px] uppercase tracking-[0.12em] text-[color:var(--bjork-text-soft)]">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Deskripsi</th>
                    <th className="px-5 py-3 font-semibold">Qty</th>
                    <th className="px-5 py-3 font-semibold">Harga</th>
                    <th className="px-5 py-3 font-semibold">Total</th>
                    <th className="px-5 py-3 text-right font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.invoice_items.map((item) => (
                    <tr
                      key={item.id}
                      className="border-t border-[color:var(--bjork-border)]"
                    >
                      <td className="px-5 py-3 text-[color:var(--bjork-text)]">
                        {item.description}
                        {item.sparepart_id ? (
                          <span className="ml-2 text-[11px] text-[color:var(--bjork-text-muted)]">
                            (sparepart)
                          </span>
                        ) : null}
                      </td>
                      <td className="px-5 py-3 text-[color:var(--bjork-text-muted)]">
                        {item.quantity}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-[color:var(--bjork-text-muted)]">
                        {formatRupiah(item.unit_price)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-[color:var(--bjork-text)]">
                        {formatRupiah(item.line_total)}
                      </td>
                      <td className="px-5 py-3 text-right">
                        {canDelete && canEditItems ? (
                          <button
                            type="button"
                            className={buttonSmallDanger}
                            onClick={() =>
                              setPending({ kind: "delete-item", item })
                            }
                          >
                            Hapus
                          </button>
                        ) : (
                          <span className="text-xs text-[color:var(--bjork-text-faint)]">
                            —
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {canEditItems ? (
            <form
              onSubmit={handleAddItem}
              className="space-y-4 border-t border-[color:var(--bjork-border)] px-5 py-5"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Sparepart (opsional)">
                  <select
                    className={inputClass}
                    value={itemSparepartId}
                    onChange={(event) => pickSparepart(event.target.value)}
                  >
                    <option value="">Tanpa sparepart / jasa</option>
                    {spareparts.map((sparepart) => (
                      <option key={sparepart.id} value={sparepart.id}>
                        {sparepart.name} · stok {sparepart.stock_quantity}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Deskripsi">
                  <input
                    className={inputClass}
                    required
                    maxLength={300}
                    value={itemDescription}
                    onChange={(event) => setItemDescription(event.target.value)}
                    placeholder="Contoh: Jasa ganti LCD"
                  />
                </Field>

                <Field label="Jumlah">
                  <input
                    className={inputClass}
                    type="number"
                    min={1}
                    max={100000}
                    step={1}
                    required
                    value={itemQuantity}
                    onChange={(event) => setItemQuantity(event.target.value)}
                  />
                </Field>

                <Field label="Harga satuan (Rp)">
                  <input
                    className={inputClass}
                    type="number"
                    min={0}
                    step={1000}
                    required
                    value={itemUnitPrice}
                    onChange={(event) => setItemUnitPrice(event.target.value)}
                  />
                </Field>
              </div>

              <FormError message={itemError} />

              <FormActions>
                <button
                  type="submit"
                  disabled={itemBusy}
                  className={buttonPrimary}
                >
                  {itemBusy ? "Menambah…" : "Tambah item"}
                </button>
              </FormActions>
            </form>
          ) : null}
        </Card>

        <Card className="p-0">
          <div className="flex items-center justify-between border-b border-[color:var(--bjork-border)] px-5 py-4">
            <div>
              <h2 className="text-[13.5px] font-semibold">Pembayaran</h2>
              <p className="text-[12px] text-[color:var(--bjork-text-muted)]">
                Status lunas otomatis saat total pembayaran menutup total
                invoice.
              </p>
            </div>
            <span className="text-xs text-[color:var(--bjork-text-muted)]">
              {invoice.payments.length} transaksi
            </span>
          </div>

          {invoice.payments.length === 0 ? (
            <p className="px-5 py-6 text-sm text-[color:var(--bjork-text-muted)]">
              Belum ada pembayaran tercatat.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-[11px] uppercase tracking-[0.12em] text-[color:var(--bjork-text-soft)]">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Waktu</th>
                    <th className="px-5 py-3 font-semibold">Metode</th>
                    <th className="px-5 py-3 font-semibold">Referensi</th>
                    <th className="px-5 py-3 font-semibold">Jumlah</th>
                    <th className="px-5 py-3 text-right font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.payments.map((payment) => (
                    <tr
                      key={payment.id}
                      className="border-t border-[color:var(--bjork-border)]"
                    >
                      <td className="whitespace-nowrap px-5 py-3 text-[color:var(--bjork-text-muted)]">
                        {formatDateTime(payment.paid_at)}
                      </td>
                      <td className="px-5 py-3 text-[color:var(--bjork-text)]">
                        {paymentMethodLabels[payment.method]}
                      </td>
                      <td className="px-5 py-3 text-[color:var(--bjork-text-muted)]">
                        {payment.reference ?? "—"}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-[color:var(--bjork-text)]">
                        {formatRupiah(payment.amount)}
                      </td>
                      <td className="px-5 py-3 text-right">
                        {canDeletePayments ? (
                          <button
                            type="button"
                            className={buttonSmallDanger}
                            onClick={() =>
                              setPending({ kind: "delete-payment", payment })
                            }
                          >
                            Hapus
                          </button>
                        ) : (
                          <span className="text-xs text-[color:var(--bjork-text-faint)]">
                            —
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {canRecordPayment ? (
            <form
              onSubmit={handleAddPayment}
              className="space-y-4 border-t border-[color:var(--bjork-border)] px-5 py-5"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Jumlah (Rp)">
                  <input
                    className={inputClass}
                    type="number"
                    min={1}
                    step={1000}
                    required
                    value={paymentAmount}
                    onChange={(event) => setPaymentAmount(event.target.value)}
                    placeholder={remaining > 0 ? String(remaining) : "0"}
                  />
                </Field>

                <Field label="Metode">
                  <select
                    className={inputClass}
                    value={paymentMethod}
                    onChange={(event) =>
                      setPaymentMethod(event.target.value as PaymentMethod)
                    }
                  >
                    {PAYMENT_METHODS.map((method) => (
                      <option key={method} value={method}>
                        {paymentMethodLabels[method]}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Referensi (opsional)">
                  <input
                    className={inputClass}
                    maxLength={120}
                    value={paymentReference}
                    onChange={(event) =>
                      setPaymentReference(event.target.value)
                    }
                    placeholder="No. transfer / ID QRIS"
                  />
                </Field>

                <Field label="Waktu bayar (kosongkan = sekarang)">
                  <input
                    className={inputClass}
                    type="datetime-local"
                    value={paymentPaidAt}
                    onChange={(event) => setPaymentPaidAt(event.target.value)}
                  />
                </Field>
              </div>

              <FormError message={paymentError} />

              <FormActions>
                <button
                  type="submit"
                  disabled={paymentBusy}
                  className={buttonPrimary}
                >
                  {paymentBusy ? "Menyimpan…" : "Catat pembayaran"}
                </button>
              </FormActions>
            </form>
          ) : (
            <p className="border-t border-[color:var(--bjork-border)] px-5 py-3 text-[12px] text-[color:var(--bjork-text-muted)]">
              {isDraft
                ? "Kirim invoice dulu sebelum mencatat pembayaran."
                : isPaid
                  ? "Invoice sudah lunas."
                  : isCancelled
                    ? "Invoice batal tidak menerima pembayaran."
                    : !canManage
                      ? "Anda tidak punya izin mencatat pembayaran."
                      : "Tidak ada sisa tagihan."}
            </p>
          )}
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-[13.5px] font-semibold">Status invoice</h2>
            <InvoiceStatusBadge status={invoice.status} />
          </div>
          <ol className="mt-4 flex items-center gap-1 text-[11px]">
            {(
              [
                ["draft", "Draft"],
                ["terkirim", "Terkirim"],
                ["lunas", "Lunas"],
              ] as const
            ).map(([key, label]) => {
              const active =
                !isCancelled && STATUS_RANK[invoice.status] >= STATUS_RANK[key];
              return (
                <li
                  key={key}
                  className={cn(
                    "flex-1 rounded-md border px-2 py-1.5 text-center font-medium",
                    active
                      ? "border-[color:var(--bjork-accent)]/50 bg-[var(--blk-accent-fill)]/15 text-[color:var(--blk-accent-ink)]"
                      : "border-[color:var(--bjork-border)] text-[color:var(--bjork-text-faint)]",
                  )}
                >
                  {label}
                </li>
              );
            })}
          </ol>
          {isPaid ? (
            <p className="mt-3 text-[12px] text-[color:var(--bjork-text-muted)]">
              Lunas otomatis dari total pembayaran. Hapus pembayaran untuk
              kembali ke Terkirim.
            </p>
          ) : null}

          <FormError message={actionError} />

          {canManage && isDraft ? (
            <button
              type="button"
              className={`${buttonPrimary} mt-4 w-full`}
              onClick={() => {
                setActionError(null);
                setPending({ kind: "send" });
              }}
            >
              Kirim invoice
            </button>
          ) : null}

          {canDelete && !isCancelled && !isPaid ? (
            <button
              type="button"
              className={`${buttonDanger} mt-2 w-full`}
              onClick={() => {
                setActionError(null);
                setPending({ kind: "cancel" });
              }}
            >
              Batalkan invoice
            </button>
          ) : null}
        </Card>

        <Card>
          <h2 className="text-[13.5px] font-semibold">Ringkasan</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-[color:var(--bjork-text-muted)]">Subtotal</dt>
              <dd className="text-[color:var(--bjork-text)]">
                {formatRupiah(invoice.subtotal)}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-[color:var(--bjork-text-muted)]">Diskon</dt>
              <dd className="text-[color:var(--bjork-text)]">
                {formatRupiah(invoice.discount_amount)}
              </dd>
            </div>
            <div className="flex justify-between gap-3 border-t border-[color:var(--bjork-border)] pt-2">
              <dt className="font-semibold text-[color:var(--bjork-text)]">
                Total
              </dt>
              <dd className="font-semibold text-[color:var(--bjork-text)]">
                {formatRupiah(invoice.total_amount)}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-[color:var(--bjork-text-muted)]">Dibayar</dt>
              <dd className="text-[color:var(--blk-success)]">
                {formatRupiah(invoice.paid_amount)}
              </dd>
            </div>
            <div className="flex justify-between gap-3 border-t border-[color:var(--bjork-border)] pt-2">
              <dt className="font-semibold text-[color:var(--bjork-text)]">
                Sisa
              </dt>
              <dd
                className={cn(
                  "font-semibold",
                  remaining > 0
                    ? "text-[color:var(--blk-warning)]"
                    : "text-[color:var(--blk-success)]",
                )}
              >
                {formatRupiah(Math.max(remaining, 0))}
              </dd>
            </div>
          </dl>
          {remaining < 0 ? (
            <p className="mt-3 rounded-lg border border-[color:var(--blk-warning)]/30 bg-[var(--blk-warning-soft)] px-3 py-2 text-xs text-[color:var(--blk-warning)]">
              Pembayaran melebihi total invoice. Periksa kembali nominal yang
              dicatat.
            </p>
          ) : null}
        </Card>

        {canManage && isDraft ? (
          <Card>
            <h2 className="text-[13.5px] font-semibold">Pengaturan draft</h2>
            <form onSubmit={handleSettings} className="mt-4 space-y-4">
              <Field label="Diskon (Rp)">
                <input
                  name="discount_amount"
                  type="number"
                  min={0}
                  step={1000}
                  className={inputClass}
                  defaultValue={invoice.discount_amount}
                />
              </Field>

              <Field label="Jatuh tempo">
                <input
                  name="due_at"
                  type="datetime-local"
                  className={inputClass}
                  defaultValue={toJakartaInput(invoice.due_at)}
                />
              </Field>

              <Field label="Catatan">
                <textarea
                  name="notes"
                  rows={3}
                  maxLength={1000}
                  className={inputClass}
                  defaultValue={invoice.notes ?? ""}
                />
              </Field>

              <FormError message={settingsError} />

              <FormActions>
                <button
                  type="submit"
                  disabled={settingsBusy}
                  className={buttonPrimary}
                >
                  {settingsBusy ? "Menyimpan…" : "Simpan pengaturan"}
                </button>
              </FormActions>
            </form>
          </Card>
        ) : (
          <Card>
            <h2 className="text-[13.5px] font-semibold">Catatan invoice</h2>
            <p className="mt-2 whitespace-pre-line text-[13px] text-[color:var(--bjork-text-muted)]">
              {invoice.notes || "Tidak ada catatan."}
            </p>
            <p className="mt-2 text-[12px] text-[color:var(--bjork-text-muted)]">
              Jatuh tempo: {formatDateTime(invoice.due_at)}
            </p>
            {!isDraft && !isCancelled ? (
              <p className="mt-2 text-[12px] text-[color:var(--bjork-text-faint)]">
                Diskon dan jatuh tempo terkunci setelah invoice dikirim.
              </p>
            ) : null}
          </Card>
        )}

        {canDelete ? (
          <Card>
            <h2 className="text-[13.5px] font-semibold">Zona berbahaya</h2>
            <p className="mt-1 text-[12px] text-[color:var(--bjork-text-muted)]">
              Invoice dengan pembayaran tidak bisa dihapus sebelum pembayarannya
              dihapus.
            </p>
            <button
              type="button"
              onClick={() => {
                setActionError(null);
                setPending({ kind: "delete-invoice" });
              }}
              className={`${buttonDanger} mt-4`}
            >
              Hapus invoice
            </button>
          </Card>
        ) : null}
      </div>

      <ConfirmDialog
        open={pending !== null}
        title={pendingCopy?.title ?? ""}
        description={pendingCopy?.description}
        confirmLabel={pendingCopy?.confirmLabel}
        tone={pendingCopy?.tone}
        busy={actionBusy}
        onClose={() => {
          if (actionBusy) return;
          setPending(null);
          setActionError(null);
        }}
        onConfirm={runPending}
      >
        {actionError ? (
          <p
            role="alert"
            className="rounded-lg border border-[var(--blk-error)]/40 bg-[var(--blk-error-soft)] px-3 py-2 text-[12px] text-[color:var(--blk-error)]"
          >
            {actionError}
          </p>
        ) : null}
      </ConfirmDialog>
    </div>
  );
}
