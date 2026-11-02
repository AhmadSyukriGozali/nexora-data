import { Reveal } from "@/components/reveal";
import { Section } from "@/components/ui/section";
import { deviceOrder, estimates, priceRows } from "@/lib/content";

/**
 * One table on desktop, one stacked list per device on smaller screens.
 * Both render the same `priceRows`, so prices are edited in one place.
 */
export function Pricing() {
  return (
    <Section id="tarif" tone="navy" className="scroll-mt-20 section-pad">
      <div className="container-page">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <Reveal>
            <h2 className="display-lg text-[clamp(2.1rem,4.6vw,4rem)] text-chrome">
              Daftar tarif
            </h2>
          </Reveal>

          <Reveal delay={80}>
            <p className="max-w-[40ch] text-[15px] leading-relaxed text-dim">
              Rentang harga jasa dan part yang paling sering diminta, dalam
              Rupiah. Semua angka dikonfirmasi setelah diagnosa gratis.
            </p>
          </Reveal>
        </div>

        <Reveal className="mt-10 hidden lg:mt-12 lg:block">
          <table className="price-table w-full border-collapse text-left">
            <caption className="sr-only">
              Estimasi tarif servis HP, laptop, dan PC di Nexora Data
            </caption>

            <thead>
              <tr>
                <th
                  scope="col"
                  className="pb-5 pr-4 text-[14px] font-medium text-dim"
                >
                  Tindakan
                </th>
                {deviceOrder.map((device) => (
                  <th
                    key={device}
                    scope="col"
                    className="px-3 pb-5 font-display text-[clamp(1.1rem,2.2vw,1.9rem)] font-semibold text-chrome"
                  >
                    {estimates[device].label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {priceRows.map((row) => (
                <tr
                  key={row.action}
                  className="transition-colors hover:bg-white/[0.04]"
                >
                  <th
                    scope="row"
                    className="py-5 pr-4 text-[16px] font-medium text-chrome md:text-[19px]"
                  >
                    {row.action}
                  </th>
                  {deviceOrder.map((device) => (
                    <td
                      key={device}
                      className="px-3 py-5 text-[16px] tabular-nums text-chrome md:text-[19px]"
                    >
                      {row[device]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>

        <div className="mt-8 space-y-8 lg:hidden">
          {deviceOrder.map((device) => (
            <div key={device}>
              <h3 className="font-display text-[22px] font-semibold text-chrome">
                {estimates[device].label}
              </h3>

              <ul className="mt-3 space-y-1">
                {priceRows.map((row) => (
                  <li
                    key={row.action}
                    className="flex items-baseline justify-between gap-4 py-2.5 text-[15px]"
                  >
                    <span className="text-chrome">{row.action}</span>
                    <span className="tabular-nums text-dim">{row[device]}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
