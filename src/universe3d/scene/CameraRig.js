import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Vector3 } from "three";

// Camera states. PLANET_FOCUS and MOON_FOCUS join this machine once bodies
// carry portfolio content; until then the camera is either resting at the
// overview, being steered by the visitor, or easing back to the overview.
export const CAMERA_STATES = {
  OVERVIEW: "overview",
  FREE_EXPLORE: "freeExplore",
  RETURNING: "returning",
};

// Frames the outermost planet's orbit (r ≈ 13.4) in a square view with a
// 42° field of view: distance ≈ extent / tan(fov / 2) ≈ 35, seen from ~34°
// above the orbital plane so the orbits open up into the square.
export const OVERVIEW_POSITION = new Vector3(0, 19.6, 29);
const OVERVIEW_TARGET = new Vector3(0, 0, 0);
const RETURN_RATE = 4.5; // higher = snappier
const SETTLED = 1e-4;

export const CameraRig = ({ expanded, resetToken }) => {
  const controls = useRef();
  const state = useRef(CAMERA_STATES.OVERVIEW);
  const camera = useThree((s) => s.camera);
  const gl = useThree((s) => s.gl);

  useEffect(() => {
    if (resetToken > 0) state.current = CAMERA_STATES.RETURNING;
  }, [resetToken]);

  // In the miniature, let vertical touch drags scroll the page and only
  // horizontal drags orbit the camera. Expanded mode owns every gesture.
  useEffect(() => {
    gl.domElement.style.touchAction = expanded ? "none" : "pan-y";
  }, [expanded, gl]);

  useFrame((_, delta) => {
    if (state.current !== CAMERA_STATES.RETURNING || !controls.current) return;
    // Exponential smoothing: each frame closes a fixed fraction of the
    // remaining gap per unit time, so the ease is identical at 30 or 144 fps.
    const k = 1 - Math.exp(-RETURN_RATE * delta);
    camera.position.lerp(OVERVIEW_POSITION, k);
    controls.current.target.lerp(OVERVIEW_TARGET, k);
    if (camera.position.distanceToSquared(OVERVIEW_POSITION) < SETTLED && controls.current.target.lengthSq() < SETTLED) {
      state.current = CAMERA_STATES.OVERVIEW;
    }
  });

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableDamping
      dampingFactor={0.07}
      // Zoom and pan only when expanded, so the wheel keeps scrolling the page
      // in the miniature. Panning lets visitors reach outer moon systems until
      // planet focus arrives; Overview recentres everything.
      enableZoom={expanded}
      enablePan={expanded}
      screenSpacePanning
      zoomSpeed={0.7}
      rotateSpeed={0.55}
      // Close enough to inspect a moon, far enough to stay inside the starfield shell.
      minDistance={1.6}
      maxDistance={70}
      minPolarAngle={0.12}
      maxPolarAngle={Math.PI - 0.12}
      onStart={() => {
        state.current = CAMERA_STATES.FREE_EXPLORE;
      }}
    />
  );
};
