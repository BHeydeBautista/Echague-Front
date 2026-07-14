"use client";

import { useFBX, useAnimations } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { SkeletonUtils } from "three-stdlib";
import { normalizeAndGround, applyStylizedMaterial } from "@/src/lib/three-helpers";

const swimmerMaterial = new THREE.MeshStandardMaterial({
  color: "#bfe3ff",
  metalness: 0.3,
  roughness: 0.4,
  emissive: "#0e3a55",
  emissiveIntensity: 0.2,
});

export function Swimmer() {
  const fbx = useFBX("/models/Swimming.fbx");
  const cloned = useMemo(() => SkeletonUtils.clone(fbx), [fbx]);
  const group = useRef<THREE.Object3D>(null);
  const { actions, names } = useAnimations(fbx.animations, group);

  useEffect(() => {
    normalizeAndGround(cloned, 1.9);
    applyStylizedMaterial(cloned, swimmerMaterial);
  }, [cloned]);

  useEffect(() => {
    const name = names[0];
    const action = name ? actions[name] : null;
    action?.reset().setLoop(THREE.LoopRepeat, Infinity).fadeIn(0.4).play();
    return () => {
      action?.fadeOut(0.3);
    };
  }, [actions, names]);

  return (
    // Rotated about Z (not X) so the swimmer's long axis runs left-right,
    // roughly perpendicular to the camera's mostly-forward (Z) view through
    // the pool — lying along Z instead would foreshorten into a vertical blob.
    <primitive
      ref={group}
      object={cloned}
      position={[0, -0.35, 1]}
      rotation={[0, 0, Math.PI / 2]}
    />
  );
}
