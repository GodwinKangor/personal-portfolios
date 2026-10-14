import { ancestryOf, buildSystem, heliocentricPeriod } from "./hierarchy";
import { ASTEROID_BELT, PLANETS, STAR } from "../data/celestialBodies";
import { universe } from "../system";

const ofKind = (kind) => universe.bodies.filter((b) => b.kind === kind);
const childrenOf = (id) => universe.childrenOf.get(id) || [];

test("the universe has the planned hierarchy", () => {
  expect(ofKind("star")).toHaveLength(1);
  expect(ofKind("planet").map((p) => p.name)).toEqual([
    "Technical Skills", "Education", "Personal World", "Projects", "Professional Experience", "Creative World",
  ]);
  expect(ofKind("moon")).toHaveLength(30);
  expect(ofKind("satellite")).toHaveLength(17);
  expect(ofKind("asteroid")).toHaveLength(18);
  // Skills are satellites of their category moon.
  expect(childrenOf("frontend").map((s) => s.name)).toEqual(["React", "HTML/CSS", "Vite"]);
  expect(ancestryOf(universe, "skill-substance-painter")).toEqual(["about-me", "technical-skills", "graphics-tools", "skill-substance-painter"]);
});

test("every id is unique and every parent exists", () => {
  expect(new Set(universe.bodies.map((b) => b.id)).size).toBe(universe.bodies.length);
  universe.bodies.forEach((b) => {
    if (b.parentId !== null) expect(universe.byId.has(b.parentId)).toBe(true);
  });
});

test("building twice gives the identical universe (deterministic)", () => {
  const again = buildSystem({ star: STAR, planets: PLANETS, belt: ASTEROID_BELT });
  expect(again.bodies).toEqual(universe.bodies);
});

test("planets orbit clear of the star and of each other, with the belt in between", () => {
  const planets = ofKind("planet");
  expect(planets[0].orbit.distance - planets[0].radius).toBeGreaterThan(STAR.radius);
  planets.slice(1).forEach((p, i) => {
    const inner = planets[i];
    expect(p.orbit.distance - p.radius).toBeGreaterThan(inner.orbit.distance + inner.radius);
    expect(p.orbit.period).toBeGreaterThan(inner.orbit.period); // outer worlds are slower
  });
  const inside = planets.filter((p) => p.orbit.distance < ASTEROID_BELT.innerRadius);
  const outside = planets.filter((p) => p.orbit.distance > ASTEROID_BELT.outerRadius);
  expect(inside.length + outside.length).toBe(planets.length);
  expect(inside.length).toBeGreaterThan(0);
  expect(outside.length).toBeGreaterThan(0);
});

test("moons and satellites orbit outside their parent and don't collide with siblings", () => {
  universe.bodies
    .filter((b) => b.kind === "planet" || b.kind === "moon")
    .forEach((parent) => {
      const kids = childrenOf(parent.id);
      const clearance = parent.rings ? parent.radius * parent.rings.outer : parent.radius;
      kids.forEach((k) => expect(k.orbit.distance - k.radius).toBeGreaterThan(clearance));
      kids.slice(1).forEach((k, i) => {
        expect(k.orbit.distance - kids[i].orbit.distance).toBeGreaterThan(k.radius + kids[i].radius);
      });
    });
});

test("concept asteroids live inside the belt and keep the belt's orbital law", () => {
  ofKind("asteroid").forEach((a) => {
    expect(a.parentId).toBe(ASTEROID_BELT.id);
    expect(a.orbit.distance).toBeGreaterThan(ASTEROID_BELT.innerRadius);
    expect(a.orbit.distance).toBeLessThan(ASTEROID_BELT.outerRadius);
    expect(a.orbit.period).toBeCloseTo(heliocentricPeriod(a.orbit.distance), 10);
  });
});
