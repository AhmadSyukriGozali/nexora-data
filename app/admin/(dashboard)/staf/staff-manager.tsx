"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import {
  buttonGhost,
  buttonPrimary,
  buttonSmall,
  buttonSmallDanger,
  buttonSmallSuccess,
  Field,
  FormActions,
  FormError,
  inputClass,
} from "@/components/admin/form-controls";
import { Badge, Card, EmptyState } from "@/components/admin/ui";
import { apiRequest } from "@/lib/admin/client-api";
import {
  EMPTY_PERMISSIONS,
  MODULES,
  MODULE_LABELS,
  PRESETS,
  permissionsToRows,
  rowsToPermissions,
  type Permissions,
  type PresetKey,
} from "@/lib/admin/access";
import { textValue } from "@/lib/admin/form-utils";
import { formatDate } from "@/lib/admin/format";
import type { StaffMember, StaffRole } from "@/lib/admin/types";
import { cn } from "@/lib/cn";

function staffLabel(member: StaffMember): string {
  return member.full_name || member.email || member.id;
}

const ROLE_LABELS: Record<StaffRole, string> = {
  owner: "Owner",
  admin: "Admin",
  teknisi: "Teknisi",
};

function memberPermissions(member: StaffMember): Permissions {
  if (member.role === "owner") {
    return Object.fromEntries(
      MODULES.map((module) => [
        module,
        { view: true, manage: true, delete: true, viewCost: true },
      ]),
    ) as Permissions;
  }
  return rowsToPermissions(member.permissions ?? []);
}

function summary(member: StaffMember): string {
  if (member.role === "owner") return "Akses penuh (owner)";
  const permissions = memberPermissions(member);
  const modules = MODULES.filter((module) => permissions[module].view);
  if (modules.length === 0) return "Belum punya akses";
  return modules.map((module) => MODULE_LABELS[module]).join(", ");
}

