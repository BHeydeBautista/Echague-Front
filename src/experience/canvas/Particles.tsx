"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { scrollState } from "@/src/lib/scrollState";
import { sampleStoryboard } from "@/src/experience/camera/storyboard";
import { SECTION_BOUNDS } from "@/src/lib/sections";

const COUNT = 900;
const Z_START = 14;
const Z_END = -66;

function makeSprite() {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  );
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.35, "rgba(255,255,255,0.55)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export function Particles() {
  const points = useRef<THREE.Points>(null);
  const material = useRef<THREE.PointsMaterial>(null);
  const sprite = useMemo(() => makeSprite(), []);

  const { positions, seeds } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const seeds = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      const z = Z_START + Math.random() * (Z_END - Z_START);
      // Both x and y are derived from the same radius/angle (a true
      // cylindrical shell around the camera's general travel axis) so every
      // particle keeps a guaranteed minimum distance from wherever the
      // camera actually is — previously y was independent of radius, so a
      // particle could land at e.g. x=0.3 regardless of "radius", occasionally
      // sitting right next to the camera and ballooning into a full-screen
      // blown-out sprite (size grows as 1/distance with sizeAttenuation).
      const radius = 3.5 + Math.random() * 7;
      const angle = Math.random() * Math.PI * 2;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.sin(angle) * radius * 0.5 + 0.5;
      positions[i * 3 + 2] = z;
      seeds[i] = Math.random() * Math.PI * 2;
    }
    return { positions, seeds };
  }, []);

  useFrame((state, delta) => {
    if (!points.current) return;
    const time = state.clock.elapsedTime;
    const array = points.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < COUNT; i++) {
      const seed = seeds[i];
      array[i * 3] += Math.sin(time * 0.15 + seed) * 0.0015;
      array[i * 3 + 1] += Math.cos(time * 0.12 + seed * 1.3) * 0.0012;
    }
    points.current.geometry.attributes.position.needsUpdate = true;

    const sample = sampleStoryboard(scrollState.progress);
    if (material.current) {
      material.current.color.lerp(sample.keyColor, 0.04);
      // These read as ambient dust/starlight in the open arena and court,
      // but the exact same bright floating specks read as "outer space"
      // once the camera is underwater — so fade them out entirely for the
      // swim section and let Bubbles.tsx supply the (differently styled,
      // upward-drifting) underwater particulate instead.
      const { start, end } = SECTION_BOUNDS.swimming;
      const p = scrollState.progress;
      const inSwim = p >= start - 0.03 && p <= end + 0.03;
      const targetOpacity = inSwim ? 0 : 0.55;
      material.current.opacity = THREE.MathUtils.damp(
        material.current.opacity,
        targetOpacity,
        2,
        delta,
      );
    }
  });

  return (
    <points ref={points} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        ref={material}
        map={sprite}
        size={0.07}
        sizeAttenuation
        transparent
        opacity={0.5}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        color="#bcd8ff"
      />
    </points>
  );
}
