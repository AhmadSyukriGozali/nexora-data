"use client";

import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "motion/react";
import { useRef, useState } from "react";
import { Section } from "@/components/ui/section";
import { processSteps } from "@/lib/content";
import { cn } from "@/lib/cn";
import { ease } from "@/lib/motion";

/**
 * A sticky scene: the heading and the progress bar hold position while the
 * four steps travel past. Only the step in the middle of the screen is at
 * full strength, so the eye is led instead of scanning a static list.
 */
export function Process() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 72%", "end 82%"],
  });

  const [active, setActive] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    const next = Math.min(
      processSteps.length - 1,
      Math.max(0, Math.floor(value * processSteps.length)),
    );
    setActive(next);
  });

  const progress = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <Section id="proses" tone="navy" className="scroll-mt-20 section-pad">
      <div className="container-page">
        <div ref={ref} className="grid md:grid-cols-12 md:gap-x-16">
          <div className="md:sticky md:top-[132px] md:col-span-5 md:self-start">
            <h2 className="display-lg text-[clamp(2.1rem,4.4vw,3.9rem)] text-chrome">
              Empat langkah,
              <br />
              <span className="text-electric-soft">tanpa kejutan.</span>
            </h2>

            <p className="mt-5 max-w-[38ch] text-[16px] leading-relaxed text-dim">
              Kamu tahu apa yang dikerjakan, berapa biayanya, dan apa yang
              dijamin, sebelum perangkat dibongkar.
            </p>

            <div className="mt-10 flex items-center gap-4">
              <div
                aria-hidden="true"
                className="relative h-[3px] w-full max-w-[220px] bg-white/12"
              >
                <motion.div
                  style={{ width: progress }}
                  className="absolute inset-y-0 left-0 bg-electric-soft"
                />
              </div>
              <p className="shrink-0 text-[14px] tabular-nums text-dim">
                {active + 1} / {processSteps.length}
              </p>
            </div>
          </div>

          <div className="mt-14 md:col-span-7 md:mt-0">
            <ol>
              {processSteps.map((step, index) => {
                const isActive = index === active;

                return (
                  <li
                    key={step.title}
                    className="flex min-h-[46vh] items-center md:min-h-[58vh]"
                  >
                    <motion.div
                      animate={{ x: isActive ? 0 : 10 }}
                      transition={{ duration: 0.5, ease: ease.out }}
                      className="w-full"
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          "mb-6 block h-2 w-2 transition-colors duration-500",
                          isActive ? "bg-electric-soft" : "bg-white/20",
                        )}
                      />

                      <h3
                        className={cn(
                          "display-lg text-[clamp(1.7rem,3.6vw,3.1rem)] transition-colors duration-500",
                          isActive ? "text-chrome" : "text-dim",
                        )}
                      >
                        {step.title}
                      </h3>

                      <p className="mt-4 max-w-[42ch] text-[16px] leading-relaxed text-dim md:text-[17px]">
                        {step.description}
                      </p>
                    </motion.div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </div>
    </Section>
  );
}
