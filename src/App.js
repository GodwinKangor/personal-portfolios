import { useState } from "react";
import "./App.css";
import { ThemeProvider } from "./theme/ThemeContext";
import { NavBar } from "./components/NavBar";
import { Intro } from "./components/Intro";
import { WhoNow } from "./components/WhoNow";
import { Projects } from "./components/Projects";
import { Capabilities } from "./components/Capabilities";
import { Contact } from "./components/Contact";
import { Footer } from "./components/Footer";

function App() {
  const [activeCategory, setActiveCategory] = useState("all");

  return (
    <ThemeProvider>
      <div className="App">
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <NavBar />
        <main id="main-content">
          <Intro activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
          <WhoNow />
          <Projects activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
          <Capabilities />
          <Contact />
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
}

export default App;
