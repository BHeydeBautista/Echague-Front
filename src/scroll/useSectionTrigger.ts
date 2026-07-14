"use client";

import { useRef } from "react";
import { ScrollTrigger, useGSAP } from "@/src/lib/gsap";
import { scrollState, type SectionId } from "@/src/lib/scrollState";
import { useUIStore } from "@/src/state/useUIStore";

/** Registers a DOM section as both a ScrollTrigger (feeding the shared,
 * render-free scrollState used by the 3D scene) and the UI store's active
 * section (used sparingly, only on toggle, so it stays cheap). */
export function useSectionTrigger(id: SectionId) {
  const ref = useRef<HTMLElement | null>(null);

  useGSAP(() => {
    if (!ref.current) return;

    // Wide range: feeds the continuous local progress the 3D scene/text
    // fades read from, for the entire time the section is anywhere on screen.
    ScrollTrigger.create({
      trigger: ref.current,
      start: "top bottom",
      end: "bottom top",
      onUpdate: (self) => {
        scrollState.sections[id] = self.progress;
      },
    });

    // Tight range: only flips "active" once the section is roughly centered,
    // so the nav/progress-rail label doesn't jump ahead of what's on screen.
    ScrollTrigger.create({
      trigger: ref.current,
      start: "top 55%",
      end: "bottom 45%",
      onToggle: (self) => {
        if (self.isActive) {
          scrollState.activeSection = id;
          useUIStore.getState().setActiveSection(id);
        }
      },
    });
  }, []);

  return ref;
}
