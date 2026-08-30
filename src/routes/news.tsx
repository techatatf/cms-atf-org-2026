import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Newspaper } from "lucide-react";

import {
  ArticleCard,
  ContentBand,
  FilterChip,
  SubpageTemplate,
} from "@/components/site/Page";
import { formatPublishedDate } from "@/lib/format-published-date";
import {
  getPublishedNewsPage,
  NEWS_CATEGORIES,
  type NewsArticle,
  type NewsCategory,
} from "@/services/news";

export const Route = createFileRoute("/news")({
  component: NewsPage,
});

const categories = ["All", ...NEWS_CATEGORIES] as const;

function NewsPage() {
  const [activeCategory, setActiveCategory] = useState<"All" | NewsCategory>(
    "All",
  );
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [failed, setFailed] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loadMoreState, setLoadMoreState] = useState<
    "failed" | "idle" | "loading"
  >("idle");
  const [loading, setLoading] = useState(true);
  const [nextPage, setNextPage] = useState(2);
  const [retryKey, setRetryKey] = useState(0);
  const requestVersion = useRef(0);

  useEffect(() => {
    const version = ++requestVersion.current;
    let active = true;

    setArticles([]);
    setFailed(false);
    setHasNextPage(false);
    setLoadMoreState("idle");
    setLoading(true);
    setNextPage(2);
    void getPublishedNewsPage({
      category: activeCategory === "All" ? undefined : activeCategory,
      limit: 12,
      page: 1,
    })
      .then((result) => {
        if (!active || requestVersion.current !== version) return;
        setArticles(result.articles);
        setHasNextPage(result.hasNextPage);
      })
      .catch(() => {
        if (active && requestVersion.current === version) setFailed(true);
      })
      .finally(() => {
        if (active && requestVersion.current === version) setLoading(false);
      });

    return () => {
      active = false;
      requestVersion.current += 1;
    };
  }, [activeCategory, retryKey]);

  const loadMore = () => {
    if (loadMoreState === "loading") return;

    const version = requestVersion.current;
    const requestedPage = nextPage;
    setLoadMoreState("loading");
    void getPublishedNewsPage({
      category: activeCategory === "All" ? undefined : activeCategory,
      limit: 12,
      page: requestedPage,
    })
      .then((result) => {
        if (requestVersion.current !== version) return;
        setArticles((current) => [...current, ...result.articles]);
        setHasNextPage(result.hasNextPage);
        setNextPage(requestedPage + 1);
        setLoadMoreState("idle");
      })
      .catch(() => {
        if (requestVersion.current === version) setLoadMoreState("failed");
      });
  };

  return (
    <SubpageTemplate
      hero={{
        eyebrow: "Newsroom",
        title: "News & Updates",
        icon: Newspaper,
        description:
          "Stay updated with ATF announcements, events, partnerships, research, chapter activity, and impact stories.",
      }}
    >
      <ContentBand>
        <div
          className="mb-8 flex flex-wrap gap-2"
          aria-label="Filter news articles"
        >
          {categories.map((category) => (
            <FilterChip
              key={category}
              active={activeCategory === category}
              onClick={() => {
                if (category === activeCategory) return;
                requestVersion.current += 1;
                setActiveCategory(category);
              }}
            >
              {category}
            </FilterChip>
          ))}
        </div>

        {loading ? (
          <p className="py-10 text-sm text-atf-gray-500" role="status">
            Loading news...
          </p>
        ) : null}

        {!loading && failed ? (
          <div className="border border-atf-gray-200 bg-atf-gray-50 p-6">
            <h2 className="font-display text-xl font-black uppercase text-atf-black">
              News temporarily unavailable
            </h2>
            <button
              className="atf-link mt-4"
              onClick={() => setRetryKey((value) => value + 1)}
              type="button"
            >
              Retry
            </button>
          </div>
        ) : null}

        {!loading && !failed ? (
          <div className="grid gap-6 md:grid-cols-2">
            {articles.map((article) => (
              <ArticleCard
                key={article.id}
                href={`/news/${article.slug}`}
                eyebrow={`${article.category} - ${formatPublishedDate(article.publishedAt)}`}
                title={article.title}
                description={article.excerpt}
              >
                <span className="mt-6 inline-flex items-center gap-2 font-display text-xs font-bold uppercase text-atf-ink group-hover:text-primary">
                  Read more
                  <ArrowRight
                    className="size-4 transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </span>
              </ArticleCard>
            ))}
          </div>
        ) : null}

        {!loading && !failed && articles.length === 0 ? (
          <p className="py-8 text-sm text-atf-gray-500">
            {activeCategory === "All"
              ? "No news published yet."
              : "No updates in this category yet."}
          </p>
        ) : null}

        {!loading && !failed && hasNextPage && loadMoreState === "idle" ? (
          <button className="atf-link mt-8" onClick={loadMore} type="button">
            Load more
          </button>
        ) : null}

        {!loading && !failed && loadMoreState === "loading" ? (
          <p className="mt-8 text-sm text-atf-gray-500" role="status">
            Loading more news...
          </p>
        ) : null}

        {!loading && !failed && loadMoreState === "failed" ? (
          <div className="mt-8 border border-atf-gray-200 bg-atf-gray-50 p-4">
            <p className="text-sm text-atf-gray-500">
              More news temporarily unavailable.
            </p>
            <button className="atf-link mt-3" onClick={loadMore} type="button">
              Retry
            </button>
          </div>
        ) : null}
      </ContentBand>
    </SubpageTemplate>
  );
}
