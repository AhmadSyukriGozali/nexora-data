"use client";

import { useEffect, useState } from "react";

export type Chapter = "dark" | "light" | "blue";

/** The y-coordinate where the fixed header ends. */
const HEADER_LINE = 88;

/**
 * Watches which `[data-chapter]` section sits under the header and returns
 * its tone, so the header can flip between navy, paper and electric.
 */
export function useChapterTheme() {
  const [chapter, setChapter] = useState<Chapter>("dark");

  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("[data-chapter]"),
    );

    let frame = 0;

    const update = () => {
      frame = 0;

      const current = sections.find((section) => {
        const { top, bottom } = section.getBoundingClientRect();
        return top <= HEADER_LINE && bottom > HEADER_LINE;
      });

      setChapter((current?.dataset.chapter as Chapter) ?? "dark");
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return chapter;
}
