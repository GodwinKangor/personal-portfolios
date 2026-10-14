import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending } from "three";
import { simulationClock } from "../simulation/simulationClock";
import { spinAngle } from "../simulation/orbits";
import { getGlowTexture } from "../textures/planetTextures";

const vertexShader = /* glsl */ `
  varying vec3 vLocal;
  varying vec3 vNormalView;
  varying vec3 vViewDir;
  void main() {
    vLocal = position;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vNormalView = normalize(normalMatrix * normal);
    vViewDir = normalize(-mvPosition.xyz);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

// Photosphere: two layers of 3D value noise (large convection cells and fine
// granulation) drifting over time, mapped through a black-body-ish ramp.
const fragmentShader = /* glsl */ `
  uniform float uTime;
  varying vec3 vLocal;
  varying vec3 vNormalView;
  varying vec3 vViewDir;

  float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }
  float noise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash(i), hash(i + vec3(1, 0, 0)), f.x), mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), f.x), f.y),
      mix(mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), f.x), mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), f.x), f.y),
      f.z);
  }
  float fbm(vec3 p) {
    float sum = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 5; i++) {
      sum += amplitude * noise(p);
      p = p * 2.03 + vec3(1.7, 9.2, 3.1);
      amplitude *= 0.5;
    }
    return sum / 0.96875;
  }

  void main() {
    vec3 p = normalize(vLocal);
    float cells = fbm(p * 3.0 + vec3(0.0, uTime * 0.02, uTime * 0.015));
    float granulation = fbm(p * 16.0 + vec3(uTime * 0.07, -uTime * 0.05, uTime * 0.04));
    float heat = clamp(cells * 0.6 + granulation * 0.5 - 0.05, 0.0, 1.0);

    vec3 cool = vec3(0.92, 0.36, 0.06);
    vec3 warm = vec3(1.0, 0.68, 0.26);
    vec3 hot = vec3(1.0, 0.93, 0.78);
    vec3 color = mix(cool, warm, smoothstep(0.25, 0.6, heat));
    color = mix(color, hot, smoothstep(0.6, 0.88, heat));

    // Limb darkening. Near the edge we look through cooler, higher layers of
    // the photosphere, so brightness falls off with mu = cos(viewing angle).
    // Approximated as I(mu) = a + b * mu^0.45, and reddened toward the limb.
    float mu = clamp(dot(vNormalView, vViewDir), 0.0, 1.0);
    color *= 0.38 + 0.62 * pow(mu, 0.45);
    color = mix(color * vec3(1.0, 0.7, 0.45), color, smoothstep(0.0, 0.5, mu));

    gl_FragColor = vec4(color * 1.2, 1.0);
  }
`;

export const Star = ({ body, highlighted }) => {
  const surface = useRef();
  const material = useRef();
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
  const glow = getGlowTexture();

  useFrame(() => {
    const t = simulationClock.time;
    surface.current.rotation.y = spinAngle(body.spin, t);
    // Surface activity follows simulation time, so pausing freezes it too.
    material.current.uniforms.uTime.value = t;
  });

  return (
    <group rotation={[0, 0, body.spin.axialTilt]}>
      <mesh ref={surface}>
        <sphereGeometry args={[body.radius, 96, 64]} />
        <shaderMaterial ref={material} uniforms={uniforms} vertexShader={vertexShader} fragmentShader={fragmentShader} />
      </mesh>
      {/* Corona: two soft additive sprites, deliberately restrained instead of bloom. */}
      <sprite scale={body.radius * 3.1}>
        <spriteMaterial map={glow} color="#ffd29a" transparent opacity={highlighted ? 0.75 : 0.6}
          blending={AdditiveBlending} depthWrite={false} toneMapped={false} />
      </sprite>
      <sprite scale={body.radius * 6.5}>
        <spriteMaterial map={glow} color="#ff9a3c" transparent opacity={0.28}
          blending={AdditiveBlending} depthWrite={false} toneMapped={false} />
      </sprite>
    </group>
  );
};
