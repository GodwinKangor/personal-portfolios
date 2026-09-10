import { projects, categories, featuredIds } from "../data/projects";
import { ProjectCard } from "./ProjectCard";

export const Projects = ({ activeCategory, onCategoryChange }) => {
  const featured = featuredIds
    .map((id) => projects.find((p) => p.id === id))
    .filter(Boolean);

  const visible =
    activeCategory === "all"
      ? projects
      : projects.filter((p) => p.category === activeCategory);

  return (
    <section className="work" id="work">
      <div className="section-shell">
        <div className="section-heading">
          <p className="section-label">Selected work</p>
          <h2>Featured projects</h2>
        </div>

        <div className="project-grid project-grid--featured">
          {featured.map((project) => (
            <ProjectCard key={project.id} project={project} featured />
          ))}
        </div>

        <div className="section-heading section-heading--index">
          <p className="section-label">Full index</p>
          <h2>All projects</h2>
        </div>

        <div className="filter-bar" role="group" aria-label="Filter projects by category">
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`filter-pill${activeCategory === c.id ? " is-active" : ""}`}
              aria-pressed={activeCategory === c.id}
              onClick={() => onCategoryChange(c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="project-grid">
          {visible.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
};
