"use client";

import { useSceneVisibility } from "@/src/experience/scenes/useSceneVisibility";
import { Pool } from "./Pool";
import { Bubbles } from "./Bubbles";
import { Swimmer } from "./Swimmer";

export function SwimmingScene() {
  const visibilityRef = useSceneVisibility("swimming");

  return (
    <group ref={visibilityRef} name="swimming-root" position={[0, -1.4, -34]}>
      <Pool />
      <Bubbles />
      <Swimmer />
    </group>
  );
}
