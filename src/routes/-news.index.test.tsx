/**
 * @vitest-environment jsdom
 */
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { RouterProvider, createMemoryHistory } from "@tanstack/react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createAppRouter } from "@/router";

const body = { root: { children: [], direction: "ltr", format: "", indent: 0, type: "root", version: 1 } };
function article(id: number, featured = false, heroImage: null | { alt: string; url: string } = null) {
  return {
    id, _status: "published", body, category: "Press", excerpt: `Excerpt ${id}`,
    featured, heroImage, publishedAt: `2026-08-${String(31 - id).padStart(2, "0")}T09:00:00.000Z`,
    slug: `article-${id}`, title: `Article ${id}`,
  };
}
function page(docs: ReturnType<typeof article>[], hasNextPage = false) {
  return new Response(JSON.stringify({ docs, hasNextPage, page: 1, totalDocs: docs.length }), { status: 200 });
}
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => { resolve = done; });
  return { promise, resolve };
}
function renderNews() {
  const router = createAppRouter({
    homepageOnlyMode: false,
    history: createMemoryHistory({ initialEntries: ["/news"] }),
  });
  render(<RouterProvider router={router} />);
}
beforeEach(() => {
  vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
  Object.defineProperty(Element.prototype, "scrollIntoView", { configurable: true, value: vi.fn() });
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  Reflect.deleteProperty(Element.prototype, "scrollIntoView");
});

describe("Newsroom", () => {
  it("keeps the shell visible, promotes an image-free featured Lead Story, and pages the other stories", async () => {
    const leadResponse = deferred<Response>();
    const fetchSpy = vi.spyOn(globalThis, "fetch")
      .mockReturnValueOnce(leadResponse.promise)
      .mockResolvedValueOnce(page(Array.from({ length: 12 }, (_, i) => article(i + 2)), true))
      .mockResolvedValueOnce(page([article(14)]));
    renderNews();

    expect(await screen.findByRole("banner")).toBeTruthy();
    expect(screen.getByRole("contentinfo")).toBeTruthy();
    expect(screen.getByRole("status").textContent).toContain("Loading news");
    leadResponse.resolve(page([article(1, true)]));

    expect(await screen.findByRole("heading", { level: 1, name: "Article 1" })).toBeTruthy();
    expect(screen.queryByRole("img", { name: /Article 1/ })).toBeNull();
    const archive = screen.getByRole("region", { name: "News Archive" });
    await waitFor(() => expect(within(archive).getAllByRole("heading", { level: 3, name: /^Article \d+$/ })).toHaveLength(12));
    expect(within(archive).queryByText("Article 1")).toBeNull();
    expect(screen.getByRole("link", { name: /Read the story/ }).getAttribute("href")).toBe("/news/article-1");
    expect(new URL(String(fetchSpy.mock.calls[1]?.[0])).searchParams.get("where[id][not_equals]")).toBe("1");
    fireEvent.click(screen.getByRole("button", { name: "Load more" }));
    expect(await within(archive).findByRole("heading", { level: 3, name: "Article 14" })).toBeTruthy();
    expect(new URL(String(fetchSpy.mock.calls[2]?.[0])).searchParams.get("page")).toBe("2");
  });

  it("retries an unavailable CMS and distinguishes a site with no published news", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch")
      .mockRejectedValueOnce(new TypeError("offline"))
      .mockResolvedValueOnce(page([]))
      .mockResolvedValueOnce(page([]));
    renderNews();
    expect(await screen.findByRole("heading", { name: "News temporarily unavailable" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(await screen.findByText("No news published yet.")).toBeTruthy();
    expect(fetchSpy).toHaveBeenCalledTimes(3);
  });

  it("filters only the archive and ignores a stale category response", async () => {
    const research = deferred<Response>();
    const fetchSpy = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(page([article(1, true)]))
      .mockResolvedValueOnce(page([article(2)]))
      .mockReturnValueOnce(research.promise)
      .mockResolvedValueOnce(page([article(3)]));
    renderNews();
    expect(await screen.findByRole("heading", { level: 3, name: "Article 2" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Research" }));
    fireEvent.click(screen.getByRole("button", { name: "Press" }));
    expect(await screen.findByRole("heading", { level: 3, name: "Article 3" })).toBeTruthy();
    research.resolve(page([article(4)]));
    await waitFor(() => expect(screen.queryByRole("heading", { level: 3, name: "Article 4" })).toBeNull());
    expect(screen.getByRole("heading", { level: 1, name: "Article 1" })).toBeTruthy();
    expect(new URL(String(fetchSpy.mock.calls[2]?.[0])).searchParams.get("where[category][equals]")).toBe("Research");
    expect(new URL(String(fetchSpy.mock.calls[3]?.[0])).searchParams.get("where[category][equals]")).toBe("Press");
  });

  it("keeps loaded archive stories while a failed Load more page is retried", async () => {
    const retry = deferred<Response>();
    const fetchSpy = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(page([article(1, true)]))
      .mockResolvedValueOnce(page([article(2)], true))
      .mockRejectedValueOnce(new TypeError("page two offline"))
      .mockReturnValueOnce(retry.promise);
    renderNews();
    expect(await screen.findByRole("heading", { level: 3, name: "Article 2" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Load more" }));
    expect(await screen.findByText("More news temporarily unavailable.")).toBeTruthy();
    expect(screen.getByRole("heading", { level: 3, name: "Article 2" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    retry.resolve(page([article(3)]));
    expect(await screen.findByRole("heading", { level: 3, name: "Article 3" })).toBeTruthy();
    expect(new URL(String(fetchSpy.mock.calls[2]?.[0])).searchParams.get("page")).toBe("2");
    expect(new URL(String(fetchSpy.mock.calls[3]?.[0])).searchParams.get("page")).toBe("2");
  });

  it("retries a failed archive without dropping the Lead Story", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(page([article(1, true)]))
      .mockRejectedValueOnce(new TypeError("archive offline"))
      .mockResolvedValueOnce(page([article(2)]));
    renderNews();
    expect(await screen.findByRole("heading", { name: "News Archive temporarily unavailable" })).toBeTruthy();
    expect(screen.getByRole("heading", { level: 1, name: "Article 1" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(await screen.findByRole("heading", { level: 3, name: "Article 2" })).toBeTruthy();
  });

  it("uses the text masthead after a lead image fails", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(page([article(1, true, { alt: "Lead photo", url: "/lead.jpg" })]))
      .mockResolvedValueOnce(page([]));
    renderNews();
    const image = await screen.findByRole("img", { name: "Lead photo" });
    fireEvent.error(image);
    expect(screen.queryByRole("img", { name: "Lead photo" })).toBeNull();
    expect(screen.getByRole("heading", { level: 1, name: "Article 1" })).toBeTruthy();
  });
});
