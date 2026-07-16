"use client";

import { ReactNode, useRef } from "react";
import { gsap, useGSAP } from "@/src/lib/gsap";

interface Props {
  children: ReactNode;
  /** How far the element chases the pointer, as a fraction of the offset. */
  strength?: number;
  className?: string;
}

/** Wraps an element so it leans toward the pointer while hovered and snaps
 * back with an elastic overshoot on leave — the classic "magnetic button".
 * Also tags itself [data-magnetic] so the custom cursor swells over it. */
export function Magnetic({ children, strength = 0.35, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const xTo = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3.out" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3.out" });

      const onMove = (e: PointerEvent) => {
        const rect = el.getBoundingClientRect();
        const relX = e.clientX - (rect.left + rect.width / 2);
        const relY = e.clientY - (rect.top + rect.height / 2);
        xTo(relX * strength);
        yTo(relY * strength);
      };
      const onLeave = () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1, 0.35)" });
      };

      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerleave", onLeave);
      return () => {
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerleave", onLeave);
      };
    },
    { scope: ref },
  );

  return (
    <div ref={ref} data-magnetic className={className} style={{ display: "inline-block" }}>
      {children}
    </div>
  );
}
