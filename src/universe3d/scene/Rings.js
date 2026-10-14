import { useEffect, useMemo } from "react";
import { DoubleSide, RingGeometry, Vector3 } from "three";
import { getRingTexture } from "../textures/planetTextures";

/**
 * Planetary rings in the planet's equatorial plane. RingGeometry ships with
 * planar UVs; we rewrite u to run from the inner edge (0) to the outer edge
 * (1) so a 1-pixel-tall radial strip texture wraps around as concentric bands.
 */
const createRingGeometry = (innerRadius, outerRadius) => {
  const geometry = new RingGeometry(innerRadius, outerRadius, 160, 1);
  const position = geometry.attributes.position;
  const uv = geometry.attributes.uv;
  const v = new Vector3();
  for (let i = 0; i < position.count; i += 1) {
    v.fromBufferAttribute(position, i);
    uv.setXY(i, (v.length() - innerRadius) / (outerRadius - innerRadius), 0.5);
  }
  return geometry;
};

export const Rings = ({ radius, inner, outer }) => {
  const geometry = useMemo(() => createRingGeometry(radius * inner, radius * outer), [radius, inner, outer]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  const texture = getRingTexture();

  return (
    // RingGeometry lies in XY; rotate it flat into the equatorial XZ plane.
    <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]}>
      {/* A faint emissive floor keeps the rings readable when the star lights them edge-on. */}
      <meshStandardMaterial map={texture} emissiveMap={texture} emissive="#ffffff" emissiveIntensity={0.08}
        transparent side={DoubleSide} depthWrite={false} roughness={0.9} metalness={0} />
    </mesh>
  );
};
