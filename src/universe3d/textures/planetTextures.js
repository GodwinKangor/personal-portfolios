import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from "three";
import { createNoise3D, createRandom, fbm, smoothstep } from "./noise";

// Procedural stand-ins for real planetary imagery. Each recipe returns colour,
// height, and roughness for a point on the unit sphere; `paintSphere` bakes
// that into equirectangular maps. Sampling on the sphere (rather than in 2D
// texture space) keeps the maps seamless at the date line.
//
// Swap any of these for licensed photographic maps later: the planet
// component only consumes { map, bumpMap, roughnessMap, cloudMap }.

const hex = (value) => [1, 3, 5].map((i) => parseInt(value.slice(i, i + 2), 16));
const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

const createCanvas = (width, height) => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
};

/**
 * Walk every texel of an equirectangular map, convert it to a direction on
 * the unit sphere, and let `sample(x, y, z, latitude)` decide its values.
 * Returns the requested channels as canvases.
 */
function* paintSphere(width, height, channels, sample) {
  const canvases = Object.fromEntries(channels.map((name) => [name, createCanvas(width, height)]));
  const images = Object.fromEntries(channels.map((name) => [name, canvases[name].getContext("2d").createImageData(width, height)]));
  const out = {};

  for (let row = 0; row < height; row += 1) {
    // Row 0 is the north pole (+Y); texture V runs top to bottom.
    const latitude = (0.5 - (row + 0.5) / height) * Math.PI;
    const cosLat = Math.cos(latitude);
    const y = Math.sin(latitude);
    for (let col = 0; col < width; col += 1) {
      // Match three's SphereGeometry UV layout: u = 0 at −X, increasing eastward.
      const longitude = ((col + 0.5) / width) * Math.PI * 2;
      const x = -Math.cos(longitude) * cosLat;
      const z = Math.sin(longitude) * cosLat;
      sample(x, y, z, latitude, out);
      const offset = (row * width + col) * 4;
      for (const name of channels) {
        const value = out[name];
        const data = images[name].data;
        if (typeof value === "number") {
          data[offset] = data[offset + 1] = data[offset + 2] = value * 255;
        } else {
          data[offset] = value[0];
          data[offset + 1] = value[1];
          data[offset + 2] = value[2];
        }
        data[offset + 3] = 255;
      }
    }
    yield; // let the scheduler pause between rows
  }

  channels.forEach((name) => canvases[name].getContext("2d").putImageData(images[name], 0, 0));
  return canvases;
}

const toTexture = (canvas, { color = false } = {}) => {
  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.anisotropy = 4;
  // Colour maps are authored in sRGB; height/roughness data must stay linear.
  if (color) texture.colorSpace = SRGBColorSpace;
  return texture;
};

const EARTH = {
  deep: hex("#08203d"),
  shallow: hex("#1f5b80"),
  coast: hex("#3f7f8f"),
  forest: hex("#2f5a2a"),
  grass: hex("#5d7a3a"),
  desert: hex("#b49a6a"),
  rock: hex("#7a6c5c"),
  snow: hex("#e8edf0"),
};

function* earthlike() {
  const continents = createNoise3D(11);
  const warp = createNoise3D(23);
  const climate = createNoise3D(37);
  const detail = createNoise3D(41);
  const SEA_LEVEL = 0.52;

  const surface = yield* paintSphere(1024, 512, ["color", "height", "roughness"], (x, y, z, latitude, out) => {
    // Domain warping bends coastlines so continents don't look like blobs.
    const w = fbm(warp, x * 2 + 4, y * 2, z * 2, 4) - 0.5;
    const h = fbm(continents, x * 1.6 + w, y * 1.6 + w, z * 1.6 - w, 6);
    const fine = fbm(detail, x * 9, y * 9, z * 9, 3);
    const polar = Math.abs(latitude) / (Math.PI / 2);
    const iceLine = 0.8 + (fine - 0.5) * 0.18;

    if (polar > iceLine) {
      out.color = mix(EARTH.snow, hex("#c9d4dc"), fine * 0.6);
      out.height = 0.55;
      out.roughness = 0.55;
    } else if (h < SEA_LEVEL) {
      const depth = (SEA_LEVEL - h) / SEA_LEVEL;
      out.color = mix(mix(EARTH.coast, EARTH.shallow, smoothstep(0, 0.06, depth)), EARTH.deep, smoothstep(0.05, 0.3, depth));
      out.height = 0.45;
      out.roughness = 0.32;
    } else {
      const elevation = (h - SEA_LEVEL) / (1 - SEA_LEVEL);
      // Dry belts near ±25° latitude, wetter near the equator and higher up.
      const subtropic = Math.exp(-(((Math.abs(latitude) - 0.42) / 0.16) ** 2));
      const aridity = smoothstep(0.35, 0.75, fbm(climate, x * 2.5, y * 2.5, z * 2.5, 4) * 0.7 + subtropic * 0.45);
      let color = mix(mix(EARTH.forest, EARTH.grass, fine), EARTH.desert, aridity);
      color = mix(color, EARTH.rock, smoothstep(0.25, 0.5, elevation));
      color = mix(color, EARTH.snow, smoothstep(0.5, 0.62, elevation + polar * 0.35));
      out.color = color;
      out.height = 0.5 + elevation * 0.5;
      out.roughness = 0.88;
    }
  });

  const cloudNoise = createNoise3D(53);
  const cloudWarp = createNoise3D(59);
  const clouds = yield* paintSphere(1024, 512, ["alpha"], (x, y, z, latitude, out) => {
    const w = fbm(cloudWarp, x * 3, y * 3, z * 3, 3) - 0.5;
    // Stretch along longitude so cloud bands trail like weather systems.
    const c = fbm(cloudNoise, x * 3 + w * 1.4, y * 6 + w, z * 3 - w * 1.4, 6);
    out.alpha = smoothstep(0.5, 0.72, c) * 0.9;
  });

  return {
    map: toTexture(surface.color, { color: true }),
    bumpMap: toTexture(surface.height),
    roughnessMap: toTexture(surface.roughness),
    cloudMap: toTexture(clouds.alpha),
  };
}

