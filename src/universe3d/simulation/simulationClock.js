// Single source of simulation time for the 3D universe.
//
// Every orbit and spin is a pure function of `time` (see orbits.js), so the
// scene can be re-rendered, resized, expanded, or even remounted without the
// planets jumping back to their starting positions. The clock lives at module
// scope for exactly that reason: it outlives any one React tree.

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// A long frame (tab switch, breakpoint, offscreen canvas resuming) should not
// fling planets halfway around their orbits.
export const MAX_FRAME_STEP = 0.1;

export const simulationClock = {
  time: 0,
  // Respect reduced motion by starting paused; visitors can still press play.
  paused: prefersReducedMotion(),
};

/** Advance simulation time by one rendered frame's delta (seconds). */
export const advanceSimulation = (delta, clock = simulationClock) => {
  if (clock.paused || !(delta > 0)) return clock.time;
  clock.time += Math.min(delta, MAX_FRAME_STEP);
  return clock.time;
};
