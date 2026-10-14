import { Component, useCallback, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { universe } from "./system";
import { BodyNavigator, kindLabel } from "./BodyNavigator";
import { simulationClock } from "./simulation/simulationClock";
import { SolarSystemScene } from "./scene/SolarSystemScene";
import { OVERVIEW_POSITION } from "./scene/CameraRig";

const EXPAND_MS = 560;

const prefersReducedMotion = () =>
  typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const canHoverPointer = () => typeof window.matchMedia === "function" && window.matchMedia("(hover: hover)").matches;

// WebGL can be missing or blocked; the rest of the portfolio must not care.
class WebGLBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed) {
      return <p className="u3d__fallback">This 3D view needs WebGL, which isn't available here. The Orbit map tab shows the same universe.</p>;
    }
    return this.props.children;
  }
}

/** Run the miniature ↔ fullscreen move as a FLIP animation on the same element. */
const animateShell = (shell, from, to, onDone) => {
  const px = (rect) => ({ top: `${rect.top}px`, left: `${rect.left}px`, width: `${rect.width}px`, height: `${rect.height}px` });
  Object.assign(shell.style, { position: "fixed", transition: "none", ...px(from) });
  shell.getBoundingClientRect(); // commit the starting frame before animating
  if (prefersReducedMotion()) {
    Object.assign(shell.style, px(to));
    onDone();
    return null;
  }
  shell.style.transition = ["top", "left", "width", "height", "border-radius"]
    .map((prop) => `${prop} ${EXPAND_MS}ms cubic-bezier(.22,.8,.24,1)`)
    .join(", ");
  Object.assign(shell.style, px(to));
  return window.setTimeout(onDone, EXPAND_MS + 20);
};

const clearShellStyles = (shell) => {
  ["position", "transition", "top", "left", "width", "height"].forEach((prop) => shell.style.removeProperty(prop));
};

