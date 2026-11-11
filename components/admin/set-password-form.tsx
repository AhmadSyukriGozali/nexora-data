"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import {
  buttonPrimary,
  Field,
  FormError,
  inputClass,
} from "@/components/admin/form-controls";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function SetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Konfirmasi password tidak sama.");
      return;
    }

    setBusy(true);
    const supabase = createSupabaseBrowserClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setBusy(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    router.replace("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Password baru" hint="Minimal 8 karakter.">
        <input
          className={inputClass}
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          maxLength={72}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </Field>

      <Field label="Ulangi password">
        <input
          className={inputClass}
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          maxLength={72}
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
        />
      </Field>

      <FormError message={error} />

      <button type="submit" disabled={busy} className={`${buttonPrimary} w-full`}>
        {busy ? "Menyimpan…" : "Simpan password"}
      </button>
    </form>
  );
}
