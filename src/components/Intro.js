import { profile } from "../data/profile";
import { ArrowRightIcon } from "../icons";
import { InterestMap } from "./InterestMap";

export const Intro = ({ activeCategory, onCategoryChange }) => {
  return (
    <section className="intro" id="top">
      <div className="section-shell intro__grid">
        <div className="intro__copy">
          <p className="section-label">{profile.role}</p>
          <h1 className="intro__name">{profile.name}</h1>
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
          <InterestMap activeCategory={activeCategory} onSelect={onCategoryChange} />
        </div>
      </div>
    </section>
  );
};
