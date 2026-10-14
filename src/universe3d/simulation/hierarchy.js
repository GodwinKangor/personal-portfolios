import { createRandom } from "../textures/noise";

// Turns the authoring data (data/celestialBodies.js) into a flat list of
// fully resolved bodies with parent links and orbits. Everything derived here
// is deterministic: the same data always yields the same universe.

const TAU = Math.PI * 2;
const deg = (d) => (d * Math.PI) / 180;

export const slug = (name) =>
  name.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// FNV-1a: a tiny, stable string hash, used to seed per-body randomness so a
// body's look and orbit never depend on its position in the list.
const hashString = (text) => {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
};
const randomFor = (id) => createRandom(hashString(id));

/**
 * Kepler's third law says T² ∝ a³, i.e. T ∝ a^1.5. We soften the exponent so
 * outer planets still visibly move during a visit, while keeping the order
 * (inner worlds always faster) that makes the system read as real.
 */
export const heliocentricPeriod = (distance) => 9.5 * distance ** 1.35;

/** Moons and satellites use true a^1.5 scaling relative to their parent's size. */
export const satellitePeriod = (distance, parentRadius, scale = 6) => scale * (distance / parentRadius) ** 1.5;

const moonLayout = (planet) => {
  const giant = planet.radius > 0.7;
  const clearance = planet.rings ? planet.radius * planet.rings.outer + 0.18 : planet.radius * 1.55 + 0.14;
  return { first: clearance, step: giant ? 0.17 : 0.15 };
};

/**
 * @param {{ star: object, planets: object[], belt: object }} spec
 * @returns {{ bodies: import("../data/celestialBodies").CelestialBody[], byId: Map<string, object>, childrenOf: Map<string, object[]> }}
 */
export const buildSystem = ({ star, planets, belt }) => {
  const bodies = [{ ...star, kind: "star", parentId: null }];

  planets.forEach((spec) => {
    const { moons = [], moonSurfaces = ["moonGray"], distance, phase, inclination, ascendingNode, ...visual } = spec;
    const planet = {
      ...visual,
      kind: "planet",
      parentId: star.id,
      orbit: { distance, period: heliocentricPeriod(distance), phase, inclination, ascendingNode },
    };
    bodies.push(planet);

    const { first, step } = moonLayout(planet);
    moons.forEach((moonSpec, index) => {
      const random = randomFor(moonSpec.id);
      const radius = Math.min(0.065, Math.max(0.035, planet.radius * (0.08 + random() * 0.05)));
      const distanceFromPlanet = first + index * step;
      const moon = {
        id: moonSpec.id,
        name: moonSpec.name,
        kind: "moon",
        category: planet.name,
        parentId: planet.id,
        radius,
        surface: moonSurfaces[index % moonSurfaces.length],
        tint: planet.tint,
        spin: { tidallyLocked: true, axialTilt: 0 },
        orbit: {
          distance: distanceFromPlanet,
          period: satellitePeriod(distanceFromPlanet, planet.radius),
          phase: random() * TAU,
          // Regular moons orbit close to their planet's equator.
          inclination: (random() - 0.5) * deg(8),
          ascendingNode: random() * TAU,
        },
      };
      bodies.push(moon);

      (moonSpec.satellites || []).forEach((name, satIndex) => {
        const id = `skill-${slug(name)}`;
        const r = randomFor(id);
        const satDistance = radius * 1.7 + satIndex * 0.028;
        bodies.push({
          id,
          name,
          kind: "satellite",
          category: moon.name,
          parentId: moon.id,
          radius: 0.008,
          tint: planet.tint,
          spin: { period: 5 + r() * 6, axialTilt: r() * 0.8 },
          orbit: {
            distance: satDistance,
            period: satellitePeriod(satDistance, radius, 3.2),
            phase: r() * TAU,
            // Artificial satellites use all sorts of inclinations, polar included.
            inclination: (r() - 0.5) * deg(140),
            ascendingNode: r() * TAU,
          },
        });
      });
    });
  });

  bodies.push({
    id: belt.id,
    name: belt.name,
    kind: "belt",
    category: belt.category,
    parentId: star.id,
    radius: 0,
    innerRadius: belt.innerRadius,
    outerRadius: belt.outerRadius,
    backgroundCount: belt.backgroundCount,
  });

  const concepts = belt.concepts.flatMap(({ category, items }) => items.map((name) => ({ name, category })));
  concepts.forEach(({ name, category }, index) => {
    const id = `concept-${slug(name)}`;
    const random = randomFor(id);
    const distance = belt.innerRadius + 0.12 + random() * (belt.outerRadius - belt.innerRadius - 0.24);
    bodies.push({
      id,
      name,
      kind: "asteroid",
      category,
      parentId: belt.id,
      radius: 0.05 + random() * 0.025,
      tint: "#d6c39a",
      spin: { period: 6 + random() * 10, axialTilt: random() * Math.PI },
      orbit: {
        distance,
        period: heliocentricPeriod(distance),
        // Spread evenly around the belt, with jitter so it doesn't look gridded.
        phase: (index / concepts.length) * TAU + (random() - 0.5) * 0.25,
        inclination: (random() - 0.5) * deg(6),
        ascendingNode: random() * TAU,
      },
    });
  });

  const byId = new Map(bodies.map((b) => [b.id, b]));
  const childrenOf = new Map();
  bodies.forEach((b) => {
    if (b.parentId === null) return;
    if (!childrenOf.has(b.parentId)) childrenOf.set(b.parentId, []);
    childrenOf.get(b.parentId).push(b);
  });
  return { bodies, byId, childrenOf };
};

/** Ids from the root down to `id`, inclusive. */
export const ancestryOf = (system, id) => {
  const path = [];
  let current = system.byId.get(id);
  while (current) {
    path.unshift(current.id);
    current = current.parentId ? system.byId.get(current.parentId) : null;
  }
  return path;
};
