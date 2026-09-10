import { capabilities } from "../data/capabilities";
import { projects } from "../data/projects";

export const Capabilities = () => {
  return (
    <section className="capabilities">
      <div className="section-shell">
        <div className="section-heading">
          <p className="section-label">Capabilities</p>
          <h2>What I work with</h2>
        </div>

        <ul className="capability-grid">
          {capabilities.map((cap) => {
            const example = projects.find((p) => p.id === cap.exampleId);
            return (
              <li key={cap.title} className="capability-card">
                <h3>{cap.title}</h3>
                <p>{cap.description}</p>
                {example && (
                  <a href="#work" className="capability-card__example">
                    Example: {example.title}
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
};
