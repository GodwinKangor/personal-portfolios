import { IcosahedronGeometry, Vector3 } from "three";
import { createNoise3D, fbm } from "../textures/noise";

/**
 * Irregular rock: an icosphere whose vertices are pushed in or out by 3D
 * noise sampled at their own position. Because the displacement depends only
 * on position, vertices shared by neighbouring faces move identically and
 * the surface never cracks open. The geometry is non-indexed, so normals come
 * out per-face, giving the faceted look of real small bodies.
 */
export const createRockGeometry = (seed, detail = 1) => {
  const geometry = new IcosahedronGeometry(1, detail);
  const noise = createNoise3D(seed);
  const position = geometry.attributes.position;
  const v = new Vector3();
  for (let i = 0; i < position.count; i += 1) {
    v.fromBufferAttribute(position, i);
    const n = fbm(noise, v.x * 1.4 + seed, v.y * 1.4, v.z * 1.4, 3);
    v.multiplyScalar(0.62 + n * 0.75);
    position.setXYZ(i, v.x, v.y, v.z);
  }
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
};

// Shared, higher-detail shapes for the few selectable asteroids. Created on
// first use and kept for the page's lifetime (a few KB each).
let conceptShapes = null;
export const getConceptRockShapes = () => {
  if (!conceptShapes) conceptShapes = [301, 307, 311, 313].map((seed) => createRockGeometry(seed, 2));
  return conceptShapes;
};
