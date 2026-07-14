"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { scrollState } from "@/src/lib/scrollState";
import { sampleStoryboard } from "@/src/experience/camera/storyboard";

export function Lighting() {
  const key = useRef<THREE.DirectionalLight>(null);
  const rim = useRef<THREE.DirectionalLight>(null);
  const ambient = useRef<THREE.AmbientLight>(null);
  const fill = useRef<THREE.PointLight>(null);

  useFrame((_, delta) => {
    const sample = sampleStoryboard(scrollState.progress);

    if (key.current) {
      key.current.color.lerp(sample.keyColor, 0.05);
      key.current.intensity = THREE.MathUtils.damp(
        key.current.intensity,
        sample.keyIntensity,
        3,
        delta,
      );
      key.current.position.set(
        sample.position.x + 4,
        sample.position.y + 6,
        sample.position.z + 4,
      );
    }
    if (rim.current) {
      rim.current.color.lerp(sample.rimColor, 0.05);
      rim.current.intensity = THREE.MathUtils.damp(
        rim.current.intensity,
        sample.rimIntensity,
        3,
        delta,
      );
      rim.current.position.set(sample.target.x - 6, sample.target.y + 2, sample.target.z - 6);
    }
    if (ambient.current) {
      ambient.current.color.lerp(sample.ambientColor, 0.05);
      ambient.current.intensity = THREE.MathUtils.damp(
        ambient.current.intensity,
        sample.ambientIntensity,
        3,
        delta,
      );
    }
    if (fill.current) {
      fill.current.color.lerp(sample.keyColor, 0.05);
      fill.current.position.set(sample.target.x, sample.target.y + 3, sample.target.z + 2);
    }
  });

  return (
    <>
      <ambientLight ref={ambient} intensity={0.5} color="#10182c" />
      <directionalLight ref={key} position={[4, 6, 4]} intensity={1.2} color="#f3d78f" />
      <directionalLight ref={rim} position={[-6, 2, -6]} intensity={0.6} color="#5fd8e8" />
      <pointLight ref={fill} intensity={0.6} distance={18} color="#f3d78f" />
    </>
  );
}
