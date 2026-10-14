import { Matrix4, Vector3 } from "three";

const TAU = Math.PI * 2;

/** Angle along the orbit at simulation time `t`: initialAngle + angularSpeed × t. */
export const orbitalAngle = (orbit, t) => orbit.phase + (TAU / orbit.period) * t;

/** Rotation about the body's own axis at time `t`, in radians. */
export const spinAngle = (spin, t) => (TAU / spin.period) * t;

/**
 * The orbital plane starts as the horizontal XZ plane. We tilt it about the
 * X axis by the inclination, then turn that tilted plane about the vertical
 * Y axis by the longitude of the ascending node, so different planets tilt in
 * different directions. Matrix order is right-to-left: R = Ry(node) · Rx(incl).
 * Precompute this once per body; it never changes.
 */
export const createOrbitFrame = (orbit) =>
  new Matrix4()
    .makeRotationY(orbit.ascendingNode)
    .multiply(new Matrix4().makeRotationX(orbit.inclination));

/**
 * Position on a circular orbit for a given angle, written into `target`.
 * In the untilted plane, x = r·cos θ and z = −r·sin θ, which runs
 * counter-clockwise when seen from above (+Y), like the real solar system.
 */
export const orbitalPosition = (orbit, frame, angle, target = new Vector3()) =>
  target.set(Math.cos(angle) * orbit.distance, 0, -Math.sin(angle) * orbit.distance).applyMatrix4(frame);

/** Closed polyline tracing the whole orbit, for drawing its path. */
export const orbitPathPoints = (orbit, segments = 256) => {
  const frame = createOrbitFrame(orbit);
  return Array.from({ length: segments }, (_, i) => orbitalPosition(orbit, frame, (i / segments) * TAU));
};
