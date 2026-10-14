import { Html } from "@react-three/drei";

// Name tag that tracks a body in screen space. Kept below the HUD buttons
// (zIndexRange) and ignores the pointer so it never blocks clicks.
export const BodyLabel = ({ body, selected, offset }) => (
  <Html position={[0, offset, 0]} center zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
    <span className={`u3d-label${selected ? " is-selected" : ""}`} style={{ "--tint": body.tint || "#ffd29a" }}>
      {body.name}
    </span>
  </Html>
);
