import { RichText } from "@payloadcms/richtext-lexical/react";
import { useState } from "react";

import { AppLink } from "@/components/site/AppLink";
import { NewsArticleImage } from "@/components/site/NewsArticleImage";
import { SubpageBreadcrumb, newsArticleBreadcrumb } from "@/components/site/SubpageBreadcrumb";
import { formatPublishedDate } from "@/lib/format-published-date";
import type { NewsArticle, NewsArticleBody } from "@/services/news";

function visibleText(node: unknown): string | null {
  if (!node || typeof node !== "object") return null;
  const value = node as { type?: unknown; text?: unknown; children?: unknown };
  if (value.type === "text") return typeof value.text === "string" ? value.text : null;
  if (value.type === "linebreak") return "\n";
  if (!Array.isArray(value.children)) return null;

  const children = value.children.map(visibleText);
  return children.some((text) => text === null) ? null : children.join("");
}

function splitRepeatedExcerpt(body: NewsArticleBody, excerpt: string): {
  body: NewsArticleBody;
  summary: NewsArticleBody | null;
} {
  const first = body.root.children[0];
  if (!first || first.type !== "paragraph") return { body, summary: null };

  const firstText = visibleText(first);
  if (firstText?.trim() !== excerpt.trim()) return { body, summary: null };

  return {
    body: { ...body, root: { ...body.root, children: body.root.children.slice(1) } },
    summary: { ...body, root: { ...body.root, children: [first] } },
  };
}

export function NewsArticlePage({ article }: { article: NewsArticle }) {
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
  const content = splitRepeatedExcerpt(article.body, article.excerpt);

  return (
    <div className="min-h-[70vh] bg-white">
      <SubpageBreadcrumb entries={newsArticleBreadcrumb(article.title)} />
      <article>
        <header className="atf-container max-w-5xl py-16 md:py-20">
          <p className="font-display text-xs font-bold uppercase tracking-widest text-primary">{article.category}</p>
          <h1 className="mt-7 max-w-5xl break-words font-display text-4xl font-black leading-[1.07] text-atf-black md:text-6xl">
            {article.title}
          </h1>
          {content.summary ? (
            <RichText className="mt-7 max-w-4xl text-xl leading-9 text-atf-gray-500" data={content.summary} />
          ) : (
            <p className="mt-7 max-w-4xl text-xl leading-9 text-atf-gray-500">{article.excerpt}</p>
          )}
          <div className="mt-10 border-t border-atf-gray-200 pt-6 font-display text-xs font-bold uppercase tracking-widest text-atf-ink">
            <span className="mr-4 text-atf-gray-500">Published</span>
            <time dateTime={article.publishedAt}>{formatPublishedDate(article.publishedAt)}</time>
          </div>
        </header>
        {article.heroImage && article.heroImage.url !== failedImageUrl ? (
          <div className="atf-container pb-4">
            <NewsArticleImage
              frameClassName="aspect-video w-full"
              image={article.heroImage}
              key={article.heroImage.url}
              onFailure={() => setFailedImageUrl(article.heroImage?.url ?? null)}
            />
          </div>
        ) : null}
        <div className="atf-container max-w-5xl py-12 md:py-16">
          <div className="max-w-3xl">
            <RichText className="space-y-5 text-lg leading-8 text-atf-ink" data={content.body} />
            <AppLink href="/news" className="atf-link mt-14 inline-flex">Back to Newsroom</AppLink>
          </div>
        </div>
      </article>
    </div>
  );
}
