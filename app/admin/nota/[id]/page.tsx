import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { buttonGhost } from "@/components/admin/form-controls";
import {
  deviceTypeLabels,
  formatDateTime,
} from "@/lib/admin/format";
import { requireStaffPage } from "@/lib/admin/guard";
import type { Order } from "@/lib/admin/types";
import { site } from "@/lib/site";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { PrintButton } from "./print-button";

export const instant = false;

type Context = { params: Promise<{ id: string }> };

/** Judul dipakai browser sebagai nama berkas saat disimpan ke PDF. */
export async function generateMetadata({ params }: Context): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("service_orders")
    .select("ticket_number")
    .eq("id", id)
    .maybeSingle();

  return {
    title: data ? `Nota ${data.ticket_number as string}` : "Nota Penerimaan",
  };
}

export default async function ReceiptPage({ params }: Context) {
  const { id } = await params;
  await requireStaffPage("orders");
  const supabase = await createSupabaseServerClient();

  const { data } = await supabase
    .from("service_orders")
    .select("*, customer:customers(*), device:devices(*)")
    .eq("id", id)
    .maybeSingle();

  // Teknisi lain tidak melihat order ini karena RLS, jadi hasilnya null.
  if (!data) notFound();

  const order = data as Order;
  const equipment = order.equipment ?? [];

  return (
    <div className="min-h-screen bg-paper py-6 print:min-h-0 print:bg-white print:py-0">
      <div className="mx-auto w-[72mm] print:w-[72mm]">
        <div className="mb-3 flex items-center justify-between gap-2 print:hidden">
          <Link href={`/admin/order/${order.id}`} className={buttonGhost}>
            Kembali ke order
          </Link>
          <PrintButton />
        </div>

        <article className="rounded-lg bg-white px-3 py-4 text-[10px] leading-[1.45] text-black print:rounded-none print:px-0 print:py-0">
          <header className="border-b border-black pb-2 text-center">
            <h1 className="text-[13px] font-bold tracking-[0.08em] uppercase">
              {site.name}
            </h1>
            <p className="mt-0.5">{site.address.line1}</p>
            <p>
              {site.address.city} {site.address.postal}
            </p>
            <p>Telp/WA {site.phone.display}</p>
            <p className="mt-0.5 text-[9px]">
              {site.hours.days} {site.hours.open}–{site.hours.close}
            </p>
          </header>

          <p className="mt-3 text-center text-[11px] font-semibold tracking-[0.18em] uppercase">
            Nota Penerimaan
          </p>
          <p className="mt-1 text-center font-mono text-[13px] font-bold tracking-[0.06em]">
            {order.ticket_number}
          </p>

          <dl className="mt-3 space-y-1">
            <Row label="Tanggal masuk" value={formatDateTime(order.created_at)} />
            <Row label="Pelanggan" value={order.customer?.full_name ?? "—"} />
            <Row label="WhatsApp" value={order.customer?.phone ?? "—"} />
            <Row
              label="Perangkat"
              value={
                order.device
                  ? `${deviceTypeLabels[order.device.device_type]} · ${order.device.brand} ${order.device.model}`
                  : "—"
              }
            />
            <Row label="Serial" value={order.device?.serial_number ?? "—"} />
          </dl>

          <section className="mt-3 border-t border-dashed border-black pt-2">
            <h2 className="text-[10px] font-semibold tracking-[0.12em] uppercase">
              Kelengkapan unit
            </h2>
            {equipment.length === 0 ? (
              <p className="mt-1">Tidak dicatat.</p>
            ) : (
              <ul className="mt-1 space-y-0.5">
                {equipment.map((item) => (
                  <li key={item.label}>✓ {item.label}</li>
                ))}
              </ul>
            )}
          </section>

          <section className="mt-3 border-t border-dashed border-black pt-2">
            <h2 className="text-[10px] font-semibold tracking-[0.12em] uppercase">
              Keluhan
            </h2>
            <p className="mt-1 whitespace-pre-line">{order.complaint}</p>
          </section>

          <section className="mt-3 border-t border-dashed border-black pt-2">
            <p>
              Diagnosa gratis. Biaya perbaikan disepakati lebih dulu sebelum
              pengerjaan.
            </p>
            <p className="mt-1">
              Garansi mengikuti kesepakatan saat unit diserahkan. Simpan nota ini
              untuk klaim garansi.
            </p>
            <p className="mt-1">Pengambilan unit pada jam operasional.</p>
          </section>

          <div className="mt-5 grid grid-cols-2 gap-3 text-center">
            <div>
              <p>Pelanggan</p>
              <div className="mt-10 border-t border-black pt-1" />
            </div>
            <div>
              <p>Petugas</p>
              <div className="mt-10 border-t border-black pt-1" />
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-1">
      <dt className="w-[26mm] shrink-0">{label}</dt>
      <dd className="min-w-0 flex-1">: {value}</dd>
    </div>
  );
}
