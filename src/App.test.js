import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

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

test("interest map and filter pills stay in sync when selecting a category", () => {
  render(<App />);

  const map = screen.getByRole("group", { name: /filter work by interest/i });
  const filterBar = screen.getByRole("group", { name: /filter projects by category/i });

  const mlNode = within(map).getByRole("button", { name: /ml \/ data/i });
  userEvent.click(mlNode);

  expect(mlNode).toHaveAttribute("aria-pressed", "true");
  const mlPill = within(filterBar).getByRole("button", { name: /^ml \/ data$/i });
  expect(mlPill).toHaveAttribute("aria-pressed", "true");

  // Only ML/Data projects are now visible; a software project drops out.
  expect(screen.queryByText("Kadi")).not.toBeInTheDocument();
  expect(screen.getByText("Amazon Review Classifier")).toBeInTheDocument();

  // Selecting the same node again clears the filter back to "all".
  userEvent.click(mlNode);
  expect(mlNode).toHaveAttribute("aria-pressed", "false");
  expect(screen.getByText("Kadi")).toBeInTheDocument();
});

test("coursework projects stay reachable through the filter pills though absent from the map", () => {
  render(<App />);

  const courseworkPill = screen.getByRole("button", { name: /^coursework$/i });
  userEvent.click(courseworkPill);

  expect(screen.getByText("Gold Nuggets Game")).toBeInTheDocument();
  expect(screen.queryByText("Kadi")).not.toBeInTheDocument();
});
