"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { scrollState, type SectionId } from "@/src/lib/scrollState";
import { SECTION_BOUNDS } from "@/src/lib/sections";

/** Hides a scene's root group whenever its section isn't the one the camera
 * is currently in (plus a small padding so it doesn't pop in/out exactly at
 * the boundary). Models stay mounted — only `visible` toggles — so
 * animations, loaded textures and skeletons are never torn down mid-scroll;
 * three.js simply skips rendering the subtree while it's hidden. This is
 * what actually stops one sport's court/pool/net from being visible in the
 * background of another, rather than trying to tune fog distances per pair
 * of neighboring sections. */
export function useSceneVisibility(id: SectionId, padding = 0.015) {
  const ref = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!ref.current) return;
    const p = scrollState.smoothedProgress;
    const { start, end } = SECTION_BOUNDS[id];
    ref.current.visible = p >= start - padding && p <= end + padding;
  });

  return ref;
}
