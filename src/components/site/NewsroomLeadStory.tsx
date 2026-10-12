import { useState } from "react";
import { ArrowRight } from "lucide-react";

import { OpportunityButton } from "@/components/site/OpportunityButton";
import { formatPublishedDate } from "@/lib/format-published-date";
import type { NewsArticle } from "@/services/news";

export function NewsroomLeadStory({ article }: { article: NewsArticle }) {
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
  const image = article.heroImage;
  const hasImage = image !== null && image.url !== failedImageUrl;

  return (
    <section aria-labelledby="lead-story-title" className="border-b border-atf-gray-200 bg-white">
      <div className={hasImage ? "grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]" : "atf-container py-16 md:py-24"}>
        {hasImage ? (
          <div className="min-h-[300px] bg-atf-gray-100 lg:min-h-[600px]">
            <img
              key={image.url}
              src={image.url}
              alt={image.alt}
              className="h-full w-full object-cover"
              onError={() => setFailedImageUrl(image.url)}
            />
          </div>
        ) : null}
        <div className={hasImage ? "flex flex-col justify-center px-6 py-12 md:px-12 lg:px-16" : "max-w-5xl"}>
          <div className="flex flex-wrap items-center gap-3 font-display text-[11px] font-bold uppercase tracking-[0.1em]">
            <span className="bg-primary px-3 py-2 text-white">Lead story</span>
            <span className="border border-atf-gray-200 px-3 py-2 text-atf-ink">{article.category}</span>
          </div>
          <h1
            id="lead-story-title"
            className={`mt-7 break-words font-display text-4xl font-black leading-[1.06] text-atf-black md:text-6xl${hasImage ? " lg:text-3xl" : ""}`}
          >
            {article.title}
          </h1>
          <p className={`mt-6 max-w-2xl text-lg leading-8 text-atf-gray-500${hasImage ? " lg:text-base lg:leading-7" : ""}`}>
            {article.excerpt}
          </p>
          <OpportunityButton href={`/news/${article.slug}`} size="lg" className="mt-9 self-start">
            Read the story <ArrowRight className="size-4" aria-hidden="true" />
          </OpportunityButton>
          <p className="mt-8 font-display text-xs font-bold uppercase tracking-[0.1em] text-atf-gray-500">
            {formatPublishedDate(article.publishedAt)}
          </p>
        </div>
      </div>
    </section>
  );
}
