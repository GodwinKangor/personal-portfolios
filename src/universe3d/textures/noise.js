// Small seeded noise toolkit for procedural planet surfaces. Seeded so the
// planets look identical on every visit.

/** Deterministic PRNG (mulberry32): returns floats in [0, 1). */
export const createRandom = (seed) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const fade = (t) => t * t * (3 - 2 * t);
const lerp = (a, b, t) => a + (b - a) * t;

/**
 * 3D value noise: random values on an integer lattice, smoothly interpolated
 * between the 8 surrounding corners. Output is in [0, 1].
 */
export const createNoise3D = (seed) => {
  const random = createRandom(seed);
  const perm = new Uint8Array(256).map((_, i) => i);
  for (let i = 255; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [perm[i], perm[j]] = [perm[j], perm[i]];
  }
  const values = Float32Array.from({ length: 256 }, random);
  const corner = (x, y, z) => values[perm[(perm[(perm[x & 255] + y) & 255] + z) & 255]];

  return (x, y, z) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const zi = Math.floor(z);
    const u = fade(x - xi);
    const v = fade(y - yi);
    const w = fade(z - zi);
    return lerp(
      lerp(lerp(corner(xi, yi, zi), corner(xi + 1, yi, zi), u), lerp(corner(xi, yi + 1, zi), corner(xi + 1, yi + 1, zi), u), v),
      lerp(lerp(corner(xi, yi, zi + 1), corner(xi + 1, yi, zi + 1), u), lerp(corner(xi, yi + 1, zi + 1), corner(xi + 1, yi + 1, zi + 1), u), v),
      w
    );
  };
};

/** Fractal Brownian motion: layered octaves of noise, normalised to [0, 1]. */
export const fbm = (noise, x, y, z, octaves = 5) => {
  let sum = 0;
  let amplitude = 0.5;
  let frequency = 1;
  let norm = 0;
  for (let i = 0; i < octaves; i += 1) {
    sum += amplitude * noise(x * frequency, y * frequency, z * frequency);
    norm += amplitude;
    amplitude *= 0.5;
    frequency *= 2.03; // slightly off 2 so octave lattices don't line up
  }
  return sum / norm;
};

export const smoothstep = (edge0, edge1, x) => {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
};
