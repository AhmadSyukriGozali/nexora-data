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
import { Badge, Card, EmptyState } from "@/components/admin/ui";
import { apiRequest } from "@/lib/admin/client-api";
import {
  booleanValue,
  emptyToNull,
  numberValue,
  textValue,
} from "@/lib/admin/form-utils";
import {
  formatDateTime,
  formatRupiah,
  stockMovementLabels,
} from "@/lib/admin/format";
import type {
  OrderOption,
  Sparepart,
  StockMovement,
  StockMovementType,
} from "@/lib/admin/types";

const MOVEMENT_TYPES = Object.keys(
  stockMovementLabels,
) as StockMovementType[];

type ActiveFilter = "all" | "active" | "inactive";

export function SparepartManager({
  spareparts,
  movements,
  orders,
  canDelete,
}: {
  spareparts: Sparepart[];
  movements: StockMovement[];
  orders: OrderOption[];
  canDelete: boolean;
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("all");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Sparepart | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [stockTargetId, setStockTargetId] = useState<string | null>(null);
  const [stockType, setStockType] = useState<StockMovementType>("masuk");
  const [stockQuantity, setStockQuantity] = useState("");
  const [stockNote, setStockNote] = useState("");
  const [stockOrderId, setStockOrderId] = useState("");
  const [stockError, setStockError] = useState<string | null>(null);
  const [stockBusy, setStockBusy] = useState(false);

  const [movementFilter, setMovementFilter] = useState("all");

  const stockTarget = stockTargetId
    ? spareparts.find((sparepart) => sparepart.id === stockTargetId) ?? null
    : null;

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return spareparts.filter((sparepart) => {
      if (activeFilter === "active" && !sparepart.is_active) return false;
      if (activeFilter === "inactive" && sparepart.is_active) return false;
      if (!term) return true;
      return (
        sparepart.sku.toLowerCase().includes(term) ||
        sparepart.name.toLowerCase().includes(term) ||
        (sparepart.category ?? "").toLowerCase().includes(term)
      );
    });
  }, [spareparts, search, activeFilter]);

  const filteredMovements = useMemo(() => {
    if (movementFilter === "all") return movements;
    return movements.filter(
      (movement) => movement.sparepart_id === movementFilter,
    );
  }, [movements, movementFilter]);

  function openCreate() {
    setEditing(null);
    setError(null);
    setFormKey((value) => value + 1);
    setShowForm(true);
    requestAnimationFrame(() => {
      document
        .getElementById("sparepart-form")
        ?.scrollIntoView({ block: "start" });
    });
  }

  function openEdit(sparepart: Sparepart) {
    setEditing(sparepart);
    setError(null);
    setFormKey((value) => value + 1);
    setShowForm(true);
    requestAnimationFrame(() => {
      document
        .getElementById("sparepart-form")
        ?.scrollIntoView({ block: "start" });
    });
  }

  function openStock(sparepart: Sparepart) {
    setStockTargetId(sparepart.id);
    setStockType("masuk");
    setStockQuantity("");
    setStockNote("");
    setStockOrderId("");
    setStockError(null);
    requestAnimationFrame(() => {
      document.getElementById("stock-form")?.scrollIntoView({ block: "start" });
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const payload = {
      sku: textValue(form.get("sku")),
      name: textValue(form.get("name")),
      category: emptyToNull(form.get("category")),
      unit: textValue(form.get("unit")) || "pcs",
      cost_price: numberValue(form.get("cost_price"), 0),
      sell_price: numberValue(form.get("sell_price"), 0),
      min_stock: numberValue(form.get("min_stock"), 0),
      is_active: booleanValue(form.get("is_active")),
    };

    const result = await apiRequest<Sparepart>(
      editing ? `/api/admin/spareparts/${editing.id}` : "/api/admin/spareparts",
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

    setShowForm(false);
    setEditing(null);
    router.refresh();
  }

  async function handleDelete(sparepart: Sparepart) {
    if (!window.confirm(`Hapus sparepart "${sparepart.name}"?`)) return;

    setBusyId(sparepart.id);
    const result = await apiRequest<{ deleted: boolean }>(
      `/api/admin/spareparts/${sparepart.id}`,
      { method: "DELETE" },
    );
    setBusyId(null);

    if (!result.ok) {
      window.alert(result.message);
      return;
    }

    router.refresh();
  }

  async function handleStock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!stockTarget) return;
    setStockError(null);

    const quantity = Number(stockQuantity);
    if (!Number.isInteger(quantity)) {
      setStockError("Jumlah harus bilangan bulat.");
      return;
    }
    if (stockType === "penyesuaian") {
      if (quantity === 0) {
        setStockError("Penyesuaian tidak boleh 0.");
        return;
      }
    } else if (quantity < 1) {
      setStockError("Jumlah masuk/keluar minimal 1.");
      return;
    }

    setStockBusy(true);
    const result = await apiRequest<{
      movement: StockMovement;
      stock_quantity: number | null;
    }>(`/api/admin/spareparts/${stockTarget.id}/movements`, {
      method: "POST",
      body: JSON.stringify({
        movement_type: stockType,
        quantity,
        note: emptyToNull(stockNote),
        order_id: stockOrderId || null,
      }),
    });
    setStockBusy(false);

    if (!result.ok) {
      setStockError(result.message);
      return;
    }

    setStockQuantity("");
    setStockNote("");
    setStockOrderId("");
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            className={`${inputClass} sm:max-w-xs`}
            placeholder="Cari SKU, nama, kategori…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select
            className={`${inputClass} sm:max-w-[10rem]`}
            value={activeFilter}
            onChange={(event) =>
              setActiveFilter(event.target.value as ActiveFilter)
            }
          >
            <option value="all">Semua status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Nonaktif</option>
          </select>
        </div>
        <button type="button" onClick={openCreate} className={buttonPrimary}>
          Tambah sparepart
        </button>
      </div>

      {showForm ? (
        <div id="sparepart-form">
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-bold text-chrome">
                  {editing ? `Ubah ${editing.name}` : "Sparepart baru"}
                </h2>
                <p className="text-xs text-dim">
                  Stok awal 0. Tambahkan stok lewat form buku stok setelah
                  sparepart dibuat.
                </p>
              </div>
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
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <Field label="SKU">
                  <input
                    name="sku"
                    className={inputClass}
                    required
                    maxLength={64}
                    defaultValue={editing?.sku ?? ""}
                    placeholder="LCD-IP11"
                  />
                </Field>

                <Field label="Nama">
                  <input
                    name="name"
                    className={inputClass}
                    required
                    minLength={2}
                    maxLength={120}
                    defaultValue={editing?.name ?? ""}
                  />
                </Field>

                <Field label="Kategori (opsional)">
                  <input
                    name="category"
                    className={inputClass}
                    maxLength={80}
                    defaultValue={editing?.category ?? ""}
                  />
                </Field>

                <Field label="Satuan">
                  <input
                    name="unit"
                    className={inputClass}
                    maxLength={20}
                    defaultValue={editing?.unit ?? "pcs"}
                  />
                </Field>

                <Field label="Harga modal (Rp)">
                  <input
                    name="cost_price"
                    type="number"
                    min={0}
                    step={1000}
                    className={inputClass}
                    defaultValue={editing?.cost_price ?? 0}
                  />
                </Field>

                <Field label="Harga jual (Rp)">
                  <input
                    name="sell_price"
                    type="number"
                    min={0}
                    step={1000}
                    className={inputClass}
                    defaultValue={editing?.sell_price ?? 0}
                  />
                </Field>

                <Field label="Stok minimum">
                  <input
                    name="min_stock"
                    type="number"
                    min={0}
                    step={1}
                    className={inputClass}
                    defaultValue={editing?.min_stock ?? 0}
                  />
                </Field>

                <label className="flex items-center gap-2 self-end pb-2 text-sm text-chrome">
                  <input
                    name="is_active"
                    type="checkbox"
                    defaultChecked={editing?.is_active ?? true}
                    className="h-4 w-4 rounded border-white/20 bg-navy-soft accent-electric"
                  />
                  Aktif dijual / dipakai
                </label>
              </div>

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

      {stockTarget ? (
        <div id="stock-form">
          <Card className="border-electric/40">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-bold text-chrome">
                  Catat stok · {stockTarget.name}
                </h2>
                <p className="text-xs text-dim">
                  Stok saat ini {stockTarget.stock_quantity}{" "}
                  {stockTarget.unit}. Perubahan langsung masuk buku stok.
                </p>
              </div>
              <button
                type="button"
                className={buttonGhost}
                onClick={() => setStockTargetId(null)}
              >
                Tutup
              </button>
            </div>

            <form onSubmit={handleStock} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Field label="Jenis pergerakan">
                  <select
                    className={inputClass}
                    value={stockType}
                    onChange={(event) =>
                      setStockType(event.target.value as StockMovementType)
                    }
                  >
                    {MOVEMENT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {stockMovementLabels[type]}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field
                  label="Jumlah"
                  hint={
                    stockType === "penyesuaian"
                      ? "Boleh negatif, mis. -2 untuk koreksi kurang."
                      : "Selalu positif."
                  }
                >
                  <input
                    className={inputClass}
                    type="number"
                    step={1}
                    min={stockType === "penyesuaian" ? -1000000 : 1}
                    max={1000000}
                    required
                    value={stockQuantity}
                    onChange={(event) => setStockQuantity(event.target.value)}
                  />
                </Field>

                <Field label="Order terkait (opsional)">
                  <select
                    className={inputClass}
                    value={stockOrderId}
                    onChange={(event) => setStockOrderId(event.target.value)}
                  >
                    <option value="">Tanpa order</option>
                    {orders.map((order) => (
                      <option key={order.id} value={order.id}>
                        {order.ticket_number}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Catatan (opsional)">
                  <input
                    className={inputClass}
                    maxLength={500}
                    value={stockNote}
                    onChange={(event) => setStockNote(event.target.value)}
                    placeholder="Contoh: pembelian dari supplier"
                  />
                </Field>
              </div>

              <FormError message={stockError} />

              <FormActions>
                <button
                  type="submit"
                  disabled={stockBusy}
                  className={buttonPrimary}
                >
                  {stockBusy ? "Menyimpan…" : "Simpan pergerakan"}
                </button>
              </FormActions>
            </form>
          </Card>
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <EmptyState
          title="Belum ada sparepart"
          description="Tambahkan sparepart agar bisa dipakai pada item invoice dan buku stok."
        />
      ) : (
        <Card className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-[11px] uppercase tracking-[0.14em] text-dim">
                <tr>
                  <th className="px-4 py-3 font-semibold">Sparepart</th>
                  <th className="px-4 py-3 font-semibold">Kategori</th>
                  <th className="px-4 py-3 font-semibold">Stok</th>
                  <th className="px-4 py-3 font-semibold">Harga jual</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((sparepart) => {
                  const low =
                    sparepart.is_active &&
                    sparepart.stock_quantity <= sparepart.min_stock;
                  return (
                    <tr key={sparepart.id} className="border-t border-white/8">
                      <td className="px-4 py-3">
                        <p className="font-medium text-chrome">
                          {sparepart.name}
                        </p>
                        <p className="font-mono text-[11px] text-dim">
                          {sparepart.sku}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-dim">
                        {sparepart.category ?? "—"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span
                          className={
                            low
                              ? "font-semibold text-red-200"
                              : "text-chrome"
                          }
                        >
                          {sparepart.stock_quantity} {sparepart.unit}
                        </span>
                        <span className="block text-[11px] text-dim">
                          min. {sparepart.min_stock}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-dim">
                        {formatRupiah(sparepart.sell_price)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={sparepart.is_active ? "green" : "dark"}>
                          {sparepart.is_active ? "Aktif" : "Nonaktif"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            className={buttonSmall}
                            onClick={() => openStock(sparepart)}
                          >
                            Catat stok
                          </button>
                          <button
                            type="button"
                            className={buttonSmall}
                            onClick={() => openEdit(sparepart)}
                          >
                            Ubah
                          </button>
                          {canDelete ? (
                            <button
                              type="button"
                              className={buttonSmallDanger}
                              disabled={busyId === sparepart.id}
                              onClick={() => handleDelete(sparepart)}
                            >
                              {busyId === sparepart.id ? "…" : "Hapus"}
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Card className="p-0">
        <div className="flex flex-col gap-3 border-b border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-chrome">
              Buku stok terbaru
            </h2>
            <p className="text-xs text-dim">
              200 pergerakan terakhir. Riwayat stok bersifat permanen.
            </p>
          </div>
          <select
            className={`${inputClass} sm:max-w-[16rem]`}
            value={movementFilter}
            onChange={(event) => setMovementFilter(event.target.value)}
          >
            <option value="all">Semua sparepart</option>
            {spareparts.map((sparepart) => (
              <option key={sparepart.id} value={sparepart.id}>
                {sparepart.name}
              </option>
            ))}
          </select>
        </div>

        {filteredMovements.length === 0 ? (
          <p className="px-5 py-6 text-sm text-dim">
            Belum ada pergerakan stok.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-[11px] uppercase tracking-[0.14em] text-dim">
                <tr>
                  <th className="px-5 py-3 font-semibold">Waktu</th>
                  <th className="px-5 py-3 font-semibold">Sparepart</th>
                  <th className="px-5 py-3 font-semibold">Jenis</th>
                  <th className="px-5 py-3 font-semibold">Jumlah</th>
                  <th className="px-5 py-3 font-semibold">Order</th>
                  <th className="px-5 py-3 font-semibold">Catatan</th>
                  <th className="px-5 py-3 font-semibold">Staf</th>
                </tr>
              </thead>
              <tbody>
                {filteredMovements.map((movement) => {
                  const delta =
                    movement.movement_type === "keluar"
                      ? -movement.quantity
                      : movement.quantity;
                  return (
                    <tr key={movement.id} className="border-t border-white/8">
                      <td className="whitespace-nowrap px-5 py-3 text-xs text-dim">
                        {formatDateTime(movement.created_at)}
                      </td>
                      <td className="px-5 py-3 text-chrome">
                        {movement.sparepart?.name ?? "—"}
                        <span className="block font-mono text-[11px] text-dim">
                          {movement.sparepart?.sku ?? ""}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-dim">
                        {stockMovementLabels[movement.movement_type]}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3">
                        <span
                          className={
                            delta >= 0 ? "text-emerald-200" : "text-red-200"
                          }
                        >
                          {delta > 0 ? `+${delta}` : delta}
                        </span>
                      </td>
                      <td className="px-5 py-3 font-mono text-xs text-dim">
                        {movement.order?.ticket_number ?? "—"}
                      </td>
                      <td className="max-w-[18rem] px-5 py-3 text-dim">
                        {movement.note ?? "—"}
                      </td>
                      <td className="px-5 py-3 text-xs text-dim">
                        {movement.staff?.full_name || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
