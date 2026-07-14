"use client";

import { useRef } from "react";
import { SECTION_ORDER } from "@/src/lib/scrollState";
import { SECTION_COPY } from "@/src/content/copy";
import { useUIStore } from "@/src/state/useUIStore";
import { useScrollFrame } from "@/src/scroll/useScrollFrame";

export function ProgressRail() {
  const activeSection = useUIStore((s) => s.activeSection);
  const fillRef = useRef<HTMLDivElement>(null);

  useScrollFrame((progress) => {
    if (fillRef.current) {
      fillRef.current.style.height = `${Math.min(progress * 100, 100)}%`;
    }
  });

  return (
    <div className="fixed right-6 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-4 sm:right-10 lg:flex">
      <span className="font-display text-xs tracking-widest text-gold">
        {SECTION_COPY[activeSection].index}
      </span>
      <div className="relative h-32 w-px bg-paper/15">
        <div
          ref={fillRef}
          className="absolute left-0 top-0 w-px bg-gradient-to-b from-gold to-cyan"
        />
      </div>
      <span className="kicker text-mist">
        {String(SECTION_ORDER.length - 1).padStart(2, "0")}
      </span>
      <span className="mt-1 [writing-mode:vertical-rl] kicker text-mist/70">
        {SECTION_COPY[activeSection].label}
      </span>
    </div>
  );
}
