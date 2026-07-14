"use client";

import { SectionFrame } from "@/src/sections/SectionFrame";
import { SECTION_COPY } from "@/src/content/copy";

export function OutroSection() {
  const copy = SECTION_COPY.outro;

  return (
    <>
      <SectionFrame id="outro" align="center">
        <p className="kicker">{copy.kicker}</p>
        <h2 className="font-display text-[clamp(2.4rem,6vw,4.75rem)] font-semibold leading-[0.98] text-paper">
          {copy.headline}
          <br />
          <em className="font-light italic text-gold-bright">{copy.headlineItalic}</em>
        </h2>
        <p className="mx-auto max-w-md text-sm font-light leading-relaxed text-mist sm:text-base">
          {copy.body}
        </p>
      </SectionFrame>
      <footer className="relative z-10 flex flex-col items-center gap-2 pb-16 pt-6 text-center">
        <span className="kicker text-mist/60">Club Atlético Echagüe — Concepto interactivo</span>
        <span className="kicker text-mist/40">Paraná, Entre Ríos, Argentina</span>
      </footer>
    </>
  );
}
