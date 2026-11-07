"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";

import {
  buttonGhost,
  buttonPrimary,
  buttonSmall,
  buttonSmallDanger,
  Field,
  FormActions,
  FormError,
  inputClass,
} from "@/components/admin/form-controls";
import { Card, EmptyState } from "@/components/admin/ui";
import { apiRequest } from "@/lib/admin/client-api";
import { emptyToNull, textValue } from "@/lib/admin/form-utils";
import { formatDate } from "@/lib/admin/format";
import type { Customer } from "@/lib/admin/types";

export function CustomerManager({
  customers,
  canDelete,
}: {
  customers: Customer[];
  canDelete: boolean;
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return customers;
    return customers.filter(
      (customer) =>
        customer.full_name.toLowerCase().includes(term) ||
        customer.phone.includes(term),
    );
  }, [customers, search]);

  function openCreate() {
    setEditing(null);
    setError(null);
    setShowForm(true);
    setFormKey((value) => value + 1);
    requestAnimationFrame(() => {
      document.getElementById("customer-form")?.scrollIntoView({ block: "start" });
    });
  }

  function openEdit(customer: Customer) {
    setEditing(customer);
    setError(null);
    setShowForm(true);
    setFormKey((value) => value + 1);
    requestAnimationFrame(() => {
      document.getElementById("customer-form")?.scrollIntoView({ block: "start" });
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const payload = {
      full_name: textValue(form.get("full_name")),
      phone: textValue(form.get("phone")),
      email: emptyToNull(form.get("email")),
      address: emptyToNull(form.get("address")),
      notes: emptyToNull(form.get("notes")),
    };

    const result = await apiRequest<Customer>(
      editing ? `/api/admin/customers/${editing.id}` : "/api/admin/customers",
      {
        method: editing ? "PATCH" : "POST",
        body: JSON.stringify(payload),
      },
    );

    setBusy(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setEditing(null);
    setShowForm(false);
    router.refresh();
  }

  async function handleDelete(customer: Customer) {
    if (!window.confirm(`Hapus pelanggan "${customer.full_name}"?`)) return;

    setBusyId(customer.id);
    const result = await apiRequest<{ deleted: boolean }>(
      `/api/admin/customers/${customer.id}`,
      { method: "DELETE" },
    );
    setBusyId(null);

    if (!result.ok) {
      window.alert(result.message);
      return;
    }

    router.refresh();
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          className={`${inputClass} sm:max-w-sm`}
          placeholder="Cari nama atau nomor HP…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <button type="button" onClick={openCreate} className={buttonPrimary}>
          Tambah pelanggan
        </button>
      </div>

      {showForm ? (
        <div id="customer-form">
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-chrome">
                {editing ? `Ubah ${editing.full_name}` : "Pelanggan baru"}
              </h2>
              <button
                type="button"
                className={buttonGhost}
                onClick={() => {
                  setShowForm(false);
                  setEditing(null);
                }}
              >
                Tutup
              </button>
            </div>

            <form
              key={`${editing?.id ?? "new"}-${formKey}`}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Nama lengkap">
                  <input
                    name="full_name"
                    className={inputClass}
                    required
                    minLength={2}
                    maxLength={120}
                    defaultValue={editing?.full_name ?? ""}
                  />
                </Field>
                <Field label="Nomor HP" hint="Boleh +62, spasi, atau tanda hubung.">
                  <input
                    name="phone"
                    className={inputClass}
                    required
                    defaultValue={editing?.phone ?? ""}
                  />
                </Field>
                <Field label="Email (opsional)">
                  <input
                    name="email"
                    type="email"
                    className={inputClass}
                    defaultValue={editing?.email ?? ""}
                  />
                </Field>
                <Field label="Alamat (opsional)">
                  <input
                    name="address"
                    className={inputClass}
                    defaultValue={editing?.address ?? ""}
                  />
                </Field>
              </div>

              <Field label="Catatan (opsional)">
                <textarea
                  name="notes"
                  rows={3}
                  className={inputClass}
                  defaultValue={editing?.notes ?? ""}
                />
              </Field>

              <FormError message={error} />

              <FormActions>
                <button type="submit" disabled={busy} className={buttonPrimary}>
                  {busy ? "Menyimpan…" : editing ? "Simpan perubahan" : "Tambah"}
                </button>
              </FormActions>
            </form>
          </Card>
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <EmptyState
          title="Belum ada pelanggan"
          description="Tambahkan pelanggan sebelum membuat perangkat atau order servis."
        />
      ) : (
        <Card className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-[11px] uppercase tracking-[0.14em] text-dim">
                <tr>
                  <th className="px-4 py-3 font-semibold">Pelanggan</th>
                  <th className="px-4 py-3 font-semibold">Nomor HP</th>
                  <th className="px-4 py-3 font-semibold">Alamat</th>
                  <th className="px-4 py-3 font-semibold">Dibuat</th>
                  <th className="px-4 py-3 text-right font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((customer) => (
                  <tr key={customer.id} className="border-t border-white/8">
                    <td className="px-4 py-3">
                      <p className="font-medium text-chrome">{customer.full_name}</p>
                      {customer.email ? (
                        <p className="text-xs text-dim">{customer.email}</p>
                      ) : null}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-dim">
                      {customer.phone}
                    </td>
                    <td className="max-w-[16rem] truncate px-4 py-3 text-dim">
                      {customer.address ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-dim">
                      {formatDate(customer.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          className={buttonSmall}
                          onClick={() => openEdit(customer)}
                        >
                          Ubah
                        </button>
                        {canDelete ? (
                          <button
                            type="button"
                            className={buttonSmallDanger}
                            disabled={busyId === customer.id}
                            onClick={() => handleDelete(customer)}
                          >
                            {busyId === customer.id ? "…" : "Hapus"}
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {!canDelete ? (
        <p className="text-xs text-dim">
          Hapus data pelanggan hanya tersedia untuk owner.
        </p>
      ) : null}
    </div>
  );
}
