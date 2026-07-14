"use client";

import { Suspense } from "react";
import { ModelErrorBoundary } from "@/src/experience/scenes/ErrorBoundary";
import { Court } from "./Court";
import { Ball } from "./Ball";
import { BasketballPlayer } from "./Player";
import { PlayerFallback } from "./PlayerFallback";

export function BasketballScene() {
  return (
    <group name="basketball-root" position={[0, 0, -17]}>
      <Court />
      <ModelErrorBoundary fallback={<PlayerFallback />}>
        <Suspense fallback={null}>
          <BasketballPlayer />
        </Suspense>
      </ModelErrorBoundary>
      <Ball origin={[0.5, 0, 1.55]} />
    </group>
  );
}
