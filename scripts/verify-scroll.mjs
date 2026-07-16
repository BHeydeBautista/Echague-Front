#!/usr/bin/env node
// Drives the running dev server (http://localhost:3000 by default) in a
// headless Chrome and verifies the cinematic scroll pipeline end-to-end:
//   1. the Loader curtain finishes and unmounts,
//   2. wheel input actually moves the Lenis-smoothed scroll,
//   3. every FrameSequence canvas becomes visible inside its section and
//      draws *different* frames at different scroll depths (scrub works),
//   4. a screenshot per section is saved for eyeballing.
//
// Usage:
//   node scripts/verify-scroll.mjs [url] [screenshot-dir] [--screens-only]
//
// --screens-only skips the FrameSequence canvas assertions (for when no
// frame sequences are extracted yet) and just checks scrolling + saves
// the per-section screenshots.

import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const screensOnly = process.argv.includes("--screens-only");
const mobile = process.argv.includes("--mobile");
const url = args[0] ?? "http://localhost:3000";
const shotDir = args[1] ?? join(process.cwd(), ".scroll-verify");
mkdirSync(shotDir, { recursive: true });

// Same section heights as src/lib/sections.ts — the scroll math must match.
const SECTION_VH = { hero: 240, basketball: 220, swimming: 240, volleyball: 220, outro: 160 };

let browser;
for (const channel of ["chrome", "msedge"]) {
  try {
    browser = await chromium.launch({ channel, headless: true });
    break;
  } catch {
    /* try next channel */
  }
}
if (!browser) {
  console.error("Neither Chrome nor Edge found for playwright-core.");
  process.exit(1);
}

const page = await browser.newPage(
  mobile
    ? { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }
    : { viewport: { width: 1600, height: 900 } },
);
const consoleIssues = [];
page.on("console", (m) => {
  if (m.type() === "error") consoleIssues.push(`console.error: ${m.text()}`);
});
page.on("pageerror", (e) => consoleIssues.push(`pageerror: ${e.message}`));

await page.goto(url, { waitUntil: "load", timeout: 60_000 });

// 1. loader must finish its curtain animation and hide itself
await page.waitForFunction(
  () => {
    const el = document.querySelector('div.fixed.inset-0[class*="z-[100]"]');
    return el && getComputedStyle(el).display === "none";
  },
  { timeout: 45_000 },
);

// 2. real wheel events must move the smoothed scroll
const yBefore = await page.evaluate(() => window.scrollY);
for (let i = 0; i < 12; i++) {
  await page.mouse.wheel(0, 500);
  await page.waitForTimeout(70);
}
await page.waitForTimeout(1500);
const yAfterWheel = await page.evaluate(() => window.scrollY);

// helpers evaluated in the page
const sampleCanvas = (index) => {
  const layer = document.querySelector('div.pointer-events-none.fixed[class*="z-[5]"]');
  const cv = layer?.querySelectorAll("canvas")[index];
  if (!cv) return { opacity: "missing", hash: -1 };
  let hash = -1;
  try {
    if (cv.width && cv.height) {
      const d = cv
        .getContext("2d")
        .getImageData(Math.floor(cv.width / 3), Math.floor(cv.height / 3), 40, 40).data;
      let s = 0;
      for (let i = 0; i < d.length; i += 97) s = (s * 31 + d[i]) % 1e9;
      hash = s;
    }
  } catch (e) {
    hash = `ERR:${e.message}`;
  }
  return { opacity: cv.style.opacity, hash };
};

const total = Object.values(SECTION_VH).reduce((a, b) => a + b, 0);
const results = [];
let cum = 0;
let sectionIndex = 0;
for (const [id, vh] of Object.entries(SECTION_VH)) {
  const start = cum / total;
  const end = (cum + vh) / total;
  cum += vh;

  const scrollToLocal = async (local, settleMs) => {
    await page.evaluate(
      ([s, e, l]) => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        window.scrollTo(0, (s + l * (e - s)) * max);
      },
      [start, end, local],
    );
    await page.waitForTimeout(settleMs);
  };

  // first stop: give the 120-frame sequence time to fetch + decode
  await scrollToLocal(0.3, 2500);
  const a = screensOnly ? null : await page.evaluate(sampleCanvas, sectionIndex);
  await page.screenshot({ path: join(shotDir, `${id}.png`) });
  await scrollToLocal(0.65, 900);
  const b = screensOnly ? null : await page.evaluate(sampleCanvas, sectionIndex);

  results.push(
    screensOnly
      ? { id, screenshot: `${id}.png` }
      : {
          id,
          visible: a.opacity === "1" && b.opacity === "1",
          scrubs: a.hash !== b.hash && a.hash !== -1 && b.hash !== -1,
          samples: [a, b],
        },
  );
  sectionIndex += 1;
}

await browser.close();

const wheelMoved = yAfterWheel > yBefore + 500;
const allVisible = screensOnly || results.every((r) => r.visible);
const allScrub = screensOnly || results.every((r) => r.scrubs);
console.log(
  JSON.stringify(
    { wheelMoved, yBefore, yAfterWheel, allVisible, allScrub, results, consoleIssues, shotDir },
    null,
    2,
  ),
);
process.exit(wheelMoved && allVisible && allScrub ? 0 : 1);
