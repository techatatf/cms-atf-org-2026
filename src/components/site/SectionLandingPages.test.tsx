/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  PublicationsLandingPage,
  WhatWeDoLandingPage,
  WhereWeWorkLandingPage,
  WhoWeAreLandingPage,
} from "@/components/site/SectionLandingPages";

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

vi.mock("@tanstack/react-router", () => ({
  Link: ({
    to,
    children,
    ...props
  }: {
    to: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

beforeEach(() => {
  vi.spyOn(globalThis, "fetch").mockImplementation(() =>
    Promise.resolve(payloadPage()),
  );
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("PublicationsLandingPage", () => {
  it("presents Publications as a content-family overview with prominent detail destinations", () => {
    render(<PublicationsLandingPage />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Insights, news, and research from across the ATF network.",
      }),
    ).toBeTruthy();

    const detailPages = screen.getByRole("navigation", {
      name: "Publications detail pages",
    });

    const detailLinks = within(detailPages)
      .getAllByRole("link")
      .map((link) => ({
        label: within(link).getByRole("heading").textContent,
        href: link.getAttribute("href"),
      }));

    expect(detailLinks).toEqual([
      { label: "Newsroom", href: "/news" },
      { label: "Articles", href: "/articles" },
      { label: "Research Papers", href: "/research" },
      { label: "Library", href: "/library" },
    ]);
  });

  it("renders one featured News Article and three recent News Articles without replacing other Publications content", async () => {
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
      category: "Research",
      excerpt: `${title} excerpt.`,
      featured,
      heroImage: null,
      publishedAt: `2026-08-${String(30 - id).padStart(2, "0")}T09:00:00.000Z`,
      slug: title.toLowerCase().replaceAll(" ", "-"),
      title,
    });
    const featuredArticle = article({
      featured: true,
      id: 1,
      title: "Publications Featured News",
    });
    const recentArticles = Array.from({ length: 4 }, (_, index) =>
      article({
        featured: false,
        id: index + 2,
        title: `Publications Recent News ${index + 1}`,
      }),
    );
    const fetchSpy = vi.mocked(globalThis.fetch).mockImplementation((input) => {
      const requestURL = new URL(String(input));
      const featured = requestURL.searchParams.get("where[featured][equals]");
      const docs = featured === "true" ? [featuredArticle] : recentArticles;

      return Promise.resolve(payloadPage(docs));
    });

    render(<PublicationsLandingPage />);

    expect(
      await screen.findByRole("heading", {
        name: "Publications Featured News",
      }),
    ).toBeTruthy();
    for (let index = 1; index <= 3; index += 1) {
      expect(
        screen.getByRole("heading", {
          name: `Publications Recent News ${index}`,
        }),
      ).toBeTruthy();
    }
    expect(screen.queryByText("Publications Recent News 4")).toBeNull();
    expect(
      screen.getByRole("heading", {
        name: "The Future of AI in African Healthcare",
      }),
    ).toBeTruthy();
    expect(
      screen.getByRole("heading", {
        name: "State of African Tech Ecosystems 2025",
      }),
    ).toBeTruthy();
    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(
      fetchSpy.mock.calls.map(([input]) => {
        const requestURL = new URL(String(input));
        return [
          requestURL.searchParams.get("where[featured][equals]"),
          requestURL.searchParams.get("limit"),
        ];
      }),
    ).toEqual([
      ["true", "1"],
      ["false", "4"],
    ]);
  });

  it("keeps other Publications content available when Newsroom fails", async () => {
    vi.mocked(globalThis.fetch).mockRejectedValue(
      new Error("Backend CMS unavailable"),
    );

    render(<PublicationsLandingPage />);

    expect(
      await screen.findByRole("heading", {
        name: "News temporarily unavailable",
      }),
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: "Retry" })).toBeTruthy();
    expect(
      screen.getByRole("navigation", { name: "Publications detail pages" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("heading", {
        name: "The Future of AI in African Healthcare",
      }),
    ).toBeTruthy();
  });
});

describe("WhoWeAreLandingPage", () => {
  it("expands the homepage Who We Are section and links to its detail pages", () => {
    render(<WhoWeAreLandingPage />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "A pan-African technology forum built for systemic change.",
      }),
    ).toBeTruthy();

    const detailPages = screen.getByRole("navigation", {
      name: "Who We Are detail pages",
    });
    const detailLinks = within(detailPages)
      .getAllByRole("link")
      .map((link) => ({
        label: within(link).getByRole("heading").textContent,
        href: link.getAttribute("href"),
      }));

    expect(detailLinks).toEqual([
      { label: "Our Mission, Vision and Story", href: "/about" },
      { label: "The Team And Contributors", href: "/team" },
    ]);
  });
});

describe("WhatWeDoLandingPage", () => {
  it("expands the homepage What We Do section and links to its detail pages", () => {
    render(<WhatWeDoLandingPage />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Programs that connect strategy, talent, and implementation.",
      }),
    ).toBeTruthy();

    const detailPages = screen.getByRole("navigation", {
      name: "What We Do detail pages",
    });
    const detailLinks = within(detailPages)
      .getAllByRole("link")
      .map((link) => ({
        label: within(link).getByRole("heading").textContent,
        href: link.getAttribute("href"),
      }));

    expect(detailLinks).toEqual([
      { label: "ATF Consulting", href: "/consulting" },
      { label: "ATF Challenge", href: "/challenge" },
      { label: "ATF Chapters", href: "/chapters" },
    ]);
  });
});

describe("WhereWeWorkLandingPage", () => {
  it("expands the homepage Where We Work section and links to its country detail pages", () => {
    render(<WhereWeWorkLandingPage />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "A chapter network rooted across Africa.",
      }),
    ).toBeTruthy();

    const detailPages = screen.getByRole("navigation", {
      name: "Where We Work detail pages",
    });
    const detailLinks = within(detailPages)
      .getAllByRole("link")
      .map((link) => ({
        label: within(link).getByRole("heading").textContent,
        href: link.getAttribute("href"),
      }));

    expect(detailLinks).toEqual([
      { label: "Ghana", href: "/countries/ghana" },
      { label: "Nigeria", href: "/countries/nigeria" },
      { label: "Kenya", href: "/countries/kenya" },
      { label: "South Africa", href: "/countries/south-africa" },
    ]);
  });
});
