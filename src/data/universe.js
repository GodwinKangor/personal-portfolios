// The "universe" on the home page and at #/universe. Each planet is a major
// area of work; its moons are the languages, tools, and concepts used there.
// Everything is drawn from real projects and the resume — edit freely, the
// layout renders whatever is listed. Planet size grows with moon count.
//
//   look:     "plain" | "bands" | "rings" | "craters" (surface style only)
//   category: optional project filter it maps to (see data/projects.js)
//   projects: project ids where this area shows up

export const BELT_ID = "belt";

export const moonKinds = {
  language: { label: "Languages", color: "#8aabff" },
  tool: { label: "Tools & frameworks", color: "#71e2bf" },
  concept: { label: "Concepts", color: "#f3c77b" },
};

export const planets = [
  {
    id: "web",
    name: "Full-Stack Web",
    short: "Web",
    tagline: "End-to-end products, from the database schema to a polished UI.",
    color: "#8aabff",
    look: "bands",
    category: "software",
    projects: ["hireflow", "exitify", "movers-transport", "kadi"],
    moons: {
      language: ["JavaScript", "TypeScript"],
      tool: ["React", "Next.js", "FastAPI", "Flask", "Prisma", "Postgres", "MySQL"],
      concept: ["REST APIs"],
    },
  },
  {
    id: "ml",
    name: "Machine Learning & Data",
    short: "ML & Data",
    tagline: "Turning text, audio, and stats into predictions.",
    color: "#71e2bf",
    look: "bands",
    category: "ml",
    projects: ["dj-effect-detection", "amazon-review-classifier", "basketball-win-predictor"],
    moons: {
      language: ["Python"],
      tool: ["scikit-learn", "Librosa"],
      concept: ["Text classification", "Sentiment analysis", "Audio features", "Statistical modeling"],
    },
  },
  {
    id: "three-d",
    name: "3D Modeling & Animation",
    short: "3D",
    tagline: "Characters, rooms, and abstract forms — modeled, rigged, textured, animated.",
    color: "#c4a0ff",
    look: "rings",
    category: "design",
    projects: ["biped-project", "room-project", "abstract-project"],
    moons: {
      language: [],
      tool: ["Maya", "Substance Painter"],
      concept: ["Modeling", "Rigging", "Character animation", "Texturing", "Low-poly forms"],
    },
  },
  {
    id: "ui-ux",
    name: "UI/UX & Product Design",
    short: "UI/UX",
    tagline: "Interfaces that feel obvious, designed before they're built.",
    color: "#ff9ec7",
    look: "plain",
    category: "design",
    projects: ["ice-cream-finder"],
    moons: {
      language: [],
      tool: ["Figma", "Google Maps API"],
      concept: ["Interface design", "Interaction design"],
    },
  },
  {
    id: "spatial",
    name: "Spatial & Digital Twins",
    short: "Spatial",
    tagline: "Real places rebuilt as interactive 3D data.",
    color: "#6fd3f2",
    look: "craters",
    category: "software",
    projects: ["dartmouth-energy-twin"],
    moons: {
      language: ["TypeScript"],
      tool: ["CesiumJS", "Next.js"],
      concept: ["Digital twins", "3D geospatial data"],
    },
  },
  {
    id: "systems",
    name: "Systems Programming",
    short: "Systems",
    tagline: "Close to the metal: memory, processes, and the shell.",
    color: "#f3c77b",
    look: "craters",
    category: "coursework",
    projects: ["gold-nuggets-game"],
    moons: {
      language: ["C", "C++"],
      tool: ["Unix / Linux"],
      concept: ["Operating systems", "Memory management", "Sockets"],
    },
  },
  {
    id: "networking",
    name: "Multiplayer & Networking",
    short: "Networking",
    tagline: "Games and tools where many people share one live state.",
    color: "#ff9f7a",
    look: "plain",
    projects: ["kadi", "gold-nuggets-game", "sketch-editor"],
    moons: {
      language: ["Java", "JavaScript"],
      tool: ["Socket.IO"],
      concept: ["Client / server", "Real-time sync", "Concurrency"],
    },
  },
  {
    id: "compilers",
    name: "Compilers",
    short: "Compilers",
    tagline: "MiniC: source code all the way down to x86.",
    color: "#e98a8a",
    look: "rings",
    category: "coursework",
    projects: ["minic-compiler"],
    moons: {
      language: ["C"],
      tool: ["Yacc / Lex", "LLVM"],
      concept: ["Parsing", "IR generation", "Optimization", "x86 code generation"],
    },
  },
  {
    id: "algorithms",
    name: "Algorithms & Data Structures",
    short: "Algorithms",
    tagline: "Graphs, trees, and probabilistic models doing real work.",
    color: "#b6e36f",
    look: "bands",
    category: "coursework",
    projects: ["kevin-bacon-game", "huffman-compression", "pos-tagger", "2d-space-management", "dartmouth-pathfinder"],
    moons: {
      language: ["Java", "Python"],
      tool: [],
      concept: ["Graph search", "Huffman coding", "Quadtrees", "Hidden Markov models", "Object-oriented design"],
    },
  },
];

// The asteroid belt: small things that don't warrant a planet of their own.
export const asteroids = [
  "Git / GitHub",
  "VS Code",
  "Firebase",
  "Google APIs",
  "SQL",
  "JUnit",
  "Software development life cycle",
];
