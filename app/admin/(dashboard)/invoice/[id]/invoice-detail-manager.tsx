"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import {
  buttonDanger,
  buttonPrimary,
  buttonSmallDanger,
  Field,
  FormActions,
  FormError,
  inputClass,
} from "@/components/admin/form-controls";
import { Card } from "@/components/admin/ui";
import { apiRequest } from "@/lib/admin/client-api";
import {
  emptyToNull,
  numberValue,
  textValue,
} from "@/lib/admin/form-utils";
import {
  formatDateTime,
  formatRupiah,
  fromJakartaInput,
  invoiceStatusLabels,
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

const INVOICE_STATUSES = Object.keys(invoiceStatusLabels) as InvoiceStatus[];
const PAYMENT_METHODS = Object.keys(paymentMethodLabels) as PaymentMethod[];

export function InvoiceDetailManager({
  invoice,
  spareparts,
  canDelete,
}: {
  invoice: InvoiceDetail;
  spareparts: Sparepart[];
  canDelete: boolean;
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
  const [busyItemId, setBusyItemId] = useState<string | null>(null);

  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("tunai");
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentPaidAt, setPaymentPaidAt] = useState("");
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentBusy, setPaymentBusy] = useState(false);
  const [busyPaymentId, setBusyPaymentId] = useState<string | null>(null);

  const [deleteBusy, setDeleteBusy] = useState(false);

  const remaining = invoice.total_amount - invoice.paid_amount;

  async function handleSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSettingsError(null);
    setSettingsBusy(true);

    const form = new FormData(event.currentTarget);
    const payload = {
      status: textValue(form.get("status")),
      discount_amount: numberValue(form.get("discount_amount"), 0),
      due_at: fromJakartaInput(textValue(form.get("due_at"))),
      notes: emptyToNull(form.get("notes")),
    };

    const result = await apiRequest<InvoiceDetail>(
      `/api/admin/invoices/${invoice.id}`,
      { method: "PATCH", body: JSON.stringify(payload) },
    );

    setSettingsBusy(false);

    if (!result.ok) {
      setSettingsError(result.message);
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

  async function handleDeleteItem(item: InvoiceItem) {
    if (!window.confirm(`Hapus item "${item.description}"?`)) return;

    setBusyItemId(item.id);
    const result = await apiRequest<{ deleted: boolean }>(
      `/api/admin/invoice-items/${item.id}`,
      { method: "DELETE" },
    );
    setBusyItemId(null);

    if (!result.ok) {
      window.alert(result.message);
      return;
    }

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

  async function handleDeletePayment(payment: Payment) {
    if (
      !window.confirm(
        `Hapus pembayaran ${formatRupiah(payment.amount)} pada ${formatDateTime(
          payment.paid_at,
        )}?`,
      )
    ) {
      return;
    }

    setBusyPaymentId(payment.id);
    const result = await apiRequest<{ deleted: boolean }>(
      `/api/admin/payments/${payment.id}`,
      { method: "DELETE" },
    );
    setBusyPaymentId(null);

    if (!result.ok) {
      window.alert(result.message);
      return;
    }

    router.refresh();
  }

  async function handleDeleteInvoice() {
    if (
      !window.confirm(
        `Hapus invoice ${invoice.invoice_number}? Item dan pembayaran harus sudah dihapus.`,
      )
    ) {
      return;
    }

    setDeleteBusy(true);
    const result = await apiRequest<{ deleted: boolean }>(
      `/api/admin/invoices/${invoice.id}`,
      { method: "DELETE" },
    );
    setDeleteBusy(false);

    if (!result.ok) {
      window.alert(result.message);
      return;
    }

    router.push("/admin/invoice");
    router.refresh();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
      <div className="space-y-6">
        <Card className="p-0">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div>
              <h2 className="font-display text-lg font-bold text-chrome">
                Item invoice
              </h2>
              <p className="text-xs text-dim">
                Jumlah baris dan subtotal dihitung ulang otomatis.
              </p>
            </div>
            <span className="text-xs text-dim">
              {invoice.invoice_items.length} item
            </span>
          </div>

          {invoice.invoice_items.length === 0 ? (
            <p className="px-5 py-6 text-sm text-dim">
              Belum ada item. Tambahkan jasa atau sparepart di bawah.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-[11px] uppercase tracking-[0.14em] text-dim">
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
                    <tr key={item.id} className="border-t border-white/8">
                      <td className="px-5 py-3 text-chrome">
                        {item.description}
                        {item.sparepart_id ? (
                          <span className="ml-2 text-[11px] text-dim">
                            (sparepart)
                          </span>
                        ) : null}
                      </td>
                      <td className="px-5 py-3 text-dim">{item.quantity}</td>
                      <td className="whitespace-nowrap px-5 py-3 text-dim">
                        {formatRupiah(item.unit_price)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-chrome">
                        {formatRupiah(item.line_total)}
                      </td>
                      <td className="px-5 py-3 text-right">
                        {canDelete ? (
                          <button
                            type="button"
                            className={buttonSmallDanger}
                            disabled={busyItemId === item.id}
                            onClick={() => handleDeleteItem(item)}
                          >
                            {busyItemId === item.id ? "…" : "Hapus"}
                          </button>
                        ) : (
                          <span className="text-xs text-dim">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <form
            onSubmit={handleAddItem}
            className="space-y-4 border-t border-white/10 px-5 py-5"
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
        </Card>

        <Card className="p-0">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div>
              <h2 className="font-display text-lg font-bold text-chrome">
                Pembayaran
              </h2>
              <p className="text-xs text-dim">
                Status lunas mengikuti total pembayaran yang masuk.
              </p>
            </div>
            <span className="text-xs text-dim">
              {invoice.payments.length} transaksi
            </span>
          </div>

          {invoice.payments.length === 0 ? (
            <p className="px-5 py-6 text-sm text-dim">
              Belum ada pembayaran tercatat.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-[11px] uppercase tracking-[0.14em] text-dim">
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
                    <tr key={payment.id} className="border-t border-white/8">
                      <td className="whitespace-nowrap px-5 py-3 text-dim">
                        {formatDateTime(payment.paid_at)}
                      </td>
                      <td className="px-5 py-3 text-chrome">
                        {paymentMethodLabels[payment.method]}
                      </td>
                      <td className="px-5 py-3 text-dim">
                        {payment.reference ?? "—"}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-chrome">
                        {formatRupiah(payment.amount)}
                      </td>
                      <td className="px-5 py-3 text-right">
                        {canDelete ? (
                          <button
                            type="button"
                            className={buttonSmallDanger}
                            disabled={busyPaymentId === payment.id}
                            onClick={() => handleDeletePayment(payment)}
                          >
                            {busyPaymentId === payment.id ? "…" : "Hapus"}
                          </button>
                        ) : (
                          <span className="text-xs text-dim">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <form
            onSubmit={handleAddPayment}
            className="space-y-4 border-t border-white/10 px-5 py-5"
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
                  onChange={(event) => setPaymentReference(event.target.value)}
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
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <h2 className="font-display text-lg font-bold text-chrome">
            Ringkasan
          </h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-dim">Subtotal</dt>
              <dd className="text-chrome">{formatRupiah(invoice.subtotal)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-dim">Diskon</dt>
              <dd className="text-chrome">
                {formatRupiah(invoice.discount_amount)}
              </dd>
            </div>
            <div className="flex justify-between gap-3 border-t border-white/10 pt-2">
              <dt className="font-semibold text-chrome">Total</dt>
              <dd className="font-semibold text-chrome">
                {formatRupiah(invoice.total_amount)}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-dim">Dibayar</dt>
              <dd className="text-emerald-200">
                {formatRupiah(invoice.paid_amount)}
              </dd>
            </div>
            <div className="flex justify-between gap-3 border-t border-white/10 pt-2">
              <dt className="font-semibold text-chrome">Sisa</dt>
              <dd
                className={
                  remaining > 0
                    ? "font-semibold text-amber-200"
                    : "font-semibold text-emerald-200"
                }
              >
                {formatRupiah(Math.max(remaining, 0))}
              </dd>
            </div>
          </dl>
          {remaining < 0 ? (
            <p className="mt-3 rounded-lg border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-xs text-amber-200">
              Pembayaran melebihi total invoice. Periksa kembali nominal yang
              dicatat.
            </p>
          ) : null}
        </Card>

        <Card>
          <h2 className="font-display text-lg font-bold text-chrome">
            Pengaturan invoice
          </h2>
          <form onSubmit={handleSettings} className="mt-4 space-y-4">
            <Field label="Status">
              <select
                key={invoice.status}
                name="status"
                className={inputClass}
                defaultValue={invoice.status}
              >
                {INVOICE_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {invoiceStatusLabels[status]}
                  </option>
                ))}
              </select>
            </Field>

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

        {canDelete ? (
          <Card>
            <h2 className="font-display text-lg font-bold text-chrome">
              Zona berbahaya
            </h2>
            <p className="mt-1 text-xs text-dim">
              Invoice dengan pembayaran tidak bisa dihapus sebelum pembayarannya
              dihapus.
            </p>
            <button
              type="button"
              onClick={handleDeleteInvoice}
              disabled={deleteBusy}
              className={`${buttonDanger} mt-4`}
            >
              {deleteBusy ? "Menghapus…" : "Hapus invoice"}
            </button>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
