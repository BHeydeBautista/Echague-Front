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

  // Every section's height is driven by its DOM content's actual layout
  // (vh-based spacers around text sized in real ems), so a web-font swap
  // after first paint reflows that content — but ScrollTrigger only
  // auto-refreshes on window `resize`, never on a same-size content
  // reflow. On a cold load (fonts not cached yet), every trigger gets
  // measured once against fallback-font metrics and never re-measured,
  // so the scroll-to-camera-progress mapping stays permanently off for
  // that page load. A warm reload (fonts already cached) never hits the
  // fallback state at all, which is why only first-ever visits show it.
  useEffect(() => {
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }, []);

  // Mobile browser chrome (the address bar) collapsing/expanding as the
  // user scrolls changes the *visible* viewport height without always
  // firing a plain `window resize` — Safari and some Chrome builds only
  // report it through `visualViewport`. ScrollTrigger's built-in
  // auto-refresh listens on `window resize`, so on those browsers it can
  // miss this change entirely, leaving every trigger's cached start/end
  // measured against whichever viewport height happened to be current
  // when the page first settled.
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const onResize = () => ScrollTrigger.refresh();
    vv.addEventListener("resize", onResize);
    return () => vv.removeEventListener("resize", onResize);
  }, []);

  return null;
}

function PointerParallax() {
  useEffect(() => {
    // Touch input reports through `pointermove` too, but only while a
    // finger is actually down — there's no hover to return it to center,
    // so a touch-drag (e.g. scrolling) would leave the camera parallax
    // stuck at whatever offset the finger last touched. Restrict this to
    // devices that actually have a hovering pointer (a mouse/trackpad).
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

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
