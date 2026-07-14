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
  kf(B.hero.start, [0, 0.3, 7.6], [0, 0.15, 0], 38, "#05070d", 6, 26, "#f3d78f", 1.2, "#5fd8e8", 0.6, "#10182c", 0.5),
  kf(mid(B.hero.start, B.hero.end), [2.6, 0.9, 5.2], [0, 0.1, 0], 40, "#05070d", 6, 25, "#f3d78f", 1.35, "#5fd8e8", 0.75, "#10182c", 0.5),
  // --- into the arena: warm, gold-lit basketball world ---
  kf(B.hero.end, [3.6, 1.7, -6], [0, 0.6, -13], 46, "#130b06", 8, 34, "#ffb37a", 1.6, "#e8a860", 0.5, "#1a1208", 0.5),
  kf(mid(B.basketball.start, B.basketball.end), [-3.4, 2.6, -15.5], [0, 1.3, -17.5], 50, "#150c07", 9, 32, "#ffb774", 1.85, "#ffcf8f", 0.55, "#1c1309", 0.55),
  // --- diving down into the pool: cool cyan-blue depths ---
  // Targets stay close to the pool/swimmer (world z ~ -34, group center)
  // instead of drifting past the content into empty fog.
  kf(B.basketball.end, [0.6, 0.3, -24], [0, -1, -28], 48, "#03101a", 6, 28, "#6fd0ff", 1.05, "#2b6fb0", 0.85, "#05141c", 0.6),
  kf(mid(B.swimming.start, B.swimming.end), [2.6, -1.7, -32], [0, -1.4, -34], 52, "#020a12", 4, 22, "#4fb8e8", 0.85, "#1c4d78", 1.0, "#040c14", 0.6),
  // --- rising into sunset volleyball court (world z ~ -49, group center) ---
  kf(B.swimming.end, [-1, -0.2, -40], [0, 0.3, -44], 48, "#1d0f10", 8, 34, "#ff9d5c", 1.45, "#ff6f91", 0.6, "#200f10", 0.5),
  kf(mid(B.volleyball.start, B.volleyball.end), [-3.2, 1.6, -48], [0, 1.4, -50], 46, "#1a0e0f", 9, 32, "#ffb26a", 1.7, "#ff8fa8", 0.55, "#1c0f0f", 0.55),
  // --- pulling back and journeying home, past the realms we've visited ---
  kf(B.volleyball.end, [0, 2, -51], [0, 0.6, -53], 42, "#05070d", 10, 22, "#f3d78f", 1.3, "#5fd8e8", 0.6, "#10182c", 0.5),
  kf(mid(B.outro.start, B.outro.end), [3, 2.6, -22], [0, 1, -12], 42, "#05070d", 8, 20, "#f3d78f", 1.4, "#5fd8e8", 0.7, "#10182c", 0.55),
  // --- full circle: back where we began, the crest whole and eternal ---
  // Fog is kept tight here so the arena/pool/court we just passed stay
  // swallowed in darkness, leaving only the crest sharp in frame.
  kf(B.outro.end, [0, 1, 6.8], [0, 0.2, 0], 38, "#05070d", 6, 20, "#f6dd9c", 1.6, "#5fd8e8", 0.85, "#10182c", 0.6),
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
