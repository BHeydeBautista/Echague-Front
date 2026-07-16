"use client";

import { Experience } from "@/src/experience/canvas/Experience";
import { CinematicLayer } from "@/src/components/cinematic/CinematicLayer";
import { SmoothScroll } from "@/src/scroll/SmoothScroll";
import { Nav } from "@/src/dom/nav/Nav";
import { ProgressRail } from "@/src/dom/overlay/ProgressRail";
import { ScrollPrompt } from "@/src/dom/overlay/ScrollPrompt";
import { Atmosphere, Grain } from "@/src/dom/overlay/Atmosphere";
import { Cursor } from "@/src/dom/cursor/Cursor";
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
      <CinematicLayer />
      <Atmosphere />
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
      <Grain />
      <Cursor />
      <Loader />
    </SmoothScroll>
  );
}
