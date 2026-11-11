import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

/**
 * Chart ringan berbasis SVG. Tidak ada dependency, tidak ada JavaScript
 * klien: tooltip memakai <title> bawaan sehingga tetap terbaca pembaca layar.
 */

const DEFAULT_COLORS = [
  "var(--color-electric)",
  "var(--color-live)",
  "var(--blk-warning)",
  "var(--color-electric-soft)",
  "var(--blk-error)",
  "var(--color-dim)",
];

export type Point = { label: string; value: number };

function maxOf(points: Point[]): number {
  return Math.max(1, ...points.map((point) => point.value));
}

export function Sparkline({
  points,
  className,
  tone = "var(--color-electric)",
}: {
  points: Point[];
  className?: string;
  tone?: string;
}) {
  const width = 120;
  const height = 34;
  const max = maxOf(points);
  const step = points.length > 1 ? width / (points.length - 1) : width;
  const coords = points.map((point, index) => {
    const x = points.length > 1 ? index * step : width / 2;
    const y = height - 3 - (point.value / max) * (height - 6);
    return { x, y, point };
  });
  const line = coords
    .map(({ x, y }, index) => `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(" ");
  const area = `${line} L${width} ${height} L0 ${height} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn("h-9 w-full overflow-visible", className)}
      role="img"
      aria-label={`Tren ${points.length} titik terakhir`}
      preserveAspectRatio="none"
    >
      <path d={area} fill={tone} opacity={0.12} />
      <path
        d={line}
        fill="none"
        stroke={tone}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      {coords.length > 0 ? (
        <circle
          cx={coords[coords.length - 1].x}
          cy={coords[coords.length - 1].y}
          r={2.4}
          fill={tone}
        />
      ) : null}
    </svg>
  );
}

export function AreaTrend({
  points,
  height = 180,
  formatValue = (value: number) => String(value),
  tone = "var(--color-electric)",
  className,
}: {
  points: Point[];
  height?: number;
  formatValue?: (value: number) => string;
  tone?: string;
  className?: string;
}) {
  const width = 640;
  const pad = 8;
  const max = maxOf(points);
  const step = points.length > 1 ? (width - pad * 2) / (points.length - 1) : width;
  const coords = points.map((point, index) => {
    const x = pad + index * step;
    const y = height - 22 - (point.value / max) * (height - 36);
    return { x, y, point };
  });
  const line = coords
    .map(({ x, y }, index) => `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(" ");
  const area = `${line} L${coords[coords.length - 1]?.x ?? width} ${height} L${pad} ${height} Z`;
  const gradientId = `nx-area-${tone.replace(/[^a-z0-9]/gi, "")}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn("h-auto w-full", className)}
      role="img"
      aria-label="Grafik tren"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={tone} stopOpacity="0.35" />
          <stop offset="100%" stopColor={tone} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((ratio) => (
        <line
          key={ratio}
          x1={pad}
          x2={width - pad}
          y1={height - 22 - ratio * (height - 36)}
          y2={height - 22 - ratio * (height - 36)}
          stroke="var(--bjork-border)"
          strokeDasharray="4 6"
        />
      ))}
      <path d={area} fill={`url(#${gradientId})`} />
      <path
        d={line}
        fill="none"
        stroke={tone}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      {coords.map(({ x, y, point }) => (
        <g key={point.label}>
          <circle cx={x} cy={y} r={2.6} fill={tone} />
          <circle cx={x} cy={y} r={9} fill="transparent">
            <title>{`${point.label}: ${formatValue(point.value)}`}</title>
          </circle>
        </g>
      ))}
    </svg>
  );
}

