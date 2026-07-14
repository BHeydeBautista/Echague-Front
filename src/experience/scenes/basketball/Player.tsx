"use client";

import { useFBX, useAnimations } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { SkeletonUtils } from "three-stdlib";
import { normalizeAndGround, applyStylizedMaterial } from "@/src/lib/three-helpers";

const athleteMaterial = new THREE.MeshStandardMaterial({
  color: "#e7c98f",
  metalness: 0.4,
  roughness: 0.5,
  emissive: "#3a2410",
  emissiveIntensity: 0.12,
});

export function BasketballPlayer() {
  const fbx = useFBX("/models/Dribble.fbx");
  const cloned = useMemo(() => SkeletonUtils.clone(fbx), [fbx]);
  const group = useRef<THREE.Object3D>(null);
  const { actions, names } = useAnimations(fbx.animations, group);

  useEffect(() => {
    normalizeAndGround(cloned, 1.85);
    applyStylizedMaterial(cloned, athleteMaterial);
  }, [cloned]);

  useEffect(() => {
    const name = names[0];
    const action = name ? actions[name] : null;
    action?.reset().setLoop(THREE.LoopRepeat, Infinity).fadeIn(0.4).play();
    return () => {
      action?.fadeOut(0.3);
    };
  }, [actions, names]);

  return <primitive ref={group} object={cloned} position={[0, 0, 1.4]} rotation={[0, Math.PI, 0]} />;
}
