import { createOrbitFrame, orbitalAngle, orbitalPosition, orbitPathPoints } from "./orbits";
import { advanceSimulation, MAX_FRAME_STEP } from "./simulationClock";

const orbit = { distance: 4, period: 20, phase: 0.5, inclination: 0.1, ascendingNode: 1.2 };

test("orbital position is a pure function of time and stays on the orbit", () => {
  const frame = createOrbitFrame(orbit);
  const a = orbitalPosition(orbit, frame, orbitalAngle(orbit, 7.25));
  const b = orbitalPosition(orbit, frame, orbitalAngle(orbit, 7.25));
  expect(a.distanceTo(b)).toBe(0);
  expect(a.length()).toBeCloseTo(orbit.distance, 10);
  // One full period later the body is back where it started.
  const later = orbitalPosition(orbit, frame, orbitalAngle(orbit, 7.25 + orbit.period));
  expect(later.distanceTo(a)).toBeLessThan(1e-9);
});

test("inclination lifts the orbit out of the horizontal plane", () => {
  const flat = orbitPathPoints({ ...orbit, inclination: 0 });
  const tilted = orbitPathPoints(orbit);
  expect(Math.max(...flat.map((p) => Math.abs(p.y)))).toBeLessThan(1e-9);
  expect(Math.max(...tilted.map((p) => Math.abs(p.y)))).toBeCloseTo(orbit.distance * Math.sin(orbit.inclination), 2);
});

test("simulation clock clamps long frames and respects pause", () => {
  const clock = { time: 0, paused: false };
  advanceSimulation(0.016, clock);
  advanceSimulation(5, clock); // e.g. returning to a hidden tab
  expect(clock.time).toBeCloseTo(0.016 + MAX_FRAME_STEP, 10);
  clock.paused = true;
  advanceSimulation(0.016, clock);
  expect(clock.time).toBeCloseTo(0.016 + MAX_FRAME_STEP, 10);
});
