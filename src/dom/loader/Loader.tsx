"use client";

import { useProgress } from "@react-three/drei";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { gsap } from "@/src/lib/gsap";
import { useUIStore } from "@/src/state/useUIStore";

export function Loader() {
  const { progress, active } = useProgress();
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const ready = useUIStore((s) => s.ready);
  const setReady = useUIStore((s) => s.setReady);
  const setEntered = useUIStore((s) => s.setEntered);
  const root = useRef<HTMLDivElement>(null);
  const curtainTop = useRef<HTMLDivElement>(null);
  const curtainBottom = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setMinTimeElapsed(true), 1600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!active && minTimeElapsed && !ready) {
      setReady(true);
    }
  }, [active, minTimeElapsed, ready, setReady]);

  useEffect(() => {
    if (!ready) return;
    const tl = gsap.timeline({
      onComplete: () => setEntered(true),
    });
    tl.to(content.current, { opacity: 0, duration: 0.5, ease: "power2.out" })
      .to(
        curtainTop.current,
        { yPercent: -100, duration: 1.15, ease: "power4.inOut" },
        "curtain",
      )
      .to(
        curtainBottom.current,
        { yPercent: 100, duration: 1.15, ease: "power4.inOut" },
        "curtain",
      )
      .set(root.current, { display: "none" });
  }, [ready, setEntered]);

  return (
    <div ref={root} className="fixed inset-0 z-[100]">
      <div ref={curtainTop} className="absolute inset-x-0 top-0 h-1/2 bg-void" />
      <div ref={curtainBottom} className="absolute inset-x-0 bottom-0 h-1/2 bg-void" />
      <div ref={content} className="absolute inset-0 flex flex-col items-center justify-center gap-6">
        <Image
          src="/img/logo.png"
          alt="Club Atlético Echagüe"
          width={72}
          height={72}
          className="animate-pulse opacity-90"
          priority
        />
        <span className="kicker text-mist">{Math.min(100, Math.round(progress))}%</span>
      </div>
    </div>
  );
}