export default function Universe3D() {
  const [expanded, setExpanded] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [paused, setPaused] = useState(simulationClock.paused);
  const [resetToken, setResetToken] = useState(0);
  const [onScreen, setOnScreen] = useState(true);
  const [canHover] = useState(canHoverPointer);
  const slotRef = useRef(null);
  const shellRef = useRef(null);
  const expandButtonRef = useRef(null);
  const collapseButtonRef = useRef(null);
  const timer = useRef(null);
  const pointerDown = useRef(null);

  useEffect(() => {
    simulationClock.paused = paused;
  }, [paused]);

  // Stop rendering entirely while the miniature is scrolled out of view.
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined" || !slotRef.current) return undefined;
    const observer = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting), { rootMargin: "100px" });
    observer.observe(slotRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const select = useCallback((id) => setSelectedId((current) => (current === id ? null : id)), []);

  const expand = () => {
    const shell = shellRef.current;
    window.clearTimeout(timer.current);
    setExpanded(true);
    timer.current = animateShell(shell, slotRef.current.getBoundingClientRect(),
      { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight },
      () => Object.assign(shell.style, { transition: "none", top: "0", left: "0", width: "100vw", height: "100dvh" }));
  };

  const collapse = useCallback(() => {
    const shell = shellRef.current;
    window.clearTimeout(timer.current);
    setExpanded(false);
    timer.current = animateShell(shell, shell.getBoundingClientRect(), slotRef.current.getBoundingClientRect(),
      () => clearShellStyles(shell));
  }, []);

  // Expanded mode behaves like a dialog: Esc closes it, the page underneath
  // stops scrolling, and focus moves in and back out again.
  useEffect(() => {
    if (!expanded) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    collapseButtonRef.current?.focus({ preventScroll: true });
    const onKey = (e) => {
      if (e.key === "Escape") collapse();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [expanded, collapse]);

  // The expand button only exists again after collapsing re-renders, so
  // return focus to it from an effect rather than from the cleanup above.
  const wasExpanded = useRef(false);
  useEffect(() => {
    if (wasExpanded.current && !expanded) expandButtonRef.current?.focus({ preventScroll: true });
    wasExpanded.current = expanded;
  }, [expanded]);

  const selected = universe.byId.get(selectedId) || null;
  const parent = selected?.parentId ? universe.byId.get(selected.parentId) : null;
  const navigator = <BodyNavigator system={universe} selectedId={selectedId} onSelect={select} />;

  return (
    <div className="u3d">
      <div className="u3d__slot" ref={slotRef}>
        <div ref={shellRef} className={`u3d__shell${expanded ? " is-expanded" : ""}`}
          role={expanded ? "dialog" : "region"} aria-modal={expanded || undefined} aria-label="3D solar system"
          onPointerDownCapture={(e) => { pointerDown.current = { x: e.clientX, y: e.clientY }; }}>
          <WebGLBoundary>
            <Canvas
              // One canvas for both modes: expanding only resizes it, so the
              // WebGL context, scene graph, and camera all survive.
              dpr={[1, expanded ? 2 : 1.5]}
              camera={{ position: OVERVIEW_POSITION.toArray(), fov: 42, near: 0.05, far: 600 }}
              gl={{ antialias: true, powerPreference: "high-performance" }}
              frameloop={onScreen || expanded ? "always" : "never"}
              onPointerMissed={(e) => {
                // R3F also reports right-button `contextmenu` events here, which
                // Chrome fires on press, before a right-drag pan has moved at all.
                if (e.type !== "click") return;
                const start = pointerDown.current;
                // Clicking empty space clears the selection; dragging the camera does not.
                if (start && Math.hypot(e.clientX - start.x, e.clientY - start.y) < 5) setSelectedId(null);
              }}
              aria-label="Interactive 3D solar system. Drag to look around."
            >
              <SolarSystemScene system={universe} expanded={expanded} selectedId={selectedId} onSelect={select}
                resetToken={resetToken} canHover={canHover} />
            </Canvas>
          </WebGLBoundary>

          <div className="u3d__hud u3d__hud--top">
            {expanded && <p className="u3d__title">Godwin's universe <span>· 3D</span></p>}
            <div className="u3d__hud-actions">
              {expanded && (
                <>
                  <button type="button" className="u3d__button" onClick={() => setResetToken((n) => n + 1)}>⌂ Overview</button>
                  <button type="button" className="u3d__button" onClick={() => setPaused((p) => !p)} aria-pressed={paused}>
                    {paused ? "▶ Play" : "Ⅱ Pause"}
                  </button>
                </>
              )}
              {expanded ? (
                <button type="button" ref={collapseButtonRef} className="u3d__button" onClick={collapse}>✕ Collapse</button>
              ) : (
                <button type="button" ref={expandButtonRef} className="u3d__button u3d__button--icon" onClick={expand}
                  aria-label="Expand universe" title="Expand universe">⤢</button>
              )}
            </div>
          </div>

          {selected && (
            <div className="u3d__selection" style={{ "--tint": selected.tint || "#ffd29a" }} aria-live="polite">
              <span>{kindLabel(selected)} · {selected.category}</span>
              <strong>{selected.name}</strong>
              {/* Back climbs one level: satellite → moon → planet (or concept → belt). */}
              {parent && parent.kind !== "star" && (
                <button type="button" className="u3d__back" onClick={() => setSelectedId(parent.id)}>← {parent.name}</button>
              )}
            </div>
          )}

          {expanded && (
            <div className="u3d__hud u3d__hud--bottom">
              {navigator}
              <p className="u3d__hint">Drag to orbit · right-drag or two fingers to pan · scroll or pinch to zoom · Esc to close</p>
            </div>
          )}
        </div>
      </div>

      <div className="cosmos__controls">
        <span>{canHover ? "Drag to look around · hover for names" : "Drag sideways to look around"}</span>
        <button type="button" onClick={() => setPaused((p) => !p)} aria-pressed={paused}>
          {paused ? "▶ Resume orbits" : "Ⅱ Pause orbits"}
        </button>
      </div>
      <div className="u3d__mini-bodies">{!expanded && navigator}</div>
    </div>
  );
}
