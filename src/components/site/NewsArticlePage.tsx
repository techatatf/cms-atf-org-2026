import { RichText } from "@payloadcms/richtext-lexical/react";
import { Calendar } from "lucide-react";

import { AppLink } from "@/components/site/AppLink";
import { ContentBand, SubpageTemplate } from "@/components/site/Page";
import type { NewsArticle } from "@/services/news";

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