function PermissionMatrix({
  value,
  onChange,
  disabled = false,
}: {
  value: Permissions;
  onChange: (next: Permissions) => void;
  disabled?: boolean;
}) {
  function toggle(
    module: (typeof MODULES)[number],
    key: "view" | "manage" | "delete" | "viewCost",
  ) {
    const current = value[module];
    const next = { ...current, [key]: !current[key] };
    if (key === "view" && !next.view) {
      next.manage = false;
      next.delete = false;
      next.viewCost = false;
    }
    if ((key === "manage" || key === "delete") && next[key]) next.view = true;
    if (key === "viewCost" && next.viewCost) next.view = true;
    onChange({ ...value, [module]: next });
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[color:var(--bjork-border)]">
      <table className="w-full min-w-[520px] text-[12.5px]">
        <thead className="bg-[var(--bjork-panel)] text-left text-[10.5px] uppercase tracking-[0.1em] text-[color:var(--bjork-text-soft)]">
          <tr>
            <th className="px-3 py-2 font-semibold">Modul</th>
            <th className="px-2 py-2 text-center font-semibold">Lihat</th>
            <th className="px-2 py-2 text-center font-semibold">Kelola</th>
            <th className="px-2 py-2 text-center font-semibold">Hapus</th>
            <th className="px-2 py-2 text-center font-semibold">Harga modal</th>
          </tr>
        </thead>
        <tbody>
          {MODULES.map((module) => {
            const entry = value[module];
            const cells: Array<{
              key: "view" | "manage" | "delete" | "viewCost";
              disabled: boolean;
            }> = [
              { key: "view", disabled: false },
              { key: "manage", disabled: !entry.view },
              { key: "delete", disabled: !entry.view },
              {
                key: "viewCost",
                disabled: !entry.view || module !== "spareparts",
              },
            ];
            return (
              <tr
                key={module}
                className="border-t border-[color:var(--bjork-border)]"
              >
                <td className="px-3 py-1.5 text-[color:var(--bjork-text)]">
                  {MODULE_LABELS[module]}
                </td>
                {cells.map((cell) => (
                  <td key={cell.key} className="px-2 py-1.5 text-center">
                    <input
                      type="checkbox"
                      className="size-4 accent-[var(--bjork-accent)]"
                      checked={entry[cell.key]}
                      disabled={disabled || cell.disabled}
                      onChange={() => toggle(module, cell.key)}
                      aria-label={`${MODULE_LABELS[module]} ${cell.key}`}
                    />
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

type PendingAction =
  | { kind: "delete"; member: StaffMember }
  | { kind: "deactivate"; member: StaffMember }
  | { kind: "resend"; member: StaffMember }
  | { kind: "role"; member: StaffMember; role: StaffRole };

export function StaffManager({
  members,
  currentUserId,
}: {
  members: StaffMember[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [mode, setMode] = useState<"password" | "invite">("password");
  const [preset, setPreset] = useState<PresetKey>("teknisi");
  const [draftPermissions, setDraftPermissions] =
    useState<Permissions>(EMPTY_PERMISSIONS);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [accessFor, setAccessFor] = useState<StaffMember | null>(null);
  const [accessPreset, setAccessPreset] = useState<PresetKey>("teknisi");
  const [accessPermissions, setAccessPermissions] =
    useState<Permissions>(EMPTY_PERMISSIONS);
  const [accessBusy, setAccessBusy] = useState(false);
  const [accessError, setAccessError] = useState<string | null>(null);

  const [passwordFor, setPasswordFor] = useState<StaffMember | null>(null);
  const [passwordMode, setPasswordMode] = useState<"password" | "email">(
    "password",
  );
  const [passwordValue, setPasswordValue] = useState("");
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [pending, setPending] = useState<PendingAction | null>(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  function openCreate() {
    setMode("password");
    setPreset("teknisi");
    setDraftPermissions(PRESETS.teknisi.permissions);
    setError(null);
    setFormKey((value) => value + 1);
    setShowForm(true);
    requestAnimationFrame(() => {
      document.getElementById("staff-form")?.scrollIntoView({ block: "start" });
    });
  }

  function applyPreset(key: PresetKey) {
    setPreset(key);
    setDraftPermissions(PRESETS[key].permissions);
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const role = textValue(form.get("role")) as StaffRole;
    const payload: Record<string, unknown> = {
      full_name: textValue(form.get("full_name")),
      email: textValue(form.get("email")),
      role,
      mode,
    };

    if (mode === "password") payload.password = textValue(form.get("password"));
    if (role === "admin") {
      payload.preset = preset;
      payload.permissions = permissionsToRows(draftPermissions);
    }

    const result = await apiRequest<{ id: string }>("/api/admin/staff", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    setBusy(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setShowForm(false);
    setFormKey((value) => value + 1);
    router.refresh();
  }

  async function handleUpdate(
    member: StaffMember,
    patch: { role?: StaffRole; is_active?: boolean },
  ) {
    const result = await apiRequest<StaffMember>(
      `/api/admin/staff/${member.id}`,
      { method: "PATCH", body: JSON.stringify(patch) },
    );

    if (!result.ok) {
      setActionError(result.message);
      return;
    }
    router.refresh();
  }

  function openAccess(member: StaffMember) {
    setAccessFor(member);
    setAccessError(null);
    setAccessPermissions(memberPermissions(member));
    setAccessPreset("teknisi");
  }

  async function saveAccess() {
    if (!accessFor) return;
    setAccessBusy(true);
    setAccessError(null);

    const result = await apiRequest<StaffMember>(
      `/api/admin/staff/${accessFor.id}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          preset: accessPreset,
          permissions: permissionsToRows(accessPermissions),
        }),
      },
    );

    setAccessBusy(false);

    if (!result.ok) {
      setAccessError(result.message);
      return;
    }

    setAccessFor(null);
    router.refresh();
  }

  function openPassword(member: StaffMember) {
    setPasswordFor(member);
    setPasswordMode("password");
    setPasswordValue("");
    setPasswordError(null);
  }

  async function submitPassword(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (!passwordFor) return;
    setPasswordBusy(true);
    setPasswordError(null);

    const result = await apiRequest<{ updated: boolean }>(
      `/api/admin/staff/${passwordFor.id}/password`,
      {
        method: "POST",
        body: JSON.stringify({
          mode: passwordMode,
          ...(passwordMode === "password" ? { password: passwordValue } : {}),
        }),
      },
    );

    setPasswordBusy(false);

    if (!result.ok) {
      setPasswordError(result.message);
      return;
    }

    setPasswordFor(null);
  }

  async function runPending() {
    if (!pending) return;
    setActionBusy(true);
    setActionError(null);

    if (pending.kind === "resend") {
      const result = await apiRequest<{ sent: boolean }>(
        `/api/admin/staff/${pending.member.id}/invite`,
        { method: "POST" },
      );
      setActionBusy(false);
      if (!result.ok) {
        setActionError(result.message);
        return;
      }
      setPending(null);
      router.refresh();
      return;
    }

    if (pending.kind === "deactivate") {
      await handleUpdate(pending.member, { is_active: false });
      setActionBusy(false);
      setPending(null);
      return;
    }

    if (pending.kind === "role") {
      await handleUpdate(pending.member, { role: pending.role });
      setActionBusy(false);
      setPending(null);
      return;
    }

    const result = await apiRequest<{ deleted: boolean }>(
      `/api/admin/staff/${pending.member.id}`,
      { method: "DELETE" },
    );
    setActionBusy(false);

    if (!result.ok) {
      setActionError(result.message);
      return;
    }

    setPending(null);
    router.refresh();
  }

  const pendingCopy = (() => {
    if (!pending) return null;
    if (pending.kind === "resend") {
      return {
        title: `Kirim ulang undangan ke ${staffLabel(pending.member)}?`,
        description:
          "Email undangan baru dikirim. Tautan lama tetap berlaku sampai kedaluwarsa.",
        confirmLabel: "Kirim ulang",
        tone: "default" as const,
      };
    }
    if (pending.kind === "deactivate") {
      return {
        title: `Nonaktifkan ${staffLabel(pending.member)}?`,
        description:
          "Akses dicabut pada permintaan berikutnya. Akun tetap ada dan bisa diaktifkan lagi.",
        confirmLabel: "Nonaktifkan",
        tone: "danger" as const,
      };
    }
    if (pending.kind === "role") {
      return {
        title: `Ubah role ${staffLabel(pending.member)} ke ${
          ROLE_LABELS[pending.role]
        }?`,
        description:
          pending.role === "owner"
            ? "Owner punya akses penuh ke semua modul termasuk Staf. Izin per modul staf ini akan dihapus."
            : "Izin akun akan direset ke preset role ini.",
        confirmLabel: `Jadikan ${ROLE_LABELS[pending.role].toLowerCase()}`,
        tone: "default" as const,
      };
    }
    return {
      title: `Hapus permanen ${staffLabel(pending.member)}?`,
      description:
        "Akun auth dihapus. Riwayat transaksi tetap tersimpan, tetapi nama pelakunya menjadi kosong.",
      confirmLabel: "Hapus permanen",
      tone: "danger" as const,
    };
  })();

  const adminCount = members.filter((member) => member.role === "admin").length;
  const ownerCount = members.filter((member) => member.role === "owner").length;
  const technicianCount = members.filter(
    (member) => member.role === "teknisi",
  ).length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2.5 @2xl/main:grid-cols-4">
        <Card>
          <p className="text-[10.5px] uppercase tracking-[0.14em] text-[color:var(--bjork-text-soft)]">
            Total akun
          </p>
          <p className="mt-2 font-display text-2xl font-bold tabular-nums">
            {members.length}
          </p>
        </Card>
        <Card>
          <p className="text-[10.5px] uppercase tracking-[0.14em] text-[color:var(--bjork-text-soft)]">
            Admin
          </p>
          <p className="mt-2 font-display text-2xl font-bold tabular-nums">
            {adminCount}
          </p>
        </Card>
        <Card>
          <p className="text-[10.5px] uppercase tracking-[0.14em] text-[color:var(--bjork-text-soft)]">
            Teknisi
          </p>
          <p className="mt-2 font-display text-2xl font-bold tabular-nums">
            {technicianCount}
          </p>
        </Card>
        <Card>
          <p className="text-[10.5px] uppercase tracking-[0.14em] text-[color:var(--bjork-text-soft)]">
            Owner
          </p>
          <p className="mt-2 font-display text-2xl font-bold tabular-nums">
            {ownerCount}
          </p>
        </Card>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[color:var(--bjork-text-muted)]">
          Owner mengatur akses tiap staf per modul.
        </p>
        <button type="button" onClick={openCreate} className={buttonPrimary}>
          Tambah staf
        </button>
      </div>

      {showForm ? (
        <div id="staff-form">
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[13.5px] font-semibold">Staf baru</h2>
              <button
                type="button"
                className={buttonGhost}
                onClick={() => setShowForm(false)}
              >
                Tutup
              </button>
            </div>

            <form
              key={formKey}
              onSubmit={handleCreate}
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
                  />
                </Field>
                <Field label="Email">
                  <input
                    name="email"
                    type="email"
                    className={inputClass}
                    required
                    maxLength={160}
                    autoComplete="off"
                  />
                </Field>
                <Field
                  label="Role"
                  hint="Izin akun mengikuti preset role. Role admin bisa disesuaikan setelah dibuat."
                >
                  <select name="role" className={inputClass} defaultValue="admin">
                    <option value="admin">Admin</option>
                    <option value="teknisi">Teknisi</option>
                    <option value="owner">Owner</option>
                  </select>
                </Field>
                <Field
                  label="Cara aktivasi"
                  hint="Akun langsung aktif. Mode undangan butuh SMTP Supabase."
                >
                  <select
                    className={inputClass}
                    value={mode}
                    onChange={(event) =>
                      setMode(event.target.value as "password" | "invite")
                    }
                  >
                    <option value="password">Password manual</option>
                    <option value="invite">Kirim undangan email</option>
                  </select>
                </Field>
                {mode === "password" ? (
                  <Field
                    label="Password awal"
                    hint="Minimal 8 karakter. Tidak bisa dilihat lagi."
                  >
                    <input
                      name="password"
                      type="password"
                      className={inputClass}
                      required
                      minLength={8}
                      maxLength={72}
                      autoComplete="new-password"
                    />
                  </Field>
                ) : null}
              </div>

              <div className="space-y-2 border-t border-[color:var(--bjork-border)] pt-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--bjork-text-muted)]">
                  Preset akses (untuk role admin)
                </p>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(PRESETS) as PresetKey[]).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => applyPreset(key)}
                      aria-pressed={preset === key}
                      className={cn(
                        "rounded-lg border px-3 py-1.5 text-[12px] font-medium transition-colors",
                        preset === key
                          ? "border-[color:var(--bjork-accent)] bg-[var(--blk-accent-fill)]/15 text-[color:var(--blk-accent-ink)]"
                          : "border-[color:var(--bjork-border-strong)] text-[color:var(--bjork-text-muted)] hover:bg-[var(--bjork-surface-hover)]",
                      )}
                    >
                      {PRESETS[key].label}
                    </button>
                  ))}
                </div>
                <p className="text-[11.5px] text-[color:var(--bjork-text-muted)]">
                  {PRESETS[preset].description}
                </p>
                <PermissionMatrix
                  value={draftPermissions}
                  onChange={setDraftPermissions}
                />
              </div>

              <FormError message={error} />

              <FormActions>
                <button type="submit" disabled={busy} className={buttonPrimary}>
                  {busy
                    ? "Membuat…"
                    : mode === "invite"
                      ? "Buat & kirim undangan"
                      : "Buat akun"}
                </button>
              </FormActions>
            </form>
          </Card>
        </div>
      ) : null}

      {members.length === 0 ? (
        <EmptyState
          title="Belum ada staf"
          description="Tambahkan akun owner atau admin untuk mulai mengelola operasional."
        />
      ) : (
        <Card className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bjork-panel)] text-left text-[10.5px] uppercase tracking-[0.1em] text-[color:var(--bjork-text-soft)]">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Nama</th>
                  <th className="px-4 py-2.5 font-semibold">Akses</th>
                  <th className="px-4 py-2.5 font-semibold">Status</th>
                  <th className="px-4 py-2.5 font-semibold">Dibuat</th>
                  <th className="px-4 py-2.5 text-right font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => {
                  const isSelf = member.id === currentUserId;
                  return (
                    <tr
                      key={member.id}
                      className="border-t border-[color:var(--bjork-border)]"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-[color:var(--bjork-text)]">
                            {member.full_name || "—"}
                          </span>
                          {isSelf ? <Badge tone="blue">Anda</Badge> : null}
                          {member.role === "owner" ? (
                            <Badge tone="amber">Owner</Badge>
                          ) : null}
                          {member.role === "teknisi" ? (
                            <Badge tone="blue">Teknisi</Badge>
                          ) : null}
                        </div>
                        <p className="text-[11.5px] text-[color:var(--bjork-text-muted)]">
                          {member.email ?? "—"}
                        </p>
                      </td>
                      <td className="max-w-[18rem] px-4 py-3 text-[12px] text-[color:var(--bjork-text-muted)]">
                        <p className="line-clamp-2">{summary(member)}</p>
                        {member.role === "admin" ? (
                          <button
                            type="button"
                            className={`${buttonSmall} mt-1`}
                            onClick={() => openAccess(member)}
                          >
                            Atur akses
                          </button>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">
                        {member.is_active ? (
                          <Badge tone="green" dot>
                            Aktif
                          </Badge>
                        ) : (
                          <Badge tone="red" dot>
                            Nonaktif
                          </Badge>
                        )}
                        {!member.email_confirmed_at ? (
                          <p className="mt-1 text-[10.5px] text-[color:var(--blk-warning)]">
                            Belum aktivasi email
                          </p>
                        ) : null}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-[color:var(--bjork-text-muted)]">
                        {formatDate(member.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap justify-end gap-1.5">
                          <button
                            type="button"
                            className={buttonSmall}
                            disabled={isSelf}
                            onClick={() => openPassword(member)}
                          >
                            Password
                          </button>
                          {!member.email_confirmed_at ? (
                            <button
                              type="button"
                              className={buttonSmall}
                              onClick={() => {
                                setActionError(null);
                                setPending({ kind: "resend", member });
                              }}
                            >
                              Kirim undangan
                            </button>
                          ) : null}
                          <button
                            type="button"
                            className={
                              member.is_active
                                ? buttonSmall
                                : buttonSmallSuccess
                            }
                            disabled={isSelf}
                            onClick={() => {
                              setActionError(null);
                              if (member.is_active) {
                                setPending({ kind: "deactivate", member });
                              } else {
                                void handleUpdate(member, { is_active: true });
                              }
                            }}
                          >
                            {member.is_active ? "Nonaktifkan" : "Aktifkan"}
                          </button>
                          <select
                            className={`${inputClass} w-auto py-1 text-xs`}
                            value={member.role}
                            disabled={isSelf}
                            aria-label={`Role ${staffLabel(member)}`}
                            onChange={(event) => {
                              const role = event.target.value as StaffRole;
                              if (role === member.role) return;
                              setActionError(null);
                              setPending({ kind: "role", member, role });
                            }}
                          >
                            <option value="owner">Owner</option>
                            <option value="admin">Admin</option>
                            <option value="teknisi">Teknisi</option>
                          </select>
                          <button
                            type="button"
                            className={buttonSmallDanger}
                            disabled={isSelf}
                            onClick={() => {
                              setActionError(null);
                              setPending({ kind: "delete", member });
                            }}
                          >
                            Hapus
                          </button>
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

      <p className="text-xs text-[color:var(--bjork-text-muted)]">
        Modul Staf hanya untuk owner. Izin hapus dan harga modal bisa diberikan
        terpisah per staf.
      </p>

      <ConfirmDialog
        open={accessFor !== null}
        title={`Akses ${accessFor ? staffLabel(accessFor) : ""}`}
        description="Pilih preset lalu sesuaikan. Staf hanya melihat menu yang dicentang Lihat."
        confirmLabel="Simpan akses"
        busy={accessBusy}
        onClose={() => {
          if (accessBusy) return;
          setAccessFor(null);
        }}
        onConfirm={saveAccess}
      >
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {(Object.keys(PRESETS) as PresetKey[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setAccessPreset(key);
                  setAccessPermissions(PRESETS[key].permissions);
                }}
                className={cn(
                  "rounded-lg border px-2.5 py-1 text-[11.5px] font-medium",
                  accessPreset === key
                    ? "border-[color:var(--bjork-accent)] bg-[var(--blk-accent-fill)]/15 text-[color:var(--blk-accent-ink)]"
                    : "border-[color:var(--bjork-border-strong)] text-[color:var(--bjork-text-muted)]",
                )}
              >
                {PRESETS[key].label}
              </button>
            ))}
          </div>
          <PermissionMatrix
            value={accessPermissions}
            onChange={setAccessPermissions}
            disabled={accessBusy}
          />
          <FormError message={accessError} />
        </div>
      </ConfirmDialog>

      <ConfirmDialog
        open={passwordFor !== null}
        title={`Reset password ${passwordFor ? staffLabel(passwordFor) : ""}`}
        description="Set password langsung atau kirim tautan reset lewat email."
        confirmLabel={passwordMode === "email" ? "Kirim email" : "Simpan password"}
        busy={passwordBusy}
        onClose={() => {
          if (passwordBusy) return;
          setPasswordFor(null);
        }}
        onConfirm={() => void submitPassword()}
      >
        <form onSubmit={submitPassword} className="space-y-3">
          <Field label="Metode">
            <select
              className={inputClass}
              value={passwordMode}
              onChange={(event) =>
                setPasswordMode(event.target.value as "password" | "email")
              }
            >
              <option value="password">Password manual</option>
              <option value="email">Kirim email reset</option>
            </select>
          </Field>
          {passwordMode === "password" ? (
            <Field label="Password baru" hint="Minimal 8 karakter.">
              <input
                className={inputClass}
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                maxLength={72}
                value={passwordValue}
                onChange={(event) => setPasswordValue(event.target.value)}
              />
            </Field>
          ) : null}
          <FormError message={passwordError} />
        </form>
      </ConfirmDialog>

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