export function BarSeries({
  points,
  height = 140,
  tone = "var(--color-electric)",
  formatValue = (value: number) => String(value),
  className,
}: {
  points: Point[];
  height?: number;
  tone?: string;
  formatValue?: (value: number) => string;
  className?: string;
}) {
  const max = maxOf(points);
  return (
    <div
      className={cn("flex items-end gap-1.5", className)}
      style={{ height }}
      role="img"
      aria-label="Grafik batang"
    >
      {points.map((point) => (
        <div
          key={point.label}
          className="group flex h-full min-w-0 flex-1 flex-col justify-end gap-1"
          title={`${point.label}: ${formatValue(point.value)}`}
        >
          <div
            className="w-full rounded-[3px] transition-opacity duration-150 group-hover:opacity-80"
            style={{
              height: `${Math.max(2, (point.value / max) * 100)}%`,
              backgroundColor: tone,
              opacity: point.value === 0 ? 0.18 : 1,
            }}
          />
          <span className="truncate text-center text-[9.5px] leading-none text-[color:var(--bjork-text-faint)]">
            {point.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export type DonutSegment = {
  label: string;
  value: number;
  color?: string;
  href?: string;
};

export function Donut({
  segments,
  size = 148,
  thickness = 14,
  centerLabel,
  centerValue,
}: {
  segments: DonutSegment[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: ReactNode;
}) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex items-center gap-4">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
          role="img"
          aria-label={segments
            .map((segment) => `${segment.label}: ${segment.value}`)
            .join(", ")}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--bjork-border)"
            strokeWidth={thickness}
          />
          {total > 0
            ? segments.map((segment, index) => {
                const length = (segment.value / total) * circumference;
                const dash = `${length} ${circumference - length}`;
                const currentOffset = offset;
                offset += length;
                const circle = (
                  <circle
                    key={segment.label}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={
                      segment.color ??
                      DEFAULT_COLORS[index % DEFAULT_COLORS.length]
                    }
                    strokeWidth={thickness}
                    strokeDasharray={dash}
                    strokeDashoffset={-currentOffset}
                    strokeLinecap="butt"
                  >
                    <title>{`${segment.label}: ${segment.value}`}</title>
                  </circle>
                );
                return segment.href ? (
                  <a key={segment.label} href={segment.href}>
                    {circle}
                  </a>
                ) : (
                  circle
                );
              })
            : null}
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <div className="font-display text-[22px] font-bold leading-none tabular-nums">
              {centerValue ?? total}
            </div>
            {centerLabel ? (
              <div className="mt-1 text-[10.5px] uppercase tracking-[0.08em] text-[color:var(--bjork-text-muted)]">
                {centerLabel}
              </div>
            ) : null}
          </div>
        </div>
      </div>
      <ul className="min-w-0 flex-1 space-y-1.5">
        {segments.map((segment, index) => (
          <li key={segment.label} className="flex items-center gap-2 text-[12px]">
            <span
              aria-hidden="true"
              className="size-2 shrink-0 rounded-full"
              style={{
                backgroundColor:
                  segment.color ?? DEFAULT_COLORS[index % DEFAULT_COLORS.length],
              }}
            />
            <span className="min-w-0 flex-1 truncate text-[color:var(--bjork-text-medium)]">
              {segment.label}
            </span>
            <span className="shrink-0 font-semibold tabular-nums">
              {segment.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ProgressBar({
  value,
  max,
  tone = "var(--color-electric)",
  label,
}: {
  value: number;
  max: number;
  tone?: string;
  label?: string;
}) {
  const ratio = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  return (
    <div
      className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--bjork-surface-active)]"
      role="progressbar"
      aria-valuenow={Math.round(ratio * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div
        className="h-full rounded-full transition-[width] duration-500"
        style={{ width: `${ratio * 100}%`, backgroundColor: tone }}
      />
    </div>
  );
}

export function StatDelta({ value }: { value: number | null }) {
  if (value === null || !Number.isFinite(value)) {
    return (
      <span className="text-[11px] text-[color:var(--bjork-text-faint)]">
        Belum ada pembanding
      </span>
    );
  }
  const positive = value >= 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[11px] font-medium tabular-nums",
        positive ? "text-[var(--color-live)]" : "text-[var(--blk-error)]",
      )}
    >
      {positive ? "▲" : "▼"} {Math.abs(value).toFixed(0)}% vs minggu lalu
    </span>
  );
}

export function ChartEmpty({ children }: { children: ReactNode }) {
  return (
    <div className="grid h-[140px] place-items-center rounded-xl border border-dashed border-[color:var(--bjork-border)] px-4 text-center text-[12px] text-[color:var(--bjork-text-muted)]">
      {children}
    </div>
  );
}
