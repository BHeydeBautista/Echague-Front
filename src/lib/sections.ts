import type { SectionId } from "@/src/lib/scrollState";

/** Height of each section in viewport-heights (vh). Single source of truth
 * for both the DOM spacer heights and the camera storyboard's t-boundaries. */
export const SECTION_VH: Record<SectionId, number> = {
  hero: 240,
  basketball: 220,
  swimming: 240,
  volleyball: 220,
  outro: 160,
};

const total = Object.values(SECTION_VH).reduce((a, b) => a + b, 0);

function cumulative(id: SectionId): number {
  let sum = 0;
  for (const key of Object.keys(SECTION_VH) as SectionId[]) {
    if (key === id) break;
    sum += SECTION_VH[key];
  }
  return sum;
}

/** Global scroll-progress (0..1) at which each section starts / ends. */
export const SECTION_BOUNDS: Record<SectionId, { start: number; end: number }> =
  Object.keys(SECTION_VH).reduce((acc, key) => {
    const id = key as SectionId;
    const start = cumulative(id) / total;
    const end = (cumulative(id) + SECTION_VH[id]) / total;
    acc[id] = { start, end };
    return acc;
  }, {} as Record<SectionId, { start: number; end: number }>);

export const TOTAL_VH = total;
