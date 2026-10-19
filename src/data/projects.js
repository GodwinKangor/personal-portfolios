// Editable project index. Add/edit projects here — the layout renders
// whatever is listed. Omit repoUrl/demoUrl when there is no real link
// rather than pointing at a dead destination. Omit `image` to fall back
// to a neutral typographic cover instead of a generic placeholder.

import abstractProjectCover from "../assets/img/projects/abstract-project.jpg";
import bipedProjectCover from "../assets/img/projects/biped-project.jpg";
import roomProjectCover from "../assets/img/projects/room-project.jpg";
import energyTwinCover from "../assets/img/projects/dartmouth-energy-twin.jpg";

const GH = "https://github.com/GodwinKangor";

// Categories used for both the filter controls and the interest map.
// "coursework" is reachable only through the filters, by design.
export const categories = [
  { id: "all", label: "All" },
  { id: "software", label: "Software Engineering" },
  { id: "ml", label: "ML / Data" },
  { id: "coursework", label: "Coursework" },
  { id: "design", label: "Design / 3D" },
];

// Subset of categories used by the interest map (see brief: coursework
// stays accessible via the filters, not as its own map branch).
export const mapCategories = ["software", "ml", "design"];

export const featuredIds = ["hireflow", "exitify", "dartmouth-energy-twin"];

