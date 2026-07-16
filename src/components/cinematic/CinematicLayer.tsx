"use client";

import { FrameSequence } from "./FrameSequence";
import type { SectionId } from "@/src/lib/scrollState";

const SEQUENCES: { name: string; sectionId: SectionId }[] = [
  { name: "hero", sectionId: "hero" },
  { name: "basketball", sectionId: "basketball" },
  { name: "swimming", sectionId: "swimming" },
  { name: "volleyball", sectionId: "volleyball" },
  { name: "outro", sectionId: "outro" },
];

/** Cinematic backdrop built from Higgsfield-generated frame sequences,
 * scroll-scrubbed in lockstep with the DOM section text — sits between the
 * always-on Three.js canvas (z-0) and the section content (z-10).
 *
 * Safe to ship with zero clips in place: each FrameSequence quietly no-ops
 * until its matching /public/video-frames/<name>/manifest.json exists. Drop
 * a clip in with `npm run frames -- <video.mp4> <name>` and reload — no
 * code changes needed. */
export function CinematicLayer() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[5]">
      {SEQUENCES.map((seq) => (
        <FrameSequence key={seq.name} name={seq.name} sectionId={seq.sectionId} />
      ))}
    </div>
  );
}
