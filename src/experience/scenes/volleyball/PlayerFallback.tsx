"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

const material = new THREE.MeshStandardMaterial({
  color: "#c3d4ef",
  metalness: 0.32,
  roughness: 0.42,
  emissive: "#2c3f66",
  emissiveIntensity: 0.22,
});

const CYCLE = 4.2;

/** Symbolic spiking silhouette, used only if the animated GLB cannot load. */
export function PlayerFallback() {
  const group = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = (state.clock.elapsedTime % CYCLE) / CYCLE;
    const jump = Math.sin(Math.PI * Math.min(t / 0.55, 1));
    if (group.current) {
      group.current.position.y = jump * 1.65;
      group.current.rotation.y = -0.3 + jump * 0.2;
    }
    if (armR.current) {
      armR.current.rotation.x = THREE.MathUtils.lerp(0.3, -2.4, THREE.MathUtils.smoothstep(t, 0.15, 0.55));
    }
  });

  return (
    <group ref={group} position={[0.4, 0, 0.6]} scale={1.5}>
      <mesh position={[0, 1.58, 0]} castShadow>
        <sphereGeometry args={[0.15, 20, 20]} />
        <primitive object={material} attach="material" />
      </mesh>
      <mesh position={[0, 1.08, 0]} castShadow>
        <capsuleGeometry args={[0.19, 0.6, 6, 12]} />
        <primitive object={material} attach="material" />
      </mesh>
      <group ref={armR} position={[0.2, 1.35, 0]}>
        <mesh position={[0, 0.3, 0]} castShadow>
          <capsuleGeometry args={[0.06, 0.6, 4, 8]} />
          <primitive object={material} attach="material" />
        </mesh>
      </group>
      <mesh position={[-0.22, 1.15, 0.05]} rotation={[0.3, 0, 0.2]} castShadow>
        <capsuleGeometry args={[0.06, 0.45, 4, 8]} />
        <primitive object={material} attach="material" />
      </mesh>
      <mesh position={[0.1, 0.4, 0]} rotation={[-0.4, 0, 0]} castShadow>
        <capsuleGeometry args={[0.08, 0.55, 4, 8]} />
        <primitive object={material} attach="material" />
      </mesh>
      <mesh position={[-0.1, 0.4, 0]} rotation={[-0.5, 0, 0]} castShadow>
        <capsuleGeometry args={[0.08, 0.55, 4, 8]} />
        <primitive object={material} attach="material" />
      </mesh>
    </group>
  );
}
