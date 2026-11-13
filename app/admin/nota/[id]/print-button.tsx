"use client";

import { buttonPrimary } from "@/components/admin/form-controls";

/** Cetak lewat dialog browser; ukuran kertas dipilih di sana (80 mm atau A4). */
export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className={buttonPrimary}>
      Cetak nota
    </button>
  );
}
