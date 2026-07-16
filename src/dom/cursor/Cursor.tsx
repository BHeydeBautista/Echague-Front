"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/src/lib/gsap";
import { useIsTouchDevice } from "@/src/lib/useIsTouchDevice";

/** Decorative halo that trails the native cursor with inertia and swells
 * over anything marked [data-magnetic]. The system pointer stays visible —
 * the ring is an accent following it, not a replacement.
 * Blend-difference keeps it legible over both the dark void and the bright
 * headline glyphs. Touch devices render it inert (never activated). */
export function Cursor() {
  const isTouch = useIsTouchDevice();
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isTouch) return;
    const ring = ringRef.current;
    if (!ring) return;

    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ringPos = { x: pos.x, y: pos.y };
    let ringScale = 1;
    let targetScale = 1;
    let visible = false;

    const onMove = (e: PointerEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      if (!visible) {
        visible = true;
        gsap.to(ring, { opacity: 1, duration: 0.3 });
      }
    };
    const onLeave = () => {
      visible = false;
      gsap.to(ring, { opacity: 0, duration: 0.3 });
    };

    const onOver = (e: PointerEvent) => {
      const target = (e.target as HTMLElement).closest("[data-magnetic]");
      targetScale = target ? 2.6 : 1;
    };

    const tick = () => {
      ringPos.x += (pos.x - ringPos.x) * 0.16;
      ringPos.y += (pos.y - ringPos.y) * 0.16;
      ringScale += (targetScale - ringScale) * 0.14;
      // direct style write: quickSetter can't take a composite transform
      // string, and this runs once per frame on a single element anyway
      ring.style.transform = `translate(${ringPos.x}px, ${ringPos.y}px) translate(-50%, -50%) scale(${ringScale})`;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    gsap.ticker.add(tick);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      gsap.ticker.remove(tick);
    };
  }, [isTouch]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[90]" aria-hidden>
      <div
        ref={ringRef}
        className="absolute left-0 top-0 h-9 w-9 rounded-full border border-paper/60 opacity-0"
        style={{ mixBlendMode: "difference" }}
      />
    </div>
  );
}
