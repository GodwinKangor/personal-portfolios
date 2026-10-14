import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, Matrix4, MeshStandardMaterial, Quaternion, Vector3 } from "three";
import { simulationClock } from "../simulation/simulationClock";
import { heliocentricPeriod } from "../simulation/hierarchy";
import { createRandom } from "../textures/noise";
import { createRockGeometry } from "./rockGeometry";

const SHAPES = 3;
const TAU = Math.PI * 2;

// Broad asteroid colour families: dark carbonaceous, stony, and metallic.
const FAMILIES = [
  { weight: 0.6, color: "#4f4943" },
  { weight: 0.3, color: "#857660" },
  { weight: 0.1, color: "#9a968f" },
];

const buildRocks = ({ innerRadius, outerRadius, backgroundCount }) => {
  const random = createRandom(4049);
  const gaussian = () => (random() + random() + random() - 1.5) / 1.5; // roughly normal in [−1, 1]
  return Array.from({ length: backgroundCount }, (_, index) => {
    // Denser toward the middle of the belt, thinning at both edges.
    const distance = (innerRadius + outerRadius) / 2 + gaussian() * (outerRadius - innerRadius) * 0.55;
    const inclination = gaussian() * 0.06;
    const node = random() * TAU;
    // Power-law sizes: many tiny fragments, a handful of larger bodies.
    const size = 0.012 + random() ** 5 * 0.07;
    const pick = random();
    const family = FAMILIES.find((f, i) => pick < FAMILIES.slice(0, i + 1).reduce((s, x) => s + x.weight, 0)) || FAMILIES[0];
    const shade = 0.75 + random() * 0.4;
    return {
      shape: index % SHAPES,
      distance,
      period: heliocentricPeriod(distance),
      phase: random() * TAU,
      cosInc: Math.cos(inclination),
      sinInc: Math.sin(inclination),
      cosNode: Math.cos(node),
      sinNode: Math.sin(node),
      spinAxis: new Vector3(random() - 0.5, random() - 0.5, random() - 0.5).normalize(),
      spinRate: (random() - 0.5) * 2.4,
      scale: new Vector3(size * (0.7 + random() * 0.8), size * (0.6 + random() * 0.5), size * (0.7 + random() * 0.6)),
      color: new Color(family.color).multiplyScalar(shade),
    };
  });
};

/**
 * The environmental part of the belt: hundreds of rocks drawn with one
 * InstancedMesh per rock shape (three draw calls in total). Each rock has its
 * own circular orbit, recomputed from simulation time every frame.
 */
export const AsteroidBelt = ({ body, highlighted }) => {
  const meshes = useRef([]);
  const geometries = useMemo(() => Array.from({ length: SHAPES }, (_, i) => createRockGeometry(101 + i * 17, 1)), []);
  const material = useMemo(() => new MeshStandardMaterial({ roughness: 0.95, metalness: 0.05, flatShading: true }), []);
  const rocks = useMemo(() => buildRocks(body), [body]);
  const groups = useMemo(() => Array.from({ length: SHAPES }, (_, s) => rocks.filter((r) => r.shape === s)), [rocks]);
  const scratch = useMemo(() => ({ matrix: new Matrix4(), position: new Vector3(), quaternion: new Quaternion() }), []);

  useEffect(
    () => () => {
      geometries.forEach((g) => g.dispose());
      material.dispose();
    },
    [geometries, material]
  );

  useEffect(() => {
    groups.forEach((group, s) => {
      const mesh = meshes.current[s];
      group.forEach((rock, i) => mesh.setColorAt(i, rock.color));
      mesh.instanceColor.needsUpdate = true;
    });
  }, [groups]);

  useEffect(() => {
    material.emissive.set(highlighted ? "#d6c39a" : "#000000");
    material.emissiveIntensity = highlighted ? 0.12 : 0;
  }, [highlighted, material]);

  useFrame(() => {
    const t = simulationClock.time;
    const { matrix, position, quaternion } = scratch;
    groups.forEach((group, s) => {
      const mesh = meshes.current[s];
      group.forEach((rock, i) => {
        const angle = rock.phase + (TAU / rock.period) * t;
        // Same orbit transform as orbits.js, inlined for speed:
        // point on the flat circle, tilt about X by the inclination,
        // then turn about Y by the ascending node.
        const x0 = Math.cos(angle) * rock.distance;
        const z0 = -Math.sin(angle) * rock.distance;
        const y1 = -z0 * rock.sinInc;
        const z1 = z0 * rock.cosInc;
        position.set(x0 * rock.cosNode + z1 * rock.sinNode, y1, -x0 * rock.sinNode + z1 * rock.cosNode);
        quaternion.setFromAxisAngle(rock.spinAxis, rock.spinRate * t);
        matrix.compose(position, quaternion, rock.scale);
        mesh.setMatrixAt(i, matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
    });
  });

  return groups.map((group, s) => (
    <instancedMesh
      key={s}
      ref={(el) => {
        meshes.current[s] = el;
      }}
      args={[geometries[s], material, group.length]}
      // Instances spread far beyond the base geometry's bounds, so culling
      // against that single small sphere would wrongly hide the whole belt.
      frustumCulled={false}
    />
  ));
};
