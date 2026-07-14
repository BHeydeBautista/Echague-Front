"use client";

import { Suspense } from "react";
import { ModelErrorBoundary } from "@/src/experience/scenes/ErrorBoundary";
import { Court } from "./Court";
import { Ball } from "./Ball";
import { VolleyballPlayer } from "./Player";
import { PlayerFallback } from "./PlayerFallback";

export function VolleyballScene() {
  return (
    <group name="volleyball-root" position={[0, 0, -49]}>
      <Court />
      <ModelErrorBoundary fallback={<PlayerFallback />}>
        <Suspense fallback={null}>
          <VolleyballPlayer />
        </Suspense>
      </ModelErrorBoundary>
      <Ball />
    </group>
  );
}
