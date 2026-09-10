import { categories } from "../data/projects";

const CATEGORY_LABELS = Object.fromEntries(categories.map((c) => [c.id, c.label]));

const initials = (title) =>
  title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

export const ProjectCard = ({ project, featured = false }) => {
  const { title, description, tech, category, repoUrl, demoUrl, image, videoUrl } = project;

  return (
    <article className={`project-card${featured ? " project-card--featured" : ""}`}>
      <div className="project-card__cover">
        {videoUrl ? (
          <video controls preload="metadata" poster={image} aria-label={`${title} demo video`}>
            <source src={videoUrl} type="video/mp4" />
          </video>
        ) : image ? (
          <img src={image} alt={`${title} screenshot`} loading="lazy" />
        ) : (
          <div className="project-card__cover-placeholder" aria-hidden="true">
            <span>{initials(title)}</span>
          </div>
        )}
      </div>

      <div className="project-card__body">
        <p className="project-card__meta">{CATEGORY_LABELS[category]}</p>
        <h3 className="project-card__title">{title}</h3>
        {description && <p className="project-card__description">{description}</p>}

        {tech && tech.length > 0 && (
          <ul className="project-card__tech" aria-label="Technologies used">
            {tech.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        )}

        {(repoUrl || demoUrl) && (
          <div className="project-card__links">
            {repoUrl && (
              <a href={repoUrl} target="_blank" rel="noopener noreferrer">
                View repo
              </a>
            )}
            {demoUrl && (
              <a href={demoUrl} target="_blank" rel="noopener noreferrer">
                View demo
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  );
};
