"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { cn } from "@/lib/cn";
import type { AtmospherePhoto } from "@/lib/media";

type PhotoBandProps = {
  photo: AtmospherePhoto;
  /** Height classes differ per section, so the caller decides. */
  className?: string;
  /** Optional oversized word that rides across the picture. */
  overlay?: string;
};

/**
 * A photograph that opens as it enters: the frame loses its side margins, the
 * picture slides against the scroll, and an optional word travels slower than
 * the image so the two layers separate.
 */
export function PhotoBand({ photo, className, overlay }: PhotoBandProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["-7%", "7%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.18, 1.04]);
  const clipPath = useTransform(
    scrollYProgress,
    [0, 0.38],
    ["inset(0 7% 0 7%)", "inset(0 0% 0 0%)"],
  );
  const wordY = useTransform(scrollYProgress, [0, 1], ["28%", "-28%"]);

  return (
    <figure data-chapter="dark" className="bg-navy">
      <motion.div
        ref={ref}
        style={{ clipPath }}
        className={cn("relative overflow-hidden", className)}
      >
        <motion.div
          style={{ y, scale }}
          className="absolute inset-[-12%]"
        >
          <Image
            src={photo.src}
            alt={photo.alt}
            width={photo.width}
            height={photo.height}
            sizes="100vw"
            className="h-full w-full object-cover"
          />
        </motion.div>

        <div aria-hidden="true" className="absolute inset-0 bg-navy/25" />

        {overlay ? (
          <motion.span
            aria-hidden="true"
            style={{ y: wordY }}
            className="absolute bottom-2 left-4 select-none font-display text-[clamp(3.4rem,13vw,12rem)] font-extrabold uppercase leading-none tracking-[-0.05em] text-white/15 md:bottom-4 md:left-11"
          >
            {overlay}
          </motion.span>
        ) : null}
      </motion.div>

      <figcaption className="container-page flex flex-wrap justify-between gap-3 py-5 text-[13px] leading-relaxed text-dim">
        <span>{photo.caption}</span>
        <span>Foto: {photo.credit}</span>
      </figcaption>
    </figure>
  );
}
