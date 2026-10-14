import { useEffect, useRef, useState } from "react";
import { planets, asteroids, moonKinds, BELT_ID } from "../data/universe";
import { projects } from "../data/projects";

const projectTitles = Object.fromEntries(projects.map((p) => [p.id, p.title]));

// Orbit diameters (% of the viewport). The asteroid belt sits in the gap
// between the fourth and fifth planets, like the real one past Mars.
const ORBITS = [22, 29, 36, 43, 58, 65, 72, 79, 86];
const BELT_RADIUS = 25.25; // in cqw, i.e. % of the viewport width
const ROCK_COUNT = 72;
const ROCK_STEP = Math.floor(ROCK_COUNT / asteroids.length);

const moonsOf = (planet) =>
  Object.entries(planet.moons).flatMap(([kind, names]) => names.map((name) => ({ name, kind })));

const orbitStyle = (index, planet) => {
  const angle = (index * 137.5 + 20) % 360;
  const period = 28 + index * 9;
  return {
    "--d": `${ORBITS[index]}%`,
    "--angle": `${angle}deg`,
    "--period": `${period}s`,
    "--delay": `${-(angle / 360) * period}s`,
    "--size": `${3 + moonsOf(planet).length * 0.3}cqw`,
    "--color": planet.color,
  };
};

// Deterministic scatter so the belt looks the same on every render.
const rocks = Array.from({ length: ROCK_COUNT }, (_, i) => ({
  angle: i * (360 / ROCK_COUNT) + ((i * 37) % 7) - 3,
  radius: BELT_RADIUS + (((i * 53) % 9) - 4) * 0.5,
  size: 0.5 + ((i * 29) % 5) * 0.22,
  name: i % ROCK_STEP === 0 ? asteroids[i / ROCK_STEP] : undefined,
}));

