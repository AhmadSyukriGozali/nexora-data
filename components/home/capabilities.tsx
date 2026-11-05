"use client";

import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";
import { useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { Reveal } from "@/components/reveal";
import { ButtonLink } from "@/components/ui/button-link";
import { Section } from "@/components/ui/section";
import { capabilities } from "@/lib/content";
import { cn } from "@/lib/cn";
import { ease } from "@/lib/motion";

/** Atmosphere shots paired with each repair, not photos of this shop. */
const shots = [
  {
    src: "/images/laptop-repair-tall.webp",
    alt: "Bagian dalam laptop terbuka memperlihatkan layar dan rangkanya",
  },
  {
    src: "/images/laptop-repair-wide.webp",
    alt: "Tangan memasang modul memori ke dalam laptop yang sudah dibuka",
  },
  {
    src: "/images/motherboard-6.webp",
    alt: "Motherboard komputer dengan soket prosesor dan slot memori",
  },
  {
    src: "/images/laptop-repair-wide.webp",
    alt: "Perangkat dibongkar untuk penggantian RAM dan pembersihan",
  },
  {
    src: "/images/motherboard-11.webp",
    alt: "Jalur dan komponen motherboard yang diperiksa dari dekat",
  },
  {
    src: "/images/repair-lab.webp",
    alt: "Teknisi membuka cangkang ponsel dengan alat presisi",
  },
  {
    src: "/images/printer-repair.webp",
    alt: "Teknisi memeriksa bagian dalam printer yang sudah dibuka",
  },
];

/**
 * A bench index: every row is readable on its own, and hovering a row floats
 * the matching specimen card beside the pointer. The card is an enhancement,
 * so nothing disappears when it is not shown.
 */
export function Capabilities() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState<number | null>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 190, damping: 26, mass: 0.5 });
  const springY = useSpring(y, { stiffness: 190, damping: 26, mass: 0.5 });

  function trackPointer(event: ReactPointerEvent<HTMLUListElement>) {
    if (reduce || event.pointerType !== "mouse") return;

    const cardWidth = 300;
    const cardHeight = 400;

    x.set(Math.min(event.clientX + 26, window.innerWidth - cardWidth - 16));
    y.set(
      Math.min(
        Math.max(event.clientY - cardHeight / 2, 16),
        window.innerHeight - cardHeight - 16,
      ),
    );
  }

  const shot = shots[active ?? 0];

  return (
    <Section id="layanan" tone="paper" className="scroll-mt-20 section-pad">
      <div className="container-page relative">
        <Reveal variant="mask">
          <h2 className="display-lg text-[clamp(1.9rem,5.2vw,4.6rem)] text-ink-soft">
            Yang kami tangani
          </h2>
        </Reveal>

        <ul
          className="mt-12 space-y-10 md:mt-16 md:space-y-0"
          onPointerMove={trackPointer}
          onPointerLeave={() => setActive(null)}
        >
          {capabilities.map((item, index) => (
            <li
              key={item.title}
              onPointerEnter={() => setActive(index)}
              className="group"
            >
              <div className="mb-5 hidden md:block md:mb-6 lg:hidden">
                <div className="relative aspect-[16/9] overflow-hidden">
                  <Image
                    src={shots[index].src}
                    alt={shots[index].alt}
                    fill
                    sizes="100vw"
                    className="object-cover"
                  />
                </div>
              </div>

              <div className="grid grid-cols-12 items-baseline gap-y-2 md:gap-x-10 md:py-6">
                <h3
                  className={cn(
                    "col-span-12 flex items-baseline gap-4 font-display text-[clamp(1.7rem,4.8vw,4.4rem)] font-semibold leading-[0.98] tracking-[-0.035em] transition-[color,transform] duration-500 ease-out md:col-span-7",
                    active === index
                      ? "text-electric md:translate-x-3"
                      : "text-ink",
                  )}
                >
                  {item.title}
                  <span
                    aria-hidden="true"
                    className={cn(
                      "hidden text-[0.42em] transition-opacity duration-300 md:inline",
                      active === index ? "opacity-100" : "opacity-0",
                    )}
                  >
                    ↗
                  </span>
                </h3>

                <p className="col-span-12 max-w-[48ch] text-[15px] leading-relaxed text-ink-soft md:col-span-5 md:text-[17px]">
                  {item.description}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <Reveal delay={60} className="mt-12 md:mt-16">
          <ButtonLink href="/layanan" tone="on-light">
            Detail layanan per perangkat
            <span aria-hidden="true">→</span>
          </ButtonLink>
        </Reveal>
      </div>

      <motion.div
        aria-hidden="true"
        style={{ x: springX, y: springY }}
        animate={{
          opacity: active === null ? 0 : 0.75,
          scale: active === null ? 0.95 : 1,
        }}
        transition={{ duration: 0.25, ease: ease.out }}
        className="pointer-events-none fixed left-0 top-0 z-30 hidden w-[300px] lg:block"
      >
        <div className="bg-ink p-2">
          <div className="relative h-[330px] overflow-hidden bg-surface">
            <AnimatePresence initial={false}>
              <motion.div
                key={`${active}-${shot.src}`}
                initial={{ opacity: 0, scale: 1.06 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: ease.out }}
                className="absolute inset-0"
              >
                <Image
                  src={shot.src}
                  alt={shot.alt}
                  fill
                  sizes="300px"
                  className="object-cover"
                />
              </motion.div>
            </AnimatePresence>
          </div>

          <p className="px-2 pb-1 pt-3 text-[14px] font-semibold text-chrome">
            {capabilities[active ?? 0].title}
          </p>
        </div>
      </motion.div>
    </Section>
  );
}
