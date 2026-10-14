import { useMemo } from "react";
import { createRandom } from "../textures/noise";
import { getGlowTexture } from "../textures/planetTextures";

// Stellar colours by rough temperature class; most visible stars look white.
const STAR_COLORS = [
  { weight: 0.62, rgb: [1, 0.97, 0.93] },
  { weight: 0.2, rgb: [0.8, 0.87, 1] },
  { weight: 0.13, rgb: [1, 0.86, 0.68] },
  { weight: 0.05, rgb: [1, 0.72, 0.55] },
];

const pickColor = (r) => {
  let acc = 0;
  for (const c of STAR_COLORS) {
    acc += c.weight;
    if (r < acc) return c.rgb;
  }
  return STAR_COLORS[0].rgb;
};

const buildStars = (count, seed, minBrightness) => {
  const random = createRandom(seed);
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    // Uniform direction on a sphere: pick height uniformly in [−1, 1] and
    // azimuth uniformly; this avoids clustering at the poles.
    const u = random() * 2 - 1;
    const theta = random() * Math.PI * 2;
    const s = Math.sqrt(1 - u * u);
    const radius = 160 + random() * 60;
    positions.set([s * Math.cos(theta) * radius, u * radius, s * Math.sin(theta) * radius], i * 3);
    // Cubic falloff: many faint stars, few bright ones.
    const brightness = minBrightness + random() ** 3 * (1 - minBrightness);
    const [r, g, b] = pickColor(random());
    colors.set([r * brightness, g * brightness, b * brightness], i * 3);
  }
  return { positions, colors };
};

const StarLayer = ({ count, seed, size, minBrightness }) => {
  const { positions, colors } = useMemo(() => buildStars(count, seed, minBrightness), [count, seed, minBrightness]);
  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={size} sizeAttenuation={false} vertexColors map={getGlowTexture()} transparent depthWrite={false} toneMapped={false} />
    </points>
  );
};

export const Starfield = () => (
  <>
    <StarLayer count={2400} seed={7} size={1.6} minBrightness={0.18} />
    <StarLayer count={140} seed={13} size={3.2} minBrightness={0.45} />
  </>
);
