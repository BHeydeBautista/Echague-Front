"use client";

import { useFBX, useAnimations } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { SkeletonUtils } from "three-stdlib";
import { normalizeAndGround, applyStylizedMaterial } from "@/src/lib/three-helpers";

const athleteMaterial = new THREE.MeshStandardMaterial({
  color: "#a9c1e2",
  metalness: 0.4,
  roughness: 0.48,
  emissive: "#26314a",
  emissiveIntensity: 0.16,
});

interface Props {
  /** Called once the skeleton is ready, with the dribbling hand's bone (or
   * null if this rig doesn't expose one) — lets the ball track it directly
   * instead of bouncing at a fixed, disconnected spot. */
  onHandBone?: (bone: THREE.Object3D | null) => void;
}

export function BasketballPlayer({ onHandBone }: Props) {
  const fbx = useFBX("/models/Dribble.fbx");
  const cloned = useMemo(() => SkeletonUtils.clone(fbx), [fbx]);
  const group = useRef<THREE.Object3D>(null);
  const { actions, names } = useAnimations(fbx.animations, group);

  useEffect(() => {
    normalizeAndGround(cloned, 1.85, fbx.animations[0]);
    applyStylizedMaterial(cloned, athleteMaterial);
    // FBXLoader strips ":" from bone names, so the Mixamo rig's
    // "mixamorig:RightHand" becomes "mixamorigRightHand" at runtime.
    const hand =
      cloned.getObjectByName("mixamorigRightHand") ??
      cloned.getObjectByName("mixamorigLeftHand") ??
      null;
    onHandBone?.(hand);
  }, [cloned, fbx, onHandBone]);

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
