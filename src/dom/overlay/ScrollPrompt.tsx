"use client";

import { useRef } from "react";
import { useScrollFrame } from "@/src/scroll/useScrollFrame";

export function ScrollPrompt() {
  const ref = useRef<HTMLDivElement>(null);

  useScrollFrame((progress) => {
    if (!ref.current) return;
    const opacity = Math.max(0, 1 - progress * 22);
    ref.current.style.opacity = String(opacity);
    ref.current.style.pointerEvents = opacity < 0.05 ? "none" : "auto";
  });

  return (
    <div
      ref={ref}
      className="fixed inset-x-0 bottom-8 z-40 flex flex-col items-center gap-3 transition-opacity"
    >
      <span className="kicker text-mist">Desliza para comenzar</span>
      <div className="h-9 w-5 rounded-full border border-paper/25 p-1">
        <div className="mx-auto h-1.5 w-1.5 animate-bounce rounded-full bg-gold" />
      </div>
    </div>
  );
}
