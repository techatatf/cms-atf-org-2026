/**
 * @vitest-environment jsdom
 */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { RouterProvider, createMemoryHistory } from "@tanstack/react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createAppRouter } from "@/router";

const articleBody = {
  root: {
    children: [],
    direction: "ltr",
    format: "",
    indent: 0,
    type: "root",
    version: 1,
  },
};

function createDeferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });

  return { promise, reject, resolve };
}

function article(index: number) {
  return {
    id: index,
    _status: "published",
    body: articleBody,
    category: "Press",
    excerpt: `News article ${index} excerpt.`,
    featured: index === 1,
    heroImage: null,
    publishedAt: `2026-08-${String(31 - index).padStart(2, "0")}T09:00:00.000Z`,
    slug: `news-article-${index}`,
    title: `News article ${index}`,
  };
}

function pageResponse({
  docs,
  hasNextPage,
  page,
  totalDocs,
}: {
  docs: ReturnType<typeof article>[];
  hasNextPage: boolean;
  page: number;
  totalDocs: number;
}) {
  return new Response(
    JSON.stringify({
      docs,
      hasNextPage,
      page,
      totalDocs,
      totalPages: Math.ceil(totalDocs / 12),
    }),
    { status: 200 },
  );
}

function renderNewsIndex() {
  const router = createAppRouter({
    homepageOnlyMode: false,
    history: createMemoryHistory({ initialEntries: ["/news"] }),
  });

  render(<RouterProvider router={router} />);

  return router;
}

beforeEach(() => {
  vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
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

describe("published News index", () => {
  it("keeps the layout visible while loading and renders the first twelve articles", async () => {
    const response = createDeferred<Response>();
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockReturnValue(response.promise);

    renderNewsIndex();

    expect(await screen.findByRole("banner")).toBeTruthy();
    expect(screen.getByRole("contentinfo")).toBeTruthy();
    expect(screen.getByRole("status").textContent).toContain("Loading news...");

    response.resolve(
      pageResponse({
        docs: Array.from({ length: 12 }, (_, index) => article(index + 1)),
        hasNextPage: true,
        page: 1,
        totalDocs: 13,
      }),
    );

    expect(
      await screen.findByRole("heading", { level: 2, name: "News article 1" }),
    ).toBeTruthy();
    expect(
      screen.getAllByRole("heading", {
        level: 2,
        name: /^News article \d+$/,
      }),
    ).toHaveLength(12);
    expect(screen.getByRole("button", { name: "Load more" })).toBeTruthy();

    const requestURL = new URL(String(fetchSpy.mock.calls[0]?.[0]));
    expect(Object.fromEntries(requestURL.searchParams)).toMatchObject({
      limit: "12",
      page: "1",
      sort: "-publishedAt,slug",
    });
  });

  it("retries an initial failure and distinguishes a successful empty collection", async () => {
    const retryResponse = createDeferred<Response>();
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockRejectedValueOnce(new TypeError("offline"))
      .mockReturnValueOnce(retryResponse.promise);

    renderNewsIndex();

    expect(
      await screen.findByRole("heading", {
        level: 2,
        name: "News temporarily unavailable",
      }),
    ).toBeTruthy();
    expect(screen.getByRole("banner")).toBeTruthy();
    expect(screen.getByRole("contentinfo")).toBeTruthy();
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    expect(screen.getByRole("status").textContent).toContain("Loading news...");
    expect(fetchSpy).toHaveBeenCalledTimes(2);

    retryResponse.resolve(
      pageResponse({
        docs: [],
        hasNextPage: false,
        page: 1,
        totalDocs: 0,
      }),
    );

    expect(await screen.findByText("No news published yet.")).toBeTruthy();
    expect(screen.queryByText("News temporarily unavailable")).toBeNull();
  });

  it("resets to the first page when the category changes", async () => {
    const categoryResponse = createDeferred<Response>();
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        pageResponse({
          docs: [article(1)],
          hasNextPage: true,
          page: 1,
          totalDocs: 13,
        }),
      )
      .mockReturnValueOnce(categoryResponse.promise);

    renderNewsIndex();

    expect(
      await screen.findByRole("heading", { level: 2, name: "News article 1" }),
    ).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Research" }));

    expect(screen.getByRole("status").textContent).toContain("Loading news...");
    expect(screen.queryByText("News article 1")).toBeNull();
    const categoryURL = new URL(String(fetchSpy.mock.calls[1]?.[0]));
    expect(Object.fromEntries(categoryURL.searchParams)).toMatchObject({
      limit: "12",
      page: "1",
      "where[category][equals]": "Research",
    });

    categoryResponse.resolve(
      pageResponse({
        docs: [],
        hasNextPage: false,
        page: 1,
        totalDocs: 0,
      }),
    );

    expect(
      await screen.findByText("No updates in this category yet."),
    ).toBeTruthy();
    expect(
      screen
        .getByRole("button", { name: "Research" })
        .getAttribute("aria-pressed"),
    ).toBe("true");
    expect(screen.queryByRole("button", { name: "Load more" })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Research" }));
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it("keeps prior pages visible and retries a failed Load more page", async () => {
    const retryResponse = createDeferred<Response>();
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        pageResponse({
          docs: [article(1)],
          hasNextPage: true,
          page: 1,
          totalDocs: 2,
        }),
      )
      .mockRejectedValueOnce(new TypeError("page two offline"))
      .mockReturnValueOnce(retryResponse.promise);

    renderNewsIndex();

    expect(
      await screen.findByRole("heading", { level: 2, name: "News article 1" }),
    ).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Load more" }));

    expect(
      await screen.findByText("More news temporarily unavailable."),
    ).toBeTruthy();
    expect(screen.getByText("News article 1")).toBeTruthy();
    expect(fetchSpy).toHaveBeenCalledTimes(2);

    const failedPageURL = new URL(String(fetchSpy.mock.calls[1]?.[0]));
    expect(failedPageURL.searchParams.get("page")).toBe("2");

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    expect(screen.getByText("News article 1")).toBeTruthy();
    expect(screen.getByRole("status").textContent).toContain(
      "Loading more news...",
    );
    expect(fetchSpy).toHaveBeenCalledTimes(3);

    retryResponse.resolve(
      pageResponse({
        docs: [article(2)],
        hasNextPage: false,
        page: 2,
        totalDocs: 2,
      }),
    );

    expect(
      await screen.findByRole("heading", { level: 2, name: "News article 2" }),
    ).toBeTruthy();
    expect(screen.getByText("News article 1")).toBeTruthy();
    expect(screen.queryByText("More news temporarily unavailable.")).toBeNull();
    expect(screen.queryByRole("button", { name: "Load more" })).toBeNull();
  });
});
