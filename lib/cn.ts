/** Joins conditional class names without pulling in a dependency. */
export function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}
