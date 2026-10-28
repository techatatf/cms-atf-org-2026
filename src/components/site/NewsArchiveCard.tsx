import { ArrowRight } from "lucide-react";

import { AppLink } from "@/components/site/AppLink";
import { formatPublishedDate } from "@/lib/format-published-date";
import type { NewsArticle } from "@/services/news";

export function NewsArchiveCard({ article }: { article: NewsArticle }) {
  return (
    <AppLink href={`/news/${article.slug}`} className="group block h-full border-t-2 border-atf-ink pt-5 no-underline transition-colors hover:border-primary">
      <article>
        <p className="font-display text-[11px] font-bold uppercase tracking-widest text-atf-gray-500">
          {article.category} · {formatPublishedDate(article.publishedAt)}
        </p>
        <h3 className="mt-4 break-words font-display text-xl font-black leading-tight text-atf-black group-hover:text-primary">
          {article.title}
        </h3>
        <p className="mt-3 text-sm leading-6 text-atf-gray-500">{article.excerpt}</p>
        <span className="mt-6 inline-flex items-center gap-3 font-display text-xs font-bold uppercase text-atf-ink group-hover:text-primary">
          Read story <ArrowRight className="size-4 text-primary" aria-hidden="true" />
        </span>
      </article>
    </AppLink>
  );
}
