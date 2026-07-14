"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

const material = new THREE.MeshStandardMaterial({
  color: "#e7c98f",
  metalness: 0.45,
  roughness: 0.45,
  emissive: "#3a2410",
  emissiveIntensity: 0.15,
});

/** Symbolic athlete silhouette, used only if the animated FBX cannot load. */
export function PlayerFallback() {
  const group = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const bounce = Math.abs(Math.sin(t * 1.8));
    if (group.current) {
      group.current.position.y = bounce * 0.06;
      group.current.rotation.y = Math.sin(t * 0.5) * 0.25;
    }
    if (armR.current) {
      armR.current.rotation.x = -0.6 + Math.sin(t * 1.8) * 0.35;
    }
  });

  return (
    <group ref={group} position={[0, 0, 1.4]}>
      <mesh position={[0, 1.55, 0]} castShadow>
        <sphereGeometry args={[0.16, 20, 20]} />
        <primitive object={material} attach="material" />
      </mesh>
      <mesh position={[0, 1.05, 0]} castShadow>
        <capsuleGeometry args={[0.2, 0.65, 6, 12]} />
        <primitive object={material} attach="material" />
      </mesh>
      <group ref={armR} position={[0.26, 1.3, 0]}>
        <mesh position={[0.18, -0.25, 0]} rotation={[0, 0, -0.3]} castShadow>
          <capsuleGeometry args={[0.06, 0.55, 4, 8]} />
          <primitive object={material} attach="material" />
        </mesh>
      </group>
      <mesh position={[-0.26, 1.1, 0]} rotation={[0, 0, 0.15]} castShadow>
        <capsuleGeometry args={[0.065, 0.5, 4, 8]} />
        <primitive object={material} attach="material" />
      </mesh>
      <mesh position={[0.11, 0.35, 0]} rotation={[0.3, 0, 0]} castShadow>
        <capsuleGeometry args={[0.08, 0.6, 4, 8]} />
        <primitive object={material} attach="material" />
      </mesh>
      <mesh position={[-0.11, 0.35, 0]} rotation={[-0.15, 0, 0]} castShadow>
        <capsuleGeometry args={[0.08, 0.6, 4, 8]} />
        <primitive object={material} attach="material" />
      </mesh>
    </group>
  );
}
