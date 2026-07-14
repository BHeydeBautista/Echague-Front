"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const COUNT = 140;
const MIN_Y = -2.4;
const MAX_Y = 1.2;

export function Bubbles() {
  const points = useRef<THREE.Points>(null);
  const { positions, speeds } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const speeds = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 1] = MIN_Y + Math.random() * (MAX_Y - MIN_Y);
      positions[i * 3 + 2] = (Math.random() - 0.5) * 18;
      speeds[i] = 0.25 + Math.random() * 0.4;
    }
    return { positions, speeds };
  }, []);

  useFrame((state) => {
    if (!points.current) return;
    const t = state.clock.elapsedTime;
    const arr = points.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < COUNT; i++) {
      arr[i * 3 + 1] += speeds[i] * 0.01;
      arr[i * 3] += Math.sin(t + i) * 0.003;
      if (arr[i * 3 + 1] > MAX_Y) arr[i * 3 + 1] = MIN_Y;
    }
    points.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={points} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.045}
        sizeAttenuation
        color="#cdeeff"
        transparent
        opacity={0.6}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
