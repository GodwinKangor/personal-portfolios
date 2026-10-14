import { SolarSystem } from "./SolarSystem";

// Full-screen view of the universe at #/universe (and #/universe/<planet>).
// The focused planet lives in the URL, so back/forward zooms in and out.
export const UniversePage = ({ focusedId, onFocusChange }) => (
  <div className="universe-page">
    <header className="universe-page__bar">
      <a href="#top">← Back to portfolio</a>
      <span>Godwin Kangor</span>
    </header>
    <main id="main-content" className="universe-page__main">
      <div className="universe-page__intro">
        <h1>My universe</h1>
        <p>Nine planets — the major things I do. Land on one to see its moons: the languages, tools, and concepts behind it.</p>
      </div>
      <SolarSystem variant="full" focusedId={focusedId} onFocusChange={onFocusChange} />
    </main>
  </div>
);
