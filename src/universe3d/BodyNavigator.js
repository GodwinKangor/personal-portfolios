import { ancestryOf } from "./simulation/hierarchy";

const KIND_LABEL = {
  star: "Star",
  planet: "Planet",
  moon: "Moon",
  satellite: "Satellite",
  belt: "Asteroid belt",
  asteroid: "Concept asteroid",
};
export const kindLabel = (body) => KIND_LABEL[body.kind];

const BodyButton = ({ body, selectedId, onSelect, onPath }) => (
  <li>
    <button type="button" aria-pressed={selectedId === body.id} className={onPath ? "is-on-path" : undefined}
      onClick={() => onSelect(body.id)} style={{ "--tint": body.tint || "#ffd29a" }}>
      <i aria-hidden="true" className={`u3d__dot u3d__dot--${body.kind}`} />
      {body.kind === "star" ? "Star" : body.name}
    </button>
  </li>
);

/**
 * Non-3D way to reach every body. Shows the top level (star, planets, belt),
 * then the children of whatever is selected, one level per row, so visitors
 * can drill down planet → moon → satellite with the keyboard alone.
 */
export const BodyNavigator = ({ system, selectedId, onSelect }) => {
  const path = selectedId ? ancestryOf(system, selectedId) : [];
  const onPath = new Set(path.slice(1)); // the star is everyone's ancestor; don't mark it
  const root = system.bodies.find((b) => b.parentId === null);
  const topLevel = [root, ...(system.childrenOf.get(root.id) || [])];

  // One extra row for each selected ancestor (below the star) that has children.
  const levels = path
    .slice(1)
    .map((id) => system.byId.get(id))
    .filter((body) => (system.childrenOf.get(body.id) || []).length > 0);

  const renderList = (bodies, label) => (
    <ul className="u3d__bodies" aria-label={label}>
      {bodies.map((body) => (
        <BodyButton key={body.id} body={body} selectedId={selectedId} onSelect={onSelect} onPath={onPath.has(body.id)} />
      ))}
    </ul>
  );

  return (
    <nav className="u3d__navigator" aria-label="Celestial bodies">
      {renderList(topLevel, "Star, planets, and asteroid belt")}
      {levels.map((parent) => {
        const children = system.childrenOf.get(parent.id);
        if (parent.kind === "belt") {
          // Group concept asteroids by their category.
          const categories = [...new Set(children.map((c) => c.category))];
          return categories.map((category) => (
            <div key={category} className="u3d__level">
              <p className="u3d__level-label">{category}</p>
              {renderList(children.filter((c) => c.category === category), category)}
            </div>
          ));
        }
        const childKind = children[0].kind === "satellite" ? "Satellites" : "Moons";
        return (
          <div key={parent.id} className="u3d__level">
            <p className="u3d__level-label">{childKind} of {parent.name}</p>
            {renderList(children, `${childKind} of ${parent.name}`)}
          </div>
        );
      })}
    </nav>
  );
};
