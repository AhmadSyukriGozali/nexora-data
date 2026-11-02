import type { ReactNode } from "react";

/** Fades each route in so navigation feels continuous rather than abrupt. */
export default function Template({ children }: { children: ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
