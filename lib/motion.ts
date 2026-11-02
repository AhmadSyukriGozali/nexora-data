/**
 * Motion vocabulary for the whole site.
 * One easing family, three spring weights, one set of durations, so every
 * movement feels like it came from the same hand.
 */

type Bezier = [number, number, number, number];

export const ease = {
  /** fast out, long settle: the default for entrances */
  out: [0.16, 1, 0.3, 1] as Bezier,
  /** softer version for hovers and small state changes */
  soft: [0.22, 0.61, 0.36, 1] as Bezier,
};

export const spring = {
  soft: { type: "spring", stiffness: 140, damping: 22, mass: 0.9 },
  snappy: { type: "spring", stiffness: 380, damping: 30 },
  heavy: { type: "spring", stiffness: 90, damping: 18, mass: 1.15 },
} as const;

export const duration = {
  micro: 0.18,
  quick: 0.32,
  base: 0.56,
  scene: 0.9,
} as const;

/** Slide-up entrance used by text blocks that change in place. */
export const swapIn = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: duration.quick, ease: ease.out },
} as const;
