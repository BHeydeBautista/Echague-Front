"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { scrollState } from "@/src/lib/scrollState";
import { sampleStoryboard } from "./storyboard";

const lookTarget = new THREE.Vector3();
const desiredPos = new THREE.Vector3();
const parallax = new THREE.Vector3();

export function CameraRig() {
  const { camera, scene } = useThree();
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

    // gentle idle float + mouse parallax layered on top of the storyboard position
    const idleX = Math.sin(time * 0.18) * 0.12;
    const idleY = Math.cos(time * 0.22) * 0.08;
    parallax.set(
      scrollState.pointer.x * 0.35 + idleX,
      scrollState.pointer.y * 0.18 + idleY,
      0,
    );

    desiredPos.copy(sample.position).add(parallax);
    camera.position.lerp(desiredPos, 1 - Math.pow(0.001, delta));

    lookTarget.copy(sample.target);
    lookTarget.x += scrollState.pointer.x * 0.15;
    lookTarget.y += scrollState.pointer.y * 0.08;

    const currentLook = camera.userData.lookAt ?? lookTarget.clone();
    currentLook.lerp(lookTarget, 1 - Math.pow(0.0005, delta));
    camera.userData.lookAt = currentLook;
    camera.lookAt(currentLook);

    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = THREE.MathUtils.damp(camera.fov, sample.fov, 3, delta);
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
