import { loadPlanetTextures, SURFACE_TYPES } from "./planetTextures";

// jsdom has no 2D canvas backend, so stub just enough of one to run every
// recipe end to end and catch math errors (out-of-range palette lookups).
// beforeEach because CRA's Jest config resets mocks between tests.
beforeEach(() => {
  jest.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(function getContext() {
    const canvas = this;
    return {
      createImageData: (w, h) => ({ data: new Uint8ClampedArray(w * h * 4) }),
      putImageData: (image) => {
        canvas.__data = image.data;
      },
    };
  });
});

test.each(SURFACE_TYPES)("%s surface bakes every texel without throwing", async (surface) => {
  const textures = await loadPlanetTextures(surface);
  const data = textures.map.image.__data;
  // Every texel was written (alpha is set last, after the colour lookup).
  let opaque = 0;
  for (let i = 3; i < data.length; i += 4) if (data[i] === 255) opaque += 1;
  expect(opaque).toBe(data.length / 4);
}, 60000);
