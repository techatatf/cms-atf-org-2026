import { afterEach, describe, expect, it, vi } from "vitest";

import { getPublishedNewsArticle } from "@/services/news";

const body = {
  root: {
    children: [
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            text: "The mapped article body.",
            type: "text",
            version: 1,
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        type: "paragraph",
        version: 1,
      },
    ],
    direction: "ltr",
    format: "",
    indent: 0,
    type: "root",
    version: 1,
  },
};

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("published News Article query", () => {
  it("maps one published Payload document by Public News Slug", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          docs: [
            {
              id: 42,
              _status: "published",
              body,
              category: "Programs",
              excerpt: "A typed public excerpt.",
              featured: true,
              heroImage: null,
              publishedAt: "2026-08-29T12:00:00.000Z",
              slug: "typed-public-article",
              title: "Typed Public Article",
            },
          ],
          totalDocs: 1,
        }),
        { status: 200 },
      ),
    );

    await expect(
      getPublishedNewsArticle("typed-public-article", {
        origin: "https://cms.example.test/",
      }),
    ).resolves.toEqual({
      id: "42",
      body,
      category: "Programs",
      excerpt: "A typed public excerpt.",
      featured: true,
      publishedAt: "2026-08-29T12:00:00.000Z",
      slug: "typed-public-article",
      title: "Typed Public Article",
    });

    const requestURL = new URL(String(fetchSpy.mock.calls[0]?.[0]));
    expect(`${requestURL.origin}${requestURL.pathname}`).toBe(
      "https://cms.example.test/api/news-articles",
    );
    expect(Object.fromEntries(requestURL.searchParams)).toEqual({
      depth: "0",
      draft: "false",
      limit: "1",
      "where[_status][equals]": "published",
      "where[slug][equals]": "typed-public-article",
    });
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.any(URL),
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it("returns no News Article when Payload resolves the slug with no documents", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ docs: [], totalDocs: 0 }), { status: 200 }),
    );

    await expect(getPublishedNewsArticle("missing-article")).resolves.toBeNull();
  });

  it("stops one request after five seconds without retrying", async () => {
    vi.useFakeTimers();
    let requestSignal: AbortSignal | undefined;
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation((_input, init) => {
        requestSignal = init?.signal ?? undefined;
        return new Promise((_resolve, reject) => {
          requestSignal?.addEventListener("abort", () => {
            reject(new DOMException("Timed out", "AbortError"));
          });
        });
      });

    const request = getPublishedNewsArticle("slow-article");
    const rejection = expect(request).rejects.toMatchObject({
      name: "AbortError",
    });

    await vi.advanceTimersByTimeAsync(4_999);
    expect(requestSignal?.aborted).toBe(false);
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1);
    expect(requestSignal?.aborted).toBe(true);
    await rejection;
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });
});
