"use client";

import { Suspense, useRef } from "react";
import * as THREE from "three";
import { ModelErrorBoundary } from "@/src/experience/scenes/ErrorBoundary";
import { useSceneVisibility } from "@/src/experience/scenes/useSceneVisibility";
import { Court } from "./Court";
import { Ball } from "./Ball";
import { BasketballPlayer } from "./Player";
import { PlayerFallback } from "./PlayerFallback";

export function BasketballScene() {
  const handBoneRef = useRef<THREE.Object3D | null>(null);
  const visibilityRef = useSceneVisibility("basketball");

  return (
    <group ref={visibilityRef} name="basketball-root" position={[0, 0, -17]}>
      <Court />
      <ModelErrorBoundary fallback={<PlayerFallback />}>
        <Suspense fallback={null}>
          <BasketballPlayer onHandBone={(bone) => (handBoneRef.current = bone)} />
        </Suspense>
      </ModelErrorBoundary>
      <Ball origin={[0.5, 0, 1.55]} handBoneRef={handBoneRef} />
    </group>
  );
}
