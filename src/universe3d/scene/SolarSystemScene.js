import { useEffect, useMemo, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { advanceSimulation } from "../simulation/simulationClock";
import { ancestryOf } from "../simulation/hierarchy";
import { Starfield } from "./Starfield";
import { CameraRig } from "./CameraRig";
import { BodyNode } from "./BodyNode";

// Pointer travel (px) beyond which a press counts as a camera drag, not a click.
const CLICK_TOLERANCE = 5;

// Advances the shared clock once per rendered frame. Priority −1 runs it
// before every body reads the time, so all bodies see the same instant.
const SimulationDriver = () => {
  useFrame((_, delta) => advanceSimulation(delta), -1);
  return null;
};

export const SolarSystemScene = ({ system, expanded, selectedId, onSelect, resetToken, canHover }) => {
  const [hoveredId, setHoveredId] = useState(null);
  const gl = useThree((s) => s.gl);

  useEffect(() => {
    gl.domElement.style.cursor = hoveredId ? "pointer" : "";
  }, [hoveredId, gl]);

  // R3F pointer events raycast against current world transforms on every
  // event, so selection stays accurate while bodies are moving.
  const handlersFor = useMemo(() => {
    const cache = new Map();
    return (id) => {
      if (!cache.has(id)) {
        cache.set(id, {
          onPointerOver: (e) => {
            e.stopPropagation();
            setHoveredId(id);
          },
          onPointerOut: () => setHoveredId((current) => (current === id ? null : current)),
          onClick: (e) => {
            if (e.delta > CLICK_TOLERANCE) return;
            e.stopPropagation();
            onSelect(id);
          },
        });
      }
      return cache.get(id);
    };
  }, [onSelect]);

  // Everything rendered reads from this one object, so the recursive body
  // tree doesn't need a prop for every piece of interaction state.
  const scene = useMemo(
    () => ({
      system,
      selectedId,
      hoveredId,
      handlersFor,
      focusPath: new Set(selectedId ? ancestryOf(system, selectedId) : []),
      labelVisible: (id) => selectedId === id || (canHover && hoveredId === id),
    }),
    [system, selectedId, hoveredId, handlersFor, canHover]
  );

  const root = system.bodies.find((b) => b.parentId === null);

  return (
    <>
      <SimulationDriver />
      <color attach="background" args={["#02040a"]} />
      {/* The star is the only real light source. A trace of ambient keeps
          night sides from collapsing to pure black on dim screens. */}
      <pointLight position={[0, 0, 0]} intensity={3.6} decay={0} color="#fff2df" />
      <ambientLight intensity={0.05} />
      <Starfield />
      <BodyNode body={root} scene={scene} />
      <CameraRig expanded={expanded} resetToken={resetToken} />
    </>
  );
};
