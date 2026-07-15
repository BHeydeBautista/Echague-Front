"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { scrollState } from "@/src/lib/scrollState";
import { sampleStoryboard } from "./storyboard";

const lookTarget = new THREE.Vector3();
const desiredPos = new THREE.Vector3();
const parallax = new THREE.Vector3();
const dolly = new THREE.Vector3();

// The storyboard's positions/targets/fov were hand-tuned while looking at a
// landscape-ish aspect. On a portrait phone the same vertical fov produces a
// much narrower *horizontal* frustum (horizontal fov shrinks with aspect),
// so subjects that were nicely framed on desktop end up cropped or pushed
// off to one side. Rather than author a whole second set of keyframes, we
// dolly the camera back from the storyboard's target (and add a modest fov
// boost) as aspect drops below this reference — same story, same framing
// intent, just pulled back enough to fit a narrower frame.
const REFERENCE_ASPECT = 1.65;
const MAX_DOLLY = 1.22;
const MAX_FOV_BOOST = 9;

export function CameraRig() {
  const { camera, scene, size } = useThree();
  const smoothed = useRef({ progress: 0 });

  useFrame((state, delta) => {
    // critically damped smoothing so fast scroll jumps stay cinematic
    smoothed.current.progress = THREE.MathUtils.damp(
      smoothed.current.progress,
      scrollState.progress,
      4.2,
      delta,
    );
    scrollState.smoothedProgress = smoothed.current.progress;

    const sample = sampleStoryboard(smoothed.current.progress);
    const time = state.clock.elapsedTime;

    const aspect = size.width / size.height;
    const narrowness = THREE.MathUtils.clamp(REFERENCE_ASPECT / Math.max(aspect, 0.01), 1, MAX_DOLLY);
    const fovBoost = THREE.MathUtils.clamp((narrowness - 1) * 6, 0, MAX_FOV_BOOST);

    dolly.copy(sample.position).sub(sample.target).multiplyScalar(narrowness);

    // gentle idle float + mouse parallax layered on top of the storyboard
    // position — scaled down as we dolly back so it stays subtle rather
    // than exaggerated once the camera (and its apparent field) is wider.
    const idleX = Math.sin(time * 0.18) * 0.12;
    const idleY = Math.cos(time * 0.22) * 0.08;
    parallax.set(
      scrollState.pointer.x * 0.35 + idleX,
      scrollState.pointer.y * 0.18 + idleY,
      0,
    ).divideScalar(narrowness);

    desiredPos.copy(sample.target).add(dolly).add(parallax);
    camera.position.lerp(desiredPos, 1 - Math.pow(0.001, delta));

    lookTarget.copy(sample.target);
    lookTarget.x += scrollState.pointer.x * 0.15;
    lookTarget.y += scrollState.pointer.y * 0.08;

    const currentLook = camera.userData.lookAt ?? lookTarget.clone();
    currentLook.lerp(lookTarget, 1 - Math.pow(0.0005, delta));
    camera.userData.lookAt = currentLook;
    camera.lookAt(currentLook);

    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = THREE.MathUtils.damp(camera.fov, sample.fov + fovBoost, 3, delta);
      camera.updateProjectionMatrix();
    }

    if (!scene.fog) {
      scene.fog = new THREE.Fog(sample.fogColor, sample.fogNear, sample.fogFar);
    } else if (scene.fog instanceof THREE.Fog) {
      scene.fog.color.lerp(sample.fogColor, 0.06);
      scene.fog.near = THREE.MathUtils.damp(scene.fog.near, sample.fogNear, 3, delta);
      scene.fog.far = THREE.MathUtils.damp(scene.fog.far, sample.fogFar, 3, delta);
    }
  });

  return null;
}
