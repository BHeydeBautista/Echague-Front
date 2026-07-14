"use client";

import { useMemo } from "react";
import * as THREE from "three";

function makeSandTexture() {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const base = ctx.createRadialGradient(size / 2, size / 2, 40, size / 2, size / 2, size * 0.75);
  base.addColorStop(0, "#1e242c");
  base.addColorStop(1, "#0a0d12");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = "rgba(188,216,255,0.4)";
  ctx.lineWidth = 5;
  ctx.strokeRect(50, 50, size - 100, size - 100);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function Court() {
  const sandTex = useMemo(() => makeSandTexture(), []);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[12, 16]} />
        <meshStandardMaterial map={sandTex} roughness={0.9} />
      </mesh>

      {/* net */}
      <group position={[0, 0, -1.5]}>
        <mesh position={[-3.1, 1.55, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 3.1, 10]} />
          <meshStandardMaterial color="#0a1120" metalness={0.6} roughness={0.5} />
        </mesh>
        <mesh position={[3.1, 1.55, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 3.1, 10]} />
          <meshStandardMaterial color="#0a1120" metalness={0.6} roughness={0.5} />
        </mesh>
        <mesh position={[0, 2.35, 0]}>
          <boxGeometry args={[6.2, 0.7, 0.02]} />
          <meshStandardMaterial
            color="#bcd8ff"
            transparent
            opacity={0.16}
            wireframe
          />
        </mesh>
        <mesh position={[0, 2.72, 0]} castShadow>
          <boxGeometry args={[6.25, 0.08, 0.05]} />
          <meshStandardMaterial color="#c3d4ef" metalness={0.8} roughness={0.28} />
        </mesh>
      </group>
    </group>
  );
}
