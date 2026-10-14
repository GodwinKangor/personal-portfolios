import { useEffect, useMemo } from "react";
import { BufferGeometry } from "three";
import { orbitPathPoints } from "../simulation/orbits";

// Faint guide line along a body's orbit; brightens in the body's tint when
// it is selected or on the selected branch. `faint` is for moon and satellite orbits.
export const OrbitPath = ({ orbit, color, highlighted, faint = false }) => {
  const geometry = useMemo(() => new BufferGeometry().setFromPoints(orbitPathPoints(orbit)), [orbit]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <lineLoop geometry={geometry}>
      <lineBasicMaterial color={highlighted ? color : "#9fb3d1"} transparent opacity={highlighted ? 0.5 : faint ? 0.1 : 0.14} depthWrite={false} />
    </lineLoop>
  );
};
