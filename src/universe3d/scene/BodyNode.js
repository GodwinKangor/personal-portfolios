import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { simulationClock } from "../simulation/simulationClock";
import { createOrbitFrame, orbitalAngle, orbitalPosition } from "../simulation/orbits";
import { Star } from "./Star";
import { SurfaceBody } from "./SurfaceBody";
import { Spacecraft } from "./Spacecraft";
import { AsteroidBelt } from "./AsteroidBelt";
import { ConceptAsteroid } from "./ConceptAsteroid";
import { OrbitPath } from "./OrbitPath";
import { HitTarget } from "./HitTarget";
import { BodyLabel } from "./BodyLabel";

const VISUALS = {
  star: Star,
  planet: SurfaceBody,
  moon: SurfaceBody,
  satellite: Spacecraft,
  belt: AsteroidBelt,
  asteroid: ConceptAsteroid,
};

// How each kind receives the pointer. Planets, the star, and concept
// asteroids keep a minimum on-screen target so they stay clickable in the
// overview; moons and satellites use their real size so they never steal
// clicks from their planet until the camera is close enough to tell them apart.
const HIT = {
  star: { factor: 1.05, minPixels: 0 },
  planet: { factor: 1.25, minPixels: 10 },
  moon: { factor: 2, minPixels: 0 },
  satellite: { factor: 4, minPixels: 0 },
  asteroid: { factor: 1.8, minPixels: 6 },
};

const labelOffset = (body) => {
  if (body.kind === "satellite") return 0.05;
  return body.radius + Math.min(0.32, Math.max(0.06, body.radius * 0.6));
};

/**
 * One node of the orbital hierarchy. Its group is moved to the body's
 * position on its orbit *relative to the parent node*, so a moon placed
 * inside a planet's node automatically follows the planet around the star,
 * and a satellite inside a moon's node follows both.
 */
export const BodyNode = ({ body, scene }) => {
  const anchor = useRef();
  const frame = useMemo(() => (body.orbit ? createOrbitFrame(body.orbit) : null), [body.orbit]);
  const children = scene.system.childrenOf.get(body.id) || [];
  const Visual = VISUALS[body.kind];
  const selected = scene.selectedId === body.id;
  const highlighted = selected || scene.hoveredId === body.id;
  const onFocusPath = scene.focusPath.has(body.id);

  useFrame(() => {
    if (!frame) return;
    orbitalPosition(body.orbit, frame, orbitalAngle(body.orbit, simulationClock.time), anchor.current.position);
  });

  // Moons orbit in their planet's equatorial plane, and satellites in their
  // moon's, so children inherit the parent's axial tilt. The star's tilt is
  // not passed on: planets orbit in the ecliptic, not the star's equator.
  const childTilt = body.kind === "planet" || body.kind === "moon" ? body.spin.axialTilt : 0;
  // Planet orbits are always drawn; deeper orbits only for the branch in focus.
  const showChildPaths = body.kind === "star" || (onFocusPath && body.kind !== "belt");

  return (
    <group ref={anchor}>
      <Visual body={body} highlighted={highlighted} />
      <group rotation={[0, 0, childTilt]}>
        {showChildPaths &&
          children.map((child) =>
            child.orbit ? (
              <OrbitPath key={`path-${child.id}`} orbit={child.orbit} color={child.tint}
                highlighted={scene.focusPath.has(child.id)} faint={body.kind !== "star"} />
            ) : null
          )}
        {children.map((child) => (
          <BodyNode key={child.id} body={child} scene={scene} />
        ))}
      </group>
      {HIT[body.kind] && <HitTarget radius={body.radius} {...HIT[body.kind]} handlers={scene.handlersFor(body.id)} />}
      {scene.labelVisible(body.id) && body.kind !== "belt" && (
        <BodyLabel body={body} selected={selected} offset={labelOffset(body)} />
      )}
    </group>
  );
};
