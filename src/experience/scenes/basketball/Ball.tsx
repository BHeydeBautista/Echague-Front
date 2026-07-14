"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";

function makeBallTexture() {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#b3582c";
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = "#1a0f08";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(size / 2, 0);
  ctx.lineTo(size / 2, size);
  ctx.moveTo(0, size / 2);
  ctx.lineTo(size, size / 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(size / 2, size / 2, size * 0.48, size * 0.18, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(size / 2, size / 2, size * 0.18, size * 0.48, 0, 0, Math.PI * 2);
  ctx.stroke();
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

const worldPos = new THREE.Vector3();

interface Props {
  origin?: [number, number, number];
  speed?: number;
  /** When the real athlete's rig exposes a hand bone, the ball tracks it
   * directly each frame instead of bouncing independently — reads as an
   * actual dribble rather than two unrelated floating props. */
  handBoneRef?: RefObject<THREE.Object3D | null>;
}

/** A procedurally bounced basketball prop — used alongside both the real
 * animated athlete and the symbolic fallback so the sport always reads. */
export function Ball({ origin = [0.55, 0, 1.6], speed = 1, handBoneRef }: Props) {
  const ref = useRef<THREE.Mesh>(null);
  const texture = useMemo(() => makeBallTexture(), []);

  useFrame((state) => {
    if (!ref.current) return;
    const hand = handBoneRef?.current;

    if (hand && ref.current.parent) {
      hand.getWorldPosition(worldPos);
      ref.current.parent.worldToLocal(worldPos);
      // sit just under the palm — the hand's own animated rise/fall through
      // the dribble cycle already supplies the bounce, so the offset stays
      // small and vertical-only (a lateral offset would sometimes point
      // "behind" the hand as the arm rotates through the swing).
      ref.current.position.set(worldPos.x, worldPos.y - 0.13, worldPos.z);
    } else {
      const t = state.clock.elapsedTime * speed;
      const bounce = Math.abs(Math.sin(t * 1.8));
      ref.current.position.set(
        origin[0] + Math.sin(t * 0.6) * 0.25,
        origin[1] + bounce * 0.55 + 0.12,
        origin[2],
      );
    }
    ref.current.rotation.x += 0.05;
    ref.current.rotation.z += 0.03;
  });

  return (
    <mesh ref={ref} castShadow>
      <sphereGeometry args={[0.13, 24, 24]} />
      <meshStandardMaterial map={texture} roughness={0.55} metalness={0.05} />
    </mesh>
  );
}
