import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Color } from "three";
import { simulationClock } from "../simulation/simulationClock";
import { spinAngle } from "../simulation/orbits";
import { getConceptRockShapes } from "./rockGeometry";

// A selectable asteroid. Looks like its neighbours (slightly larger, slightly
// brighter stony albedo) so the belt stays natural; the highlight on hover or
// selection is what sets it apart.
export const ConceptAsteroid = ({ body, highlighted }) => {
  const rock = useRef();
  const shapes = getConceptRockShapes();
  const shape = useMemo(() => shapes[[...body.id].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % shapes.length], [body.id, shapes]);
  const tint = useMemo(() => new Color(body.tint), [body.tint]);

  useFrame(() => {
    rock.current.rotation.y = spinAngle(body.spin, simulationClock.time);
  });

  return (
    <group rotation={[body.spin.axialTilt, 0, 0]}>
      {/* Shared geometry: dispose={null} keeps R3F from disposing it on unmount. */}
      <mesh ref={rock} geometry={shape} scale={[body.radius * 1.2, body.radius * 0.85, body.radius]} dispose={null}>
        <meshStandardMaterial color="#9b8a72" roughness={0.92} metalness={0.05} flatShading
          emissive={tint} emissiveIntensity={highlighted ? 0.35 : 0} />
      </mesh>
    </group>
  );
};
