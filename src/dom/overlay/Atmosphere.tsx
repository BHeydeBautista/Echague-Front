"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useScrollFrame } from "@/src/scroll/useScrollFrame";
import { scrollState, SECTION_ORDER, type SectionId } from "@/src/lib/scrollState";
import { SECTION_BOUNDS } from "@/src/lib/sections";

/** Each section's atmospheric tint — the DOM-side echo of the storyboard's
 * lighting grade, so the space *around* the WebGL frame breathes with the
 * same color story instead of staying flat black. */
const SECTION_TINT: Record<SectionId, [string, string]> = {
  hero: ["#c9a227", "#28406e"],
  basketball: ["#e8a34b", "#3a2410"],
  swimming: ["#2fb7c9", "#0a3a5c"],
  volleyball: ["#ff8a50", "#3a1a2e"],
  outro: ["#c9a227", "#1a2440"],
};

const cA = new THREE.Color();
const cB = new THREE.Color();
const tmpA = new THREE.Color();
const tmpB = new THREE.Color();

/** Two enormous soft radial glows drifting behind the content, colored by
 * where you are in the story and eased between sections. Pure transforms +
 * pre-blurred gradients — no filter: blur(), so it costs almost nothing. */
export function Atmosphere() {
  const blobA = useRef<HTMLDivElement>(null);
  const blobB = useRef<HTMLDivElement>(null);
  const t0 = useRef(performance.now());

  useScrollFrame(() => {
    const a = blobA.current;
    const b = blobB.current;
    if (!a || !b) return;

    const p = scrollState.progress;

    // find the surrounding section midpoints and blend their tints
    let fromId: SectionId = SECTION_ORDER[0];
    let toId: SectionId = SECTION_ORDER[0];
    let alpha = 0;
    for (let i = 0; i < SECTION_ORDER.length; i++) {
      const id = SECTION_ORDER[i];
      const m = (SECTION_BOUNDS[id].start + SECTION_BOUNDS[id].end) / 2;
      if (p >= m) {
        fromId = id;
        toId = SECTION_ORDER[Math.min(i + 1, SECTION_ORDER.length - 1)];
      }
    }
    const mFrom = (SECTION_BOUNDS[fromId].start + SECTION_BOUNDS[fromId].end) / 2;
    const mTo = (SECTION_BOUNDS[toId].start + SECTION_BOUNDS[toId].end) / 2;
    alpha = mTo > mFrom ? THREE.MathUtils.clamp((p - mFrom) / (mTo - mFrom), 0, 1) : 0;

    tmpA.set(SECTION_TINT[fromId][0]);
    tmpB.set(SECTION_TINT[toId][0]);
    cA.lerpColors(tmpA, tmpB, alpha);
    tmpA.set(SECTION_TINT[fromId][1]);
    tmpB.set(SECTION_TINT[toId][1]);
    cB.lerpColors(tmpA, tmpB, alpha);

    const t = (performance.now() - t0.current) / 1000;
    const driftAx = Math.sin(t * 0.07) * 6 + scrollState.pointer.x * 2;
    const driftAy = Math.cos(t * 0.05) * 5 + scrollState.pointer.y * 2;
    const driftBx = Math.cos(t * 0.06) * 7 - scrollState.pointer.x * 3;
    const driftBy = Math.sin(t * 0.08) * 6 - scrollState.pointer.y * 2;

    a.style.background = `radial-gradient(closest-side, #${cA.getHexString()}14, transparent 70%)`;
    a.style.transform = `translate(${driftAx}vw, ${driftAy}vh)`;
    b.style.background = `radial-gradient(closest-side, #${cB.getHexString()}1f, transparent 70%)`;
    b.style.transform = `translate(${driftBx}vw, ${driftBy}vh)`;
  });

  return (
    <div className="pointer-events-none fixed inset-0 z-[6] overflow-hidden" aria-hidden>
      <div
        ref={blobA}
        className="absolute -right-[30vw] -top-[30vh] h-[110vh] w-[110vw] rounded-full"
        style={{ willChange: "transform" }}
      />
      <div
        ref={blobB}
        className="absolute -bottom-[35vh] -left-[35vw] h-[120vh] w-[110vw] rounded-full"
        style={{ willChange: "transform" }}
      />
    </div>
  );
}

/** Full-screen animated film grain over everything — the DOM-side match for
 * the WebGL Noise pass, so type and canvas share one filmic surface. */
export function Grain() {
  return <div className="grain pointer-events-none fixed inset-0 z-[80]" aria-hidden />;
}
