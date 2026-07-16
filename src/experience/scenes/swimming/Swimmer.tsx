"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { WATER_Y } from "./Pool";

// Straddles the rippling water surface mesh instead of drifting down near
// the floor, so the swimmer reads as cutting through the actual waves. The
// offset from WATER_Y (rather than using it directly) accounts for the
// camera's steep downward angle in this section — tuned by comparing
// screenshots across the storyboard's swimming keyframes until the body
// sat right on the surface line instead of floating above or sinking below
// it.
const SWIM_Y = WATER_Y - 1.6;

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
      group.current.position.y = SWIM_Y + Math.sin(t) * 0.06;
      // Slow lengthwise drift so the swimmer visibly crosses the lane from
      // side to side, reading unmistakably as "swimming across the pool".
      group.current.position.x = Math.sin(state.clock.elapsedTime * 0.12) * 2.6;
      // Freestyle roll: the body banks slightly with each stroke.
      group.current.rotation.z = Math.sin(t) * 0.06;
    }
    // tighter stroke arc — big amplitudes made the silhouette splay into an
    // "X" from the section's side-on camera; a contained freestyle reads
    // far more like an actual swimmer
    if (armL.current) armL.current.rotation.x = Math.sin(t) * 0.65 + 0.15;
    if (armR.current) armR.current.rotation.x = Math.sin(t + Math.PI) * 0.65 + 0.15;
    if (legL.current) legL.current.rotation.x = Math.sin(t * 1.6 + Math.PI) * 0.28;
    if (legR.current) legR.current.rotation.x = Math.sin(t * 1.6) * 0.28;
    if (head.current) head.current.rotation.z = Math.sin(t * 0.5) * 0.14;
  });

  return (
    <group ref={group} position={[0, SWIM_Y, 0]} rotation={[0, Math.PI / 2, 0]}>
      <group ref={head} position={[0, 0, 0.98]}>
        <mesh castShadow>
          <sphereGeometry args={[0.15, 20, 20]} />
          <primitive object={material} attach="material" />
        </mesh>
      </group>
      {/* shoulders — a short crossbar that gives the silhouette a real
          upper body instead of three parallel sticks */}
      <mesh position={[0, 0, 0.72]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <capsuleGeometry args={[0.085, 0.2, 6, 10]} />
        <primitive object={material} attach="material" />
      </mesh>
      {/* torso, tapering into hips */}
      <mesh position={[0, 0, 0.35]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <capsuleGeometry args={[0.19, 0.8, 6, 12]} />
        <primitive object={material} attach="material" />
      </mesh>
      <mesh position={[0, 0, -0.18]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <capsuleGeometry args={[0.14, 0.35, 6, 12]} />
        <primitive object={material} attach="material" />
      </mesh>
      <group ref={armL} position={[0.2, 0, 0.72]}>
        <mesh position={[0, 0, 0.45]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <capsuleGeometry args={[0.075, 0.85, 4, 8]} />
          <primitive object={material} attach="material" />
        </mesh>
        {/* hand */}
        <mesh position={[0, 0, 0.95]} castShadow>
          <sphereGeometry args={[0.085, 10, 10]} />
          <primitive object={material} attach="material" />
        </mesh>
      </group>
      <group ref={armR} position={[-0.2, 0, 0.72]}>
        <mesh position={[0, 0, 0.45]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <capsuleGeometry args={[0.075, 0.85, 4, 8]} />
          <primitive object={material} attach="material" />
        </mesh>
        <mesh position={[0, 0, 0.95]} castShadow>
          <sphereGeometry args={[0.085, 10, 10]} />
          <primitive object={material} attach="material" />
        </mesh>
      </group>
      <group ref={legL} position={[0.11, 0, -0.35]}>
        <mesh position={[0, 0, -0.42]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <capsuleGeometry args={[0.09, 0.8, 4, 8]} />
          <primitive object={material} attach="material" />
        </mesh>
      </group>
      <group ref={legR} position={[-0.11, 0, -0.35]}>
        <mesh position={[0, 0, -0.42]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <capsuleGeometry args={[0.09, 0.8, 4, 8]} />
          <primitive object={material} attach="material" />
        </mesh>
      </group>
    </group>
  );
}
