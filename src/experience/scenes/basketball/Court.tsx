"use client";

import { useMemo } from "react";
import * as THREE from "three";

function makeFloorTexture() {
  const size = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  const base = ctx.createLinearGradient(0, 0, 0, size);
  base.addColorStop(0, "#1c130a");
  base.addColorStop(1, "#100b06");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);

  ctx.strokeStyle = "rgba(205,168,102,0.55)";
  ctx.lineWidth = 4;
  ctx.strokeRect(40, 40, size - 80, size - 80);

  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size * 0.14, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(40, size / 2);
  ctx.lineTo(size - 40, size / 2);
  ctx.stroke();

  ctx.strokeStyle = "rgba(205,168,102,0.35)";
  ctx.beginPath();
  ctx.arc(size / 2, size - 40, size * 0.32, Math.PI, 0);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function Court() {
  const floorTex = useMemo(() => makeFloorTexture(), []);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -1]} receiveShadow>
        <planeGeometry args={[11, 16]} />
        <meshStandardMaterial map={floorTex} roughness={0.55} metalness={0.15} />
      </mesh>

      {/* hoop assembly */}
      <group position={[0, 0, -6.4]}>
        <mesh position={[0, 3.6, -0.4]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 3.6, 12]} />
          <meshStandardMaterial color="#0a1120" metalness={0.7} roughness={0.4} />
        </mesh>
        <mesh position={[0, 5.1, -0.15]} castShadow>
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
        <mesh position={[0, 4.65, 0.28]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.46, 0.028, 12, 32]} />
          <meshStandardMaterial color="#cda866" metalness={0.9} roughness={0.3} emissive="#8a6a2e" emissiveIntensity={0.3} />
        </mesh>
        {Array.from({ length: 10 }).map((_, i) => {
          const angle = (i / 10) * Math.PI * 2;
          return (
            <mesh
              key={i}
              position={[Math.cos(angle) * 0.46, 4.15, 0.28 + Math.sin(angle) * 0.46]}
            >
              <cylinderGeometry args={[0.006, 0.006, 0.9, 4]} />
              <meshStandardMaterial color="#e8ecf2" transparent opacity={0.5} />
            </mesh>
          );
        })}
      </group>

      {/* stadium light beams */}
      {[[-4.5, -3], [4.5, -3], [-4.5, 3], [4.5, 3]].map(([x, z], i) => (
        <group key={i} position={[x, 8, z]} rotation={[Math.PI, 0, 0]}>
          <mesh>
            <coneGeometry args={[1.6, 7, 24, 1, true]} />
            <meshBasicMaterial
              color="#ffdca6"
              transparent
              opacity={0.05}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
          <spotLight
            position={[0, 0, 0]}
            angle={0.5}
            penumbra={0.6}
            intensity={6}
            color="#ffcf8f"
            distance={16}
          />
        </group>
      ))}
    </group>
  );
}
