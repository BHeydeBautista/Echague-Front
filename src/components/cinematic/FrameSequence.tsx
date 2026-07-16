"use client";

import { useEffect, useRef, useState } from "react";
import { useScrollFrame } from "@/src/scroll/useScrollFrame";
import { scrollState, type SectionId } from "@/src/lib/scrollState";
import { SECTION_BOUNDS } from "@/src/lib/sections";

interface Manifest {
  frameCount: number;
  pattern: string;
}

interface Props {
  /** Folder name under /public/video-frames/<name>/ (see the extraction script). */
  name: string;
  /** Section whose local scroll progress (0..1 across its pinned duration) drives which frame is shown. */
  sectionId: SectionId;
}

// Start fetching a section's frames a little before the user actually
// reaches it (in units of total-page scroll progress), so images have time
// to arrive before they're first drawn — without eagerly loading all five
// sections' sequences on initial page load.
const PRELOAD_MARGIN = 0.06;

// Matches the fade curve SectionFrame already uses for its text, so the
// cinematic backdrop and the copy over it fade together instead of one
// popping in ahead of the other.
const FADE_IN_END = 0.14;
const FADE_OUT_START = 0.82;

function framePath(name: string, pattern: string, index: number) {
  const match = pattern.match(/%0(\d+)d/);
  const digits = match ? Number(match[1]) : 4;
  const file = pattern.replace(/%0\d+d/, String(index).padStart(digits, "0"));
  return `/video-frames/${name}/${file}`;
}

/** Draws a Higgsfield-exported, scroll-scrubbed frame sequence to a
 * full-bleed canvas — the same "canvas frame" scroll-scrub technique used
 * for Apple product pages, driven by this project's existing scroll
 * plumbing (useScrollFrame / scrollState) instead of a new one.
 *
 * Renders nothing (and does no network work) until
 * /video-frames/<name>/manifest.json 404s or resolves — so mounting this
 * before any clips exist is completely safe. Run
 * `npm run frames -- <video> <name>` (see scripts/extract-frames.mjs) and
 * reload once a clip is ready. */
export function FrameSequence({ name, sectionId }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const startedRef = useRef(false);
  const cancelledRef = useRef(false);
  const [ready, setReady] = useState(false);
  const [missing, setMissing] = useState(false);

  useEffect(
    () => () => {
      cancelledRef.current = true;
    },
    [],
  );

  useScrollFrame(() => {
    if (!startedRef.current) {
      const bounds = SECTION_BOUNDS[sectionId];
      if (scrollState.progress < bounds.start - PRELOAD_MARGIN) return;
      startedRef.current = true;

      fetch(`/video-frames/${name}/manifest.json`)
        .then((res) => {
          if (!res.ok) throw new Error("no manifest");
          return res.json() as Promise<Manifest>;
        })
        .then((manifest) => {
          if (cancelledRef.current) return;
          let loaded = 0;
          imagesRef.current = Array.from({ length: manifest.frameCount }, (_, i) => {
            const img = new Image();
            img.onload = () => {
              loaded += 1;
              if (loaded === manifest.frameCount && !cancelledRef.current) setReady(true);
            };
            img.src = framePath(name, manifest.pattern, i + 1);
            return img;
          });
        })
        .catch(() => {
          if (!cancelledRef.current) setMissing(true);
        });

      return;
    }

    if (!ready || missing) return;

    const canvas = canvasRef.current;
    const images = imagesRef.current;
    if (!canvas || images.length === 0) return;

    const local = scrollState.sections[sectionId] ?? 0;
    const fadeIn = Math.min(local / FADE_IN_END, 1);
    const fadeOut = 1 - Math.max((local - FADE_OUT_START) / (1 - FADE_OUT_START), 0);
    const opacity = Math.max(0, Math.min(fadeIn, fadeOut));
    canvas.style.opacity = String(opacity);
    if (opacity <= 0) return;

    const frameIndex = Math.min(images.length - 1, Math.floor(local * images.length));
    const img = images[frameIndex];
    if (!img.complete || img.naturalWidth === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const targetW = Math.round(canvas.clientWidth * dpr);
    const targetH = Math.round(canvas.clientHeight * dpr);
    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }

    // cover-fit, centered — same behavior as CSS background-size: cover
    const scale = Math.max(targetW / img.naturalWidth, targetH / img.naturalHeight);
    const drawW = img.naturalWidth * scale;
    const drawH = img.naturalHeight * scale;
    ctx.clearRect(0, 0, targetW, targetH);
    ctx.drawImage(img, (targetW - drawW) / 2, (targetH - drawH) / 2, drawW, drawH);
  });

  if (missing) return null;

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" style={{ opacity: 0 }} />;
}
