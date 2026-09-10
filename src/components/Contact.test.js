import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Contact } from "./Contact";

const originalFormspreeId = process.env.REACT_APP_FORMSPREE_ID;

afterEach(() => {
  process.env.REACT_APP_FORMSPREE_ID = originalFormspreeId;
  delete global.fetch;
});

describe("Contact — missing Formspree configuration", () => {
  beforeEach(() => {
    delete process.env.REACT_APP_FORMSPREE_ID;
  });

  test("shows a social fallback instead of an unconfigured form", () => {
    render(<Contact />);

    expect(screen.queryByRole("textbox", { name: /message/i })).not.toBeInTheDocument();
    expect(screen.getByText(/isn't configured yet/i)).toBeInTheDocument();
    screen.getAllByRole("link", { name: /linkedin/i }).forEach((link) =>
      expect(link).toHaveAttribute("href", "https://www.linkedin.com/in/godwinkangor")
    );
    screen.getAllByRole("link", { name: /github/i }).forEach((link) =>
      expect(link).toHaveAttribute("href", "https://github.com/GodwinKangor")
    );
  });
});

describe("Contact — configured form", () => {
  beforeEach(() => {
    process.env.REACT_APP_FORMSPREE_ID = "test-id";
    global.fetch = jest.fn();
  });

  test("blocks submission and shows validation errors on empty required fields", async () => {
    render(<Contact />);

    userEvent.click(screen.getByRole("button", { name: /send message/i }));

    expect(await screen.findByText(/enter your name/i)).toBeInTheDocument();
    expect(screen.getByText(/valid email address/i)).toBeInTheDocument();
    expect(screen.getByText(/enter a message/i)).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("submits, disables the button while sending, and reports success", async () => {
    let resolveFetch;
    global.fetch.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFetch = () => resolve({ ok: true });
        })
    );

    render(<Contact />);

    userEvent.type(screen.getByLabelText(/name/i), "Ada Lovelace");
    userEvent.type(screen.getByLabelText(/email/i), "ada@example.com");
    userEvent.type(screen.getByLabelText(/message/i), "Hello there");

    const submitButton = screen.getByRole("button", { name: /send message/i });
    userEvent.click(submitButton);

    expect(await screen.findByRole("button", { name: /sending/i })).toBeDisabled();
    resolveFetch();

    expect(await screen.findByText(/message sent/i)).toBeInTheDocument();
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  test("reports an error state when the request fails", async () => {
    global.fetch.mockResolvedValue({ ok: false });

    render(<Contact />);

    userEvent.type(screen.getByLabelText(/name/i), "Ada Lovelace");
    userEvent.type(screen.getByLabelText(/email/i), "ada@example.com");
    userEvent.type(screen.getByLabelText(/message/i), "Hello there");
    userEvent.click(screen.getByRole("button", { name: /send message/i }));

    expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument();
  });
});
