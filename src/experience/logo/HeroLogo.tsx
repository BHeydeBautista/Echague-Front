"use client";

import { useFrame } from "@react-three/fiber";
import { Float, useTexture } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { scrollState } from "@/src/lib/scrollState";

function pennantShape() {
  const shape = new THREE.Shape();
  shape.moveTo(-1.02, 0.9);
  shape.lineTo(1.02, 0.9);
  shape.quadraticCurveTo(1.1, 0.9, 1.05, 0.78);
  shape.lineTo(0.2, -1.02);
  shape.quadraticCurveTo(0, -1.32, -0.2, -1.02);
  shape.lineTo(-1.05, 0.78);
  shape.quadraticCurveTo(-1.1, 0.9, -1.02, 0.9);
  return shape;
}

function glowSprite() {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(188,216,255,0.55)");
  g.addColorStop(0.5, "rgba(125,147,194,0.2)");
  g.addColorStop(1, "rgba(125,147,194,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

export function HeroLogo() {
  const outer = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const texture = useTexture("/img/logo.png");
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;

  const shape = useMemo(() => pennantShape(), []);
  const glowTex = useMemo(() => glowSprite(), []);

  const plinthGeo = useMemo(
    () =>
      new THREE.ExtrudeGeometry(shape, {
        depth: 0.16,
        bevelEnabled: true,
        bevelThickness: 0.035,
        bevelSize: 0.03,
        bevelSegments: 5,
        curveSegments: 24,
      }),
    [shape],
  );

  const frameGeo = useMemo(
    () =>
      new THREE.ExtrudeGeometry(shape, {
        depth: 0.1,
        bevelEnabled: true,
        bevelThickness: 0.025,
        bevelSize: 0.045,
        bevelSegments: 4,
        curveSegments: 24,
      }),
    [shape],
  );

  useFrame((state, delta) => {
    if (outer.current) {
      outer.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.12) * 0.22 +
        scrollState.pointer.x * 0.18;
      outer.current.rotation.x = scrollState.pointer.y * -0.08;

      // recede + dim as the story moves past the hero, held near the origin
      const heroFocus = THREE.MathUtils.clamp(1 - scrollState.progress * 3.2, 0, 1);
      const targetScale = 0.82 + heroFocus * 0.18;
      outer.current.scale.setScalar(
        THREE.MathUtils.damp(outer.current.scale.x, targetScale, 2.5, delta),
      );
    }
    if (glowRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 0.6) * 0.05;
      glowRef.current.scale.setScalar(3.4 * pulse);
      glowRef.current.lookAt(state.camera.position);
    }
  });

  return (
    <group position={[0, 0.1, 0]}>
      <mesh ref={glowRef} renderOrder={-1}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={glowTex}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <group ref={outer}>
        <Float floatIntensity={0.7} rotationIntensity={0.35} speed={1.4}>
          {/* brand-blue chrome trim, slightly larger, sits behind the navy plinth */}
          <mesh geometry={frameGeo} position={[0, 0, -0.08]} castShadow receiveShadow>
            <meshStandardMaterial
              color="#a9c1e2"
              metalness={0.9}
              roughness={0.25}
              emissive="#2c3f66"
              emissiveIntensity={0.3}
            />
          </mesh>

          {/* dark navy metal plinth */}
          <mesh geometry={plinthGeo} position={[0, 0, -0.04]} castShadow receiveShadow>
            <meshPhysicalMaterial
              color="#0a1120"
              metalness={0.75}
              roughness={0.32}
              clearcoat={0.6}
              clearcoatRoughness={0.25}
            />
          </mesh>

          {/* crisp flat crest, self-illuminated so it reads clearly regardless of scene lighting.
              z must clear the plinth's beveled front face (depth 0.16 + bevelThickness 0.035
              starting at z=-0.04 => front face ~0.155) or the crest gets occluded. */}
          <mesh position={[0, 0, 0.24]}>
            <planeGeometry args={[1.92, 1.92]} />
            <meshBasicMaterial map={texture} transparent alphaTest={0.05} toneMapped={false} />
          </mesh>
        </Float>
      </group>
    </group>
  );
}
