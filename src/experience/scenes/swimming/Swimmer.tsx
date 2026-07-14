"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

const material = new THREE.MeshStandardMaterial({
  color: "#cfe8ff",
  metalness: 0.25,
  roughness: 0.35,
  emissive: "#1c4d78",
  emissiveIntensity: 0.32,
});

/** A deliberately procedural swimmer instead of an imported rig: after two
 * rounds of the FBX character's baked-in animation pose fighting with the
 * root rotation needed to lay it on its side (producing a tumbling, curled
 * silhouette instead of a horizontal swimmer), a simple hand-built capsule
 * figure guarantees the one thing that actually matters here — a body that
 * stays flat and horizontal while crossing the lane left-to-right. */
export function Swimmer() {
  const group = useRef<THREE.Group>(null);
  const armL = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);
  const legL = useRef<THREE.Group>(null);
  const legR = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime * 2.2;
    if (group.current) {
      group.current.position.y = -0.4 + Math.sin(t) * 0.08;
      // Slow lengthwise drift so the swimmer visibly crosses the lane from
      // side to side, reading unmistakably as "swimming across the pool".
      group.current.position.x = Math.sin(state.clock.elapsedTime * 0.12) * 2.6;
      // Freestyle roll: the body banks slightly with each stroke.
      group.current.rotation.z = Math.sin(t) * 0.1;
    }
    if (armL.current) armL.current.rotation.x = Math.sin(t) * 0.9 + 0.3;
    if (armR.current) armR.current.rotation.x = Math.sin(t + Math.PI) * 0.9 + 0.3;
    if (legL.current) legL.current.rotation.x = Math.sin(t * 1.6 + Math.PI) * 0.4;
    if (legR.current) legR.current.rotation.x = Math.sin(t * 1.6) * 0.4;
    if (head.current) head.current.rotation.z = Math.sin(t * 0.5) * 0.18;
  });

  return (
    <group ref={group} position={[0, -0.4, 0]} rotation={[0, Math.PI / 2, 0]}>
      <group ref={head} position={[0, 0, 0.95]}>
        <mesh castShadow>
          <sphereGeometry args={[0.14, 20, 20]} />
          <primitive object={material} attach="material" />
        </mesh>
      </group>
      <mesh position={[0, 0, 0.35]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <capsuleGeometry args={[0.17, 0.85, 6, 12]} />
        <primitive object={material} attach="material" />
      </mesh>
      <group ref={armL} position={[0.24, 0, 0.65]}>
        <mesh position={[0, 0, 0.45]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <capsuleGeometry args={[0.055, 0.85, 4, 8]} />
          <primitive object={material} attach="material" />
        </mesh>
      </group>
      <group ref={armR} position={[-0.24, 0, 0.65]}>
        <mesh position={[0, 0, 0.45]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <capsuleGeometry args={[0.055, 0.85, 4, 8]} />
          <primitive object={material} attach="material" />
        </mesh>
      </group>
      <group ref={legL} position={[0.1, 0, -0.35]}>
        <mesh position={[0, 0, -0.4]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <capsuleGeometry args={[0.07, 0.75, 4, 8]} />
          <primitive object={material} attach="material" />
        </mesh>
      </group>
      <group ref={legR} position={[-0.1, 0, -0.35]}>
        <mesh position={[0, 0, -0.4]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <capsuleGeometry args={[0.07, 0.75, 4, 8]} />
          <primitive object={material} attach="material" />
        </mesh>
      </group>
    </group>
  );
}
