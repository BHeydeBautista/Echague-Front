"use client";

import { useEffect, useState } from "react";

function readIsTouch() {
  return typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
}

/** True for coarse-pointer (touch) devices — used to trim GPU-heavy render
 * settings (dpr, post-processing quality) on phones/tablets. The lazy
 * initializer reads the real value for the client's very first render
 * (avoiding a desktop-settings flash on mobile); SSR still renders the
 * `false` default since `window` isn't available there, same as any other
 * client-only value in a "use client" component. */
export function useIsTouchDevice() {
  const [isTouch, setIsTouch] = useState(readIsTouch);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    const onChange = (e: MediaQueryListEvent) => setIsTouch(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return isTouch;
}
