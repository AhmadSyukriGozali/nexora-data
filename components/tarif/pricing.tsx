import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { Section } from "@/components/ui/section";
import { deviceOrder, estimates, priceRows } from "@/lib/content";

const columns = ["hp", "laptop", "pc", "printer"] as const;

export function PriceTable() {
  return (
    <Section id="tabel" tone="paper" className="scroll-mt-24 border-t border-line">
      <div className="container-page section-pad">
        <Reveal>
          <h2 className="display-lg text-[clamp(1.8rem,3.2vw,2.6rem)] text-ink">
            Tabel tarif
          </h2>
          <p className="mt-3 max-w-[58ch] text-[15px] leading-relaxed text-ink-soft">
            Rentang harga jasa dan part yang paling sering diminta, dalam
            Rupiah. Semua angka dikonfirmasi setelah diagnosa gratis.
          </p>
        </Reveal>

        <div className="mt-8 hidden overflow-x-auto rounded-2xl border border-line bg-white lg:block">
          <table className="w-full border-collapse text-left text-[14px]">
            <caption className="sr-only">
              Estimasi tarif servis HP, laptop, PC, dan printer di Nexora Data
            </caption>
            <thead>
              <tr className="border-b border-line">
                <th scope="col" className="px-5 py-4 font-semibold text-ink">
                  Layanan
                </th>
                {columns.map((key) => (
                  <th
                    key={key}
                    scope="col"
                    className="px-5 py-4 font-semibold text-ink"
                  >
                    {estimates[key].label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {priceRows.map((row) => (
                <tr key={row.action} className="border-b border-line last:border-0">
                  <th
                    scope="row"
                    className="px-5 py-4 font-medium text-ink-soft"
                  >
                    {row.action}
                  </th>
                  {columns.map((key) => (
                    <td key={key} className="px-5 py-4 tabular-nums text-ink">
                      {row[key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 space-y-3 lg:hidden">
          {deviceOrder.map((key) => {
            const data = estimates[key];

            return (
              <details
                key={key}
                className="rounded-2xl border border-line bg-white"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-display text-[17px] font-semibold text-ink [&::-webkit-details-marker]:hidden">
                  {data.label}
                  <span aria-hidden="true" className="text-electric">
                    +
                  </span>
                </summary>
                <ul className="border-t border-line px-5 py-4">
                  {data.items.map((item) => (
                    <li
                      key={item.issue}
                      className="flex items-baseline justify-between gap-5 py-2.5 text-[14px]"
                    >
                      <span className="text-ink-soft">{item.issue}</span>
                      <span className="shrink-0 tabular-nums text-ink">
                        {item.price}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="px-5 pb-4">
                  <Link
                    href={`/layanan#${key}`}
                    className="text-[14px] font-semibold text-electric hover:text-navy"
                  >
                    Detail {data.label}
                  </Link>
                </div>
              </details>
            );
          })}
        </div>

        <p className="mt-6 text-[14px] leading-relaxed text-ink-soft">
          Harga final ditentukan setelah pemeriksaan langsung. Untuk kasus board
          atau part khusus, kami konfirmasi dulu sebelum memesan.
        </p>
      </div>
    </Section>
  );
}
