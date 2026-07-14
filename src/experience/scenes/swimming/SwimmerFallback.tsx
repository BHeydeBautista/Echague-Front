"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

const material = new THREE.MeshStandardMaterial({
  color: "#bfe3ff",
  metalness: 0.3,
  roughness: 0.35,
  emissive: "#0e3a55",
  emissiveIntensity: 0.25,
});

/** Symbolic swimmer silhouette, used only if the animated FBX cannot load. */
export function SwimmerFallback() {
  const group = useRef<THREE.Group>(null);
  const armL = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);
  const legL = useRef<THREE.Group>(null);
  const legR = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime * 2.2;
    if (group.current) {
      group.current.position.y = -0.3 + Math.sin(t) * 0.08;
      group.current.rotation.z = Math.sin(t) * 0.06;
    }
    if (armL.current) armL.current.rotation.x = Math.sin(t) * 1.1;
    if (armR.current) armR.current.rotation.x = Math.sin(t + Math.PI) * 1.1;
    if (legL.current) legL.current.rotation.x = Math.sin(t * 1.4 + Math.PI) * 0.5;
    if (legR.current) legR.current.rotation.x = Math.sin(t * 1.4) * 0.5;
  });

  return (
    <group ref={group} position={[0, -0.3, 1]} rotation={[0, Math.PI / 2, 0]}>
      <mesh position={[0, 0, 0.95]} castShadow>
        <sphereGeometry args={[0.14, 20, 20]} />
        <primitive object={material} attach="material" />
      </mesh>
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