export const SolarSystem = ({ variant = "compact", focusedId = null, onFocusChange, renderPlanetActions }) => {
  const [paused, setPaused] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const viewportRef = useRef(null);
  const backRef = useRef(null);
  const lastFocused = useRef(null);

  const planet = planets.find((p) => p.id === focusedId) || null;
  const isBelt = focusedId === BELT_ID;
  const zoomed = Boolean(planet || isBelt);

  // Zoom from wherever the body currently is in its orbit.
  const zoomTo = (id) => {
    const viewport = viewportRef.current;
    const target = viewport?.querySelector(`[data-body="${id}"]`);
    const box = viewport?.getBoundingClientRect();
    const rect = target?.getBoundingClientRect();
    if (box && rect && box.width) {
      const x = ((rect.left + rect.width / 2 - box.left) / box.width) * 100;
      const y = ((rect.top + rect.height / 2 - box.top) / box.height) * 100;
      setOrigin(`${x}% ${y}%`);
    }
    onFocusChange(id);
  };
  const zoomOut = () => onFocusChange(null);

  useEffect(() => {
    if (zoomed) {
      backRef.current?.focus({ preventScroll: true });
      lastFocused.current = focusedId;
    } else if (lastFocused.current) {
      viewportRef.current?.querySelector(`[data-body="${lastFocused.current}"]`)?.focus({ preventScroll: true });
      lastFocused.current = null;
    }
  }, [zoomed, focusedId]);

  const classes = ["cosmos", `cosmos--${variant}`, paused && "is-paused", zoomed && "is-zoomed"];
  return (
    <div className={classes.filter(Boolean).join(" ")}
      onKeyDown={(e) => { if (e.key === "Escape" && zoomed) zoomOut(); }}>
      <div className="cosmos__viewport" ref={viewportRef} role="group" aria-label="Solar system of interests">
        <div className="cosmos__stars" aria-hidden="true" />
        <div className="cosmos__system" style={{ transformOrigin: origin }} aria-hidden={zoomed || undefined}>
          {ORBITS.map((d) => <div key={d} className="cosmos__path" style={{ "--d": `${d}%` }} aria-hidden="true" />)}
          <div className="cosmos__belt-band" aria-hidden="true" />
          <div className="cosmos__belt" aria-hidden="true">
            {rocks.map((rock, i) => (
              <span key={i} className={`cosmos__rock${rock.name ? " is-named" : ""}`} title={rock.name}
                style={{ "--a": `${rock.angle}deg`, "--r": rock.radius, "--s": rock.size }} />
            ))}
          </div>
          <button type="button" className="cosmos__belt-chip" data-body={BELT_ID} onClick={() => zoomTo(BELT_ID)}
            aria-label={`Asteroid belt: ${asteroids.length} smaller things`}>
            Asteroid belt
          </button>
          <div className="cosmos__sun" aria-hidden="true"><span>GK</span></div>
          {planets.map((p, i) => (
            <div key={p.id} className="cosmos__orbit" style={orbitStyle(i, p)}>
              <div className="cosmos__pos">
                <button type="button" className="cosmos-planet" data-body={p.id} onClick={() => zoomTo(p.id)}
                  aria-label={`${p.name}: ${moonsOf(p).length} moons`}>
                  <span className={`cosmos-body cosmos-body--${p.look}`} aria-hidden="true" />
                  <span className="cosmos-planet__label" aria-hidden="true">{p.short}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
        {planet && <PlanetZoom key={planet.id} planet={planet} backRef={backRef} onBack={zoomOut} />}
        {isBelt && <BeltZoom backRef={backRef} onBack={zoomOut} />}
      </div>

      <div className="cosmos__controls">
        <span>{zoomed ? "Esc or ← to zoom out" : "Planet size = number of moons"}</span>
        <button type="button" onClick={() => setPaused((v) => !v)} aria-pressed={paused}>
          {paused ? "▶ Resume orbits" : "Ⅱ Pause orbits"}
        </button>
      </div>

      <CosmosPanel variant={variant} planet={planet} isBelt={isBelt} onOpen={zoomTo}
        renderPlanetActions={renderPlanetActions} />
    </div>
  );
};

const PlanetZoom = ({ planet, backRef, onBack }) => {
  const moons = moonsOf(planet);
  const split = moons.length > 4 ? Math.floor(moons.length / 2) : moons.length;
  const rings = [moons.slice(0, split), moons.slice(split)].filter((ring) => ring.length);
  const diameters = rings.length === 1 ? [64] : [50, 78];
  return (
    <div className="cosmos-zoom" style={{ "--color": planet.color }}>
      <button type="button" ref={backRef} className="cosmos-zoom__back" onClick={onBack}>← All planets</button>
      <div className="cosmos-zoom__stage" aria-hidden="true">
        {rings.map((ring, r) => (
          <div key={r} className="cosmos-zoom__ring" style={{ "--d": `${diameters[r]}%`, "--period": `${80 + r * 40}s` }}>
            {ring.map((moon, i) => (
              <div key={moon.name} className="cosmos-zoom__arm" style={{ "--a": `${(i * 360) / ring.length + r * 30}deg` }}>
                <span className={`cosmos-moon cosmos-kind--${moon.kind}`}><i />{moon.name}</span>
              </div>
            ))}
          </div>
        ))}
        <div className={`cosmos-zoom__planet cosmos-body cosmos-body--${planet.look}`} />
      </div>
      <p className="cosmos-zoom__caption" aria-hidden="true">{planet.name}</p>
    </div>
  );
};

const BeltZoom = ({ backRef, onBack }) => (
  <div className="cosmos-zoom cosmos-zoom--belt">
    <button type="button" ref={backRef} className="cosmos-zoom__back" onClick={onBack}>← All planets</button>
    <div className="cosmos-field" aria-hidden="true">
      {rocks.filter((_, i) => i % 2 === 0).map((rock, i) => (
        <span key={i} className="cosmos-field__dust" style={{
          "--x": `${50 + 44 * Math.cos((rock.angle * Math.PI) / 180) * (0.75 + (i % 3) * 0.1)}%`,
          "--y": `${50 + 40 * Math.sin((rock.angle * Math.PI) / 180) * (0.75 + (i % 4) * 0.08)}%`,
          "--s": rock.size * 1.6,
        }} />
      ))}
      {asteroids.map((name, i) => {
        const angle = (i / asteroids.length) * 2 * Math.PI - Math.PI / 2;
        return (
          <span key={name} className="cosmos-field__item" style={{
            "--x": `${50 + 33 * Math.cos(angle)}%`, "--y": `${50 + 30 * Math.sin(angle)}%`,
            "--s": 2.4 + (i % 3) * 0.8, "--delay": `${-i * 0.9}s`,
          }}><i />{name}</span>
        );
      })}
      <p className="cosmos-field__center">Everything<br />else</p>
    </div>
    <p className="cosmos-zoom__caption" aria-hidden="true">Asteroid belt</p>
  </div>
);

const CosmosPanel = ({ variant, planet, isBelt, onOpen, renderPlanetActions }) => {
  const H = variant === "full" ? "h2" : "h3";

  if (planet) {
    const index = planets.indexOf(planet);
    return (
      <div className="cosmos-panel" style={{ "--color": planet.color }} data-testid="cosmos-panel">
        <p className="cosmos-panel__kicker">Planet {index + 1} of {planets.length}</p>
        <H className="cosmos-panel__title">{planet.name}</H>
        <p className="cosmos-panel__text">{planet.tagline}</p>
        {Object.entries(planet.moons).map(([kind, names]) => names.length > 0 && (
          <div key={kind} className="cosmos-panel__group">
            <p className="cosmos-panel__label">{moonKinds[kind].label}</p>
            <ul className="cosmos-chips">
              {names.map((name) => <li key={name} className={`cosmos-chip cosmos-kind--${kind}`}>{name}</li>)}
            </ul>
          </div>
        ))}
        {planet.projects.length > 0 && (
          <div className="cosmos-panel__group">
            <p className="cosmos-panel__label">Seen in</p>
            <p className="cosmos-panel__projects">{planet.projects.map((id) => projectTitles[id]).filter(Boolean).join(" · ")}</p>
          </div>
        )}
        {renderPlanetActions && <div className="cosmos-panel__actions">{renderPlanetActions(planet)}</div>}
      </div>
    );
  }

  if (isBelt) {
    return (
      <div className="cosmos-panel" data-testid="cosmos-panel">
        <p className="cosmos-panel__kicker">Between the inner and outer planets</p>
        <H className="cosmos-panel__title">Asteroid belt</H>
        <p className="cosmos-panel__text">Smaller tools and practices that show up everywhere but don't need a planet of their own.</p>
        <ul className="cosmos-chips">
          {asteroids.map((name) => <li key={name} className="cosmos-chip">{name}</li>)}
        </ul>
      </div>
    );
  }

  return (
    <div className="cosmos-panel" data-testid="cosmos-panel">
      <p className="cosmos-panel__kicker">{planets.length} planets · {asteroids.length} asteroids</p>
      {variant === "full" && <H className="cosmos-panel__title">Pick a planet</H>}
      <p className="cosmos-panel__text">Click a planet to land on it. Its moons are the languages, tools, and concepts I use there.</p>
      <ul className="cosmos-legend">
        {planets.map((p) => (
          <li key={p.id}>
            <button type="button" style={{ "--color": p.color }} onClick={() => onOpen(p.id)}>
              <i aria-hidden="true" />{p.name}<small>{moonsOf(p).length}</small>
            </button>
          </li>
        ))}
        <li>
          <button type="button" className="cosmos-legend__belt" onClick={() => onOpen(BELT_ID)}>
            <i aria-hidden="true" />Asteroid belt<small>{asteroids.length}</small>
          </button>
        </li>
      </ul>
    </div>
  );
};
