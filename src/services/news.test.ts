import { afterEach, describe, expect, it, vi } from "vitest";

import {
  getPublishedNewsArticle,
  getPublishedNewsHighlights,
  getPublishedNewsPage,
} from "@/services/news";

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
              heroImage: {
                alt: "Participants presenting their workshop prototypes",
                url: "/api/media/file/workshop-prototypes.jpg",
              },
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
      heroImage: {
        alt: "Participants presenting their workshop prototypes",
        url: "https://cms.example.test/api/media/file/workshop-prototypes.jpg",
      },
      publishedAt: "2026-08-29T12:00:00.000Z",
      slug: "typed-public-article",
      title: "Typed Public Article",
    });

    const requestURL = new URL(String(fetchSpy.mock.calls[0]?.[0]));
    expect(`${requestURL.origin}${requestURL.pathname}`).toBe(
      "https://cms.example.test/api/news-articles",
    );
    expect(Object.fromEntries(requestURL.searchParams)).toEqual({
      depth: "1",
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

    await expect(
      getPublishedNewsArticle("missing-article"),
    ).resolves.toBeNull();
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

describe("published News Article list query", () => {
  it("returns one ordered category page from Payload", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          docs: [
            {
              id: 84,
              _status: "published",
              body,
              category: "Research",
              excerpt: "The newest research update.",
              featured: false,
              heroImage: null,
              publishedAt: "2026-08-30T09:00:00.000Z",
              slug: "newest-research-update",
              title: "Newest Research Update",
            },
          ],
          hasNextPage: true,
          page: 2,
          totalDocs: 25,
          totalPages: 3,
        }),
        { status: 200 },
      ),
    );

    await expect(
      getPublishedNewsPage({
        category: "Research",
        limit: 12,
        origin: "https://cms.example.test/",
        page: 2,
      }),
    ).resolves.toEqual({
      articles: [
        {
          id: "84",
          body,
          category: "Research",
          excerpt: "The newest research update.",
          featured: false,
          heroImage: null,
          publishedAt: "2026-08-30T09:00:00.000Z",
          slug: "newest-research-update",
          title: "Newest Research Update",
        },
      ],
      hasNextPage: true,
      page: 2,
      totalDocs: 25,
    });

    const requestURL = new URL(String(fetchSpy.mock.calls[0]?.[0]));
    expect(Object.fromEntries(requestURL.searchParams)).toEqual({
      depth: "1",
      draft: "false",
      limit: "12",
      page: "2",
      sort: "-publishedAt,slug",
      "where[_status][equals]": "published",
      "where[category][equals]": "Research",
    });
  });

  it("stops one list request after five seconds without retrying", async () => {
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

    const request = getPublishedNewsPage();
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

  it("returns one featured article and the requested number of recent articles", async () => {
    const article = ({
      featured,
      id,
      slug,
    }: {
      featured: boolean;
      id: number;
      slug: string;
    }) => ({
      id,
      _status: "published",
      body,
      category: "Press",
      excerpt: `${slug} excerpt`,
      featured,
      heroImage: null,
      publishedAt: `2026-08-${String(30 - id).padStart(2, "0")}T09:00:00.000Z`,
      slug,
      title: slug,
    });
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            docs: [article({ featured: true, id: 1, slug: "featured" })],
            hasNextPage: false,
            page: 1,
            totalDocs: 1,
            totalPages: 1,
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            docs: [
              article({ featured: false, id: 2, slug: "recent-1" }),
              article({ featured: false, id: 3, slug: "recent-2" }),
              article({ featured: false, id: 4, slug: "recent-3" }),
              article({ featured: false, id: 5, slug: "recent-4" }),
              article({ featured: false, id: 6, slug: "recent-5" }),
              article({ featured: false, id: 7, slug: "not-returned" }),
            ],
            hasNextPage: true,
            page: 1,
            totalDocs: 7,
            totalPages: 2,
          }),
          { status: 200 },
        ),
      );

    const result = await getPublishedNewsHighlights({
      nonFeaturedLimit: 5,
      origin: "https://cms.example.test/",
    });

    expect(result.featured?.slug).toBe("featured");
    expect(result.recent.map(({ slug }) => slug)).toEqual([
      "recent-1",
      "recent-2",
      "recent-3",
      "recent-4",
      "recent-5",
    ]);
    expect(fetchSpy).toHaveBeenCalledTimes(2);

    const featuredURL = new URL(String(fetchSpy.mock.calls[0]?.[0]));
    expect(Object.fromEntries(featuredURL.searchParams)).toMatchObject({
      limit: "1",
      sort: "-publishedAt,slug",
      "where[featured][equals]": "true",
    });
    const recentURL = new URL(String(fetchSpy.mock.calls[1]?.[0]));
    expect(Object.fromEntries(recentURL.searchParams)).toMatchObject({
      limit: "6",
      sort: "-publishedAt,slug",
      "where[featured][equals]": "false",
    });
  });

  it("promotes the newest article when Payload has no featured article", async () => {
    const article = (id: number, slug: string) => ({
      id,
      _status: "published",
      body,
      category: "Chapters",
      excerpt: `${slug} excerpt`,
      featured: false,
      heroImage: null,
      publishedAt: `2026-08-${String(30 - id).padStart(2, "0")}T09:00:00.000Z`,
      slug,
      title: slug,
    });
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            docs: [],
            hasNextPage: false,
            page: 1,
            totalDocs: 0,
            totalPages: 0,
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            docs: [article(1, "newest"), article(2, "next-newest")],
            hasNextPage: false,
            page: 1,
            totalDocs: 2,
            totalPages: 1,
          }),
          { status: 200 },
        ),
      );

    const result = await getPublishedNewsHighlights({ nonFeaturedLimit: 3 });

    expect(result.featured?.slug).toBe("newest");
    expect(result.recent.map(({ slug }) => slug)).toEqual(["next-newest"]);
  });
});
