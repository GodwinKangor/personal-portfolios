import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, Color } from "three";
import { simulationClock } from "../simulation/simulationClock";
import { orbitalAngle, spinAngle } from "../simulation/orbits";
import { loadPlanetTextures } from "../textures/planetTextures";
import { Rings } from "./Rings";

// Thin atmosphere shell. Brightest at the limb (Fresnel term) and only on the
// sunlit side, so night sides stay dark like real orbital photography.
const atmosphereVertex = /* glsl */ `
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;
  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;
const atmosphereFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uStrength;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;
  void main() {
    vec3 normal = normalize(vWorldNormal);
    vec3 toCamera = normalize(cameraPosition - vWorldPosition);
    vec3 toSun = normalize(-vWorldPosition); // the star sits at the origin
    float fresnel = pow(1.0 - clamp(dot(normal, toCamera), 0.0, 1.0), 2.8);
    float daylight = smoothstep(-0.25, 0.45, dot(normal, toSun));
    gl_FragColor = vec4(uColor * fresnel * daylight * uStrength, 1.0);
  }
`;

const MATERIAL_BY_SURFACE = {
  earthlike: { metalness: 0, bumpScale: 1.4, atmosphere: 1.1 },
  rocky: { metalness: 0.22, bumpScale: 3 },
  desert: { metalness: 0, bumpScale: 1.6, atmosphere: 0.45 },
  jovian: { metalness: 0, bumpScale: 0, roughness: 1, atmosphere: 0.45 },
  saturnian: { metalness: 0, bumpScale: 0, roughness: 1, atmosphere: 0.4 },
  iceGiant: { metalness: 0, bumpScale: 0, roughness: 1, atmosphere: 0.7 },
};
const MOON_MATERIAL = { metalness: 0, bumpScale: 2.2 };

/** Textured sphere for planets and moons, with optional clouds, atmosphere, and rings. */
export const SurfaceBody = ({ body, highlighted }) => {
  const surface = useRef();
  const clouds = useRef();
  const isMoon = body.kind === "moon";
  const recipe = MATERIAL_BY_SURFACE[body.surface] || MOON_MATERIAL;
  const segments = isMoon ? [40, 28] : [96, 64];
  const tint = useMemo(() => new Color(body.tint), [body.tint]);
  const atmosphereUniforms = useMemo(
    () => ({ uColor: { value: new Color(body.atmosphere || "#000000") }, uStrength: { value: recipe.atmosphere || 0 } }),
    [body.atmosphere, recipe.atmosphere]
  );
  const [textures, setTextures] = useState(null);

  useEffect(() => {
    let active = true;
    loadPlanetTextures(body.surface).then((result) => active && setTextures(result));
    return () => {
      active = false;
    };
  }, [body.surface]);

  useFrame(() => {
    const t = simulationClock.time;
    // A tidally locked moon turns exactly once per orbit, so the same face
    // always points at its planet (as our Moon does with Earth).
    const angle = body.spin.tidallyLocked ? orbitalAngle(body.orbit, t) : spinAngle(body.spin, t);
    surface.current.rotation.y = angle;
    if (clouds.current) clouds.current.rotation.y = angle * 1.12; // weather outruns the ground slightly
  });

  return (
    <group rotation={[0, 0, body.spin.axialTilt]}>
      <mesh ref={surface}>
        <sphereGeometry args={[body.radius, ...segments]} />
        {/* Remount the material when textures arrive so its shader recompiles with the maps. */}
        <meshStandardMaterial
          key={textures ? "textured" : "plain"}
          color={textures ? "#ffffff" : isMoon ? "#8a8580" : body.tint}
          map={textures?.map ?? null}
          bumpMap={textures?.bumpMap ?? null}
          bumpScale={recipe.bumpScale}
          roughnessMap={textures?.roughnessMap ?? null}
          roughness={recipe.roughness ?? 1}
          metalness={recipe.metalness}
          emissive={tint}
          emissiveIntensity={highlighted ? 0.08 : 0}
        />
      </mesh>
      {body.clouds && textures?.cloudMap && (
        <mesh ref={clouds}>
          <sphereGeometry args={[body.radius * 1.012, 96, 64]} />
          <meshStandardMaterial color="#ffffff" alphaMap={textures.cloudMap} transparent depthWrite={false} roughness={1} />
        </mesh>
      )}
      {body.atmosphere && recipe.atmosphere && (
        <mesh scale={1.07}>
          <sphereGeometry args={[body.radius, 64, 48]} />
          <shaderMaterial uniforms={atmosphereUniforms} vertexShader={atmosphereVertex} fragmentShader={atmosphereFragment}
            transparent blending={AdditiveBlending} depthWrite={false} />
        </mesh>
      )}
      {body.rings && <Rings radius={body.radius} inner={body.rings.inner} outer={body.rings.outer} />}
    </group>
  );
};
