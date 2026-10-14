import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { DoubleSide } from "three";
import { simulationClock } from "../simulation/simulationClock";
import { spinAngle } from "../simulation/orbits";

// A small artificial satellite: foil-wrapped bus with two solar panels.
// Built at unit size and scaled to the body's radius.
export const Spacecraft = ({ body, highlighted }) => {
  const craft = useRef();
  useFrame(() => {
    craft.current.rotation.y = spinAngle(body.spin, simulationClock.time);
  });
  const s = body.radius;
  return (
    <group rotation={[body.spin.axialTilt, 0, 0]}>
      <group ref={craft} scale={s}>
        <mesh>
          <boxGeometry args={[1, 0.8, 0.8]} />
          <meshStandardMaterial color="#c9a24a" metalness={0.85} roughness={0.35}
            emissive={body.tint} emissiveIntensity={highlighted ? 0.25 : 0} />
        </mesh>
        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * 1.9, 0, 0]}>
            <boxGeometry args={[2.4, 0.04, 0.9]} />
            <meshStandardMaterial color="#1c2a4a" metalness={0.6} roughness={0.3} side={DoubleSide} />
          </mesh>
        ))}
      </group>
    </group>
  );
};
