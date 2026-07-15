"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { CameraRig } from "@/src/experience/camera/CameraRig";
import { Lighting } from "@/src/experience/lighting/Lighting";
import { Particles } from "@/src/experience/canvas/Particles";
import { PostFX } from "@/src/experience/postprocessing/PostFX";
import { HeroLogo } from "@/src/experience/logo/HeroLogo";
import { BasketballScene } from "@/src/experience/scenes/basketball/BasketballScene";
import { SwimmingScene } from "@/src/experience/scenes/swimming/SwimmingScene";
import { VolleyballScene } from "@/src/experience/scenes/volleyball/VolleyballScene";
import { useIsTouchDevice } from "@/src/lib/useIsTouchDevice";

export function Experience() {
  // Phones render the same scene at a much higher device pixel ratio for
  // comparatively far less GPU, so cap resolution lower there to keep
  // frame time stable rather than let the browser silently start dropping
  // frames on the very devices this pass is meant to make feel premium.
  const isTouch = useIsTouchDevice();
  const dpr: [number, number] = isTouch ? [1, 1.5] : [1, 1.75];

  return (
    // Deliberately z-0 (not negative): a negative z-index on a fixed,
    // fullscreen WebGL canvas can be dropped by the compositor in some
    // Chromium builds, rendering internally but never painting to screen.
    // Layer via DOM order + a higher z-index on the content instead.
    <div className="pointer-events-none fixed inset-0 z-0">
      <Canvas
        shadows
        dpr={dpr}
        gl={{ antialias: false, powerPreference: "high-performance" }}
        camera={{ position: [0, 0.3, 7.6], fov: 38, near: 0.1, far: 130 }}
      >
        <color attach="background" args={["#04060b"]} />
        <CameraRig />
        <Lighting />
        <Suspense fallback={null}>
          <HeroLogo />
          <BasketballScene />
          <SwimmingScene />
          <VolleyballScene />
        </Suspense>
        <Particles />
        <PostFX mobile={isTouch} />
      </Canvas>
    </div>
  );
}
