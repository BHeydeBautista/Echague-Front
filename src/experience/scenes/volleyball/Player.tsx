"use client";

import { useGLTF, useAnimations } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { SkeletonUtils } from "three-stdlib";
import { normalizeAndGround, applyStylizedMaterial } from "@/src/lib/three-helpers";

const athleteMaterial = new THREE.MeshStandardMaterial({
  color: "#ffd9a8",
  metalness: 0.3,
  roughness: 0.45,
  emissive: "#5c2c1a",
  emissiveIntensity: 0.18,
});

export function VolleyballPlayer() {
  const gltf = useGLTF("/models/volleyball_spike.glb");
  const cloned = useMemo(() => SkeletonUtils.clone(gltf.scene), [gltf.scene]);
  const group = useRef<THREE.Object3D>(null);
  const { actions, names } = useAnimations(gltf.animations, group);

  useEffect(() => {
    normalizeAndGround(cloned, 1.9);
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

  return <primitive ref={group} object={cloned} position={[0.4, 0, 0.6]} rotation={[0, Math.PI * 0.85, 0]} />;
}

useGLTF.preload("/models/volleyball_spike.glb");
