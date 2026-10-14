import { profile } from "../data/profile";
import { ArrowRightIcon } from "../icons";
import { UniverseSwitcher } from "./UniverseSwitcher";

export const Intro = ({ activeCategory, onCategoryChange }) => {
  return (
    <section className="intro" id="top">
      <div className="section-shell intro__grid">
        <div className="intro__copy">
          <p className="intro__eyebrow">Code, systems & visual thinking</p>
          <h1 className="intro__name">Godwin <span>Kangor.</span></h1>
          <p className="section-label">{profile.role}</p>
          <p className="intro__summary">{profile.summary}</p>
          <div className="intro__actions">
            <a className="button button--primary" href="#work">
              View work <ArrowRightIcon />
            </a>
            <a className="button button--ghost" href="#connect">
              Contact
            </a>
          </div>
        </div>

        <div className="intro__map">
          <UniverseSwitcher activeCategory={activeCategory} onCategoryChange={onCategoryChange} />
        </div>
      </div>
    </section>
  );
};
