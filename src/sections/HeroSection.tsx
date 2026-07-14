"use client";

import { SectionFrame } from "@/src/sections/SectionFrame";
import { SECTION_COPY } from "@/src/content/copy";

export function HeroSection() {
  const copy = SECTION_COPY.hero;

  return (
    <SectionFrame id="hero" justify="end">
      <p className="kicker">{copy.kicker}</p>
      <h1 className="font-display text-[clamp(2.6rem,7vw,5.75rem)] font-semibold leading-[0.95] text-paper">
        {copy.headline}
        <br />
        <em className="font-light italic text-gold-bright">{copy.headlineItalic}</em>
      </h1>
      <p className="max-w-md text-sm font-light leading-relaxed text-mist sm:text-base">
        {copy.body}
      </p>
    </SectionFrame>
  );
}
