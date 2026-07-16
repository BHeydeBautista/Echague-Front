"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function makeCausticTexture() {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, size, size);
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < 70; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 12 + Math.random() * 50;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, "rgba(175,228,255,0.75)");
    g.addColorStop(1, "rgba(175,228,255,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * 0.6, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  return tex;
}

/** Floor with painted lane lines running parallel to the swimmer's
 * left-right travel — the single strongest, most immediate "this is a
 * swimming pool" visual cue. */
function makeFloorTexture() {
  const w = 640;
  const h = 512;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  const base = ctx.createLinearGradient(0, 0, 0, h);
  base.addColorStop(0, "#0c3552");
  base.addColorStop(1, "#031722");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = "#04212f";
  ctx.lineWidth = 22;
  for (const y of [h * 0.2, h * 0.4, h * 0.6, h * 0.8]) {
    ctx.beginPath();
    ctx.setLineDash([34, 22]);
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  ctx.setLineDash([]);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const RIPPLE_SEGMENTS = 48;
const POOL_WIDTH = 22;
const POOL_LENGTH = 16;
const FLOOR_Y = -2.2;
// Exported so the swimmer can be placed right at this rippling surface
// instead of down near the floor.
export const WATER_Y = 1.3;

/** A deliberately simple pool: floor + lane lines + drifting caustics +
 * a matte water surface. No side walls — those only ever showed up as an
 * unwanted slab bleeding into whichever scene came next; fog now does the
 * job of closing off the space, and per-scene visibility keeps this whole
 * group hidden outside the swimming section anyway. */
export function Pool() {
  const causticRef1 = useRef<THREE.Mesh>(null);
  const causticRef2 = useRef<THREE.Mesh>(null);
  const caustic1 = useMemo(() => makeCausticTexture(), []);
  const caustic2 = useMemo(() => makeCausticTexture(), []);
  const floorTex = useMemo(() => makeFloorTexture(), []);

  const geometry = useMemo(
    () => new THREE.PlaneGeometry(POOL_WIDTH, POOL_LENGTH, RIPPLE_SEGMENTS, RIPPLE_SEGMENTS),
    [],
  );
  const basePositions = useMemo(
    () => Float32Array.from(geometry.attributes.position.array),
    [geometry],
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const pos = geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < pos.length; i += 3) {
      const x = basePositions[i];
      const y = basePositions[i + 1];
      pos[i + 2] =
        Math.sin(x * 0.35 + t * 0.9) * 0.12 + Math.cos(y * 0.28 + t * 0.7) * 0.1;
    }
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();

    if (causticRef1.current) {
      const m = causticRef1.current.material as THREE.MeshBasicMaterial;
      m.map!.offset.set(t * 0.015, t * 0.01);
    }
    if (causticRef2.current) {
      const m = causticRef2.current.material as THREE.MeshBasicMaterial;
      m.map!.offset.set(-t * 0.011, t * 0.017);
    }
  });

  return (
    <group>
      {/* deep-water backdrop: closes off the far end of the pool so there's
          never open void (or the global starfield) visible past the floor —
          just water fading to black, like real underwater visibility. */}
      <mesh position={[0, 0, -POOL_LENGTH / 2 - 2]}>
        <planeGeometry args={[POOL_WIDTH + 20, 24]} />
        <meshBasicMaterial color="#03121f" fog={false} />
      </mesh>

      {/* floor, painted with lane lines — reads as a pool at a glance */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, FLOOR_Y, 0]} receiveShadow>
        <planeGeometry args={[POOL_WIDTH, POOL_LENGTH]} />
        <meshStandardMaterial map={floorTex} roughness={0.75} metalness={0.1} />
      </mesh>
      <mesh ref={causticRef1} rotation={[-Math.PI / 2, 0, 0]} position={[0, FLOOR_Y + 0.02, 0]}>
        <planeGeometry args={[POOL_WIDTH, POOL_LENGTH]} />
        <meshBasicMaterial
          map={caustic1}
          transparent
          opacity={0.7}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh ref={causticRef2} rotation={[-Math.PI / 2, 0, 0]} position={[0, FLOOR_Y + 0.03, 0]}>
        <planeGeometry args={[POOL_WIDTH, POOL_LENGTH]} />
        <meshBasicMaterial
          map={caustic2}
          transparent
          opacity={0.5}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* rippling water surface, lit from above like real sunlit water seen
          from underneath — brighter + slightly emissive rather than a flat
          dark sheet, so it reads unmistakably as "the surface" from below */}
      <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} position={[0, WATER_Y, 0]}>
        {/* Plain standard material, not physical/transmission — a
            low-roughness transmissive surface caught the key light as a
            razor-sharp mirror-like specular point, which mip-mapped bloom
            then blew up into a giant lens-flare blob whenever the camera
            looked anywhere near that reflection angle. A soft, matte-ish
            surface can't produce that hotspot. */}
        <meshStandardMaterial
          color="#2870a0"
          emissive="#124568"
          emissiveIntensity={0.16}
          roughness={0.75}
          metalness={0}
          transparent
          opacity={0.82}
        />
      </mesh>
    </group>
  );
}
