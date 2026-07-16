"use client";

import { useMemo } from "react";
import * as THREE from "three";

function makeFloorTexture() {
  const size = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  // warm parquet base — dark enough to sit in the navy world, but
  // unmistakably wood under the amber lamps
  const base = ctx.createLinearGradient(0, 0, 0, size);
  base.addColorStop(0, "#2a1c10");
  base.addColorStop(0.5, "#20150c");
  base.addColorStop(1, "#150d07");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);

  // plank seams
  ctx.strokeStyle = "rgba(0,0,0,0.35)";
  ctx.lineWidth = 2;
  for (let x = 0; x <= size; x += size / 12) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, size);
    ctx.stroke();
  }
  // subtle grain variation per plank
  for (let i = 0; i < 12; i++) {
    ctx.fillStyle = `rgba(255, 190, 120, ${0.02 + Math.random() * 0.03})`;
    ctx.fillRect((i * size) / 12, 0, size / 12, size);
  }

  ctx.strokeStyle = "rgba(255,224,178,0.5)";
  ctx.lineWidth = 4;
  ctx.strokeRect(40, 40, size - 80, size - 80);

  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size * 0.14, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(40, size / 2);
  ctx.lineTo(size - 40, size / 2);
  ctx.stroke();

  ctx.strokeStyle = "rgba(255,224,178,0.3)";
  ctx.beginPath();
  ctx.arc(size / 2, size - 40, size * 0.32, Math.PI, 0);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Regulation-scale hoop assembly (1 world unit ≈ 1 metre, matching the
 * athlete's normalized height): rim at 3.05m, backboard 2.9m–3.95m. */
export function Court() {
  const floorTex = useMemo(() => makeFloorTexture(), []);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -1]} receiveShadow>
        <planeGeometry args={[11, 16]} />
        <meshStandardMaterial map={floorTex} roughness={0.4} metalness={0.22} />
      </mesh>

      {/* hoop assembly */}
      <group position={[0, 0, -6.4]}>
        <mesh position={[0, 1.65, -0.4]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 3.3, 12]} />
          <meshStandardMaterial color="#0a1120" metalness={0.7} roughness={0.4} />
        </mesh>
        <mesh position={[0, 3.43, -0.15]} castShadow>
          <boxGeometry args={[1.6, 1.05, 0.06]} />
          <meshPhysicalMaterial
            color="#dfe6f0"
            transparent
            opacity={0.22}
            roughness={0.15}
            metalness={0.1}
            transmission={0.4}
          />
        </mesh>
        <mesh position={[0, 3.05, 0.28]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.46, 0.028, 12, 32]} />
          <meshStandardMaterial
            color="#c3d4ef"
            metalness={0.9}
            roughness={0.28}
            emissive="#2c3f66"
            emissiveIntensity={0.3}
          />
        </mesh>
        {Array.from({ length: 10 }).map((_, i) => {
          const angle = (i / 10) * Math.PI * 2;
          return (
            <mesh
              key={i}
              position={[Math.cos(angle) * 0.46, 2.6, 0.28 + Math.sin(angle) * 0.46]}
            >
              <cylinderGeometry args={[0.006, 0.006, 0.9, 4]} />
              <meshStandardMaterial color="#e8ecf2" transparent opacity={0.5} />
            </mesh>
          );
        })}
      </group>

      {/* stadium light beams — tungsten amber, the "warm amber court
          lighting" the section copy promises */}
      {[[-4.5, -3], [4.5, -3], [-4.5, 3], [4.5, 3]].map(([x, z], i) => (
        <group key={i} position={[x, 8, z]} rotation={[Math.PI, 0, 0]}>
          <mesh>
            <coneGeometry args={[1.6, 7, 24, 1, true]} />
            <meshBasicMaterial
              color="#ffc27a"
              transparent
              opacity={0.06}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
          <spotLight
            position={[0, 0, 0]}
            angle={0.5}
            penumbra={0.6}
            intensity={7}
            color="#ffcf8e"
            distance={16}
          />
        </group>
      ))}
    </group>
  );
}
