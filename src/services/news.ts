import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";

const DEFAULT_BACKEND_CMS_ORIGIN =
  import.meta.env.VITE_BACKEND_CMS_ORIGIN || "http://localhost:3001";

const REQUEST_TIMEOUT_MS = 5_000;

export const NEWS_CATEGORIES = [
  "Press",
  "Programs",
  "Research",
  "Partnerships",
  "Chapters",
] as const;

export type NewsCategory = (typeof NEWS_CATEGORIES)[number];

export type NewsArticleBody = SerializedEditorState;

export type NewsArticleHeroImage = {
  alt: string;
  url: string;
};

export type NewsArticle = {
  id: string;
  body: NewsArticleBody;
  category: NewsCategory;
  excerpt: string;
  featured: boolean;
  heroImage: NewsArticleHeroImage | null;
  publishedAt: string;
  slug: string;
  title: string;
};

type NewsArticleQueryOptions = {
  origin?: string;
  timeoutMs?: number;
};

type PublishedNewsPageOptions = NewsArticleQueryOptions & {
  category?: NewsCategory;
  limit?: number;
  page?: number;
};

type PublishedNewsPageRequestOptions = PublishedNewsPageOptions & {
  featured?: boolean;
};

type PublishedNewsHighlightsOptions = NewsArticleQueryOptions & {
  nonFeaturedLimit: number;
};

export type PublishedNewsPage = {
  articles: NewsArticle[];
  hasNextPage: boolean;
  page: number;
  totalDocs: number;
};

