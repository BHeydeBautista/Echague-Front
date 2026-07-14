import * as THREE from "three";
import { SECTION_BOUNDS } from "@/src/lib/sections";

export interface Keyframe {
  t: number;
  position: THREE.Vector3;
  target: THREE.Vector3;
  fov: number;
  fog: THREE.Color;
  fogNear: number;
  fogFar: number;
  key: THREE.Color;
  keyIntensity: number;
  rim: THREE.Color;
  rimIntensity: number;
  ambient: THREE.Color;
  ambientIntensity: number;
}

function kf(
  t: number,
  position: [number, number, number],
  target: [number, number, number],
  fov: number,
  fog: string,
  fogNear: number,
  fogFar: number,
  key: string,
  keyIntensity: number,
  rim: string,
  rimIntensity: number,
  ambient: string,
  ambientIntensity: number,
): Keyframe {
  return {
    t,
    position: new THREE.Vector3(...position),
    target: new THREE.Vector3(...target),
    fov,
    fog: new THREE.Color(fog),
    fogNear,
    fogFar,
    key: new THREE.Color(key),
    keyIntensity,
    rim: new THREE.Color(rim),
    rimIntensity,
    ambient: new THREE.Color(ambient),
    ambientIntensity,
  };
}

const B = SECTION_BOUNDS;
const mid = (a: number, b: number) => (a + b) / 2;

export const KEYFRAMES: Keyframe[] = [
  // --- HERO: the crest floats in a dark, reverent void ---
  kf(B.hero.start, [0, 0.3, 7.6], [0, 0.15, 0], 38, "#05070d", 6, 26, "#bcd8ff", 1.2, "#7d93c2", 0.6, "#10182c", 0.5),
  kf(mid(B.hero.start, B.hero.end), [2.6, 0.9, 5.2], [0, 0.1, 0], 40, "#05070d", 6, 25, "#bcd8ff", 1.35, "#7d93c2", 0.75, "#10182c", 0.5),
  // --- into the arena: a cool, brand-lit basketball world ---
  kf(B.hero.end, [3.6, 1.7, -6], [0, 0.6, -13], 46, "#070a12", 8, 34, "#cfe0ff", 1.75, "#7d93c2", 0.65, "#0d1420", 0.5),
  // Pulled back from the player for a balanced action shot (player + ball +
  // hoop all read together, instead of a tight, disconnected close-up).
  kf(mid(B.basketball.start, B.basketball.end), [-5, 3.2, -10], [0, 1.1, -18], 48, "#080c15", 9, 32, "#e8f0ff", 2.05, "#a9c1e2", 0.75, "#0e1522", 0.55),
  // --- diving down into the pool: a fixed underwater viewpoint watching
  // the swimmer cross the lane left-to-right, rather than chasing behind
  // them — much easier to read as "swimming across a pool" than a
  // foreshortened follow-cam. Fog is a rich, saturated blue (not
  // near-black) so the background always reads as water. ---
  kf(B.basketball.end, [0, -0.6, -28], [0, -2.1, -34], 45, "#062a44", 7, 20, "#8fc4f0", 1.25, "#3c5178", 0.9, "#0a2038", 0.75),
  kf(mid(B.swimming.start, B.swimming.end), [0.6, -0.8, -27], [0, -2.2, -34], 46, "#052540", 5, 16, "#a0cdf5", 1.15, "#3c5178", 1.05, "#082035", 0.8),
  // --- rising toward the night volleyball court (world z ~ -49, group center) ---
  // Fog kept tight here so the volleyball court doesn't bleed into view
  // while we're still meant to be underwater.
  kf(B.swimming.end, [0, -0.3, -30], [0, -1.4, -38], 46, "#082a42", 6, 12, "#d8e6ff", 1.6, "#7d93c2", 0.65, "#0d1420", 0.55),
  // Pulled back from the player, camera centered on them as the subject.
  kf(mid(B.volleyball.start, B.volleyball.end), [-4, 2, -46], [0, 1.2, -49], 46, "#080b16", 9, 30, "#eaf1ff", 1.95, "#a9c1e2", 0.8, "#0e1420", 0.55),
  // --- pulling back and journeying home, past the realms we've visited ---
  kf(B.volleyball.end, [0, 2, -51], [0, 0.6, -53], 42, "#05070d", 10, 22, "#bcd8ff", 1.3, "#7d93c2", 0.6, "#10182c", 0.5),
  kf(mid(B.outro.start, B.outro.end), [3, 2.6, -22], [0, 1, -12], 42, "#05070d", 8, 20, "#bcd8ff", 1.4, "#7d93c2", 0.7, "#10182c", 0.55),
  // --- full circle: back where we began, the crest whole and eternal ---
  // Fog is kept tight here so the arena/pool/court we just passed stay
  // swallowed in darkness, leaving only the crest sharp in frame.
  kf(B.outro.end, [0, 1, 6.8], [0, 0.2, 0], 38, "#05070d", 6, 20, "#d8e6ff", 1.6, "#7d93c2", 0.85, "#10182c", 0.6),
];

function smoothstep(x: number) {
  return x * x * (3 - 2 * x);
}

export function sampleStoryboard(progress: number) {
  const t = THREE.MathUtils.clamp(progress, 0, 1);
  let a = KEYFRAMES[0];
  let b = KEYFRAMES[KEYFRAMES.length - 1];
  for (let i = 0; i < KEYFRAMES.length - 1; i++) {
    if (t >= KEYFRAMES[i].t && t <= KEYFRAMES[i + 1].t) {
      a = KEYFRAMES[i];
      b = KEYFRAMES[i + 1];
      break;
    }
  }
  const span = b.t - a.t || 1;
  const alpha = smoothstep(THREE.MathUtils.clamp((t - a.t) / span, 0, 1));

  const position = new THREE.Vector3().lerpVectors(a.position, b.position, alpha);
  const target = new THREE.Vector3().lerpVectors(a.target, b.target, alpha);
  const fogColor = new THREE.Color().lerpColors(a.fog, b.fog, alpha);
  const keyColor = new THREE.Color().lerpColors(a.key, b.key, alpha);
  const rimColor = new THREE.Color().lerpColors(a.rim, b.rim, alpha);
  const ambientColor = new THREE.Color().lerpColors(a.ambient, b.ambient, alpha);

  return {
    position,
    target,
    fov: THREE.MathUtils.lerp(a.fov, b.fov, alpha),
    fogColor,
    fogNear: THREE.MathUtils.lerp(a.fogNear, b.fogNear, alpha),
    fogFar: THREE.MathUtils.lerp(a.fogFar, b.fogFar, alpha),
    keyColor,
    keyIntensity: THREE.MathUtils.lerp(a.keyIntensity, b.keyIntensity, alpha),
    rimColor,
    rimIntensity: THREE.MathUtils.lerp(a.rimIntensity, b.rimIntensity, alpha),
    ambientColor,
    ambientIntensity: THREE.MathUtils.lerp(a.ambientIntensity, b.ambientIntensity, alpha),
  };
}
