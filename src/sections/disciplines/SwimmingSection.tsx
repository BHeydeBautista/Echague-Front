"use client";

import { SectionFrame } from "@/src/sections/SectionFrame";
import { SECTION_COPY } from "@/src/content/copy";

export function SwimmingSection() {
  const copy = SECTION_COPY.swimming;

  return (
    <SectionFrame id="swimming" align="right">
      <p className="kicker">{copy.kicker}</p>
      <h2 className="font-display text-[clamp(2.2rem,5.5vw,4.25rem)] font-semibold leading-[0.98] text-paper">
        {copy.headline}
        <br />
        <em className="font-light italic text-cyan">{copy.headlineItalic}</em>
      </h2>
      <p className="ml-auto max-w-sm text-sm font-light leading-relaxed text-mist sm:text-base">
        {copy.body}
      </p>
    </SectionFrame>
  );
}
