export type SectionId =
  | "hero"
  | "basketball"
  | "swimming"
  | "volleyball"
  | "outro";

export const SECTION_ORDER: SectionId[] = [
  "hero",
  "basketball",
  "swimming",
  "volleyball",
  "outro",
];

interface ScrollState {
  /** 0..1 progress across the entire scrollable page */
  progress: number;
  /** same range, but damped the same way the camera rig is — read this
   * (not `progress`) for anything that must stay in lockstep with what the
   * camera is actually looking at, like per-scene visibility toggles. */
  smoothedProgress: number;
  /** signed scroll velocity, roughly -1..1 smoothed */
  velocity: number;
  /** per-section local progress, 0 before entering, 0..1 while crossing, 1 after leaving */
  sections: Record<SectionId, number>;
  activeSection: SectionId;
  pointer: { x: number; y: number };
}

export const scrollState: ScrollState = {
  progress: 0,
  smoothedProgress: 0,
  velocity: 0,
  sections: {
    hero: 0,
    basketball: 0,
    swimming: 0,
    volleyball: 0,
    outro: 0,
  },
  activeSection: "hero",
  pointer: { x: 0, y: 0 },
};
