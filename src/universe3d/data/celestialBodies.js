// Authoring data for the 3D universe: what exists and what it is called.
// Rendering components never hardcode portfolio content; they read the flat,
// fully-resolved body list that simulation/hierarchy.js builds from this file.
//
// Units are artistic "scene units". Distances and sizes are compressed so the
// whole system fits on screen while keeping believable relationships: small
// rocky worlds inside, the belt in the middle, giants outside. Moon and
// satellite orbits, sizes, and speeds are derived automatically from their
// parent, so adding an entry here is all it takes to add a body.
//
// Ids are stable keys for selection and, later, for portfolio content.
// Moons have explicit ids; satellites and concept asteroids derive theirs
// from their name (see hierarchy.js), so renaming one changes its id.

/**
 * @typedef {"star" | "planet" | "moon" | "satellite" | "belt" | "asteroid"} BodyKind
 * @typedef {"earthlike" | "rocky" | "desert" | "jovian" | "saturnian" | "iceGiant"
 *   | "moonGray" | "moonDark" | "moonDusty" | "moonIcy"} SurfaceType
 */

/**
 * @typedef {Object} Orbit
 * @property {number} distance       Circular orbit radius around the parent.
 * @property {number} period         Seconds for one revolution.
 * @property {number} phase          Starting angle, radians.
 * @property {number} inclination    Tilt of the orbital plane, radians.
 * @property {number} ascendingNode  Direction of that tilt around the vertical axis, radians.
 */

/**
 * @typedef {Object} Spin
 * @property {number} [period]          Seconds per rotation (ignored when tidally locked).
 * @property {number} axialTilt         Radians.
 * @property {boolean} [tidallyLocked]  Always shows the same face to its parent.
 */

/**
 * Fully resolved body, as produced by buildSystem().
 * @typedef {Object} CelestialBody
 * @property {string} id
 * @property {string} name
 * @property {BodyKind} kind
 * @property {string} category
 * @property {string | null} parentId
 * @property {number} radius
 * @property {Spin} [spin]
 * @property {Orbit} [orbit]           Relative to the parent; omitted for the star and the belt.
 * @property {SurfaceType} [surface]
 * @property {string} [tint]           Accent colour for highlights and labels.
 * @property {string} [atmosphere]     Atmosphere rim colour.
 * @property {boolean} [clouds]
 * @property {{ inner: number, outer: number }} [rings]  Ring radii as multiples of the body radius.
 */

const deg = (d) => (d * Math.PI) / 180;

export const STAR = {
  id: "about-me",
  name: "Godwin Kangor",
  category: "About me",
  radius: 1.3,
  spin: { period: 90, axialTilt: deg(7) },
};

