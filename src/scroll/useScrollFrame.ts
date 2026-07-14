"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/src/lib/gsap";
import { scrollState } from "@/src/lib/scrollState";

/** Subscribes a callback to the gsap ticker, reading the shared scrollState
 * each frame without ever triggering a React re-render. */
export function useScrollFrame(callback: (progress: number, velocity: number) => void) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  });

  useEffect(() => {
    const tick = () => savedCallback.current(scrollState.progress, scrollState.velocity);
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);
}
