"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";

function makeVolleyballTexture() {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#f2ece0";
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = "#7d93c2";
  ctx.lineWidth = 8;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.ellipse(size / 2, size / 2, size * 0.5, size * (0.12 + i * 0.12), (i * Math.PI) / 3, 0, Math.PI * 2);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const CYCLE = 4.2;
const worldPos = new THREE.Vector3();

interface Props {
  /** When the real athlete's rig exposes a hitting-hand bone, the ball
   * tracks it directly through the whole jump instead of running on an
   * unrelated fixed timer — guarantees contact always reads as synchronized. */
  handBoneRef?: RefObject<THREE.Object3D | null>;
}

/** A looping spike trajectory (rise, arc, smash) used only as a fallback
 * when the real rig's hand bone isn't available. */
export function Ball({ handBoneRef }: Props = {}) {
  const ref = useRef<THREE.Mesh>(null);
  const texture = useMemo(() => makeVolleyballTexture(), []);

  useFrame((state) => {
    if (!ref.current) return;
    const hand = handBoneRef?.current;

    if (hand && ref.current.parent) {
      hand.getWorldPosition(worldPos);
      ref.current.parent.worldToLocal(worldPos);
      // rest just above/in front of the hitting hand, as if palmed for the hit
      ref.current.position.set(worldPos.x, worldPos.y + 0.12, worldPos.z + 0.08);
    } else {
      const t = (state.clock.elapsedTime % CYCLE) / CYCLE;
      const up = Math.sin(Math.PI * Math.min(t / 0.55, 1)) * 2.6;
      const across = THREE.MathUtils.lerp(0.9, -2.4, THREE.MathUtils.smoothstep(t, 0.25, 0.85));
      const depth = THREE.MathUtils.lerp(0.6, -1.6, THREE.MathUtils.smoothstep(t, 0.4, 0.9));
      ref.current.position.set(across, 1.1 + up, depth);
    }
    ref.current.rotation.x += 0.15;
    ref.current.rotation.y += 0.1;
  });

  return (
    <mesh ref={ref} castShadow>
      <sphereGeometry args={[0.11, 24, 24]} />
      <meshStandardMaterial map={texture} roughness={0.6} />
    </mesh>
  );
}
