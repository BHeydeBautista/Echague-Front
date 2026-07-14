import * as THREE from "three";

/** Plays `clip` on a throwaway mixer and samples the object's world bounding
 * box at intervals across its full duration, returning the lowest y ever
 * reached. A single-frame snapshot (whatever pose happens to be active at
 * mount) is unreliable for animations with large vertical travel — a spike
 * jump's crouch/launch/land cycle — so grounding needs the true worst case,
 * not just frame 0. The mixer is fully released afterward so the real
 * mixer (from useAnimations) can bind the object cleanly. */
function sampleMinYOverClip(object: THREE.Object3D, clip: THREE.AnimationClip, samples = 24) {
  const mixer = new THREE.AnimationMixer(object);
  const action = mixer.clipAction(clip);
  action.play();

  let minY = Infinity;
  const box = new THREE.Box3();
  for (let i = 0; i <= samples; i++) {
    mixer.setTime((clip.duration * i) / samples);
    object.updateWorldMatrix(true, true);
    box.setFromObject(object);
    if (box.min.y < minY) minY = box.min.y;
  }

  mixer.stopAllAction();
  mixer.uncacheRoot(object);
  return minY;
}

/** Uniformly scales + grounds an arbitrary imported model so it stands
 * `targetHeight` units tall with its feet at y=0 and centered on x/z.
 *
 * Pass `clip` for animations with significant vertical travel (jumps) so
 * grounding is based on the lowest point across the whole cycle rather than
 * whatever pose happens to be active at mount — otherwise the athlete
 * visibly floats or sinks through the floor depending on animation phase.
 *
 * Idempotent by design: React's dev-mode StrictMode double-invokes effects,
 * and this runs from one. Re-measuring an already-normalized object would
 * compute a fresh scale relative to its *current* (already shrunk) size —
 * collapsing back toward scale 1 and undoing the first pass entirely. */
export function normalizeAndGround(
  object: THREE.Object3D,
  targetHeight = 1.8,
  clip?: THREE.AnimationClip,
) {
  if (object.userData.normalized) return object.userData.normalizedScale as number;

  const parent = object.parent;
  // Box3.setFromObject measures in WORLD space, but object.position is
  // interpreted in the PARENT's local space — subtracting a world-space
  // center directly from position double-counts the parent's own offset
  // (and any rotation on `object` itself). Route every measurement through
  // worldToLocal so the correction lands in the same space as `position`.
  const toLocal = (v: THREE.Vector3) => (parent ? parent.worldToLocal(v.clone()) : v.clone());

  object.updateWorldMatrix(true, true);
  const box = new THREE.Box3().setFromObject(object);
  const size = new THREE.Vector3();
  box.getSize(size);
  const scale = size.y > 0 ? targetHeight / size.y : 1;
  object.scale.setScalar(scale);

  object.updateWorldMatrix(true, true);
  const box2 = new THREE.Box3().setFromObject(object);
  const localCenter = toLocal(box2.getCenter(new THREE.Vector3()));

  const minYWorld = clip ? Math.min(box2.min.y, sampleMinYOverClip(object, clip)) : box2.min.y;
  const minPoint = box2.min.clone();
  minPoint.y = minYWorld;
  const localMin = toLocal(minPoint);

  object.position.x -= localCenter.x;
  object.position.z -= localCenter.z;
  object.position.y -= localMin.y;

  object.userData.normalized = true;
  object.userData.normalizedScale = scale;

  return scale;
}

/** Replaces every mesh's material in the hierarchy with a single shared,
 * stylized material — sidesteps missing/broken source textures and keeps
 * every imported athlete on the same premium "matte statue" art direction. */
export function applyStylizedMaterial(object: THREE.Object3D, material: THREE.Material) {
  object.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (mesh.isMesh) {
      mesh.material = material;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.frustumCulled = false;
    }
  });
}
