import { ASTEROID_BELT, PLANETS, STAR } from "./data/celestialBodies";
import { buildSystem } from "./simulation/hierarchy";

// The resolved universe, built once from the authoring data.
export const universe = buildSystem({ star: STAR, planets: PLANETS, belt: ASTEROID_BELT });
