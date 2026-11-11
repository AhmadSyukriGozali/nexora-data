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
import {
  Badge,
  Card,
  EmptyState,
  StatStrip,
} from "@/components/admin/ui";
import { apiRequest } from "@/lib/admin/client-api";
import { emptyToNull, textValue } from "@/lib/admin/form-utils";
import { deviceTypeLabels, formatDate } from "@/lib/admin/format";
import type {
  CustomerOption,
  Device,
  DeviceType,
} from "@/lib/admin/types";

const DEVICE_TYPES: DeviceType[] = ["hp", "laptop", "pc", "printer"];

export function DeviceManager({
  devices,
  customers,
  canManage,
  canDelete,
}: {
  devices: Device[];
  customers: CustomerOption[];
  canManage: boolean;
  canDelete: boolean;
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | DeviceType>("all");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Device | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return devices.filter((device) => {
      const matchesType = typeFilter === "all" || device.device_type === typeFilter;
      if (!matchesType) return false;
      if (!term) return true;
      return (
        device.brand.toLowerCase().includes(term) ||
        device.model.toLowerCase().includes(term) ||
        (device.serial_number ?? "").toLowerCase().includes(term) ||
        (device.customer?.full_name ?? "").toLowerCase().includes(term)
      );
    });
  }, [devices, search, typeFilter]);

  function openCreate() {
    setEditing(null);
    setError(null);
    setShowForm(true);
    setFormKey((value) => value + 1);
    requestAnimationFrame(() => {
      document.getElementById("device-form")?.scrollIntoView({ block: "start" });
    });
  }

  function openEdit(device: Device) {
    setEditing(device);
    setError(null);
    setShowForm(true);
    setFormKey((value) => value + 1);
    requestAnimationFrame(() => {
      document.getElementById("device-form")?.scrollIntoView({ block: "start" });
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const payload = {
      customer_id: textValue(form.get("customer_id")),
      device_type: textValue(form.get("device_type")),
      brand: textValue(form.get("brand")),
      model: textValue(form.get("model")),
      serial_number: emptyToNull(form.get("serial_number")),
      notes: emptyToNull(form.get("notes")),
    };

    const result = await apiRequest<Device>(
      editing ? `/api/admin/devices/${editing.id}` : "/api/admin/devices",
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

  async function handleDelete(device: Device) {
    const label = `${device.brand} ${device.model}`.trim();
    if (!window.confirm(`Hapus perangkat "${label}"?`)) return;

    setBusyId(device.id);
    const result = await apiRequest<{ deleted: boolean }>(
      `/api/admin/devices/${device.id}`,
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
          { label: "Total perangkat", value: devices.length },
          {
            label: "Punya serial",
            value: devices.filter((device) => device.serial_number).length,
            tone: "accent",
          },
          {
            label: "Pelanggan unik",
            value: new Set(devices.map((device) => device.customer_id)).size,
          },
          {
            label: "Tanpa serial",
            value: devices.filter((device) => !device.serial_number).length,
            tone: "warning",
          },
        ]}
      />
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            className={`${inputClass} sm:max-w-xs`}
            placeholder="Cari pelanggan, merek, model, serial…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select
            className={`${inputClass} sm:max-w-[10rem]`}
            value={typeFilter}
            onChange={(event) =>
              setTypeFilter(event.target.value as "all" | DeviceType)
            }
          >
            <option value="all">Semua jenis</option>
            {DEVICE_TYPES.map((type) => (
              <option key={type} value={type}>
                {deviceTypeLabels[type]}
              </option>
            ))}
          </select>
        </div>
        {canManage ? (
          <button type="button" onClick={openCreate} className={buttonPrimary}>
            Tambah perangkat
          </button>
        ) : null}
      </div>

      {showForm && canManage ? (
        <div id="device-form">
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-[color:var(--bjork-text)]">
                {editing ? "Ubah perangkat" : "Perangkat baru"}
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
                <Field label="Pelanggan">
                  <select
                    name="customer_id"
                    className={inputClass}
                    required
                    defaultValue={editing?.customer_id ?? ""}
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
                <Field label="Jenis perangkat">
                  <select
                    name="device_type"
                    className={inputClass}
                    required
                    defaultValue={editing?.device_type ?? "hp"}
                  >
                    {DEVICE_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {deviceTypeLabels[type]}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Merek">
                  <input
                    name="brand"
                    className={inputClass}
                    required
                    maxLength={80}
                    defaultValue={editing?.brand ?? ""}
                  />
                </Field>
                <Field label="Model">
                  <input
                    name="model"
                    className={inputClass}
                    maxLength={120}
                    defaultValue={editing?.model ?? ""}
                  />
                </Field>
                <Field label="Nomor serial (opsional)">
                  <input
                    name="serial_number"
                    className={inputClass}
                    maxLength={120}
                    defaultValue={editing?.serial_number ?? ""}
                  />
                </Field>
              </div>

              <Field label="Catatan (opsional)">
                <textarea
                  name="notes"
                  rows={2}
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
          title="Belum ada perangkat"
          description="Tambahkan perangkat milik pelanggan agar bisa dibuatkan order servis."
        />
      ) : (
        <Card className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-[11px] uppercase tracking-[0.14em] text-[color:var(--bjork-text-muted)]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Perangkat</th>
                  <th className="px-4 py-3 font-semibold">Jenis</th>
                  <th className="px-4 py-3 font-semibold">Pelanggan</th>
                  <th className="px-4 py-3 font-semibold">Serial</th>
                  <th className="px-4 py-3 font-semibold">Dibuat</th>
                  <th className="px-4 py-3 text-right font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((device) => (
                  <tr key={device.id} className="border-t border-[color:var(--bjork-border)]">
                    <td className="px-4 py-3">
                      <p className="font-medium text-[color:var(--bjork-text)]">
                        {device.brand} {device.model}
                      </p>
                      {device.notes ? (
                        <p className="max-w-[18rem] truncate text-xs text-[color:var(--bjork-text-muted)]">
                          {device.notes}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <Badge>{deviceTypeLabels[device.device_type]}</Badge>
                    </td>
                    <td className="px-4 py-3 text-[color:var(--bjork-text-muted)]">
                      {device.customer?.full_name ?? "—"}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[color:var(--bjork-text-muted)]">
                      {device.serial_number ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-[color:var(--bjork-text-muted)]">
                      {formatDate(device.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        {canManage ? (
                          <button
                            type="button"
                            className={buttonSmall}
                            onClick={() => openEdit(device)}
                          >
                            Ubah
                          </button>
                        ) : null}
                        {canDelete ? (
                          <button
                            type="button"
                            className={buttonSmallDanger}
                            disabled={busyId === device.id}
                            onClick={() => handleDelete(device)}
                          >
                            {busyId === device.id ? "…" : "Hapus"}
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
    </div>
  );
}
