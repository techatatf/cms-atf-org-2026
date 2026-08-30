/**
 * @vitest-environment jsdom
 */
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { HomePage } from "@/components/site/HomePage";

function payloadPage(docs: unknown[] = []) {
  return new Response(
    JSON.stringify({
      docs,
      hasNextPage: false,
      page: 1,
      totalDocs: docs.length,
      totalPages: docs.length === 0 ? 0 : 1,
    }),
    { status: 200 },
  );
}

beforeEach(() => {
  vi.spyOn(globalThis, "fetch").mockImplementation(() =>
    Promise.resolve(payloadPage()),
  );
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

vi.mock("@tanstack/react-router", () => ({
  Link: ({
    to,
    params,
    children,
    ...props
  }: {
    to: string;
    params?: Record<string, string>;
    children: ReactNode;
    [key: string]: unknown;
  }) => {
    const href =
      params && "country" in params ? `/countries/${params.country}` : to;

    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  },
}));

describe("HomePage hero", () => {
  it("renders separate desktop and compact hero variants", () => {
    render(<HomePage />);

    const desktopHero = screen.getByRole("region", {
      name: "ATF desktop hero",
    });
    const compactHero = screen.getByRole("region", {
      name: "ATF compact hero",
    });

    expect(desktopHero.classList.contains("atf-desktop-hero")).toBe(true);
    expect(desktopHero.classList.contains("hidden")).toBe(true);
    expect(desktopHero.classList.contains("lg:block")).toBe(true);
    expect(compactHero.classList.contains("lg:hidden")).toBe(true);
    expect(compactHero.getAttribute("data-tone")).toBe("light");
  });

  it("puts compact media before a light content panel with its CTA and stats", () => {
    render(<HomePage />);

    const compactHero = screen.getByRole("region", {
      name: "ATF compact hero",
    });
    const media = compactHero.querySelector(".atf-compact-hero-media");
    const panel = compactHero.querySelector(".atf-compact-hero-panel");

    expect(media).not.toBeNull();
    expect(panel).not.toBeNull();
    if (!media || !panel) throw new Error("Compact hero structure is missing");

    const mediaElement = media as HTMLElement;
    const panelElement = panel as HTMLElement;

    expect(
      media.compareDocumentPosition(panel) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(panelElement.classList.contains("bg-white")).toBe(true);
    expect(panelElement.classList.contains("text-atf-ink")).toBe(true);

    const panelQueries = within(panelElement);

    expect(
      panelQueries
        .getByRole("link", { name: "Partner With ATF" })
        .getAttribute("href"),
    ).toBe("/consulting");
    expect(
      within(mediaElement).queryByRole("button", {
        name: /Play ATF feature video/i,
      }),
    ).toBeNull();

    expect(panelQueries.getByText("5")).toBeTruthy();
    expect(panelQueries.getByText("Countries")).toBeTruthy();
    expect(panelQueries.getByText("35+")).toBeTruthy();
    expect(panelQueries.getByText("Functional MVPs delivered")).toBeTruthy();
    expect(panelQueries.getByText("23K")).toBeTruthy();
    expect(panelQueries.getByText("Participants empowered")).toBeTruthy();
  });
});

describe("HomePage Newsroom", () => {
  it("renders one featured News Article and five newest non-featured articles", async () => {
    const article = ({
      featured,
      id,
      title,
    }: {
      featured: boolean;
      id: number;
      title: string;
    }) => ({
      id,
      _status: "published",
      body: {
        root: {
          children: [],
          direction: "ltr",
          format: "",
          indent: 0,
          type: "root",
          version: 1,
        },
      },
      category: "Press",
      excerpt: `${title} excerpt.`,
      featured,
      heroImage: featured
        ? {
            alt: "CMS featured workshop",
            url: "/api/media/file/cms-featured-workshop.jpg",
          }
        : null,
      publishedAt: `2026-08-${String(30 - id).padStart(2, "0")}T09:00:00.000Z`,
      slug: title.toLowerCase().replaceAll(" ", "-"),
      title,
    });
    const featuredArticle = article({
      featured: true,
      id: 1,
      title: "CMS Featured News",
    });
    const recentArticles = Array.from({ length: 6 }, (_, index) =>
      article({
        featured: false,
        id: index + 2,
        title: `CMS Recent News ${index + 1}`,
      }),
    );
    const fetchSpy = vi.mocked(globalThis.fetch).mockImplementation((input) => {
      const requestURL = new URL(String(input));
      const featured = requestURL.searchParams.get("where[featured][equals]");
      const docs = featured === "true" ? [featuredArticle] : recentArticles;

      return Promise.resolve(payloadPage(docs));
    });

    const { container } = render(<HomePage homepageOnlyMode={false} />);
    const newsroom = container.querySelector<HTMLElement>("#news");
    if (!newsroom) throw new Error("Homepage Newsroom is missing");
    const news = within(newsroom);

    expect(
      await news.findByRole("heading", { name: "CMS Featured News" }),
    ).toBeTruthy();
    for (let index = 1; index <= 5; index += 1) {
      expect(
        news.getByRole("heading", { name: `CMS Recent News ${index}` }),
      ).toBeTruthy();
    }
    expect(news.queryByText("CMS Recent News 6")).toBeNull();
    expect(news.queryByRole("button", { name: "Press" })).toBeNull();
    expect(
      news
        .getByRole("link", { name: /CMS Featured News/ })
        .getAttribute("href"),
    ).toBe("/news/cms-featured-news");
    const imageSource = news
      .getByRole("img", { name: "CMS featured workshop" })
      .getAttribute("src");
    expect(new URL(imageSource ?? "http://invalid.test").pathname).toBe(
      "/api/media/file/cms-featured-workshop.jpg",
    );

    expect(fetchSpy).toHaveBeenCalledTimes(2);
    const requestLimits = fetchSpy.mock.calls.map(([input]) => {
      const requestURL = new URL(String(input));
      return [
        requestURL.searchParams.get("where[featured][equals]"),
        requestURL.searchParams.get("limit"),
      ];
    });
    expect(requestLimits).toEqual([
      ["true", "1"],
      ["false", "6"],
    ]);
  });

  it("keeps the homepage available when Newsroom fails and retries to an empty result", async () => {
    let requestCount = 0;
    const fetchSpy = vi.mocked(globalThis.fetch).mockImplementation(() => {
      requestCount += 1;

      return requestCount <= 2
        ? Promise.reject(new Error("Backend CMS unavailable"))
        : Promise.resolve(payloadPage());
    });

    render(<HomePage homepageOnlyMode={false} />);

    expect(
      await screen.findByRole("heading", {
        name: "News temporarily unavailable",
      }),
    ).toBeTruthy();
    expect(
      screen.getByRole("region", { name: "ATF desktop hero" }),
    ).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    expect(await screen.findByText("No news published yet.")).toBeTruthy();
    expect(fetchSpy).toHaveBeenCalledTimes(4);
  });
});