export const PLANETS = [
  {
    id: "technical-skills",
    name: "Technical Skills",
    category: "Technical skills",
    surface: "rocky",
    tint: "#c9b8a4",
    radius: 0.36,
    distance: 2.7,
    phase: deg(35),
    inclination: deg(3.4),
    ascendingNode: deg(48),
    spin: { period: 22, axialTilt: deg(2) },
    moonSurfaces: ["moonGray", "moonDark"],
    moons: [
      { id: "programming-languages", name: "Programming Languages", satellites: ["Java", "Python", "C", "JavaScript"] },
      { id: "frontend", name: "Frontend", satellites: ["React", "HTML/CSS", "Vite"] },
      { id: "backend", name: "Backend", satellites: ["Spring Boot", "Firebase", "REST APIs"] },
      { id: "development-tools", name: "Development Tools", satellites: ["Git", "GitHub", "VS Code"] },
      { id: "graphics-tools", name: "Graphics Tools", satellites: ["Blender", "Maya", "Photoshop", "Substance Painter"] },
    ],
  },
  {
    id: "education",
    name: "Education",
    category: "Education",
    surface: "earthlike",
    tint: "#7fb4ff",
    atmosphere: "#6fa8ff",
    clouds: true,
    radius: 0.48,
    distance: 3.9,
    phase: deg(200),
    inclination: deg(1.2),
    ascendingNode: deg(120),
    spin: { period: 14, axialTilt: deg(23.4) },
    moonSurfaces: ["moonGray"],
    moons: [
      { id: "computer-science", name: "Computer Science" },
      { id: "digital-arts", name: "Digital Arts" },
      { id: "computational-photography", name: "Computational Photography" },
      { id: "visual-computing", name: "Visual Computing" },
      { id: "human-computer-interaction", name: "Human-Computer Interaction" },
    ],
  },
  {
    id: "personal-world",
    name: "Personal World",
    category: "Personal world",
    surface: "desert",
    tint: "#d98a5f",
    atmosphere: "#e0a27a",
    radius: 0.4,
    distance: 5.1,
    phase: deg(105),
    inclination: deg(1.9),
    ascendingNode: deg(310),
    spin: { period: 15, axialTilt: deg(25.2) },
    moonSurfaces: ["moonDusty", "moonDark"],
    moons: [
      { id: "kenya-cultural-background", name: "Kenya and Cultural Background" },
      { id: "soccer", name: "Soccer" },
      { id: "music", name: "Music" },
      { id: "outdoor-adventures", name: "Outdoor Adventures" },
      { id: "languages", name: "Languages" },
      { id: "personal-interests", name: "Personal Interests" },
    ],
  },
  {
    id: "projects",
    name: "Projects",
    category: "Projects",
    surface: "jovian",
    tint: "#e2b98a",
    atmosphere: "#e8c9a0",
    radius: 1.05,
    distance: 8.8,
    phase: deg(300),
    inclination: deg(1.3),
    ascendingNode: deg(100),
    spin: { period: 9, axialTilt: deg(3.1) },
    moonSurfaces: ["moonDusty", "moonIcy", "moonDark", "moonGray"],
    moons: [
      { id: "dartmouth-energy-twin", name: "Dartmouth Energy Twin" },
      { id: "tiny-search-engine", name: "Tiny Search Engine" },
      { id: "huffman-compression", name: "Huffman Compression" },
      { id: "multiplayer-treasure-hunt", name: "Multiplayer Treasure-Hunt Game" },
      { id: "uv-doctor", name: "UV Doctor" },
    ],
  },
  {
    id: "professional-experience",
    name: "Professional Experience",
    category: "Professional experience",
    surface: "saturnian",
    tint: "#e6cf98",
    atmosphere: "#efdcae",
    rings: { inner: 1.3, outer: 2.15 },
    radius: 0.82,
    distance: 11.2,
    phase: deg(160),
    inclination: deg(2.5),
    ascendingNode: deg(230),
    spin: { period: 10, axialTilt: deg(26.7) },
    moonSurfaces: ["moonIcy", "moonGray"],
    moons: [
      { id: "dartmouth-admissions", name: "Dartmouth Admissions" },
      { id: "dartmouth-outdoor-programs", name: "Dartmouth Outdoor Programs" },
      { id: "codekenya", name: "CodeKenya" },
      { id: "dali-lab", name: "DALI Lab" },
      { id: "dartmouth-section-leader", name: "Dartmouth Section Leader" },
    ],
  },
  {
    id: "creative-world",
    name: "Creative World",
    category: "Creative world",
    surface: "iceGiant",
    tint: "#8fd3e8",
    atmosphere: "#9ad8f0",
    radius: 0.68,
    distance: 13.4,
    phase: deg(20),
    inclination: deg(1.8),
    ascendingNode: deg(75),
    spin: { period: 12, axialTilt: deg(28.3) },
    moonSurfaces: ["moonIcy", "moonDark"],
    moons: [
      { id: "3d-modeling", name: "3D Modeling" },
      { id: "photography", name: "Photography" },
      { id: "ui-ux-design", name: "UI/UX Design" },
      { id: "music-digital-creativity", name: "Music and Digital Creativity" },
    ],
  },
];

// Sits between Personal World and Projects, like the real belt between Mars and Jupiter.
export const ASTEROID_BELT = {
  id: "asteroid-belt",
  name: "Asteroid Belt",
  category: "Concepts & attributes",
  innerRadius: 6.2,
  outerRadius: 7.3,
  // Environmental rocks; only the concepts below are selectable.
  backgroundCount: 1400,
  concepts: [
    {
      category: "Computer Science Fundamentals",
      items: ["Algorithms", "Data Structures", "Object-Oriented Programming", "Computer Networks", "Databases", "Computer Graphics"],
    },
    {
      category: "Engineering Concepts",
      items: ["API Design", "Testing", "Debugging", "Version Control", "System Design", "Performance Optimization"],
    },
    {
      category: "Personal Attributes",
      items: ["Creativity", "Leadership", "Collaboration", "Communication", "Curiosity", "Adaptability"],
    },
  ],
};
