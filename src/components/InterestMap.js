import { useState } from "react";
import { projects, categories } from "../data/projects";
import { SolarSystem } from "./SolarSystem";

const LABELS = Object.fromEntries(categories.map((c) => [c.id, c.label]));
const countFor = (id) => projects.filter((p) => p.category === id).length;

// Home-page version of the universe: zooming into a planet offers to filter
// the work section by that planet's category, or open it in full view.
export const InterestMap = ({ activeCategory, onSelect }) => {
  const [focusedId, setFocusedId] = useState(null);

  const showWork = (category) => {
    const active = activeCategory === category;
    onSelect(active ? "all" : category);
    if (!active) document.getElementById("work")?.scrollIntoView?.({ behavior: "smooth" });
  };

  return (
    <SolarSystem variant="compact" focusedId={focusedId} onFocusChange={setFocusedId}
      renderPlanetActions={(planet) => (
        <>
          {planet.category && (
            <button type="button" className="cosmos-panel__action" aria-pressed={activeCategory === planet.category}
              onClick={() => showWork(planet.category)}>
              Show {LABELS[planet.category]} work ({countFor(planet.category)})
            </button>
          )}
          <a className="cosmos-panel__action" href={`#/universe/${planet.id}`}>Full view ↗</a>
        </>
      )} />
  );
};
