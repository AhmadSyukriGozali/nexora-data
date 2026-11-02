"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import GlyphPortal, {
  type GlyphPortalStyle,
} from "@/components/ui/glyph-portal";
import { ShinyLink } from "@/components/ui/shiny-link";
import { atmospherePhotos } from "@/lib/media";
import { site, waDefault } from "@/lib/site";

import { WELCOME_COOKIE, WELCOME_MAX_AGE } from "@/lib/welcome";

const WORD = "NEXORA";

/** Sora, the site's display face, resolved through the Tailwind theme token. */
const DISPLAY_FONT = "var(--font-display)";
const FALLBACK_FONT = '"Segoe UI", Arial, sans-serif';

const portalStyle: GlyphPortalStyle = {
  "--gp-paper": "#f3f5f9",
  "--gp-ink": "#081227",
  "--gp-field": "#0a2a8f",
  "--gp-foreground": "#ffffff",
};

const features = [
  {
    title: "Diagnosa gratis",
    description:
      "Pemeriksaan awal tanpa biaya, dan tanpa kewajiban melanjutkan perbaikan.",
  },
  {
    title: "Harga disepakati dulu",
    description:
      "Rincian part dan jasa disebut satu per satu sebelum perangkat dibongkar.",
  },
  {
    title: `Garansi ${site.guarantee}`,
    description: "Berlaku untuk jasa pemasangan dan part yang kami sediakan.",
  },
] as const;

/**
 * GlyphPortal measures the word once, on mount, and falls back to a static
 * layout if the face is still loading. So the portal mounts only after Sora is
 * ready, or after a short timeout that hands it the fallback stack instead.
 */
function useDisplayFace() {
  const [face, setFace] = useState<string | null>(null);

  useEffect(() => {
    let settled = false;
    let timeout = 0;

    const finish = (value: string) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      setFace(value);
    };

    // The theme token is a var() chain; the font loader needs the real names.
    const probe = document.createElement("span");
    probe.style.fontFamily = DISPLAY_FONT;
    document.body.append(probe);
    const resolved = getComputedStyle(probe).fontFamily;
    probe.remove();

    timeout = window.setTimeout(() => finish(FALLBACK_FONT), 1600);
    document.fonts.load(`800 100px ${resolved}`, WORD).then(
      () => finish(DISPLAY_FONT),
      () => finish(FALLBACK_FONT),
    );

    return () => {
      settled = true;
      window.clearTimeout(timeout);
    };
  }, []);

  return face;
}

const css = `
  [data-welcome] [data-gp-caption]{inset:calc(var(--gp-word-bottom,50%) + 92px) 24px auto;justify-content:center;}
  [data-welcome] [data-gp-hint]{display:none;}
  [data-welcome] [data-gp-enter]{min-height:48px;padding:0 24px;gap:24px;background:#1e5eff;color:#fff;font-size:14px;font-weight:600;transition:background-color .2s;}
  [data-welcome] [data-gp-enter]:hover{background:#081227;}
  [data-welcome] [data-gp-enter]:focus-visible{outline:2px solid #081227;outline-offset:4px;background:#1e5eff;color:#fff;margin:0;padding:0 24px;}
  [data-welcome] [data-gp-touch-picker]{top:auto;bottom:18px;}
  [data-welcome] [data-gp-select]{border-color:transparent;font-size:12px;color:#46536a;}
  [data-welcome] [data-gp-content]{padding:6.5rem clamp(1.25rem,5vw,5rem) 5rem;}
  [data-welcome-eyebrow]{position:absolute;inset:auto 24px calc(100% - var(--gp-word-top,35%) + 28px);margin:0;text-align:center;font-size:12px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:#46536a;}
  [data-welcome-support]{position:absolute;inset:calc(var(--gp-word-bottom,50%) + 32px) 24px auto;margin:0;text-align:center;font-size:16px;line-height:1.5;color:#46536a;}
  [data-welcome-scroll]{position:absolute;inset:auto 24px 7%;text-align:center;color:#46536a;font-size:12px;}
  @media(any-pointer:coarse){[data-welcome-scroll]{bottom:13%;}}
  [data-gp-motion=off] [data-welcome-scroll]{display:none;}
  @container(max-width:450px){[data-welcome-eyebrow]{font-size:11px;}[data-welcome-support]{font-size:14px;}[data-welcome] [data-gp-caption]{top:calc(var(--gp-word-bottom,50%) + 84px);}}
  @container(max-height:479px){[data-welcome-support]{top:calc(var(--gp-word-bottom,50%) + 16px);}[data-welcome] [data-gp-caption]{top:calc(var(--gp-word-bottom,50%) + 60px);}[data-welcome-scroll]{display:none;}}
  @media(prefers-reduced-motion:reduce){[data-welcome] [data-gp-content]{padding-block:4rem;}}
`;

