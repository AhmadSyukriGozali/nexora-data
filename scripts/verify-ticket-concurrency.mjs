/**
 * Uji nomor tiket saat 20 order dibuat bersamaan.
 * Jalankan: node scripts/verify-ticket-concurrency.mjs
 * Butuh migrasi 007 sudah diterapkan dan env Supabase terisi.
 */
import { createClient } from "@supabase/supabase-js";
import { NEW_TICKET_NUMBER_PATTERN } from "../lib/tickets/ticket-number.ts";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  process.loadEnvFile(".env.local");
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("FAIL: env Supabase tidak lengkap.");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const problems = [];

const { data: device, error: deviceError } = await supabase
  .from("devices")
  .select("id, customer_id")
  .limit(1)
  .maybeSingle();

if (deviceError) {
  console.error(`FAIL: gagal membaca perangkat: ${deviceError.message}`);
  process.exit(1);
}
if (!device) {
  console.error("FAIL: belum ada perangkat; buat satu pelanggan + perangkat dulu.");
  process.exit(1);
}

const results = await Promise.all(
  Array.from({ length: 20 }, () =>
    supabase
      .from("service_orders")
      .insert({
        customer_id: device.customer_id,
        device_id: device.id,
        complaint: "uji concurrency",
      })
      .select("id, ticket_number")
      .single(),
  ),
);

const rows = [];
for (const [index, result] of results.entries()) {
  if (result.error) {
    problems.push(`insert ke-${index + 1} gagal: ${result.error.message}`);
  } else {
    rows.push(result.data);
  }
}

const numbers = rows.map((row) => row.ticket_number);
if (new Set(numbers).size !== numbers.length) {
  problems.push(`nomor duplikat: ${numbers.join(", ")}`);
}

for (const number of numbers) {
  if (!NEW_TICKET_NUMBER_PATTERN.test(number)) {
    problems.push(`format salah: ${number}`);
  }
}

const sequences = numbers.map((number) => number.split("-")[2]);
if (new Set(sequences).size !== sequences.length) {
  problems.push(`nomor urut duplikat: ${sequences.join(", ")}`);
}

if (rows.length > 0) {
  const { error: deleteError } = await supabase
    .from("service_orders")
    .delete()
    .in("id", rows.map((row) => row.id));
  if (deleteError) problems.push(`gagal menghapus order uji: ${deleteError.message}`);
}

if (problems.length > 0) {
  for (const problem of problems) console.error(`FAIL: ${problem}`);
  process.exit(1);
}

console.log(`PASS: ${numbers.length} tiket unik (${numbers[0]} .. ${numbers.at(-1)}).`);
