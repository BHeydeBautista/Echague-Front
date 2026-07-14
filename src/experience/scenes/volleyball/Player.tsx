"use client";

import { useGLTF, useAnimations } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { SkeletonUtils } from "three-stdlib";
import { normalizeAndGround, applyStylizedMaterial } from "@/src/lib/three-helpers";

const athleteMaterial = new THREE.MeshStandardMaterial({
  color: "#c3d4ef",
  metalness: 0.32,
  roughness: 0.42,
  emissive: "#2c3f66",
  emissiveIntensity: 0.2,
});

interface Props {
  /** Called once the skeleton is ready, with the hitting wrist's bone (or
   * null if this rig doesn't expose one) — lets the ball track it directly
   * through the jump instead of running on an unrelated fixed timer. */
  onHandBone?: (bone: THREE.Object3D | null) => void;
}

export function VolleyballPlayer({ onHandBone }: Props) {
  const gltf = useGLTF("/models/volleyball_spike.glb");
  const cloned = useMemo(() => SkeletonUtils.clone(gltf.scene), [gltf.scene]);
  const group = useRef<THREE.Object3D>(null);
  const { actions, names } = useAnimations(gltf.animations, group);

  useEffect(() => {
    // This rig's single clip is a full jump — crouch, launch, hit, land —
    // so grounding must be based on the lowest point across the whole
    // cycle, not whichever pose happens to be active at mount.
    normalizeAndGround(cloned, 1.9, gltf.animations[0]);
    applyStylizedMaterial(cloned, athleteMaterial);
    const hand =
      cloned.getObjectByName("Bony_rWristJ_0120") ??
      cloned.getObjectByName("Bony_lWristJ_01") ??
      null;
    onHandBone?.(hand);
  }, [cloned, gltf, onHandBone]);

  useEffect(() => {
    const name = names[0];
    const action = name ? actions[name] : null;
    action?.reset().setLoop(THREE.LoopRepeat, Infinity).fadeIn(0.4).play();
    return () => {
      action?.fadeOut(0.3);
    };
  }, [actions, names]);

  return <primitive ref={group} object={cloned} position={[0.4, 0, 0.6]} rotation={[0, Math.PI * 0.85, 0]} />;
}

useGLTF.preload("/models/volleyball_spike.glb");
