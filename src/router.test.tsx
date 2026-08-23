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

import { setAnalyticsCapture } from "@/lib/analytics";
import { createAppRouter, resolveHomepageOnlyMode } from "@/router";
import { subscribeToNewsletter } from "@/services/newsletter";

vi.mock("@/services/newsletter", () => ({
  subscribeToNewsletter: vi.fn(),
}));

const subscribeToNewsletterMock = vi.mocked(subscribeToNewsletter);
const analyticsCaptureMock = vi.fn();

function createDeferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });

  return { promise, resolve, reject };
}

async function renderHomepageNewsletter() {
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

  return {
    email,
    form,
    router,
    status: screen.getByRole("status"),
  };
}

beforeEach(() => {
  analyticsCaptureMock.mockReset();
  setAnalyticsCapture(analyticsCaptureMock);
  subscribeToNewsletterMock.mockReset();
  subscribeToNewsletterMock.mockResolvedValue({ success: true });
  Object.defineProperty(Element.prototype, "scrollIntoView", {
    configurable: true,
    value: vi.fn(),
  });
});

afterEach(() => {
  setAnalyticsCapture();
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
    expect(screen.queryByRole("button", { name: /Who We Are/i })).toBeNull();
    expect(screen.queryByText(/Applications open/i)).toBeNull();
  });

  it("shows the challenge announcement above the homepage navigation", async () => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
    const router = createAppRouter({
      homepageOnlyMode: true,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });

    render(<RouterProvider router={router} />);

    const header = await screen.findByRole("banner");
    const announcement = within(header).getByText("ATF Challenge 2026");
    const navigation = within(header).getByRole("navigation", {
      name: "Homepage",
    });

    expect(
      announcement.compareDocumentPosition(navigation) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("exposes stable header-aware destinations on the homepage", async () => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
    const router = createAppRouter({
      homepageOnlyMode: true,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });

    const { container } = render(<RouterProvider router={router} />);

    await screen.findByRole("heading", {
      name: /At the forefront\s*of African technology/i,
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
      name: /At the forefront\s*of African technology/i,
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
        .getByText("Trusted by leading organizations")
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
      expect(newsletterQueries.queryByText(/prototype review/i)).toBeNull();
      expect(
        newsletter.querySelector("[data-newsletter-review-marker]"),
      ).toBeNull();
    },
  );

  it.each([
    ["", "Email address is required"],
    ["not-an-email", "Please enter a valid email address"],
  ])(
    "shows application validation for %j before any service call",
    async (value, expectedMessage) => {
      const { email, form, router, status } = await renderHomepageNewsletter();

      expect(status.textContent).toBe("");
      expect(status.getAttribute("data-newsletter-status")).toBe("idle");

      fireEvent.change(email, { target: { value } });
      expect(form.noValidate).toBe(true);
      expect(fireEvent.submit(form)).toBe(false);

      expect(status.textContent).toContain("Error");
      expect(status.textContent).toContain(expectedMessage);
      expect(status.getAttribute("data-newsletter-status")).toBe("error");
      expect(email.value).toBe(value);
      expect(subscribeToNewsletterMock).not.toHaveBeenCalled();
      expect(analyticsCaptureMock).not.toHaveBeenCalled();
      expect(router.state.location.href).toBe("/");
    },
  );

  it("submits one trimmed address, prevents duplicates, and renders confirmed success", async () => {
    const subscription = createDeferred<{
      success: boolean;
      message?: string;
    }>();
    subscribeToNewsletterMock.mockReturnValue(subscription.promise);
    const { email, form, router } = await renderHomepageNewsletter();

    fireEvent.change(email, {
      target: { value: "\u00a0Visitor+tag@Example.COM\u00a0" },
    });

    expect(email.value).toBe("\u00a0Visitor+tag@Example.COM\u00a0");
    expect(form.noValidate).toBe(true);

    expect(fireEvent.submit(form)).toBe(false);

    const action = screen.getByRole<HTMLButtonElement>("button", {
      name: "Subscribing…",
    });
    expect(action.disabled).toBe(true);
    expect(email.readOnly).toBe(true);
    expect(screen.getByRole("status").textContent).toContain("Subscribing…");
    expect(subscribeToNewsletterMock).toHaveBeenCalledTimes(1);
    expect(subscribeToNewsletterMock).toHaveBeenCalledWith(
      "Visitor+tag@Example.COM",
    );
    expect(fireEvent.submit(form)).toBe(false);
    expect(subscribeToNewsletterMock).toHaveBeenCalledTimes(1);
    expect(analyticsCaptureMock).not.toHaveBeenCalled();
    fireEvent.change(email, { target: { value: "replacement@example.com" } });
    expect(email.value).toBe("\u00a0Visitor+tag@Example.COM\u00a0");
    expect(screen.queryByText(/prototype review/i)).toBeNull();
    expect(router.state.location.href).toBe("/");

    await act(async () => {
      subscription.resolve({ success: true, message: "Welcome to ATF!" });
      await subscription.promise;
    });

    const status = screen.getByRole("status");
    expect(status.getAttribute("data-newsletter-status")).toBe("success");
    expect(status.textContent).toContain("Success");
    expect(status.textContent).toContain("Welcome to ATF!");
    expect(email.value).toBe("");
    expect(email.readOnly).toBe(false);
    expect(screen.getByRole("button", { name: "Subscribe" })).toHaveProperty(
      "disabled",
      false,
    );
    expect(analyticsCaptureMock).toHaveBeenCalledTimes(1);
    expect(analyticsCaptureMock).toHaveBeenCalledWith("newsletter_subscribed", {
      page: "home",
      form_type: "newsletter",
      email_domain: "example.com",
    });
    expect(analyticsCaptureMock.mock.calls[0]).not.toContain(
      "Visitor+tag@Example.COM",
    );
    expect(JSON.stringify(analyticsCaptureMock.mock.calls[0])).not.toContain(
      "Visitor+tag@Example.COM",
    );

    fireEvent.change(email, { target: { value: "next@example.com" } });
    expect(status.textContent).toBe("");
    expect(status.getAttribute("data-newsletter-status")).toBe("idle");
  });

  it("uses stable success copy when the service confirms without a message", async () => {
    subscribeToNewsletterMock.mockResolvedValue({ success: true });
    const { email, form } = await renderHomepageNewsletter();
    fireEvent.change(email, { target: { value: "person@example.com" } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByRole("status").textContent).toContain(
        "Successfully subscribed to our newsletter!",
      );
    });
    expect(email.value).toBe("");
    expect(screen.getByRole("status").textContent).toContain("Success");
    expect(analyticsCaptureMock).toHaveBeenCalledTimes(1);
  });

  it("keeps the successful outcome unchanged when analytics is not configured", async () => {
    setAnalyticsCapture();
    subscribeToNewsletterMock.mockResolvedValue({
      success: true,
      message: "Welcome to ATF!",
    });
    const { email, form } = await renderHomepageNewsletter();
    fireEvent.change(email, { target: { value: "person@example.com" } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByRole("status").textContent).toContain(
        "Welcome to ATF!",
      );
    });
    expect(screen.getByRole("status").textContent).toContain("Success");
    expect(email.value).toBe("");
  });

  it("keeps the successful outcome unchanged when analytics throws", async () => {
    setAnalyticsCapture(() => {
      throw new Error("Analytics unavailable");
    });
    subscribeToNewsletterMock.mockResolvedValue({
      success: true,
      message: "Welcome to ATF!",
    });
    const { email, form } = await renderHomepageNewsletter();
    fireEvent.change(email, { target: { value: "person@example.com" } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByRole("status").textContent).toContain(
        "Welcome to ATF!",
      );
    });
    expect(screen.getByRole("status").textContent).toContain("Success");
    expect(email.value).toBe("");
  });

  it.each([
    [
      "a success: false service explanation",
      { success: false, message: "This address is already subscribed." },
      "This address is already subscribed.",
    ],
    [
      "an HTTP failure with stable fallback copy",
      { success: false },
      "Failed to subscribe. Please try again.",
    ],
  ])(
    "retains the address and shows %s after a backend rejection",
    async (_name, result, expectedMessage) => {
      subscribeToNewsletterMock.mockResolvedValue(result);
      const { email, form } = await renderHomepageNewsletter();
      fireEvent.change(email, { target: { value: "person@example.com" } });
      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByRole("status").textContent).toContain(
          expectedMessage,
        );
      });
      expect(email.value).toBe("person@example.com");
      expect(screen.getByRole("status").textContent).toContain("Error");
      expect(analyticsCaptureMock).not.toHaveBeenCalled();
      expect(
        screen.getByRole<HTMLButtonElement>("button", { name: "Subscribe" })
          .disabled,
      ).toBe(false);

      fireEvent.change(email, { target: { value: "person2@example.com" } });
      expect(screen.getByRole("status").textContent).toBe("");
      expect(
        screen.getByRole("status").getAttribute("data-newsletter-status"),
      ).toBe("idle");
    },
  );

  it.each([
    ["malformed JSON", new SyntaxError("Unexpected token")],
    ["unexpected response data", new Error("Unexpected response")],
    ["a rejected request", new TypeError("offline")],
    ["a timeout", new DOMException("Timed out", "AbortError")],
  ])("uses one generic failure outcome for %s", async (_name, failure) => {
    subscribeToNewsletterMock.mockRejectedValue(failure);
    const { email, form } = await renderHomepageNewsletter();
    fireEvent.change(email, { target: { value: "person@example.com" } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByRole("status").textContent).toContain(
        "Failed to subscribe. Please try again.",
      );
    });
    expect(screen.getByRole("status").textContent).not.toMatch(
      /connection|host|transport/i,
    );
    expect(email.value).toBe("person@example.com");
    expect(analyticsCaptureMock).not.toHaveBeenCalled();
    expect(
      screen.getByRole<HTMLButtonElement>("button", { name: "Subscribe" })
        .disabled,
    ).toBe(false);
  });

  it("clears stale newsletter feedback on the first field change", async () => {
    const { email, form } = await renderHomepageNewsletter();

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

  it("does not render inactive homepage calls to action as links", async () => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
    const router = createAppRouter({
      homepageOnlyMode: true,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });

    render(<RouterProvider router={router} />);

    await screen.findByRole("main");
    expect(screen.queryByText(/Explore our story/i)).toBeNull();
    expect(screen.queryByText(/Learn more/i)).toBeNull();
    expect(screen.queryByText(/View all 30 chapters/i)).toBeNull();
    expect(screen.queryByText(/View country/i)).toBeNull();
    expect(screen.getByText("ATF Consulting").closest("a")).toBeNull();
    expect(screen.getByText("Nigeria").closest("a")).toBeNull();
  });

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

  it("links Follow the Journey to the existing challenge destination", async () => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
    const router = createAppRouter({
      homepageOnlyMode: true,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });

    render(<RouterProvider router={router} />);

    expect(
      (
        await screen.findByRole("link", { name: "Follow the Journey" })
      ).getAttribute("href"),
    ).toBe("https://bit.ly/atf-wf");
    expect(screen.queryByRole("link", { name: "Join a Chapter" })).toBeNull();
  });

  it("restores the original news destination when homepage-only mode is disabled", async () => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
    const router = createAppRouter({
      homepageOnlyMode: false,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });

    render(<RouterProvider router={router} />);

    expect(
      (
        await screen.findByRole("link", { name: /View all news/i })
      ).getAttribute("href"),
    ).toBe("/news");
  });

  it("keeps one booking action with the response-time copy", async () => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
    const router = createAppRouter({
      homepageOnlyMode: false,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });

    render(<RouterProvider router={router} />);

    expect(
      (
        await screen.findByRole("link", { name: /Book a Meeting/i })
      ).getAttribute("href"),
    ).toBe("/#newsletter");
    expect(screen.getByText(/We'll respond within 48 hours/i)).toBeTruthy();
    expect(screen.queryByText("Submit a Partnership Inquiry")).toBeNull();
  });

  it("does not expose the impact report action until a report is available", async () => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
    const router = createAppRouter({
      homepageOnlyMode: false,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });

    render(<RouterProvider router={router} />);

    await screen.findByRole("heading", {
      name: /Invest in Africa's digital future with us/i,
    });

    expect(
      screen.queryByRole("link", { name: /Download Our Impact Report/i }),
    ).toBeNull();
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
      "https://x.com/AfTechForum",
      "https://www.instagram.com/africantech/",
      "https://www.linkedin.com/company/africantechnologyforum/",
      "https://www.youtube.com/@africantechnologyforum",
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
        name: /At the forefront\s*of African technology/i,
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
  ])(
    "redirects %s to %s while homepage-only mode is enabled",
    async (path, expectedHref) => {
      vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
      const router = createAppRouter({
        homepageOnlyMode: true,
        history: createMemoryHistory({ initialEntries: [path] }),
      });

      render(<RouterProvider router={router} />);

      await waitFor(() => {
        expect(router.state.location.href).toBe(expectedHref);
      });
    },
  );

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
  ])(
    "keeps $path accessible inside the temporary shell",
    async ({ path, heading }) => {
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
    },
  );

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
          name: /At the forefront\s*of African technology/i,
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
