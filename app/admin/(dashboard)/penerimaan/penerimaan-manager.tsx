"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";

import {
  buttonGhost,
  buttonPrimary,
  buttonSmall,
  Field,
  FormActions,
  FormError,
  inputClass,
} from "@/components/admin/form-controls";
import { Card } from "@/components/admin/ui";
import { apiRequest } from "@/lib/admin/client-api";
import { equipmentFromFormData } from "@/lib/admin/equipment";
import { emptyToNull, numberValue, textValue } from "@/lib/admin/form-utils";
import { deviceTypeLabels, fromJakartaInput } from "@/lib/admin/format";
import type {
  Customer,
  CustomerOption,
  Device,
  DeviceType,
  Order,
} from "@/lib/admin/types";
import { cn } from "@/lib/cn";

import { EquipmentField } from "../order/equipment-field";

const DEVICE_TYPES = Object.keys(deviceTypeLabels) as DeviceType[];

function StepTitle({ step, title }: { step: number; title: string }) {
  return (
    <h2 className="flex items-center gap-2 text-sm font-semibold text-[color:var(--bjork-text)]">
      <span className="grid size-6 place-items-center rounded-full bg-[var(--blk-accent-fill)] font-mono text-[11px] text-[color:var(--blk-accent-fill-ink)]">
        {step}
      </span>
      {title}
    </h2>
  );
}

