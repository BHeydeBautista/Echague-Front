import * as THREE from "three";

/** Uniformly scales + grounds an arbitrary imported model so it stands
 * `targetHeight` units tall with its feet at y=0 and centered on x/z.
 *
 * Idempotent by design: React's dev-mode StrictMode double-invokes effects,
 * and this runs from one. Re-measuring an already-normalized object would
 * compute a fresh scale relative to its *current* (already shrunk) size —
 * collapsing back toward scale 1 and undoing the first pass entirely. */
export function normalizeAndGround(object: THREE.Object3D, targetHeight = 1.8) {
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
  const localMin = toLocal(box2.min.clone());

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
