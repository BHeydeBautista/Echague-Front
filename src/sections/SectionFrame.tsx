"use client";

import { ReactNode, useRef } from "react";
import { useSectionTrigger } from "@/src/scroll/useSectionTrigger";
import { useScrollFrame } from "@/src/scroll/useScrollFrame";
import { scrollState, type SectionId } from "@/src/lib/scrollState";
import { SECTION_VH } from "@/src/lib/sections";

interface Props {
  id: SectionId;
  align?: "left" | "center" | "right";
  justify?: "center" | "end";
  children: ReactNode;
}

export function SectionFrame({ id, align = "left", justify = "center", children }: Props) {
  const sectionRef = useSectionTrigger(id);
  const contentRef = useRef<HTMLDivElement>(null);

  useScrollFrame(() => {
    const local = scrollState.sections[id] ?? 0;
    const fadeIn = Math.min(local / 0.14, 1);
    const fadeOut = 1 - Math.max((local - 0.82) / 0.18, 0);
    const opacity = Math.max(0, Math.min(fadeIn, fadeOut));
    const translate = (1 - fadeIn) * 36;
    if (contentRef.current) {
      contentRef.current.style.opacity = String(opacity);
      contentRef.current.style.transform = `translateY(${translate}px)`;
    }
  });

  const alignClass =
    align === "center"
      ? "items-center text-center"
      : align === "right"
        ? "items-end text-right"
        : "items-start text-left";

  const justifyClass = justify === "end" ? "justify-end pb-28 sm:pb-32" : "justify-center";

  return (
    <section ref={sectionRef} style={{ height: `${SECTION_VH[id]}dvh` }} className="relative">
      <div
        className={`sticky top-0 flex h-dvh w-full flex-col px-6 sm:px-10 lg:px-20 ${justifyClass}`}
      >
        <div ref={contentRef} className={`flex max-w-2xl flex-col gap-5 ${alignClass}`}>
          {children}
        </div>
      </div>
    </section>
  );
}
