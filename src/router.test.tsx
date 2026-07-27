/**
 * @vitest-environment jsdom
 */
import {
  act,
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
  vi.useRealTimers();
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

  it("keeps the News section mounted but hidden when enabled", async () => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
    const router = createAppRouter({
      homepageOnlyMode: true,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });

    const { container } = render(<RouterProvider router={router} />);

    await screen.findByRole("heading", {
      name: /Three decades at the forefront of African technology/i,
    });
    expect(container.querySelector("#news")?.classList.contains("hidden")).toBe(
      true,
    );
  });

  it("keeps the News section visible when homepage-only mode is disabled", async () => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
    const router = createAppRouter({
      homepageOnlyMode: false,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });

    const { container } = render(<RouterProvider router={router} />);

    await screen.findByRole("heading", { name: /The latest from across/i });
    expect(container.querySelector("#news")?.classList.contains("hidden")).toBe(
      false,
    );
  });

  it.each([true, false])(
    "renders the newsletter CTA between News and Partners when homepage-only mode is %s",
    async (homepageOnlyMode) => {
      vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
      const router = createAppRouter({
        homepageOnlyMode,
        history: createMemoryHistory({ initialEntries: ["/"] }),
      });

      const { container } = render(<RouterProvider router={router} />);

      const heading = await screen.findByRole("heading", {
        name: "Stay Connected",
      });
      const newsletter = container.querySelector<HTMLElement>("#newsletter");
      const news = container.querySelector<HTMLElement>("#news");
      const partners = screen
        .getByText("Trusted by leading organizations across Africa and beyond")
        .closest("section");

      expect(newsletter).not.toBeNull();
      expect(news).not.toBeNull();
      expect(partners).not.toBeNull();
      if (!newsletter || !news || !partners) {
        throw new Error("Expected homepage sections are missing");
      }

      expect(news.compareDocumentPosition(newsletter)).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING,
      );
      expect(newsletter.compareDocumentPosition(partners)).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING,
      );
      expect(newsletter.contains(heading)).toBe(true);
      expect(newsletter.classList.contains("hidden")).toBe(false);
      expect(newsletter.style.scrollMarginTop).toBe(
        "var(--atf-header-height, 76px)",
      );

      const newsletterQueries = within(newsletter);
      expect(newsletterQueries.getByText("Newsletter")).toBeTruthy();
      expect(
        newsletterQueries.getByText(
          "Subscribe for the latest research highlights, event invitations, and ecosystem news delivered straight to your inbox.",
        ),
      ).toBeTruthy();
      expect(
        newsletterQueries.getByRole("textbox", { name: "Email address" }),
      ).toHaveProperty("type", "email");
      expect(
        newsletterQueries.getByRole("button", { name: "Subscribe" }),
      ).toHaveProperty("type", "submit");
      expect(
        newsletterQueries.getByText(/prototype review/i),
      ).toBeTruthy();
    },
  );

  it.each([
    ["", "Email address is required"],
    ["not-an-email", "Please enter a valid email address"],
  ])(
    "shows application validation for %j before any service call",
    async (value, expectedMessage) => {
      vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
      const fetchSpy = vi
        .spyOn(globalThis, "fetch")
        .mockRejectedValue(new Error("Validation must happen before transport"));
      const router = createAppRouter({
        homepageOnlyMode: true,
        history: createMemoryHistory({ initialEntries: ["/"] }),
      });

      render(<RouterProvider router={router} />);

      const email = await screen.findByRole<HTMLInputElement>("textbox", {
        name: "Email address",
      });
      const form = email.closest("form");
      if (!form) throw new Error("Newsletter form is missing");
      const status = screen.getByRole("status");

      expect(status.textContent).toBe("");
      expect(status.getAttribute("data-newsletter-status")).toBe("idle");

      fireEvent.change(email, { target: { value } });
      expect(form.noValidate).toBe(true);
      expect(fireEvent.submit(form)).toBe(false);

      expect(status.textContent).toContain("Error");
      expect(status.textContent).toContain(expectedMessage);
      expect(status.getAttribute("data-newsletter-status")).toBe("error");
      expect(fetchSpy).not.toHaveBeenCalled();
      expect(router.state.location.href).toBe("/");
    },
  );

  it("shows prototype pending and success treatments without a service call", async () => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockRejectedValue(new Error("The prototype must not request a service"));
    const router = createAppRouter({
      homepageOnlyMode: true,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });

    render(<RouterProvider router={router} />);

    const email = await screen.findByRole<HTMLInputElement>("textbox", {
      name: "Email address",
    });
    const form = email.closest("form");
    if (!form) throw new Error("Newsletter form is missing");

    fireEvent.change(email, {
      target: { value: "\u00a0Visitor+tag@Example.COM\u00a0" },
    });

    expect(email.value).toBe("\u00a0Visitor+tag@Example.COM\u00a0");
    expect(form.noValidate).toBe(true);

    vi.useFakeTimers();
    expect(fireEvent.submit(form)).toBe(false);

    const action = screen.getByRole<HTMLButtonElement>("button", {
      name: "Subscribing…",
    });
    expect(action.disabled).toBe(true);
    expect(screen.getByRole("status").textContent).toContain("Subscribing…");
    expect(
      screen.getByText(/prototype review/i).hasAttribute(
        "data-newsletter-review-marker",
      ),
    ).toBe(true);
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(router.state.location.href).toBe("/");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(749);
    });
    expect(action.disabled).toBe(true);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });

    const status = screen.getByRole("status");
    expect(status.getAttribute("data-newsletter-status")).toBe("success");
    expect(status.textContent).toContain("Success");
    expect(status.textContent).toContain(
      "Successfully subscribed to our newsletter!",
    );
    expect(
      screen.getByRole("button", { name: "Subscribe" }),
    ).toHaveProperty("disabled", false);
    expect(fetchSpy).not.toHaveBeenCalled();

    fireEvent.change(email, { target: { value: "next@example.com" } });
    expect(status.textContent).toBe("");
    expect(status.getAttribute("data-newsletter-status")).toBe("idle");
  });

  it("clears stale newsletter feedback on the first field change", async () => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
    const router = createAppRouter({
      homepageOnlyMode: true,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });

    render(<RouterProvider router={router} />);

    const email = await screen.findByRole<HTMLInputElement>("textbox", {
      name: "Email address",
    });
    const form = email.closest("form");
    if (!form) throw new Error("Newsletter form is missing");

    fireEvent.submit(form);
    expect(screen.getByRole("status").textContent).toContain(
      "Email address is required",
    );

    fireEvent.change(email, { target: { value: "v" } });

    expect(email.value).toBe("v");
    expect(screen.getByRole("status").textContent).toBe("");
    expect(
      screen.getByRole("status").getAttribute("data-newsletter-status"),
    ).toBe("idle");
  });

  it("links visible organization content directly to the homepage About section when enabled", async () => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
    const router = createAppRouter({
      homepageOnlyMode: true,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });

    render(<RouterProvider router={router} />);

    expect(
      (await screen.findByRole("link", { name: /Explore our story/i })).getAttribute(
        "href",
      ),
    ).toBe("/#about");
  });

  it.each([
    ["ATF Consulting", "/#funder"],
    ["02 / 03 ATF Challenge", "/#student"],
    ["ATF Chapters", "/#chapters"],
    ["Download Our Impact Report", "/#about"],
    ["Nigeria", "/#chapters"],
  ])(
    "links visible homepage content for %s directly to %s when enabled",
    async (name, expectedHref) => {
      vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
      const router = createAppRouter({
        homepageOnlyMode: true,
        history: createMemoryHistory({ initialEntries: ["/"] }),
      });

      render(<RouterProvider router={router} />);

      const links = await screen.findAllByRole("link", {
        name: new RegExp(name, "i"),
      });
      expect(links.map((link) => link.getAttribute("href"))).toEqual(
        links.map(() => expectedHref),
      );
    },
  );

  it("does not expose hidden-route destinations in visible homepage content when enabled", async () => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
    const router = createAppRouter({
      homepageOnlyMode: true,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });

    render(<RouterProvider router={router} />);

    const main = await screen.findByRole("main");
    const hiddenRouteHref =
      /^\/(?:about|who-we-are|team|what-we-do|consulting|challenge|chapters|where-we-work|countries(?:\/|$)|publications|articles|research|library|news(?:\/|$))/;

    expect(
      within(main)
        .getAllByRole("link")
        .map((link) => link.getAttribute("href"))
        .filter((href): href is string => href !== null)
        .filter((href) => hiddenRouteHref.test(href)),
    ).toEqual([]);
  });

  it("keeps the external challenge application unchanged when enabled", async () => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
    const router = createAppRouter({
      homepageOnlyMode: true,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });

    render(<RouterProvider router={router} />);

    expect(
      (
        await screen.findByRole("link", { name: "Apply to ATF Challenge" })
      ).getAttribute("href"),
    ).toBe("https://bit.ly/atf-wf");
  });

  it.each([
    ["Explore our story", "/about"],
    ["02 / 03 ATF Challenge", "/challenge"],
    ["Download Our Impact Report", "/research"],
    ["Nigeria", "/countries/nigeria"],
    ["View all news", "/news"],
  ])(
    "restores the original homepage destination for %s when disabled",
    async (name, expectedHref) => {
      vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
      const router = createAppRouter({
        homepageOnlyMode: false,
        history: createMemoryHistory({ initialEntries: ["/"] }),
      });

      render(<RouterProvider router={router} />);

      const links = await screen.findAllByRole("link", {
        name: new RegExp(name, "i"),
      });
      expect(
        links.some((link) => link.getAttribute("href") === expectedHref),
      ).toBe(true);
    },
  );

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

  it("redirects /team to the homepage About section before page content renders", async () => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
    const router = createAppRouter({
      homepageOnlyMode: true,
      history: createMemoryHistory({ initialEntries: ["/team"] }),
    });

    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(router.state.location.href).toBe("/#about");
    });
    expect(
      screen.queryByRole("heading", { level: 1, name: "Meet Our Team" }),
    ).toBeNull();
  });

  it.each([
    ["/who-we-are", "/#about"],
    ["/what-we-do", "/#programs"],
    ["/consulting", "/#funder"],
    ["/challenge", "/#student"],
    ["/chapters", "/#chapters"],
    ["/where-we-work", "/#chapters"],
    ["/countries/ghana", "/#chapters"],
    ["/countries/%malformed?source=bookmark", "/#chapters"],
    ["/publications", "/#about"],
    ["/articles", "/#about"],
    ["/research", "/#about"],
    ["/library", "/#about"],
    ["/news", "/#about"],
    ["/news/manual-check", "/#about"],
    ["/news/%malformed?source=bookmark", "/#about"],
  ])("redirects %s to %s while homepage-only mode is enabled", async (path, expectedHref) => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
    const router = createAppRouter({
      homepageOnlyMode: true,
      history: createMemoryHistory({ initialEntries: [path] }),
    });

    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(router.state.location.href).toBe(expectedHref);
    });
  });

  it("redirects an unrecognized non-legal route to the homepage", async () => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
    const router = createAppRouter({
      homepageOnlyMode: true,
      history: createMemoryHistory({
        initialEntries: ["/homepage-only-manual-check?preview=true"],
      }),
    });

    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(router.state.location.href).toBe("/");
    });
    expect(screen.queryByText("Not Found")).toBeNull();
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
      destination: "About",
      expectedHref: "/#about",
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

  it.each([
    "/who-we-are",
    "/team",
    "/what-we-do",
    "/consulting",
    "/challenge",
    "/chapters",
    "/where-we-work",
    "/countries/ghana",
    "/publications",
    "/articles",
    "/research",
    "/library",
    "/news",
    "/news/atf-challenge-2026",
  ])("preserves direct access to %s when disabled", async (path) => {
    const router = createAppRouter({
      homepageOnlyMode: false,
      history: createMemoryHistory({ initialEntries: [path] }),
    });

    await router.load();

    expect(router.state.location.href).toBe(path);
    expect(router.state.matches.at(-1)?.status).toBe("success");
  });
});
