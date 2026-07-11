/**
 * @vitest-environment jsdom
 */
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
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

    const navigation = await screen.findByRole("navigation", {
      name: "Homepage",
    });
    expect(
      within(screen.getByRole("banner"))
        .getByRole("link", { name: "African Technology Forum" })
        .getAttribute("href"),
    ).toBe("/");
    expect(
      within(navigation)
        .getAllByRole("link")
        .map((link) => [link.textContent, link.getAttribute("href")]),
    ).toEqual([
      ["About", "/#about"],
      ["Programs", "/#programs"],
      ["Chapters", "/#chapters"],
      ["News", "/#news"],
      ["Partner with Us", "/#funder"],
    ]);
    expect(
      screen.queryByRole("button", { name: /Who We Are/i }),
    ).toBeNull();
    expect(screen.queryByText(/Applications open/i)).toBeNull();
  });

  it("exposes stable header-aware destinations on the homepage", async () => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
    const router = createAppRouter({
      homepageOnlyMode: true,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });

    const { container } = render(<RouterProvider router={router} />);

    await screen.findByRole("heading", {
      name: /Three decades at the forefront of African technology/i,
    });
    for (const id of [
      "about",
      "programs",
      "chapters",
      "news",
      "funder",
      "student",
    ]) {
      const destination = container.querySelector<HTMLElement>(`#${id}`);
      expect(destination).not.toBeNull();
      expect(destination?.style.scrollMarginTop).toBe(
        "var(--atf-header-height, 76px)",
      );
    }
  });

  it("exposes the homepage destinations through a predictable mobile menu", async () => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
    const router = createAppRouter({
      homepageOnlyMode: true,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });

    render(<RouterProvider router={router} />);

    const openButton = await screen.findByRole("button", { name: "Open menu" });
    expect(openButton.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(openButton);

    const mobileNavigation = screen.getByRole("navigation", {
      name: "Mobile homepage",
    });
    expect(
      within(mobileNavigation)
        .getAllByRole("link")
        .map((link) => [link.textContent, link.getAttribute("href")]),
    ).toEqual([
      ["About", "/#about"],
      ["Programs", "/#programs"],
      ["Chapters", "/#chapters"],
      ["News", "/#news"],
      ["Partner with Us", "/#funder"],
    ]);

    within(mobileNavigation).getByRole("link", { name: "About" }).focus();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(
      screen.queryByRole("navigation", { name: "Mobile homepage" }),
    ).toBeNull();
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Open menu" }),
    );

    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    fireEvent.click(
      within(
        screen.getByRole("navigation", { name: "Mobile homepage" }),
      ).getByRole("link", { name: "Programs" }),
    );

    await waitFor(() => {
      expect(router.state.location.href).toBe("/#programs");
    });
    expect(
      screen.queryByRole("navigation", { name: "Mobile homepage" }),
    ).toBeNull();
  });

  it("exposes only approved destinations in the temporary footer", async () => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
    const router = createAppRouter({
      homepageOnlyMode: true,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });

    render(<RouterProvider router={router} />);

    const footer = await screen.findByRole("contentinfo");
    expect(
      within(footer)
        .getAllByRole("link")
        .map((link) => link.getAttribute("href")),
    ).toEqual([
      "/",
      "/#about",
      "/#programs",
      "/#chapters",
      "/#news",
      "/#funder",
      "/#student",
      "mailto:info@africantechnologyforum.org",
      "#social-twitter",
      "#social-linkedin",
      "#social-facebook",
      "#social-youtube",
      "/privacy-policy",
      "/terms-of-service",
    ]);
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

  it.each([
    {
      path: "/privacy-policy",
      destination: "Programs",
      expectedHref: "/#programs",
    },
    {
      path: "/terms-of-service",
      destination: "News",
      expectedHref: "/#news",
    },
  ])(
    "navigates from $path to the homepage $destination section",
    async ({ path, destination, expectedHref }) => {
      vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
      const router = createAppRouter({
        homepageOnlyMode: true,
        history: createMemoryHistory({ initialEntries: [path] }),
      });

      render(<RouterProvider router={router} />);

      const navigation = await screen.findByRole("navigation", {
        name: "Homepage",
      });
      fireEvent.click(
        within(navigation).getByRole("link", { name: destination }),
      );

      await waitFor(() => {
        expect(router.state.location.href).toBe(expectedHref);
      });
      expect(
        screen.getByRole("heading", {
          name: /Three decades at the forefront of African technology/i,
        }),
      ).toBeTruthy();
    },
  );

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
    expect(
      within(screen.getByRole("contentinfo")).getByRole("link", {
        name: "ATF Consulting",
      }),
    ).toBeTruthy();
    expect(router.state.location.pathname).toBe("/about");
  });
});
