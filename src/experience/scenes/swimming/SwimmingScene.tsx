"use client";

import { Suspense } from "react";
import { ModelErrorBoundary } from "@/src/experience/scenes/ErrorBoundary";
import { Pool } from "./Pool";
import { Bubbles } from "./Bubbles";
import { Swimmer } from "./Swimmer";
import { SwimmerFallback } from "./SwimmerFallback";

export function SwimmingScene() {
  return (
    <group name="swimming-root" position={[0, -1.4, -34]}>
      <Pool />
      <Bubbles />
      <ModelErrorBoundary fallback={<SwimmerFallback />}>
        <Suspense fallback={null}>
          <Swimmer />
        </Suspense>
      </ModelErrorBoundary>
    </group>
  );
}
