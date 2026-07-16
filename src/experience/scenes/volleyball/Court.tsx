"use client";

import { useMemo } from "react";
import * as THREE from "three";

function makeSandTexture() {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  // sun-warmed sand falling off into dusk at the edges
  const base = ctx.createRadialGradient(size / 2, size / 2, 40, size / 2, size / 2, size * 0.75);
  base.addColorStop(0, "#4a3320");
  base.addColorStop(0.55, "#2e2014");
  base.addColorStop(1, "#150e0a");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);
  // fine grain speckle so the surface reads as sand, not felt
  for (let i = 0; i < 900; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    ctx.fillStyle = `rgba(255, 214, 160, ${Math.random() * 0.05})`;
    ctx.fillRect(x, y, 1.5, 1.5);
  }
  ctx.strokeStyle = "rgba(255,220,175,0.5)";
  ctx.lineWidth = 5;
  ctx.strokeRect(50, 50, size - 100, size - 100);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Woven net texture — actual strings with square gaps, drawn once to a
 * canvas, far more physical than a wireframe box ever reads. */
function makeNetTexture() {
  const w = 1024;
  const h = 128;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, w, h);
  ctx.strokeStyle = "rgba(226,236,250,0.85)";
  ctx.lineWidth = 1.6;
  const step = 16;
  for (let x = 0; x <= w; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y <= h; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  // reinforced white band along the top edge
  ctx.fillStyle = "rgba(240,246,255,0.95)";
  ctx.fillRect(0, 0, w, 10);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Low sun glow on the horizon — a big additive radial gradient billboard
 * behind the court that gives the whole section its sunset silhouette. */
function makeSunGlowTexture() {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,170,100,0.9)");
  g.addColorStop(0.25, "rgba(255,130,70,0.5)");
  g.addColorStop(0.6, "rgba(160,60,50,0.18)");
  g.addColorStop(1, "rgba(80,30,40,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

export function Court() {
  const sandTex = useMemo(() => makeSandTexture(), []);
  const netTex = useMemo(() => makeNetTexture(), []);
  const sunTex = useMemo(() => makeSunGlowTexture(), []);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[12, 16]} />
        <meshStandardMaterial map={sandTex} roughness={0.9} />
      </mesh>

      {/* setting sun, low behind the far side of the court */}
      <mesh position={[3.5, 2.2, -11]} renderOrder={-1}>
        <planeGeometry args={[16, 16]} />
        <meshBasicMaterial
          map={sunTex}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* net */}
      <group position={[0, 0, -1.5]}>
        <mesh position={[-3.1, 1.55, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 3.1, 10]} />
          <meshStandardMaterial color="#141a28" metalness={0.6} roughness={0.5} />
        </mesh>
        <mesh position={[3.1, 1.55, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 3.1, 10]} />
          <meshStandardMaterial color="#141a28" metalness={0.6} roughness={0.5} />
        </mesh>
        {/* woven mesh, lit from behind by the sun glow */}
        <mesh position={[0, 2.35, 0]}>
          <planeGeometry args={[6.2, 0.78]} />
          <meshBasicMaterial
            map={netTex}
            transparent
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
        <mesh position={[0, 2.72, 0]} castShadow>
          <boxGeometry args={[6.25, 0.08, 0.05]} />
          <meshStandardMaterial
            color="#e8d5a0"
            metalness={0.75}
            roughness={0.3}
            emissive="#4a3a14"
            emissiveIntensity={0.25}
          />
        </mesh>
      </group>
    </group>
  );
}
