"use client";

import { ReactLenis, useLenis } from "lenis/react";
import { useEffect } from "react";
import { gsap, ScrollTrigger } from "@/src/lib/gsap";
import { scrollState } from "@/src/lib/scrollState";

function LenisGsapBridge() {
  const lenis = useLenis((instance) => {
    scrollState.progress = instance.progress;
    scrollState.velocity = instance.velocity;
  });

  useEffect(() => {
    if (!lenis) return;

    const update = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    lenis.on("scroll", ScrollTrigger.update);

    return () => {
      gsap.ticker.remove(update);
    };
  }, [lenis]);

  return null;
}

function PointerParallax() {
  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      scrollState.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      scrollState.pointer.y = (event.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return null;
}

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis
      root
      options={{
        autoRaf: false,
        lerp: 0.11,
        duration: 1.2,
        wheelMultiplier: 1,
        touchMultiplier: 1.15,
        smoothWheel: true,
      }}
    >
      <LenisGsapBridge />
      <PointerParallax />
      {children}
    </ReactLenis>
  );
}