export function PenerimaanManager({
  customers: initialCustomers,
  devices: initialDevices,
}: {
  customers: CustomerOption[];
  devices: Device[];
}) {
  const [customers, setCustomers] = useState(initialCustomers);
  const [devices, setDevices] = useState(initialDevices);
  const [customerId, setCustomerId] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [search, setSearch] = useState("");
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [showNewDevice, setShowNewDevice] = useState(false);
  const [ticket, setTicket] = useState<Order | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const customer = customers.find((item) => item.id === customerId) ?? null;
  const device = devices.find((item) => item.id === deviceId) ?? null;

  const matches = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return customers.slice(0, 6);
    return customers
      .filter(
        (item) =>
          item.full_name.toLowerCase().includes(term) ||
          item.phone.includes(term),
      )
      .slice(0, 6);
  }, [customers, search]);

  const customerDevices = useMemo(
    () => devices.filter((item) => item.customer_id === customerId),
    [devices, customerId],
  );

  function selectCustomer(id: string) {
    setCustomerId(id);
    setDeviceId("");
    setShowNewCustomer(false);
    setShowNewDevice(false);
    setError(null);
  }

  async function handleCreateCustomer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formEl = event.currentTarget;
    const form = new FormData(formEl);
    setBusy(true);
    setError(null);

    const result = await apiRequest<Customer>("/api/admin/customers", {
      method: "POST",
      body: JSON.stringify({
        full_name: textValue(form.get("full_name")),
        phone: textValue(form.get("phone")),
      }),
    });

    setBusy(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setCustomers((prev) => [...prev, result.data]);
    setCustomerId(result.data.id);
    setDeviceId("");
    setShowNewCustomer(false);
    setShowNewDevice(true);
    formEl.reset();
  }

  async function handleCreateDevice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formEl = event.currentTarget;
    const form = new FormData(formEl);
    setBusy(true);
    setError(null);

    const result = await apiRequest<Device>("/api/admin/devices", {
      method: "POST",
      body: JSON.stringify({
        customer_id: customerId,
        device_type: textValue(form.get("device_type")),
        brand: textValue(form.get("brand")),
        model: textValue(form.get("model")),
        serial_number: emptyToNull(form.get("serial_number")),
      }),
    });

    setBusy(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setDevices((prev) => [...prev, result.data]);
    setDeviceId(result.data.id);
    setShowNewDevice(false);
    formEl.reset();
  }

  async function handleSubmitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError(null);

    const result = await apiRequest<Order>("/api/admin/orders", {
      method: "POST",
      body: JSON.stringify({
        customer_id: customerId,
        device_id: deviceId,
        complaint: textValue(form.get("complaint")),
        estimated_finish_at: fromJakartaInput(
          textValue(form.get("estimated_finish_at")),
        ),
        total_amount: numberValue(form.get("total_amount"), 0),
        equipment: equipmentFromFormData(
          (name) => form.get(name),
          (name) => form.getAll(name),
        ),
      }),
    });

    setBusy(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setTicket(result.data);
  }

  function resetIntake() {
    setTicket(null);
    setCustomerId("");
    setDeviceId("");
    setSearch("");
    setShowNewCustomer(false);
    setShowNewDevice(false);
    setError(null);
    setFormKey((value) => value + 1);
  }

  if (ticket) {
    return (
      <Card className="mx-auto mt-6 max-w-xl text-center">
        <p className="text-[10.5px] uppercase tracking-[0.16em] text-[color:var(--bjork-text-soft)]">
          Tiket penerimaan
        </p>
        <p className="mt-2 select-all font-mono text-3xl font-bold tracking-[0.08em] text-[color:var(--bjork-text)] sm:text-4xl">
          {ticket.ticket_number}
        </p>
        <p className="mt-3 text-[13px] text-[color:var(--bjork-text-muted)]">
          Sampaikan nomor ini ke pelanggan. Status servis bisa dicek di halaman
          Cek Status.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button type="button" className={buttonPrimary} onClick={resetIntake}>
            Terima unit lagi
          </button>
          <Link href={`/admin/order/${ticket.id}`} className={buttonGhost}>
            Buka detail order
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <div className="mt-6 flex flex-col gap-4">
      <Card>
        <StepTitle step={1} title="Pelanggan" />

        {customer ? (
          <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-[color:var(--bjork-border)] bg-[var(--bjork-panel)] p-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-[color:var(--bjork-text)]">
                {customer.full_name}
              </p>
              <p className="text-[12px] text-[color:var(--bjork-text-muted)]">
                {customer.phone}
              </p>
            </div>
            <button
              type="button"
              className={buttonSmall}
              onClick={() => selectCustomer("")}
            >
              Ganti
            </button>
          </div>
        ) : (
          <>
            <div className="mt-3">
              <Field label="Cari pelanggan" hint="Nama atau nomor HP.">
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Contoh: Budi atau 0812"
                  className={inputClass}
                  autoComplete="off"
                />
              </Field>
            </div>

            {matches.length > 0 ? (
              <ul className="mt-2 flex flex-col gap-1">
                {matches.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => selectCustomer(item.id)}
                      className="flex w-full items-center justify-between gap-3 rounded-lg border border-[color:var(--bjork-border)] px-3 py-2 text-left text-sm transition-colors hover:bg-[var(--bjork-surface-hover)]"
                    >
                      <span className="truncate text-[color:var(--bjork-text)]">
                        {item.full_name}
                      </span>
                      <span className="shrink-0 font-mono text-[12px] text-[color:var(--bjork-text-muted)]">
                        {item.phone}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-[12px] text-[color:var(--bjork-text-muted)]">
                {search.trim()
                  ? "Belum terdaftar. Tambahkan sebagai pelanggan baru."
                  : "Belum ada pelanggan terdaftar."}
              </p>
            )}

            <button
              type="button"
              className={cn(buttonGhost, "mt-3")}
              onClick={() => setShowNewCustomer((value) => !value)}
            >
              {showNewCustomer ? "Batal tambah pelanggan" : "+ Pelanggan baru"}
            </button>

            {showNewCustomer ? (
              <form
                onSubmit={handleCreateCustomer}
                className="mt-3 flex flex-col gap-3 rounded-lg border border-[color:var(--bjork-border)] bg-[var(--bjork-panel)] p-3"
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Nama lengkap">
                    <input
                      name="full_name"
                      required
                      minLength={2}
                      maxLength={120}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Nomor HP">
                    <input
                      name="phone"
                      required
                      inputMode="tel"
                      maxLength={20}
                      placeholder="0812xxxxxxx"
                      className={inputClass}
                    />
                  </Field>
                </div>
                <FormError message={error} />
                <FormActions>
                  <button type="submit" className={buttonPrimary} disabled={busy}>
                    {busy ? "Menyimpan..." : "Simpan pelanggan"}
                  </button>
                </FormActions>
              </form>
            ) : null}
          </>
        )}
      </Card>

      {customer ? (
        <Card>
          <StepTitle step={2} title="Perangkat" />

          {customerDevices.length > 0 ? (
            <ul className="mt-3 flex flex-col gap-1">
              {customerDevices.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setDeviceId(item.id);
                      setError(null);
                    }}
                    aria-pressed={item.id === deviceId}
                    className={cn(
                      "flex w-full flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                      item.id === deviceId
                        ? "border-[color:var(--bjork-accent)] bg-[var(--bjork-surface-hover)] text-[color:var(--bjork-text)]"
                        : "border-[color:var(--bjork-border)] text-[color:var(--bjork-text-medium)] hover:bg-[var(--bjork-surface-hover)]",
                    )}
                  >
                    <span>
                      {deviceTypeLabels[item.device_type]} {item.brand}{" "}
                      {item.model}
                    </span>
                    {item.serial_number ? (
                      <span className="font-mono text-[11px] text-[color:var(--bjork-text-muted)]">
                        {item.serial_number}
                      </span>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-[12px] text-[color:var(--bjork-text-muted)]">
              Pelanggan ini belum punya perangkat terdaftar.
            </p>
          )}

          <button
            type="button"
            className={cn(buttonGhost, "mt-3")}
            onClick={() => {
              setShowNewDevice((value) => !value);
              setError(null);
            }}
          >
            {showNewDevice ? "Batal tambah perangkat" : "+ Perangkat baru"}
          </button>

          {showNewDevice ? (
            <form
              onSubmit={handleCreateDevice}
              className="mt-3 flex flex-col gap-3 rounded-lg border border-[color:var(--bjork-border)] bg-[var(--bjork-panel)] p-3"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Jenis">
                  <select name="device_type" className={inputClass} required>
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
                    required
                    maxLength={80}
                    className={inputClass}
                  />
                </Field>
                <Field label="Model">
                  <input name="model" maxLength={120} className={inputClass} />
                </Field>
                <Field label="Nomor seri (opsional)">
                  <input
                    name="serial_number"
                    maxLength={120}
                    className={inputClass}
                  />
                </Field>
              </div>
              <FormError message={error} />
              <FormActions>
                <button type="submit" className={buttonPrimary} disabled={busy}>
                  {busy ? "Menyimpan..." : "Simpan perangkat"}
                </button>
              </FormActions>
            </form>
          ) : null}
        </Card>
      ) : null}

      {device ? (
        <Card>
          <form key={formKey} onSubmit={handleSubmitOrder} className="flex flex-col gap-4">
            <StepTitle step={3} title="Keluhan & serah terima" />

            <Field label="Keluhan">
              <textarea
                name="complaint"
                rows={3}
                required
                minLength={3}
                maxLength={2000}
                placeholder="Contoh: layar berkedip dan baterai cepat habis."
                className={inputClass}
              />
            </Field>

            <EquipmentField initial={[]} />

            <div className="grid gap-3 sm:grid-cols-2">
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
                  defaultValue={0}
                  className={inputClass}
                />
              </Field>
            </div>

            <FormError message={error} />

            <FormActions>
              <button type="submit" className={buttonPrimary} disabled={busy}>
                {busy ? "Membuat tiket..." : "Buat tiket servis"}
              </button>
            </FormActions>
          </form>
        </Card>
      ) : null}
    </div>
  );
}
