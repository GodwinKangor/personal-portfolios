import { useEffect, useRef, useState } from "react";
import "./App.css";
import { ThemeProvider } from "./theme/ThemeContext";
import { NavBar } from "./components/NavBar";
import { Intro } from "./components/Intro";
import { WhoNow } from "./components/WhoNow";
import { Projects } from "./components/Projects";
import { Capabilities } from "./components/Capabilities";
import { Contact } from "./components/Contact";
import { Footer } from "./components/Footer";
import { UniversePage } from "./components/UniversePage";

const UNIVERSE_ROUTE = /^#\/universe(?:\/([\w-]+))?\/?$/;

const useHash = () => {
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const onChange = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return hash;
};

// On the universe page a plain "#main-content" link would route back home.
const skipWithoutRouting = (event) => {
  const main = document.getElementById("main-content");
  if (!main) return;
  event.preventDefault();
  main.setAttribute("tabindex", "-1");
  main.focus();
};

function App() {
  const [activeCategory, setActiveCategory] = useState("all");
  const hash = useHash();
  const universe = hash.match(UNIVERSE_ROUTE);
  const inUniverse = Boolean(universe);

  // Switching pages swaps the whole tree, so the browser's own anchor jump
  // fires before the target exists. Re-run it once the new page renders.
  const wasInUniverse = useRef(inUniverse);
  useEffect(() => {
    if (wasInUniverse.current === inUniverse) return;
    wasInUniverse.current = inUniverse;
    if (inUniverse) {
      document.documentElement.scrollTop = 0;
    } else {
      document.getElementById(window.location.hash.slice(1))?.scrollIntoView?.();
    }
  }, [inUniverse]);

  return (
    <ThemeProvider>
      <div className="App">
        <a className="skip-link" href="#main-content" onClick={inUniverse ? skipWithoutRouting : undefined}>
          Skip to content
        </a>
        {universe ? (
          <UniversePage
            focusedId={universe[1] || null}
            onFocusChange={(id) => { window.location.hash = id ? `#/universe/${id}` : "#/universe"; }}
          />
        ) : (
          <>
            <NavBar />
            <main id="main-content">
              <Intro activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
              <WhoNow />
              <Projects activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
              <Capabilities />
              <Contact />
            </main>
            <Footer />
          </>
        )}
      </div>
    </ThemeProvider>
  );
}

export default App;
