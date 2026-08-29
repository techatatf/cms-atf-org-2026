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

export type NewsArticle = {
  id: string;
  body: NewsArticleBody;
  category: NewsCategory;
  excerpt: string;
  featured: boolean;
  publishedAt: string;
  slug: string;
  title: string;
};

type NewsArticleQueryOptions = {
  origin?: string;
  timeoutMs?: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNewsCategory(value: unknown): value is NewsCategory {
  return NEWS_CATEGORIES.some((category) => category === value);
}

function mapNewsArticle(value: unknown): NewsArticle {
  if (!isRecord(value)) {
    throw new Error("Unexpected News Article response");
  }

  const {
    _status,
    body,
    category,
    excerpt,
    featured,
    id,
    publishedAt,
    slug,
    title,
  } = value;

  if (
    _status !== "published" ||
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
    publishedAt,
    slug,
    title,
  };
}

export async function getPublishedNewsArticle(
  slug: string,
  {
    origin = DEFAULT_BACKEND_CMS_ORIGIN,
    timeoutMs = REQUEST_TIMEOUT_MS,
  }: NewsArticleQueryOptions = {},
): Promise<NewsArticle | null> {
  const requestURL = new URL("/api/news-articles", origin);
  requestURL.searchParams.set("depth", "0");
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

    return result.docs.length === 0 ? null : mapNewsArticle(result.docs[0]);
  } finally {
    globalThis.clearTimeout(timeout);
  }
}
