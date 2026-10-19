import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

// WebGL isn't available in jsdom; the 3D scene is covered by its own unit
// tests and by in-browser checks. Here we only verify the tab wiring.
jest.mock("./universe3d/Universe3D", () => ({
  __esModule: true,
  default: () => <div>3D universe stub</div>,
}));

test("renders identity, primary actions, and every project", () => {
  render(<App />);
  expect(screen.getByRole("heading", { level: 1, name: /godwin kangor/i })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /view work/i })).toBeInTheDocument();
  expect(screen.getAllByRole("link", { name: /^contact$/i }).length).toBeGreaterThan(0);

  // Featured projects appear once up top, plus once in the full index.
  expect(screen.getAllByText("HireFlow").length).toBeGreaterThanOrEqual(2);

  // A non-featured project from every category stays discoverable in the
  // full index without touching the interest map.
  expect(screen.getByText("Kadi")).toBeInTheDocument();
  expect(screen.getByText("Amazon Review Classifier")).toBeInTheDocument();
  expect(screen.getByText("Gold Nuggets Game")).toBeInTheDocument();
  expect(screen.getByText("Abstract Project")).toBeInTheDocument();
});

test("coursework projects stay reachable through the filter pills though absent from the map", () => {
  render(<App />);

  const courseworkPill = screen.getByRole("button", { name: /^coursework$/i });
  userEvent.click(courseworkPill);

  expect(screen.getByText("Gold Nuggets Game")).toBeInTheDocument();
  expect(screen.queryByText("Kadi")).not.toBeInTheDocument();
});


afterEach(() => {
  window.location.hash = "";
});

test("solar system shows nine planets and an asteroid belt", () => {
  const { container } = render(<App />);
  const map = screen.getByRole("group", { name: /solar system of interests/i });
  expect(within(map).getAllByRole("button", { name: /moons$/i })).toHaveLength(9);
  expect(within(map).getByRole("button", { name: /asteroid belt/i })).toBeInTheDocument();
  expect(container.querySelectorAll(".cosmos__rock.is-named")).toHaveLength(8);

  userEvent.click(screen.getByRole("button", { name: /pause orbits/i }));
  expect(container.querySelector(".cosmos")).toHaveClass("is-paused");
  userEvent.click(screen.getByRole("button", { name: /resume orbits/i }));
  expect(container.querySelector(".cosmos")).not.toHaveClass("is-paused");
});

test("clicking a planet zooms in to its moons and can filter the work", () => {
  render(<App />);
  const map = screen.getByRole("group", { name: /solar system of interests/i });
  userEvent.click(within(map).getByRole("button", { name: /machine learning & data: 7 moons/i }));

  const panel = screen.getByTestId("cosmos-panel");
  expect(within(panel).getByRole("heading", { name: /machine learning & data/i })).toBeInTheDocument();
  expect(within(panel).getByText("scikit-learn")).toBeInTheDocument();
  expect(within(panel).getByText("Python")).toBeInTheDocument();
  expect(within(panel).getByRole("link", { name: /full view/i })).toHaveAttribute("href", "#/universe/ml");

  // The moon view replaces the system; zooming out brings the planets back.
  expect(within(map).queryByRole("button", { name: /moons$/i })).not.toBeInTheDocument();

  const filter = within(panel).getByRole("button", { name: /show ml \/ data work/i });
  userEvent.click(filter);
  const filterBar = screen.getByRole("group", { name: /filter projects by category/i });
  expect(within(filterBar).getByRole("button", { name: /^ml \/ data$/i })).toHaveAttribute("aria-pressed", "true");
  expect(screen.queryByText("Kadi")).not.toBeInTheDocument();

  userEvent.click(within(map).getByRole("button", { name: /all planets/i }));
  expect(within(map).getAllByRole("button", { name: /moons$/i })).toHaveLength(9);
});

test("the asteroid belt zooms in to the smaller tools", () => {
  render(<App />);
  const map = screen.getByRole("group", { name: /solar system of interests/i });
  userEvent.click(within(map).getByRole("button", { name: /asteroid belt/i }));
  const panel = screen.getByTestId("cosmos-panel");
  expect(within(panel).getByRole("heading", { name: /asteroid belt/i })).toBeInTheDocument();
  expect(within(panel).getByText("Git / GitHub")).toBeInTheDocument();
});

test("full view page deep-links to a planet and zooms out through the URL", () => {
  window.location.hash = "#/universe/compilers";
  render(<App />);
  expect(screen.getByRole("heading", { level: 1, name: /my universe/i })).toBeInTheDocument();
  expect(screen.queryByText("HireFlow")).not.toBeInTheDocument();

  const panel = screen.getByTestId("cosmos-panel");
  expect(within(panel).getByRole("heading", { name: /compilers/i })).toBeInTheDocument();
  expect(within(panel).getByText("LLVM")).toBeInTheDocument();

  userEvent.click(screen.getByRole("button", { name: /all planets/i }));
  expect(window.location.hash).toBe("#/universe");
});

test("a tab switches between the orbit map and the 3D universe", async () => {
  render(<App />);
  const tabs = screen.getByRole("tablist", { name: /choose a universe/i });
  const orbitTab = within(tabs).getByRole("tab", { name: /orbit map/i });
  const threeDTab = within(tabs).getByRole("tab", { name: /3d system/i });
  expect(orbitTab).toHaveAttribute("aria-selected", "true");
  expect(screen.getByRole("group", { name: /solar system of interests/i })).toBeInTheDocument();

  userEvent.click(threeDTab);
  expect(threeDTab).toHaveAttribute("aria-selected", "true");
  expect(await screen.findByText("3D universe stub")).toBeInTheDocument();
  expect(screen.queryByRole("group", { name: /solar system of interests/i })).not.toBeInTheDocument();

  // Arrow keys move between tabs.
  userEvent.type(threeDTab, "{arrowleft}");
  expect(orbitTab).toHaveAttribute("aria-selected", "true");
  expect(screen.getByRole("group", { name: /solar system of interests/i })).toBeInTheDocument();
});
