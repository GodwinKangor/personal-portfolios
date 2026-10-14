import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3 } from "three";

/**
 * Invisible sphere that receives pointer events for a body. Its radius is
 * the larger of a multiple of the body's radius and a minimum on-screen size
 * in pixels, so small planets stay easy to hover in the miniature while the
 * target shrinks back to the body itself as the camera moves closer (letting
 * nearby moons become reachable).
 */
export const HitTarget = ({ radius, factor = 1.25, minPixels = 0, handlers }) => {
  const mesh = useRef();
  const worldPosition = useMemo(() => new Vector3(), []);

  useFrame(({ camera, size }) => {
    let r = radius * factor;
    if (minPixels > 0) {
      mesh.current.getWorldPosition(worldPosition);
      const distance = worldPosition.distanceTo(camera.position);
      // World-space height of one screen pixel at that distance for a
      // perspective camera: 2 · d · tan(fov / 2) / viewport height.
      const worldPerPixel = (2 * distance * Math.tan((camera.fov * Math.PI) / 360)) / size.height;
      r = Math.max(r, minPixels * worldPerPixel);
    }
    mesh.current.scale.setScalar(r);
  });

  return (
    <mesh ref={mesh} {...handlers}>
      <sphereGeometry args={[1, 16, 12]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
    </mesh>
  );
};
