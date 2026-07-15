"use client";

import {
  Bloom,
  EffectComposer,
  Vignette,
  Noise,
  ChromaticAberration,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { scrollState } from "@/src/lib/scrollState";

interface Props {
  mobile?: boolean;
}

export function PostFX({ mobile = false }: Props) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const caRef = useRef<any>(null);

  useFrame(() => {
    if (caRef.current) {
      const amount = Math.min(Math.abs(scrollState.velocity) * 0.0009, 0.0035);
      caRef.current.offset.set(amount, amount * 0.6);
    }
  });

  return (
    <EffectComposer multisampling={mobile ? 0 : 4}>
      <Bloom
        intensity={0.85}
        luminanceThreshold={0.28}
        luminanceSmoothing={0.35}
        mipmapBlur={!mobile}
        radius={0.8}
      />
      <ChromaticAberration ref={caRef} blendFunction={BlendFunction.NORMAL} />
      <Vignette eskil={false} offset={0.22} darkness={0.85} />
      <Noise opacity={0.02} blendFunction={BlendFunction.OVERLAY} />
    </EffectComposer>
  );
}
