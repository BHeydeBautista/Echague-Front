"use client";

import { useGLTF, useAnimations } from "@react-three/drei";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { SkeletonUtils } from "three-stdlib";
import { normalizeAndGround, applyStylizedMaterial } from "@/src/lib/three-helpers";

const athleteMaterial = new THREE.MeshStandardMaterial({
  color: "#c3d4ef",
  metalness: 0.32,
  roughness: 0.42,
  emissive: "#2c3f66",
  emissiveIntensity: 0.2,
});

interface Props {
  /** Called once the skeleton is ready, with the hitting wrist's bone (or
   * null if this rig doesn't expose one) — lets the ball track it directly
   * through the jump instead of running on an unrelated fixed timer. */
  onHandBone?: (bone: THREE.Object3D | null) => void;
}

export function VolleyballPlayer({ onHandBone }: Props) {
  const gltf = useGLTF("/models/volleyball_spike.glb");
  const cloned = useMemo(() => SkeletonUtils.clone(gltf.scene), [gltf.scene]);
  const group = useRef<THREE.Object3D>(null);
  const { actions, names } = useAnimations(gltf.animations, group);

  // useLayoutEffect (not useEffect) is the actual fix here, not a stylistic
  // choice: a plain effect runs *after* the browser paints, so there is a
  // real window — invisible on a fast desktop reload, but stretched to
  // several visible frames on a slow/cold mobile load — where R3F's own
  // render loop (which ticks independently of React's commit/effect
  // timing) draws this primitive at the GLB's raw, un-normalized scale
  // before this callback ever runs and corrects it. useLayoutEffect runs
  // synchronously right after the object is attached to the scene graph
  // and strictly before the next paint, so the very first frame R3F ever
  // draws already has the correct scale — regardless of how slow or fast
  // the device/network is, and identically whether this is the first-ever
  // load or a refresh.
  useLayoutEffect(() => {
    // This rig's single clip is a full jump — crouch, launch, hit, land —
    // so grounding must be based on the lowest point across the whole
    // cycle, not whichever pose happens to be active at mount.
    //
    // 2.85 is not a literal "person's height": this GLB's bind-pose bounding
    // box (what normalizeAndGround scales against) reads much taller than
    // the character's actual idle silhouette, so a literal ~1.9 left the
    // athlete looking tiny next to the net — a scale mismatch confirmed by
    // sampling the rig's true per-frame world-space height during playback
    // (via a temporary diagnostic), which showed the idle stance rendering
    // at a fraction of the requested height. This value was tuned up until
    // the on-screen presence matched the basketball/swimming scenes.
    normalizeAndGround(cloned, 2.85, gltf.animations[0]);
    applyStylizedMaterial(cloned, athleteMaterial);
    const hand =
      cloned.getObjectByName("Bony_rWristJ_0120") ??
      cloned.getObjectByName("Bony_lWristJ_01") ??
      null;
    onHandBone?.(hand);
  }, [cloned, gltf, onHandBone]);

  useEffect(() => {
    const name = names[0];
    const action = name ? actions[name] : null;
    action?.reset().setLoop(THREE.LoopRepeat, Infinity).fadeIn(0.4).play();
    return () => {
      action?.fadeOut(0.3);
    };
  }, [actions, names]);

  // normalizeAndGround re-centers `cloned` on its own bind-pose bounding-box
  // center, which overwrites whatever position we hand the primitive here —
  // so placement in the scene has to happen on a wrapping group that
  // normalizeAndGround never touches. [-1.87, 0, 1.43] was measured (via a
  // temporary diagnostic) to be the offset that lands the re-centered rig
  // at local (0.4, _, 0.6), matching the rest of the scene.
  return (
    <group position={[-1.87, 0, 1.43]}>
      <primitive ref={group} object={cloned} rotation={[0, Math.PI * 0.85, 0]} />
    </group>
  );
}

useGLTF.preload("/models/volleyball_spike.glb");
