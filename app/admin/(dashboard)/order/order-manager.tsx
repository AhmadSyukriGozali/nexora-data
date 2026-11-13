"use client";

import Link from "next/link";
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
import {
  Card,
  EmptyState,
  ServiceStatusBadge,
  StatStrip,
} from "@/components/admin/ui";
import { apiRequest } from "@/lib/admin/client-api";
import { equipmentFromFormData } from "@/lib/admin/equipment";
import {
  emptyToNull,
  numberValue,
  textValue,
} from "@/lib/admin/form-utils";
import {
  deviceTypeLabels,
  formatDateTime,
  formatRupiah,
  fromJakartaInput,
  serviceStatusLabels,
} from "@/lib/admin/format";
import type {
  CustomerOption,
  Device,
  Order,
  ServiceStatus,
} from "@/lib/admin/types";

import { EquipmentField } from "./equipment-field";

const STATUSES = Object.keys(serviceStatusLabels) as ServiceStatus[];

export function OrderManager({
  orders,
  customers,
  devices,
  canDelete,
  canCreate,
}: {
  orders: Order[];
  customers: CustomerOption[];
  devices: Device[];
  canDelete: boolean;
  canCreate: boolean;
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ServiceStatus>("all");
  const [showForm, setShowForm] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [customerId, setCustomerId] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const customerDevices = useMemo(
    () => devices.filter((device) => device.customer_id === customerId),
    [devices, customerId],
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return orders.filter((order) => {
      if (statusFilter !== "all" && order.status !== statusFilter) return false;
      if (!term) return true;
      return (
        order.ticket_number.toLowerCase().includes(term) ||
        (order.customer?.full_name ?? "").toLowerCase().includes(term) ||
        (order.customer?.phone ?? "").includes(term) ||
        (order.device?.brand ?? "").toLowerCase().includes(term) ||
        (order.device?.model ?? "").toLowerCase().includes(term) ||
        order.complaint.toLowerCase().includes(term)
      );
    });
  }, [orders, search, statusFilter]);

  function openCreate() {
    setError(null);
    setCustomerId("");
    setDeviceId("");
    setFormKey((value) => value + 1);
    setShowForm(true);
    requestAnimationFrame(() => {
      document.getElementById("order-form")?.scrollIntoView({ block: "start" });
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const payload = {
      customer_id: textValue(form.get("customer_id")),
      device_id: textValue(form.get("device_id")),
      complaint: textValue(form.get("complaint")),
      diagnosis: emptyToNull(form.get("diagnosis")),
      estimated_finish_at: fromJakartaInput(
        textValue(form.get("estimated_finish_at")),
      ),
      total_amount: numberValue(form.get("total_amount"), 0),
      equipment: equipmentFromFormData(
        (name) => form.get(name),
        (name) => form.getAll(name),
      ),
    };

    const result = await apiRequest<Order>("/api/admin/orders", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    setBusy(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setShowForm(false);
    router.refresh();
  }

  async function handleDelete(order: Order) {
    if (!window.confirm(`Hapus order ${order.ticket_number}?`)) return;

    setBusyId(order.id);
    const result = await apiRequest<{ deleted: boolean }>(
      `/api/admin/orders/${order.id}`,
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
      <StatStrip
        items={[
          { label: "Total order", value: orders.length },
          {
            label: "Aktif",
            value: orders.filter(
              (order) =>
                !["selesai", "diambil", "batal"].includes(order.status),
            ).length,
            tone: "accent",
          },
          {
            label: "Perlu persetujuan",
            value: orders.filter(
              (order) => order.status === "menunggu_persetujuan",
            ).length,
            tone: "warning",
          },
          {
            label: "Estimasi biaya",
            value: formatRupiah(
              orders.reduce((total, order) => total + order.total_amount, 0),
            ),
            hint: "Dari order terbaru",
          },
        ]}
      />
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            className={`${inputClass} sm:max-w-xs`}
            placeholder="Cari tiket, pelanggan, perangkat, keluhan…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select
            className={`${inputClass} sm:max-w-[11rem]`}
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as "all" | ServiceStatus)
            }
          >
            <option value="all">Semua status</option>
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {serviceStatusLabels[status]}
              </option>
            ))}
          </select>
        </div>
        {canCreate ? (
          <button type="button" onClick={openCreate} className={buttonPrimary}>
            Order baru
          </button>
        ) : null}
      </div>

      {showForm && canCreate ? (
        <div id="order-form">
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-bold text-[color:var(--bjork-text)]">
                  Order servis baru
                </h2>
                <p className="text-xs text-[color:var(--bjork-text-muted)]">
                  Nomor tiket dibuat otomatis oleh database.
                </p>
              </div>
              <button
                type="button"
                className={buttonGhost}
                onClick={() => setShowForm(false)}
              >
                Tutup
              </button>
            </div>

            <form key={formKey} onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Pelanggan">
                  <select
                    name="customer_id"
                    className={inputClass}
                    required
                    value={customerId}
                    onChange={(event) => {
                      setCustomerId(event.target.value);
                      setDeviceId("");
                    }}
                  >
                    <option value="" disabled>
                      Pilih pelanggan
                    </option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.full_name} · {customer.phone}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field
                  label="Perangkat"
                  hint={
                    customerId
                      ? undefined
                      : "Pilih pelanggan dulu untuk melihat perangkatnya."
                  }
                >
                  <select
                    name="device_id"
                    className={inputClass}
                    required
                    disabled={!customerId}
                    value={deviceId}
                    onChange={(event) => setDeviceId(event.target.value)}
                  >
                    <option value="" disabled>
                      {customerDevices.length === 0
                        ? "Pelanggan ini belum punya perangkat"
                        : "Pilih perangkat"}
                    </option>
                    {customerDevices.map((device) => (
                      <option key={device.id} value={device.id}>
                        {deviceTypeLabels[device.device_type]} · {device.brand}{" "}
                        {device.model}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Estimasi selesai (opsional)">
                  <input
                    name="estimated_finish_at"
                    type="datetime-local"
                    className={inputClass}
                  />
                </Field>

                <Field label="Estimasi biaya (Rp)">
                  <input
                    name="total_amount"
                    type="number"
                    min={0}
                    step={1000}
                    className={inputClass}
                    defaultValue={0}
                  />
                </Field>
              </div>

              <Field label="Keluhan">
                <textarea
                  name="complaint"
                  rows={3}
                  className={inputClass}
                  required
                  minLength={3}
                  maxLength={2000}
                  placeholder="Contoh: layar berkedip dan baterai cepat habis."
                />
              </Field>

              <EquipmentField initial={[]} />

              <Field label="Diagnosa awal (opsional)">
                <textarea
                  name="diagnosis"
                  rows={2}
                  maxLength={2000}
                  className={inputClass}
                />
              </Field>

              <FormError message={error} />

              <FormActions>
                <button
                  type="submit"
                  disabled={busy || !customerId || !deviceId}
                  className={buttonPrimary}
                >
                  {busy ? "Menyimpan…" : "Buat order"}
                </button>
                {customerId && customerDevices.length === 0 ? (
                  <Link href="/admin/perangkat" className={buttonGhost}>
                    Tambah perangkat dulu
                  </Link>
                ) : null}
              </FormActions>
            </form>
          </Card>
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <EmptyState
          title="Belum ada order"
          description="Buat order baru setelah pelanggan dan perangkatnya terdaftar."
        />
      ) : (
        <Card className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-[11px] uppercase tracking-[0.14em] text-[color:var(--bjork-text-muted)]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Tiket</th>
                  <th className="px-4 py-3 font-semibold">Pelanggan</th>
                  <th className="px-4 py-3 font-semibold">Perangkat</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Teknisi</th>
                  <th className="px-4 py-3 font-semibold">Biaya</th>
                  <th className="px-4 py-3 font-semibold">Estimasi</th>
                  <th className="px-4 py-3 font-semibold">Masuk</th>
                  <th className="px-4 py-3 text-right font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr key={order.id} className="border-t border-[color:var(--bjork-border)]">
                    <td className="whitespace-nowrap px-4 py-3">
                      <Link
                        href={`/admin/order/${order.id}`}
                        className="font-mono text-xs text-[color:var(--blk-accent-ink)] hover:text-[color:var(--bjork-text)]"
                      >
                        {order.ticket_number}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[color:var(--bjork-text)]">
                        {order.customer?.full_name ?? "—"}
                      </p>
                      <p className="text-xs text-[color:var(--bjork-text-muted)]">
                        {order.customer?.phone ?? ""}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-[color:var(--bjork-text-muted)]">
                      {order.device ? (
                        <>
                          <span className="block text-[color:var(--bjork-text)]">
                            {order.device.brand} {order.device.model}
                          </span>
                          <span className="text-xs">
                            {deviceTypeLabels[order.device.device_type]}
                          </span>
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <ServiceStatusBadge status={order.status} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-[color:var(--bjork-text-muted)]">
                      {order.technician?.full_name ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-[color:var(--bjork-text-muted)]">
                      {formatRupiah(order.total_amount)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-[color:var(--bjork-text-muted)]">
                      {formatDateTime(order.estimated_finish_at)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-[color:var(--bjork-text-muted)]">
                      {formatDateTime(order.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/order/${order.id}`}
                          className={buttonSmall}
                        >
                          Detail
                        </Link>
                        {canDelete ? (
                          <button
                            type="button"
                            className={buttonSmallDanger}
                            disabled={busyId === order.id}
                            onClick={() => handleDelete(order)}
                          >
                            {busyId === order.id ? "…" : "Hapus"}
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

      <p className="text-xs text-[color:var(--bjork-text-muted)]">
        Menampilkan maksimal 200 order terbaru. Gunakan pencarian atau filter
        status untuk mempersempit data.
      </p>
    </div>
  );
}