/**
 * A field of impact craters on the unit sphere. Returns a sampler giving the
 * height change and ejecta brightness at a point. Each crater is a parabolic
 * bowl inside its rim, a raised rim at the edge, and faint ejecta beyond.
 */
const craterField = (seed, count, maxSize) => {
  const random = createRandom(seed);
  const craters = Array.from({ length: count }, () => {
    // Uniform random direction: uniform height on [−1, 1], uniform azimuth.
    const u = random() * 2 - 1;
    const theta = random() * Math.PI * 2;
    const s = Math.sqrt(1 - u * u);
    const radius = 0.02 + random() ** 2.4 * maxSize;
    return { x: s * Math.cos(theta), y: u, z: s * Math.sin(theta), radius, depth: 0.12 + random() * 0.12, reach: Math.cos(Math.min(Math.PI, radius * 2.2)) };
  });
  return (x, y, z) => {
    let height = 0;
    let ejecta = 0;
    for (const c of craters) {
      const cos = x * c.x + y * c.y + z * c.z;
      if (cos < c.reach) continue; // cheap reject: outside this crater's influence
      const d = Math.acos(Math.min(1, cos)) / c.radius;
      if (d < 1) height -= (1 - d * d) * c.depth;
      height += Math.exp(-(((d - 1) / 0.18) ** 2)) * c.depth * 0.6;
      if (d > 1) ejecta = Math.max(ejecta, (1 - (d - 1) / 1.2) * 0.5);
    }
    return { height, ejecta };
  };
};

/**
 * Airless cratered body: Mercury-like planets and most moons.
 * `cracks` adds the dark linear fractures seen on icy moons like Europa.
 */
function* cratered({ seed, width, height, craters, maxCraterSize, palette, cracks = 0 }) {
  const base = createNoise3D(seed);
  const tone = createNoise3D(seed + 2);
  const fracture = createNoise3D(seed + 4);
  const sampleCraters = craterField(seed + 8, craters, maxCraterSize);
  const [shadow, low, high, bright] = palette.map(hex);

  const surface = yield* paintSphere(width, height, ["color", "height", "roughness"], (x, y, z, latitude, out) => {
    const crater = sampleCraters(x, y, z);
    const h = 0.5 + (fbm(base, x * 4, y * 4, z * 4, 6) - 0.5) * 0.35 + crater.height;
    const t = fbm(tone, x * 2, y * 2, z * 2, 4);
    let color = mix(low, high, smoothstep(0.3, 0.7, t));
    color = mix(color, shadow, smoothstep(0.5, 0.25, h));
    color = mix(color, bright, crater.ejecta * 0.5);
    if (cracks > 0) {
      // Thin dark lines where a noise field crosses its midpoint.
      const line = 1 - smoothstep(0, 0.018, Math.abs(fbm(fracture, x * 3, y * 3, z * 3, 5) - 0.5));
      color = mix(color, hex("#7a5a44"), line * cracks);
    }
    out.color = color;
    out.height = Math.min(1, Math.max(0, h));
    out.roughness = 0.7 + (1 - t) * 0.25;
  });

  return {
    map: toTexture(surface.color, { color: true }),
    bumpMap: toTexture(surface.height),
    roughnessMap: toTexture(surface.roughness),
  };
}