export const projects = [
  {
    id: "hireflow",
    title: "HireFlow",
    description: "AI-assisted job search platform.",
    tech: ["Next.js", "FastAPI", "Postgres"],
    category: "software",
    repoUrl: `${GH}/HireFlow`,
  },
  {
    id: "exitify",
    title: "Exitify",
    description: "Spotify → YouTube playlist migrator.",
    tech: ["Next.js", "Prisma"],
    category: "software",
    repoUrl: `${GH}/Exitify`,
  },
  {
    id: "dartmouth-energy-twin",
    title: "Dartmouth Energy Twin",
    description: "Interactive 3D digital twin for exploring Dartmouth's campus and energy future.",
    tech: ["Next.js", "CesiumJS"],
    category: "software",
    repoUrl: `${GH}/MapWRLD`,
    demoUrl: "https://dartmouth-energy-twin.vercel.app",
    image: energyTwinCover,
  },
  {
    id: "movers-transport",
    title: "Movers Transport",
    description: "Logistics platform.",
    tech: ["Flask", "MySQL"],
    category: "software",
    repoUrl: `${GH}/Movers-Transport`,
  },
  {
    id: "kadi",
    title: "Kadi",
    description: "Multiplayer card game.",
    tech: ["React", "Socket.IO"],
    category: "software",
    repoUrl: `${GH}/Kadi`,
    demoUrl: "https://kadi-nine.vercel.app",
  },
  {
    id: "launchpad",
    title: "LaunchPad",
    description: "Deploy applications from GitHub to your own server.",
    tech: ["Next.js", "TypeScript", "Prisma", "BullMQ", "Docker"],
    category: "software",
    repoUrl: `${GH}/LaunchPad`,
  },
  {
    id: "calendai",
    title: "CalendAI",
    description: "Student calendar that pulls assignments from syllabi and Canvas, with natural-language event scheduling.",
    tech: ["React", "Vite", "Tailwind CSS", "OpenRouter API"],
    category: "software",
    repoUrl: `${GH}/project-calendai-main`,
    demoUrl: "https://project-calendai.onrender.com/",
  },
  {
    id: "webcam-based-painting",
    title: "Webcam-Based Painting",
    description: "Recolor or paint image regions by color similarity, using a RegionFinder image-processing service.",
    tech: ["Java", "Spring Boot", "React", "Vite"],
    category: "software",
    repoUrl: `${GH}/webcam-based-painting`,
    demoUrl: "https://webcam-based-painting-0hdv.onrender.com/",
  },
  {
    id: "expense-tracker",
    title: "Expense Tracker",
    description: "Expense tracking web app.",
    tech: ["JavaScript", "HTML", "CSS"],
    category: "software",
    repoUrl: `${GH}/expense-tracker-app`,
  },
  {
    id: "dj-effect-detection",
    title: "DJ Effect Detection",
    description: "Audio ML app.",
    tech: ["Python", "Librosa"],
    category: "ml",
  },
  {
    id: "amazon-review-classifier",
    title: "Amazon Review Classifier",
    description: "Text sentiment classifier.",
    tech: ["scikit-learn"],
    category: "ml",
  },
  {
    id: "basketball-win-predictor",
    title: "Basketball Win Predictor",
    description: "Stats-based modeling.",
    tech: [],
    category: "ml",
  },
  {
    id: "gold-nuggets-game",
    title: "Gold Nuggets Game",
    description: "CS50 multiplayer game.",
    tech: ["C", "Client/Server"],
    category: "coursework",
    repoUrl: `${GH}/Gold-Nuggets-Game`,
  },
  {
    id: "pos-tagger",
    title: "Parts-of-Speech Tagger",
    description: "HMM POS tagger.",
    tech: ["Java"],
    category: "coursework",
    repoUrl: `${GH}/Parts-Of-Speech-Tagger`,
    image:
      "https://raw.githubusercontent.com/GodwinKangor/Parts-Of-Speech-Tagger/HEAD/Screenshot%202024-02-28%20at%209.48.05%20AM.png",
  },
  {
    id: "dartmouth-pathfinder",
    title: "Dartmouth Campus Pathfinder",
    description: "Campus pathfinding (BFS).",
    tech: ["Python"],
    category: "coursework",
    repoUrl: `${GH}/Dartmouth-Pathfinder_part3`,
    image:
      "https://raw.githubusercontent.com/GodwinKangor/Dartmouth-Pathfinder_part3/HEAD/dartmouth_map.png",
  },
  {
    id: "2d-space-management",
    title: "2D Space Management",
    description: "Quadtree collision detection.",
    tech: ["Java"],
    category: "coursework",
    repoUrl: `${GH}/2D-Space-management`,
    image:
      "https://raw.githubusercontent.com/GodwinKangor/2D-Space-management/HEAD/Screenshot%202024-01-31%20at%202.42.09%20AM.png",
  },
  {
    id: "sketch-editor",
    title: "Collaborative Sketch Editor",
    description: "Networked whiteboard.",
    tech: ["Java", "Client/Server"],
    category: "coursework",
    repoUrl: `${GH}/Server---Client-Drawing-program-`,
  },
  {
    id: "kevin-bacon-game",
    title: "Kevin Bacon Game",
    description: "Six degrees of separation.",
    tech: ["Java", "Graph Search"],
    category: "coursework",
    repoUrl: `${GH}/Kevin-Bacon-Game`,
  },
  {
    id: "huffman-compression",
    title: "Huffman Compression Tool",
    description: "File compressor.",
    tech: ["Java"],
    category: "coursework",
    repoUrl: `${GH}/Compressing-Program`,
  },
  {
    id: "minic-compiler",
    title: "MiniC Compiler",
    description: "C compiler: parsing, LLVM IR generation, optimization, x86 codegen.",
    tech: ["C", "Yacc/Lex", "LLVM"],
    category: "coursework",
    repoUrl: `${GH}/MiniC`,
  },
  {
    id: "abstract-project",
    title: "Abstract Project",
    description: "Procedural low-poly abstract form study.",
    tech: ["Maya"],
    category: "design",
    image: abstractProjectCover,
  },
  {
    id: "biped-project",
    title: "Biped Project — Deadly Valentine",
    description: "Rigged biped character animation short.",
    tech: ["Maya", "Substance Painter"],
    category: "design",
    image: bipedProjectCover,
    videoUrl: "/media/deadly-valentine.mp4",
  },
  {
    id: "room-project",
    title: "Room Project",
    description: "Modeled sci-fi interior/control-room scene.",
    tech: ["Maya"],
    category: "design",
    image: roomProjectCover,
  },
  {
    id: "ice-cream-finder",
    title: "Ice Cream Finder App",
    description: "",
    tech: ["UI/UX Design", "Google Maps API"],
    category: "design",
    repoUrl: `${GH}/Ice_Cream_Finder`,
  },
];