export type PublishedNewsHighlights = {
  featured: NewsArticle | null;
  recent: NewsArticle[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNewsCategory(value: unknown): value is NewsCategory {
  return NEWS_CATEGORIES.some((category) => category === value);
}

function mapHeroImage(
  value: unknown,
  backendCMSOrigin: string,
): NewsArticleHeroImage | null {
  if (!isRecord(value)) {
    return null;
  }

  const { alt, url } = value;

  if (
    typeof alt !== "string" ||
    alt.trim().length === 0 ||
    typeof url !== "string" ||
    url.trim().length === 0
  ) {
    return null;
  }

  try {
    const mediaURL = new URL(url, backendCMSOrigin);

    if (mediaURL.protocol !== "http:" && mediaURL.protocol !== "https:") {
      return null;
    }

    return {
      alt: alt.trim(),
      url: mediaURL.toString(),
    };
  } catch {
    return null;
  }
}

function mapNewsArticle(
  value: unknown,
  acceptedStatuses: ReadonlySet<string>,
  backendCMSOrigin: string,
): NewsArticle {
  if (!isRecord(value)) {
    throw new Error("Unexpected News Article response");
  }

  const {
    _status,
    body,
    category,
    excerpt,
    featured,
    heroImage,
    id,
    publishedAt,
    slug,
    title,
  } = value;

  if (
    typeof _status !== "string" ||
    !acceptedStatuses.has(_status) ||
    !isRecord(body) ||
    !isRecord(body.root) ||
    body.root.type !== "root" ||
    typeof body.root.version !== "number" ||
    !Array.isArray(body.root.children) ||
    !isNewsCategory(category) ||
    typeof excerpt !== "string" ||
    typeof featured !== "boolean" ||
    (typeof id !== "string" && typeof id !== "number") ||
    typeof publishedAt !== "string" ||
    typeof slug !== "string" ||
    typeof title !== "string"
  ) {
    throw new Error("Unexpected News Article response");
  }

  return {
    id: String(id),
    body: body as unknown as NewsArticleBody,
    category,
    excerpt,
    featured,
    heroImage: mapHeroImage(heroImage, backendCMSOrigin),
    publishedAt,
    slug,
    title,
  };
}

export function mapLivePreviewNewsArticle(value: unknown): NewsArticle | null {
  try {
    return mapNewsArticle(
      value,
      new Set(["draft", "published"]),
      DEFAULT_BACKEND_CMS_ORIGIN,
    );
  } catch {
    return null;
  }
}

export async function getPublishedNewsArticle(
  slug: string,
  {
    origin = DEFAULT_BACKEND_CMS_ORIGIN,
    timeoutMs = REQUEST_TIMEOUT_MS,
  }: NewsArticleQueryOptions = {},
): Promise<NewsArticle | null> {
  const requestURL = new URL("/api/news-articles", origin);
  requestURL.searchParams.set("depth", "1");
  requestURL.searchParams.set("draft", "false");
  requestURL.searchParams.set("limit", "1");
  requestURL.searchParams.set("where[_status][equals]", "published");
  requestURL.searchParams.set("where[slug][equals]", slug);

  const controller = new AbortController();
  const timeout = globalThis.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(requestURL, { signal: controller.signal });

    if (!response.ok) {
      throw new Error(`Backend CMS request failed with ${response.status}`);
    }

    const result: unknown = await response.json();
    if (!isRecord(result) || !Array.isArray(result.docs)) {
      throw new Error("Unexpected News Article response");
    }

    return result.docs.length === 0
      ? null
      : mapNewsArticle(result.docs[0], new Set(["published"]), origin);
  } finally {
    globalThis.clearTimeout(timeout);
  }
}

async function requestPublishedNewsPage({
  category,
  featured,
  limit = 12,
  origin = DEFAULT_BACKEND_CMS_ORIGIN,
  page = 1,
  timeoutMs = REQUEST_TIMEOUT_MS,
}: PublishedNewsPageRequestOptions = {}): Promise<PublishedNewsPage> {
  const requestURL = new URL("/api/news-articles", origin);
  requestURL.searchParams.set("depth", "1");
  requestURL.searchParams.set("draft", "false");
  requestURL.searchParams.set("limit", String(limit));
  requestURL.searchParams.set("page", String(page));
  requestURL.searchParams.set("sort", "-publishedAt,slug");
  requestURL.searchParams.set("where[_status][equals]", "published");

  if (category) {
    requestURL.searchParams.set("where[category][equals]", category);
  }

  if (featured !== undefined) {
    requestURL.searchParams.set(
      "where[featured][equals]",
      featured ? "true" : "false",
    );
  }

  const controller = new AbortController();
  const timeout = globalThis.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(requestURL, { signal: controller.signal });

    if (!response.ok) {
      throw new Error(`Backend CMS request failed with ${response.status}`);
    }

    const result: unknown = await response.json();
    if (
      !isRecord(result) ||
      !Array.isArray(result.docs) ||
      typeof result.hasNextPage !== "boolean" ||
      typeof result.page !== "number" ||
      typeof result.totalDocs !== "number"
    ) {
      throw new Error("Unexpected News Article response");
    }

    return {
      articles: result.docs.map((article) =>
        mapNewsArticle(article, new Set(["published"]), origin),
      ),
      hasNextPage: result.hasNextPage,
      page: result.page,
      totalDocs: result.totalDocs,
    };
  } finally {
    globalThis.clearTimeout(timeout);
  }
}

export function getPublishedNewsPage(
  options: PublishedNewsPageOptions = {},
): Promise<PublishedNewsPage> {
  return requestPublishedNewsPage(options);
}

export async function getPublishedNewsHighlights({
  nonFeaturedLimit,
  origin = DEFAULT_BACKEND_CMS_ORIGIN,
  timeoutMs = REQUEST_TIMEOUT_MS,
}: PublishedNewsHighlightsOptions): Promise<PublishedNewsHighlights> {
  const [featuredPage, nonFeaturedPage] = await Promise.all([
    requestPublishedNewsPage({
      featured: true,
      limit: 1,
      origin,
      timeoutMs,
    }),
    requestPublishedNewsPage({
      featured: false,
      limit: nonFeaturedLimit + 1,
      origin,
      timeoutMs,
    }),
  ]);
  const featured =
    featuredPage.articles[0] ?? nonFeaturedPage.articles[0] ?? null;
  const recentStart = featuredPage.articles.length === 0 ? 1 : 0;

  return {
    featured,
    recent: nonFeaturedPage.articles.slice(
      recentStart,
      recentStart + nonFeaturedLimit,
    ),
  };
}
