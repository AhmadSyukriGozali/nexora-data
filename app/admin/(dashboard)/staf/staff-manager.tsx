"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

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
import { textValue } from "@/lib/admin/form-utils";
import { formatDate } from "@/lib/admin/format";
import type { StaffMember, StaffRole } from "@/lib/admin/types";

function staffLabel(member: StaffMember): string {
  return member.full_name || member.email || member.id;
}

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
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  function openCreate() {
    setError(null);
    setFormKey((value) => value + 1);
    setShowForm(true);
    requestAnimationFrame(() => {
      document.getElementById("staff-form")?.scrollIntoView({ block: "start" });
    });
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const payload = {
      full_name: textValue(form.get("full_name")),
      email: textValue(form.get("email")),
      password: textValue(form.get("password")),
      role: textValue(form.get("role")) as StaffRole,
    };

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
    if (
      member.is_active &&
      patch.is_active === false &&
      !window.confirm(`Nonaktifkan sementara akun "${staffLabel(member)}"?`)
    ) {
      return;
    }

    setBusyId(member.id);
    const result = await apiRequest<StaffMember>(
      `/api/admin/staff/${member.id}`,
      { method: "PATCH", body: JSON.stringify(patch) },
    );
    setBusyId(null);

    if (!result.ok) {
      window.alert(result.message);
    }

    // Selalu muat ulang agar pilihan role/kontrol kembali sesuai data server.
    router.refresh();
  }

  async function handleDelete(member: StaffMember) {
    if (
      !window.confirm(
        `Hapus permanen akun "${staffLabel(member)}"? Tindakan ini tidak bisa dibatalkan. Riwayat transaksi tetap tersimpan, tetapi nama pelakunya menjadi kosong.`,
      )
    ) {
      return;
    }

    setBusyId(member.id);
    const result = await apiRequest<{ deleted: boolean }>(
      `/api/admin/staff/${member.id}`,
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
        <p className="text-sm text-dim">
          {members.length} akun staf terdaftar.
        </p>
        <button type="button" onClick={openCreate} className={buttonPrimary}>
          Tambah staf
        </button>
      </div>

      {showForm ? (
        <div id="staff-form">
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-chrome">
                Staf baru
              </h2>
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
                  label="Password awal"
                  hint="Minimal 8 karakter. Berikan ke staf; tidak bisa dilihat lagi setelah disimpan."
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
                <Field label="Role">
                  <select name="role" className={inputClass} defaultValue="admin">
                    <option value="admin">Admin</option>
                    <option value="owner">Owner</option>
                  </select>
                </Field>
              </div>

              <p className="text-xs text-dim">
                Akun langsung aktif dan bisa login di halaman{" "}
                <span className="text-chrome">/admin/login</span>. Role admin
                tidak bisa menghapus data atau mengoreksi pembayaran.
              </p>

              <FormError message={error} />

              <FormActions>
                <button type="submit" disabled={busy} className={buttonPrimary}>
                  {busy ? "Membuat…" : "Buat akun"}
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
              <thead className="text-left text-[11px] uppercase tracking-[0.14em] text-dim">
                <tr>
                  <th className="px-4 py-3 font-semibold">Nama</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Role</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Dibuat</th>
                  <th className="px-4 py-3 text-right font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => {
                  const isSelf = member.id === currentUserId;
                  const rowBusy = busyId === member.id;

                  return (
                    <tr key={member.id} className="border-t border-white/8">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-chrome">
                            {member.full_name || "—"}
                          </span>
                          {isSelf ? <Badge tone="blue">Anda</Badge> : null}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-dim">
                        {member.email ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          key={member.role}
                          className={`${inputClass} min-w-[7.5rem] py-1`}
                          value={member.role}
                          disabled={isSelf || rowBusy}
                          onChange={(event) =>
                            handleUpdate(member, {
                              role: event.target.value as StaffRole,
                            })
                          }
                          aria-label={`Role ${staffLabel(member)}`}
                        >
                          <option value="admin">Admin</option>
                          <option value="owner">Owner</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        {member.is_active ? (
                          <Badge tone="green">Aktif</Badge>
                        ) : (
                          <Badge tone="red">Nonaktif</Badge>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-dim">
                        {formatDate(member.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            className={
                              member.is_active
                                ? buttonSmall
                                : buttonSmallSuccess
                            }
                            disabled={isSelf || rowBusy}
                            onClick={() =>
                              handleUpdate(member, {
                                is_active: !member.is_active,
                              })
                            }
                          >
                            {rowBusy
                              ? "…"
                              : member.is_active
                                ? "Nonaktifkan"
                                : "Aktifkan"}
                          </button>
                          <button
                            type="button"
                            className={buttonSmallDanger}
                            disabled={isSelf || rowBusy}
                            onClick={() => handleDelete(member)}
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

      <p className="text-xs text-dim">
        Nonaktifkan = akses dicabut pada permintaan berikutnya, akun tetap ada
        dan bisa diaktifkan lagi. Hapus = akun auth dihapus permanen. Owner
        tidak bisa menonaktifkan/menghapus akunnya sendiri, dan sistem selalu
        menyisakan minimal satu owner aktif.
      </p>
    </div>
  );
}
