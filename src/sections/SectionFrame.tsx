"use client";

import { ReactNode, useEffect, useRef } from "react";
import { useSectionTrigger } from "@/src/scroll/useSectionTrigger";
import { useScrollFrame } from "@/src/scroll/useScrollFrame";
import { scrollState, type SectionId } from "@/src/lib/scrollState";
import { SECTION_VH } from "@/src/lib/sections";
import { gsap, SplitText } from "@/src/lib/gsap";
import { useGSAP } from "@/src/lib/gsap";
import { useUIStore } from "@/src/state/useUIStore";

interface Props {
  id: SectionId;
  align?: "left" | "center" | "right";
  justify?: "center" | "end";
  children: ReactNode;
}

/** Sticky full-viewport frame whose copy is *directed*, not faded: headlines
 * split into masked lines that rise with rotation as the section scrolls in
 * (scrubbed, so reversing the scroll plays the reveal backwards — no
 * one-shot triggers), kicker and body follow with staggered blur-lifts, and
 * the whole block leans with scroll velocity like a camera settling. */
export function SectionFrame({ id, align = "left", justify = "center", children }: Props) {
  const sectionRef = useSectionTrigger(id);
  const contentRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const skewSetter = useRef<((v: number) => void) | null>(null);
  const currentSkew = useRef(0);
  // The hero sits at the very top of the page, so its ScrollTrigger local
  // progress is already ~0.3 before anyone scrolls — a scroll-scrubbed
  // reveal there would land pre-finished. Instead the hero plays its reveal
  // once, time-based, the moment the loader curtain finishes opening.
  const playOnEnter = id === "hero";
  const entered = useUIStore((s) => s.entered);

  useGSAP(
    () => {
      const content = contentRef.current;
      if (!content) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      skewSetter.current = gsap.quickSetter(content, "skewY", "deg") as (v: number) => void;

      let cancelled = false;
      const splits: SplitText[] = [];
      // Fonts must be ready before splitting, or line boxes are measured
      // against the fallback font and every mask lands mid-glyph.
      document.fonts.ready.then(() => {
        if (cancelled || !contentRef.current) return;

        const tl = gsap.timeline({ paused: true });
        const heading = content.querySelector<HTMLElement>("h1, h2");
        const kicker = content.querySelector<HTMLElement>(".kicker");
        const body = content.querySelector<HTMLElement>("p:not(.kicker)");

        if (kicker) {
          tl.from(kicker, { y: 26, opacity: 0, duration: 0.5, ease: "power2.out" }, 0);
        }
        if (heading) {
          const split = SplitText.create(heading, {
            type: "lines",
            mask: "lines",
            linesClass: "reveal-line",
          });
          splits.push(split);
          tl.from(
            split.lines,
            {
              yPercent: 118,
              rotate: 3.5,
              duration: 0.9,
              stagger: 0.16,
              ease: "power4.out",
            },
            0.08,
          );
        }
        if (body) {
          tl.from(
            body,
            { y: 30, opacity: 0, filter: "blur(8px)", duration: 0.7, ease: "power3.out" },
            0.42,
          );
        }
        // CTA or any extra element opts in with data-reveal
        content.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el, i) => {
          tl.from(
            el,
            { y: 24, opacity: 0, filter: "blur(6px)", duration: 0.6, ease: "power3.out" },
            0.55 + i * 0.1,
          );
        });
        // Force-render every from() start state now (paused timelines apply
        // them lazily), so the copy is already hidden while the loader
        // curtain is still up instead of flashing complete and replaying.
        tl.progress(1).progress(0);
        tlRef.current = tl;
        // If the curtain already opened while fonts were still loading,
        // don't leave the hero blank — play immediately.
        if (playOnEnter && useUIStore.getState().entered) tl.play();
      });

      return () => {
        cancelled = true;
        splits.forEach((s) => s.revert());
        tlRef.current?.kill();
        tlRef.current = null;
      };
    },
    { scope: contentRef },
  );

  useEffect(() => {
    if (playOnEnter && entered) tlRef.current?.play();
  }, [playOnEnter, entered]);

  useScrollFrame(() => {
    const local = scrollState.sections[id] ?? 0;
    const content = contentRef.current;
    if (!content) return;

    // The hero exits earlier: it lives at the top of the page (its local
    // starts ~0.3), so by 0.7 the visitor is already meeting the next
    // section's copy — lingering longer overlaps two headlines in frame.
    const fadeStart = playOnEnter ? 0.7 : 0.82;
    const fadeOut = 1 - Math.max((local - fadeStart) / (1 - fadeStart), 0);

    if (tlRef.current) {
      if (!playOnEnter) {
        // Scrubbed entrance: local 0.02..0.30 maps to the full reveal
        // timeline, so scrolling backwards rewinds the choreography.
        const p = gsap.utils.clamp(0, 1, (local - 0.02) / 0.28);
        tlRef.current.progress(p);
      }
      content.style.opacity = String(Math.max(0, fadeOut));
      // Drift upward slightly through the section's life for depth.
      content.style.transform = `translateY(${(0.5 - local) * 24}px)`;
    } else {
      // Reduced-motion (or fonts still loading): the original quiet fade.
      const fadeIn = Math.min(local / 0.14, 1);
      const opacity = Math.max(0, Math.min(fadeIn, fadeOut));
      content.style.opacity = String(opacity);
      content.style.transform = `translateY(${(1 - fadeIn) * 36}px)`;
    }

    // Velocity lean — the copy banks with scroll momentum and settles back.
    if (skewSetter.current) {
      const target = gsap.utils.clamp(-4, 4, scrollState.velocity * -2.2);
      currentSkew.current += (target - currentSkew.current) * 0.12;
      skewSetter.current(currentSkew.current);
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
        <div
          ref={contentRef}
          style={{ willChange: "transform, opacity" }}
          className={`flex max-w-2xl flex-col gap-5 ${alignClass}`}
        >
          {children}
        </div>
      </div>
    </section>
  );
}
