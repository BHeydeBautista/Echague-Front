"use client";

import { Experience } from "@/src/experience/canvas/Experience";
import { SmoothScroll } from "@/src/scroll/SmoothScroll";
import { Nav } from "@/src/dom/nav/Nav";
import { ProgressRail } from "@/src/dom/overlay/ProgressRail";
import { ScrollPrompt } from "@/src/dom/overlay/ScrollPrompt";
import { Loader } from "@/src/dom/loader/Loader";
import { HeroSection } from "@/src/sections/HeroSection";
import { BasketballSection } from "@/src/sections/disciplines/BasketballSection";
import { SwimmingSection } from "@/src/sections/disciplines/SwimmingSection";
import { VolleyballSection } from "@/src/sections/disciplines/VolleyballSection";
import { OutroSection } from "@/src/sections/OutroSection";

export default function Home() {
  return (
    <SmoothScroll>
      <Experience />
      <Nav />
      <ProgressRail />
      <ScrollPrompt />
      <main className="relative z-10">
        <HeroSection />
        <BasketballSection />
        <SwimmingSection />
        <VolleyballSection />
        <OutroSection />
      </main>
      <Loader />
    </SmoothScroll>
  );
}
