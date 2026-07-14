"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function makeCausticTexture() {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, size, size);
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < 60; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 12 + Math.random() * 46;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, "rgba(140,220,255,0.5)");
    g.addColorStop(1, "rgba(140,220,255,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * 0.6, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  return tex;
}

const RIPPLE_SEGMENTS = 48;

export function Pool() {
  const waterRef = useRef<THREE.Mesh>(null);
  const caustic1 = useMemo(() => makeCausticTexture(), []);
  const caustic2 = useMemo(() => makeCausticTexture(), []);
  const causticRef1 = useRef<THREE.Mesh>(null);
  const causticRef2 = useRef<THREE.Mesh>(null);

  const geometry = useMemo(
    () => new THREE.PlaneGeometry(20, 26, RIPPLE_SEGMENTS, RIPPLE_SEGMENTS),
    [],
  );
  const basePositions = useMemo(
    () => Float32Array.from(geometry.attributes.position.array),
    [geometry],
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const pos = geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < pos.length; i += 3) {
      const x = basePositions[i];
      const y = basePositions[i + 1];
      pos[i + 2] =
        Math.sin(x * 0.35 + t * 0.9) * 0.12 + Math.cos(y * 0.28 + t * 0.7) * 0.1;
    }
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();

    if (causticRef1.current) {
      const m = causticRef1.current.material as THREE.MeshBasicMaterial;
      m.map!.offset.set(t * 0.015, t * 0.01);
    }
    if (causticRef2.current) {
      const m = causticRef2.current.material as THREE.MeshBasicMaterial;
      m.map!.offset.set(-t * 0.011, t * 0.017);
    }
  });

  return (
    <group>
      {/* pool floor + drifting caustic light patterns */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.6, 0]} receiveShadow>
        <planeGeometry args={[20, 26]} />
        <meshStandardMaterial color="#031722" roughness={0.85} />
      </mesh>
      <mesh ref={causticRef1} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.58, 0]}>
        <planeGeometry args={[20, 26]} />
        <meshBasicMaterial
          map={caustic1}
          transparent
          opacity={0.5}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh ref={causticRef2} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.57, 0]}>
        <planeGeometry args={[20, 26]} />
        <meshBasicMaterial
          map={caustic2}
          transparent
          opacity={0.35}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* rippling water surface */}
      <mesh ref={waterRef} geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.15, 0]}>
        <meshPhysicalMaterial
          color="#0d3a55"
          transmission={0.55}
          thickness={2}
          roughness={0.18}
          ior={1.33}
          metalness={0}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* volumetric light shafts piercing the surface */}
      {[[-3, 5], [4, -6], [-2, -4]].map(([x, z], i) => (
        <mesh key={i} position={[x, 1.5, z]} rotation={[Math.PI, 0.1 * i, 0]}>
          <coneGeometry args={[1.4, 9, 20, 1, true]} />
          <meshBasicMaterial
            color="#7fd7ff"
            transparent
            opacity={0.045}
            side={THREE.DoubleSide}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}