/** Mars-like dusty world: albedo provinces, sparse craters, small polar caps. */
function* desert() {
  const provinces = createNoise3D(131);
  const dunes = createNoise3D(137);
  const sampleCraters = craterField(139, 40, 0.12);

  const surface = yield* paintSphere(1024, 512, ["color", "height", "roughness"], (x, y, z, latitude, out) => {
    const region = fbm(provinces, x * 1.8, y * 1.8, z * 1.8, 5);
    const fine = fbm(dunes, x * 10, y * 10, z * 10, 3);
    const crater = sampleCraters(x, y, z);
    const polar = Math.abs(latitude) / (Math.PI / 2);
    let color = mix(hex("#c37b4a"), hex("#a5532e"), smoothstep(0.4, 0.6, region));
    color = mix(color, hex("#5e3426"), smoothstep(0.58, 0.72, region) * 0.85); // dark basaltic plains
    color = mix(color, hex("#d9a273"), (fine - 0.5) * 0.5 + 0.1);
    color = mix(color, hex("#e7d2bf"), crater.ejecta * 0.25);
    color = mix(color, hex("#f2ece6"), smoothstep(0.86, 0.9, polar + (fine - 0.5) * 0.08));
    out.color = color;
    out.height = Math.min(1, Math.max(0, 0.5 + (region - 0.5) * 0.4 + crater.height));
    out.roughness = 0.92;
  });

  return {
    map: toTexture(surface.color, { color: true }),
    bumpMap: toTexture(surface.height),
    roughnessMap: toTexture(surface.roughness),
  };
}

/**
 * Banded giant. Bands follow latitude; noise displaces them so their edges
 * swirl, fine streaks run east–west, and an optional oval storm sits on top.
 */
function* banded({ seed, palette, bands, turbulence, contrast = 1, storm = null }) {
  const swirlNoise = createNoise3D(seed);
  const streaks = createNoise3D(seed + 4);
  const colors = palette.map(hex);

  const surface = yield* paintSphere(1024, 512, ["color"], (x, y, z, latitude, out) => {
    const swirl = (fbm(swirlNoise, x * 3, y * 14, z * 3, 5) - 0.5) * turbulence;
    const band = (y + 1) * bands + swirl;
    // band can dip below zero near the south pole; wrap into the palette.
    const index = ((Math.floor(band) % colors.length) + colors.length) % colors.length;
    const next = (index + 1) % colors.length;
    let color = mix(colors[index], colors[next], smoothstep(0.35, 0.65, band - Math.floor(band)));
    const fine = fbm(streaks, x * 6, y * 40, z * 6, 3);
    color = mix(color, colors[0], Math.max(0, fine - 0.55) * 0.9 * contrast);
    color = mix(color, colors[colors.length - 1], Math.max(0, 0.42 - fine) * 0.8 * contrast);

    if (storm) {
      const longitude = Math.atan2(z, -x);
      let dLon = longitude - storm.lon;
      dLon = Math.atan2(Math.sin(dLon), Math.cos(dLon));
      const d = (dLon / storm.width) ** 2 + ((latitude - storm.lat) / storm.height) ** 2;
      if (d < 1.6) {
        color = mix(color, hex(storm.color), smoothstep(1.6, 0.4, d) * 0.85);
        color = mix(color, hex(storm.core), smoothstep(0.25, 0, d) * 0.4);
      }
    }
    out.color = color;
  });

  return { map: toTexture(surface.color, { color: true }) };
}

const rad = (d) => (d * Math.PI) / 180;

