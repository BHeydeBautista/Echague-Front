#!/usr/bin/env node
// Converts a Higgsfield (or any) mp4 export into a numbered JPG frame
// sequence + manifest.json under public/video-frames/<name>/, ready for
// src/components/cinematic/FrameSequence.tsx to scroll-scrub.
//
// Usage:
//   npm run frames -- <input.mp4> <name> [--fps 15] [--width 1600] [--quality 3]
//
// <name> must match one of the SectionId values wired up in
// src/components/cinematic/CinematicLayer.tsx (hero, basketball, swimming,
// volleyball, outro) so the right clip is scrubbed by the right section.

import { spawnSync } from "node:child_process";
import { mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const [, , inputPath, name, ...rest] = process.argv;

function arg(flag, fallback) {
  const i = rest.indexOf(flag);
  return i === -1 ? fallback : rest[i + 1];
}

if (!inputPath || !name) {
  console.error(
    "Usage: npm run frames -- <input.mp4> <name> [--fps 15] [--width 1600] [--quality 3]\n" +
      "  <name>: hero | basketball | swimming | volleyball | outro",
  );
  process.exit(1);
}

const fps = arg("--fps", "15");
const width = arg("--width", "1600");
const quality = arg("--quality", "3"); // ffmpeg mjpeg quality scale: 2 (best) .. 31 (worst)

const versionCheck = spawnSync("ffmpeg", ["-version"], { stdio: "ignore" });
if (versionCheck.error) {
  console.error(
    "ffmpeg not found on PATH. Install it (winget install ffmpeg / brew install ffmpeg / apt install ffmpeg) and re-run.",
  );
  process.exit(1);
}

const outDir = join(process.cwd(), "public", "video-frames", name);
mkdirSync(outDir, { recursive: true });

// Clear any previous extraction so a shorter re-export can't leave stale
// frames behind (manifest.json counts every .jpg in the folder).
for (const f of readdirSync(outDir)) {
  if (f.endsWith(".jpg")) rmSync(join(outDir, f));
}

const pattern = "frame-%04d.jpg";
const result = spawnSync(
  "ffmpeg",
  [
    "-y",
    "-i",
    inputPath,
    "-vf",
    `fps=${fps},scale=${width}:-2`,
    "-q:v",
    quality,
    "-start_number",
    "1",
    join(outDir, pattern),
  ],
  { stdio: "inherit" },
);

if (result.status !== 0) {
  console.error("ffmpeg failed — see output above.");
  process.exit(1);
}

const frameCount = readdirSync(outDir).filter((f) => f.endsWith(".jpg")).length;

writeFileSync(
  join(outDir, "manifest.json"),
  JSON.stringify({ frameCount, pattern, fps: Number(fps) }, null, 2),
);

console.log(`Wrote ${frameCount} frames + manifest.json to public/video-frames/${name}/`);
