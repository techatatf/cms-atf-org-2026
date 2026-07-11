/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { RouterProvider, createMemoryHistory } from "@tanstack/react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createAppRouter, resolveHomepageOnlyMode } from "@/router";

beforeEach(() => {
  Object.defineProperty(Element.prototype, "scrollIntoView", {
    configurable: true,
    value: vi.fn(),
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  Reflect.deleteProperty(Element.prototype, "scrollIntoView");
});

describe("homepage-only mode configuration", () => {
  it.each([
    { value: undefined, expected: true },
    { value: "", expected: true },
    { value: "true", expected: true },
    { value: "False", expected: true },
    { value: "FALSE", expected: true },
    { value: "false", expected: false },
  ])("resolves $value to $expected", ({ value, expected }) => {
    expect(resolveHomepageOnlyMode(value)).toBe(expected);
  });
});

describe("application router homepage-only mode", () => {
  it("renders the isolated temporary shell when enabled", async () => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
    const router = createAppRouter({
      homepageOnlyMode: true,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });

    render(<RouterProvider router={router} />);

    expect(
      await screen.findByRole("navigation", { name: "Homepage" }),
    ).toBeTruthy();
    expect(
      screen
        .getByRole("link", { name: "African Technology Forum" })
        .getAttribute("href"),
    ).toBe("/");
    expect(screen.getByRole("link", { name: "About" }).getAttribute("href")).toBe(
      "/#about",
    );
    expect(
      screen.queryByRole("button", { name: /Who We Are/i }),
    ).toBeNull();
    expect(screen.queryByText(/Applications open/i)).toBeNull();
  });

  it("exposes a stable About destination on the homepage", async () => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
    const router = createAppRouter({
      homepageOnlyMode: true,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });

    const { container } = render(<RouterProvider router={router} />);

    await screen.findByRole("heading", {
      name: /Three decades at the forefront of African technology/i,
    });
    expect(container.querySelector("#about")).not.toBeNull();
  });

  it("redirects /about to the homepage About section before page content renders", async () => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
    const history = createMemoryHistory({ initialEntries: ["/about"] });
    const router = createAppRouter({
      homepageOnlyMode: true,
      history,
    });

    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(router.state.location.href).toBe("/#about");
    });
    expect(
      screen.queryByRole("heading", {
        level: 1,
        name: "Our Mission, Vision and Story",
      }),
    ).toBeNull();
    expect(
      screen.getByRole("heading", {
        name: /Three decades at the forefront of African technology/i,
      }),
    ).toBeTruthy();
  });

  it.each([
    { path: "/privacy-policy", heading: "Privacy Policy" },
    { path: "/terms-of-service", heading: "Terms of Service" },
  ])("keeps $path accessible inside the temporary shell", async ({ path, heading }) => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
    const router = createAppRouter({
      homepageOnlyMode: true,
      history: createMemoryHistory({ initialEntries: [path] }),
    });

    render(<RouterProvider router={router} />);

    expect(
      await screen.findByRole("heading", { level: 1, name: heading }),
    ).toBeTruthy();
    expect(screen.getByRole("navigation", { name: "Homepage" })).toBeTruthy();
    expect(router.state.location.pathname).toBe(path);
  });

  it("preserves the existing shell and /about page when disabled", async () => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
    const router = createAppRouter({
      homepageOnlyMode: false,
      history: createMemoryHistory({ initialEntries: ["/about"] }),
    });

    render(<RouterProvider router={router} />);

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Our Mission, Vision and Story",
      }),
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: /Who We Are/i })).toBeTruthy();
    expect(screen.queryByRole("navigation", { name: "Homepage" })).toBeNull();
    expect(router.state.location.pathname).toBe("/about");
  });
});