const recipes = {
  earthlike,
  rocky: () => cratered({ seed: 71, width: 1024, height: 512, craters: 90, maxCraterSize: 0.22, palette: ["#3a3632", "#5b544d", "#9a8f83", "#b8aea2"] }),
  desert,
  // Jupiter-like: strong contrast, many bands, great red storm.
  jovian: () => banded({
    seed: 97, bands: 6.5, turbulence: 0.9,
    palette: ["#efe4cf", "#d8bf98", "#b98a5e", "#e6d6b8", "#9c6a46", "#d9c3a0", "#c49a6c", "#7c5238"],
    storm: { lat: rad(-22), lon: rad(40), width: 0.2, height: 0.09, color: "#b0583a", core: "#e9c9a3" },
  }),
  // Saturn-like: pale butterscotch with soft, low-contrast bands.
  saturnian: () => banded({
    seed: 151, bands: 8, turbulence: 0.35, contrast: 0.4,
    palette: ["#f0e2bf", "#e2c993", "#d8bb83", "#eadab0", "#cfae74", "#b8955e"],
  }),
  // Neptune-like: deep blue, faint bands, one dark storm.
  iceGiant: () => banded({
    seed: 163, bands: 5, turbulence: 0.25, contrast: 0.35,
    palette: ["#9fd7ea", "#7ec4df", "#6aaed3", "#88cbe3", "#5a98c4", "#3f74a8"],
    storm: { lat: rad(-20), lon: rad(200), width: 0.16, height: 0.07, color: "#2c4f86", core: "#3a62a0" },
  }),
  moonGray: () => cratered({ seed: 211, width: 512, height: 256, craters: 70, maxCraterSize: 0.25, palette: ["#3c3b3a", "#6e6c69", "#a3a09b", "#c9c6c0"] }),
  moonDark: () => cratered({ seed: 223, width: 512, height: 256, craters: 60, maxCraterSize: 0.22, palette: ["#1f1d1b", "#3d3833", "#5d554c", "#8a8075"] }),
  moonDusty: () => cratered({ seed: 227, width: 512, height: 256, craters: 50, maxCraterSize: 0.2, palette: ["#4a3a2c", "#8b7356", "#b9a07a", "#d8c7a6"] }),
  moonIcy: () => cratered({ seed: 229, width: 512, height: 256, craters: 18, maxCraterSize: 0.12, palette: ["#9a948a", "#c9c3b8", "#e7e2d8", "#f6f3ee"], cracks: 0.65 }),
};
const cache = new Map();

/**
 * Baking a 1024×512 map takes a few hundred milliseconds, so recipes are
 * generators that yield after every row. This runs them in ~8ms slices and
 * hands control back to the browser in between, keeping scrolling and the
 * render loop smooth while surfaces are being generated.
 */
const runSliced = (iterator, budgetMs = 8) =>
  new Promise((resolve, reject) => {
    const step = () => {
      const start = performance.now();
      try {
        let result = iterator.next();
        while (!result.done) {
          if (performance.now() - start > budgetMs) {
            setTimeout(step, 0);
            return;
          }
          result = iterator.next();
        }
        resolve(result.value);
      } catch (error) {
        reject(error);
      }
    };
    step();
  });

export const SURFACE_TYPES = Object.keys(recipes);

/**
 * Generated once per page load and reused, so switching tabs or toggling
 * modes never repeats the CPU work. Textures are re-uploaded automatically
 * if a new WebGL context is created.
 */
export const loadPlanetTextures = (surface) => {
  if (!cache.has(surface)) cache.set(surface, runSliced(recipes[surface]()));
  return cache.get(surface);
};

/**
 * Radial ring texture: u runs from the inner to the outer edge. Ringlets come
 * from layered noise along the radius; a clear gap near 60% mimics Saturn's
 * Cassini Division. Alpha carries the ring's opacity.
 */
export const getRingTexture = (() => {
  let texture = null;
  return () => {
    if (texture) return texture;
    const width = 1024;
    const canvas = createCanvas(width, 4);
    const ctx = canvas.getContext("2d");
    const image = ctx.createImageData(width, 4);
    const noise = createNoise3D(173);
    for (let i = 0; i < width; i += 1) {
      const u = i / (width - 1);
      const ringlets = fbm(noise, u * 40, 0.5, 0.5, 4);
      let alpha = 0.25 + ringlets * 0.75;
      alpha *= smoothstep(0, 0.06, u) * smoothstep(1, 0.9, u);
      alpha *= 1 - smoothstep(0.012, 0, Math.abs(u - 0.6)) * 0.95; // Cassini-like gap
      alpha *= u < 0.2 ? 0.45 : 1; // faint inner (C-like) ring
      const color = mix(hex("#8f7a5c"), hex("#e8dcc0"), smoothstep(0.2, 0.85, ringlets + u * 0.2));
      for (let row = 0; row < 4; row += 1) {
        const o = (row * width + i) * 4;
        image.data[o] = color[0];
        image.data[o + 1] = color[1];
        image.data[o + 2] = color[2];
        image.data[o + 3] = Math.max(0, Math.min(1, alpha)) * 255;
      }
    }
    ctx.putImageData(image, 0, 0);
    texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    return texture;
  };
})();

/** Soft radial falloff used for the star's corona and for starfield points. */
export const getGlowTexture = (() => {
  let texture = null;
  return () => {
    if (texture) return texture;
    const canvas = createCanvas(256, 256);
    const ctx = canvas.getContext("2d");
    const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.2, "rgba(255,255,255,0.55)");
    gradient.addColorStop(0.45, "rgba(255,255,255,0.14)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);
    texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    return texture;
  };
})();
