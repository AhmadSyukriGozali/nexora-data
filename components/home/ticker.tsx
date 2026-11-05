import { cn } from "@/lib/cn";

/** Real services, looping. The duplicate copy is hidden from screen readers. */
const items = [
  "Ganti LCD & layar",
  "Baterai & pengisian",
  "Motherboard & cairan",
  "Upgrade RAM & SSD",
  "Rakit & servis PC",
  "Servis printer",
  "Pemulihan data",
  "Diagnosa gratis",
  "Garansi 2 minggu",
];

function Row({ duplicate = false }: { duplicate?: boolean }) {
  return (
    <ul
      aria-hidden={duplicate || undefined}
      data-duplicate={duplicate || undefined}
      className="flex shrink-0 items-center"
    >
      {items.map((item) => (
        <li
          key={item}
          className="flex items-center gap-6 whitespace-nowrap pr-6 text-[15px] font-semibold text-chrome md:text-[17px]"
        >
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 shrink-0 bg-electric"
          />
          {item}
        </li>
      ))}
    </ul>
  );
}

export function Ticker({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "ticker overflow-hidden bg-navy-soft py-5 md:py-6",
        className,
      )}
    >
      <div className="ticker-track">
        <Row />
        <Row duplicate />
      </div>
    </div>
  );
}
