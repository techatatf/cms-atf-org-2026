import { RichText } from "@payloadcms/richtext-lexical/react";
import { Calendar, ImageOff } from "lucide-react";
import { useState } from "react";

import { AppLink } from "@/components/site/AppLink";
import { ContentBand, SubpageTemplate } from "@/components/site/Page";
import type { NewsArticle, NewsArticleHeroImage } from "@/services/news";

function NewsArticleImage({ image }: { image: NewsArticleHeroImage }) {
  const [failed, setFailed] = useState(false);
  const frameClassName =
    "mb-10 aspect-video w-full overflow-hidden border border-atf-gray-200 bg-atf-gray-100";

  if (failed) {
    return (
      <div
        aria-label={`${image.alt}. Image unavailable.`}
        className={`${frameClassName} flex flex-col items-center justify-center gap-3 text-atf-gray-500`}
        role="img"
      >
        <ImageOff className="size-8" aria-hidden="true" />
        <span className="font-display text-sm font-bold uppercase">
          Image unavailable
        </span>
      </div>
    );
  }

  return (
    <img
      alt={image.alt}
      className={`${frameClassName} block object-cover`}
      decoding="async"
      onError={() => setFailed(true)}
      src={image.url}
    />
  );
}

export function NewsArticlePage({ article }: { article: NewsArticle }) {
  const publishedDate = new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
    year: "numeric",
  }).format(new Date(article.publishedAt));

  return (
    <SubpageTemplate
      hero={{
        eyebrow: article.category,
        title: article.title,
        description: article.excerpt,
      }}
    >
      <ContentBand>
        <article className="mx-auto max-w-3xl">
          {article.heroImage ? (
            <NewsArticleImage
              image={article.heroImage}
              key={article.heroImage.url}
            />
          ) : null}

          <div className="mb-10 flex flex-wrap items-center gap-4 border-b border-atf-gray-200 pb-8 text-sm text-atf-gray-500">
            <span className="inline-flex items-center gap-2">
              <Calendar className="size-4 text-primary" aria-hidden="true" />
              {publishedDate}
            </span>
          </div>

          <p className="text-xl leading-9 text-atf-ink">{article.excerpt}</p>
          <RichText
            className="mt-8 space-y-5 text-lg leading-8 text-atf-gray-500"
            data={article.body}
          />

          <AppLink href="/news" className="atf-link mt-12">
            Back to News
          </AppLink>
        </article>
      </ContentBand>
    </SubpageTemplate>
  );
}
