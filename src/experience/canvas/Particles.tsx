"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { scrollState } from "@/src/lib/scrollState";
import { sampleStoryboard } from "@/src/experience/camera/storyboard";

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
      const radius = 3.5 + Math.random() * 7;
      const angle = Math.random() * Math.PI * 2;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 6 + 0.5;
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
      material.current.opacity = THREE.MathUtils.damp(
        material.current.opacity,
        0.55,
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
        size={0.09}
        sizeAttenuation
        transparent
        opacity={0.5}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        color="#f3d78f"
      />
    </points>
  );
}
