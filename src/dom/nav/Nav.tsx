"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP } from "@/src/lib/gsap";

export function Nav() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.from(ref.current, {
        yPercent: -100,
        opacity: 0,
        duration: 1.4,
        delay: 0.3,
        ease: "power3.out",
      });
    },
    { scope: ref },
  );

  return (
    <div
      ref={ref}
      className="fixed inset-x-0 top-0 z-40 flex items-center justify-between px-6 py-5 sm:px-10 sm:py-7"
    >
      <div className="flex items-center gap-3">
        <Image src="/img/logo.png" alt="" width={28} height={28} className="opacity-90" />
        <span className="font-display text-[0.95rem] tracking-[0.14em] text-paper/90">
          ATLÉTICO ECHAGÜE
        </span>
      </div>
      <div className="hidden items-center gap-2 text-right sm:flex">
        <span className="kicker">Desde 1932</span>
        <span className="h-3 w-px bg-brand/40" />
        <span className="kicker text-mist">Paraná</span>
      </div>
    </div>
  );
}
