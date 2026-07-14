"use client";

import { Suspense, useRef } from "react";
import * as THREE from "three";
import { ModelErrorBoundary } from "@/src/experience/scenes/ErrorBoundary";
import { useSceneVisibility } from "@/src/experience/scenes/useSceneVisibility";
import { Court } from "./Court";
import { Ball } from "./Ball";
import { VolleyballPlayer } from "./Player";
import { PlayerFallback } from "./PlayerFallback";

export function VolleyballScene() {
  const handBoneRef = useRef<THREE.Object3D | null>(null);
  const visibilityRef = useSceneVisibility("volleyball");

  return (
    <group ref={visibilityRef} name="volleyball-root" position={[0, 0, -49]}>
      <Court />
      <ModelErrorBoundary fallback={<PlayerFallback />}>
        <Suspense fallback={null}>
          <VolleyballPlayer onHandBone={(bone) => (handBoneRef.current = bone)} />
        </Suspense>
      </ModelErrorBoundary>
      <Ball handBoneRef={handBoneRef} />
    </group>
  );
}
