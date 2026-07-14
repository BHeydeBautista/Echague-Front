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
  base.addColorStop(0, "#4a3220");
  base.addColorStop(1, "#1c130c");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = "rgba(243,215,143,0.5)";
  ctx.lineWidth = 5;
  ctx.strokeRect(50, 50, size - 100, size - 100);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeSkyTexture() {
  const w = 512;
  const h = 512;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "#1a0f1e");
  g.addColorStop(0.45, "#5a2f3a");
  g.addColorStop(0.72, "#c96a4e");
  g.addColorStop(1, "#ffbf7a");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function Court() {
  const sandTex = useMemo(() => makeSandTexture(), []);
  const skyTex = useMemo(() => makeSkyTexture(), []);

  return (
    <group>
      {/* sunset sky backdrop */}
      <mesh position={[0, 4, -11]}>
        <planeGeometry args={[34, 20]} />
        <meshBasicMaterial map={skyTex} />
      </mesh>
      <mesh position={[0, 6, -10.9]}>
        <circleGeometry args={[1.4, 32]} />
        <meshBasicMaterial color="#ffdca0" />
      </mesh>

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
            color="#f3d78f"
            transparent
            opacity={0.16}
            wireframe
          />
        </mesh>
        <mesh position={[0, 2.72, 0]} castShadow>
          <boxGeometry args={[6.25, 0.08, 0.05]} />
          <meshStandardMaterial color="#cda866" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
}
