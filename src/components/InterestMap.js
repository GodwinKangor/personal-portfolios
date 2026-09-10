import { projects, mapCategories, categories } from "../data/projects";

const LABELS = Object.fromEntries(categories.map((c) => [c.id, c.label]));

// Percent-based coordinates so the map scales responsively with no
// JS measurement — the decorative SVG and the real buttons share the
// same grid.
const NODES = [
  { id: "software", x: 50, y: 12 },
  { id: "ml", x: 85, y: 76 },
  { id: "design", x: 15, y: 76 },
];

const countFor = (categoryId) =>
  projects.filter((p) => p.category === categoryId).length;

export const InterestMap = ({ activeCategory, onSelect }) => {
  const isActive = (id) => activeCategory === id;

  const handleSelect = (id) => {
    onSelect(activeCategory === id ? "all" : id);
  };

  return (
    <div className="interest-map" role="group" aria-label="Filter work by interest">
      <svg
        className="interest-map__lines"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
        focusable="false"
      >
        <circle cx="50" cy="50" r="20" className="interest-map__ring" />
        <circle cx="50" cy="50" r="36" className="interest-map__ring" />
        {NODES.map((n) => (
          <line
            key={n.id}
            x1="50"
            y1="50"
            x2={n.x}
            y2={n.y}
            className={`interest-map__spoke${isActive(n.id) ? " is-active" : ""}`}
          />
        ))}
      </svg>

      <button
        type="button"
        className={`interest-map__hub${activeCategory === "all" ? " is-active" : ""}`}
        style={{ left: "50%", top: "50%" }}
        onClick={() => onSelect("all")}
        aria-pressed={activeCategory === "all"}
      >
        All work
      </button>

      {mapCategories.map((id) => {
        const node = NODES.find((n) => n.id === id);
        const count = countFor(id);
        return (
          <button
            key={id}
            type="button"
            className={`interest-map__node${isActive(id) ? " is-active" : ""}`}
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
            onClick={() => handleSelect(id)}
            aria-pressed={isActive(id)}
          >
            <span className="interest-map__node-label">{LABELS[id]}</span>
            <span className="interest-map__node-count">{count}</span>
          </button>
        );
      })}
    </div>
  );
};
