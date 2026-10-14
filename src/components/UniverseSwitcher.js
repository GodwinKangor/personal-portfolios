import { lazy, Suspense, useRef, useState } from "react";
import { InterestMap } from "./InterestMap";

// Three.js is large; only download it when someone opens the 3D tab.
const Universe3D = lazy(() => import("../universe3d/Universe3D"));

const TABS = [
  { id: "orbit", label: "Orbit map", footer: ["Nine planets, their moons, and a belt of everything else.", "Click a planet to zoom in"] },
  { id: "3d", label: "3D system", footer: ["Six worlds, their moons, and a belt of ideas, lit by one star.", "Click a planet · ⤢ to expand"] },
];

export const UniverseSwitcher = ({ activeCategory, onCategoryChange }) => {
  const [activeTab, setActiveTab] = useState("orbit");
  const tabRefs = useRef({});
  const current = TABS.find((t) => t.id === activeTab);

  // Arrow keys move between tabs, per the WAI-ARIA tabs pattern.
  const onKeyDown = (e) => {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (!step) return;
    e.preventDefault();
    const next = TABS[(TABS.indexOf(current) + step + TABS.length) % TABS.length];
    setActiveTab(next.id);
    tabRefs.current[next.id]?.focus();
  };

  return (
    <>
      <div className="intro__map-header">
        <span>My creative universe</span>
        {activeTab === "orbit" && <a href="#/universe">⤢ Full view</a>}
      </div>
      <div className="universe-tabs" role="tablist" aria-label="Choose a universe" onKeyDown={onKeyDown}>
        {TABS.map((tab) => (
          <button key={tab.id} type="button" role="tab" id={`universe-tab-${tab.id}`} aria-controls={`universe-panel-${tab.id}`}
            aria-selected={activeTab === tab.id} tabIndex={activeTab === tab.id ? 0 : -1}
            ref={(el) => { tabRefs.current[tab.id] = el; }} onClick={() => setActiveTab(tab.id)}>
            {tab.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`universe-panel-${activeTab}`} aria-labelledby={`universe-tab-${activeTab}`}>
        {activeTab === "orbit" ? (
          <InterestMap activeCategory={activeCategory} onSelect={onCategoryChange} />
        ) : (
          <Suspense fallback={<div className="u3d__loading">Loading the 3D universe…</div>}>
            <Universe3D />
          </Suspense>
        )}
      </div>
      <p className="intro__map-footer"><span>{current.footer[0]}</span><span>{current.footer[1]}</span></p>
    </>
  );
};