/**
 * The welcome scene: NEXORA is cut out of a paper page, and scrolling flies
 * the camera into one letter until the circuit board behind it fills the
 * screen. The page that follows is the short version of what the shop offers.
 */
export function WelcomePortal() {
  const face = useDisplayFace();
  const frame = useRef<HTMLDivElement>(null);
  const photo = atmospherePhotos.board;
  
    // Dibuka langsung lewat /selamat-datang pun dihitung sudah disambut,
  // supaya "/" tidak mengembalikan pengunjung ke sini sekali lagi.
  useEffect(() => {
    document.cookie = `${WELCOME_COOKIE}=1; max-age=${WELCOME_MAX_AGE}; path=/; samesite=lax`;
  }, []);

  // The fixed header reads data-chapter: paper while the word is on paper,
  // navy once the camera has gone through into the blue field.
  const onProgress = (progress: number) => {
    const element = frame.current;
    if (element) element.dataset.chapter = progress > 0.85 ? "dark" : "light";
  };

  return (
    <div
      ref={frame}
      data-welcome
      data-chapter="light"
      className="bg-paper text-ink"
    >
      <style>{css}</style>

      <h1 className="sr-only">Selamat datang di {site.name}</h1>

      {face ? (
        <GlyphPortal
          word={WORD}
          fontFamily={face}
          fontWeight={800}
          scrollLength={2.6}
          enterLabel="Masuk"
          className="font-sans"
          style={portalStyle}
          onProgress={onProgress}
          background={
            <div
              className="absolute inset-0"
              style={{ transform: "scale(var(--gp-field-scale,1))" }}
            >
              <Image
                src={photo.src}
                alt=""
                fill
                sizes="100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-navy/60" />
              <div className="absolute inset-0 bg-electric/45" />
            </div>
          }
          front={
            <>
              <p data-welcome-eyebrow>Selamat datang di</p>
              <p data-welcome-support>
                Servis HP, laptop & PC · Pulo Gebang, {site.address.city}
              </p>
              <span data-welcome-scroll>Pilih satu huruf, lalu gulir ↓</span>
            </>
          }
        >
          <div className="mx-auto flex w-full max-w-[1180px] flex-col items-start gap-10 md:gap-14">
            <div className="flex flex-col gap-5">
              <h2 className="max-w-[20ch] font-display text-[clamp(2rem,1.1rem+3.4vw,3.75rem)] font-bold leading-[1.04] tracking-[-0.03em] text-white">
                Servis yang jelas, dari diagnosa sampai garansi.
              </h2>
              <p className="max-w-[48ch] text-[16px] leading-relaxed text-white md:text-[18px]">
                Ceritakan keluhan perangkatmu. Kami periksa dulu, sebutkan
                biayanya, baru dikerjakan.
              </p>
            </div>

            <ol className="grid w-full gap-8 md:grid-cols-3 md:gap-12">
              {features.map((feature, index) => (
                <li key={feature.title}>
                  <p className="font-display text-[13px] font-semibold tracking-[0.12em] text-white">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-3 font-display text-[19px] font-semibold leading-tight text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-white">
                    {feature.description}
                  </p>
                </li>
              ))}
            </ol>

            <div className="flex flex-col gap-6">
              <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
                <ShinyLink
                  href="/"
                  tone="chrome"
                  size="lg"
                  cursor="Masuk beranda"
                >
                  Masuk ke beranda
                  <span aria-hidden="true">→</span>
                </ShinyLink>

                <Link
                  href="/layanan"
                  data-cursor="Lihat layanan"
                  className="text-[15px] font-semibold text-white underline decoration-white/60 decoration-2 underline-offset-4 transition-colors hover:decoration-white"
                >
                  Lihat layanan
                </Link>

                <a
                  href={waDefault}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="Chat WhatsApp"
                  className="text-[15px] font-semibold text-white underline decoration-white/60 decoration-2 underline-offset-4 transition-colors hover:decoration-white"
                >
                  Chat WhatsApp
                </a>
              </div>

              <p className="text-[14px] leading-relaxed text-white">
                Buka {site.hours.days.toLowerCase()}, {site.hours.open}–
                {site.hours.close} · {site.address.line1}
              </p>
            </div>
          </div>
        </GlyphPortal>
      ) : (
        <div aria-hidden="true" className="min-h-[100svh]" />
      )}

      <noscript>
        <div className="bg-navy px-6 py-24 text-center text-chrome">
          <p className="font-display text-2xl font-bold">
            Selamat datang di {site.name}
          </p>
          <p className="mt-3 text-dim">{site.description}</p>
          <Link href="/" className="mt-8 inline-block font-semibold underline">
            Masuk ke beranda
          </Link>
        </div>
      </noscript>
    </div>
  );
}
