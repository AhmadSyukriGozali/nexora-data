"use client";

import { motion } from "motion/react";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/cn";

type WordsRevealProps = {
  text: string;
  className?: string;
  wordClassName?: string;
};

/**
 * Splits a line into words that rise out of a shared mask, one after another.
 * Screen readers still get the sentence in order because the spaces are real.
 */
export function WordsReveal({ text, className, wordClassName }: WordsRevealProps) {
  const words = text.split(" ");

  return (
    <motion.span
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.4 }}
      variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
      className={cn("inline", className)}
    >
      {words.map((word, index) => (
        <span
          key={`${word}-${index}`}
          className="inline-block overflow-hidden align-bottom"
        >
          <motion.span
            variants={{
              hidden: { y: "112%" },
              visible: {
                y: 0,
                transition: { duration: 0.75, ease: ease.out },
              },
            }}
            className={cn("inline-block", wordClassName)}
          >
            {word}
            {index < words.length - 1 ? "\u00A0" : ""}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}
