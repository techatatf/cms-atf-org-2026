import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { NewsArchiveCard } from "@/components/site/NewsArchiveCard";
import { NewsroomLeadStory } from "@/components/site/NewsroomLeadStory";
import { SubpageBreadcrumb, newsroomBreadcrumb } from "@/components/site/SubpageBreadcrumb";
import { ContentBand, FilterChip } from "@/components/site/Page";
import { getPublishedNewsLead, getPublishedNewsPage, NEWS_CATEGORIES, type NewsArticle, type NewsCategory } from "@/services/news";

export const Route = createFileRoute("/news")({ component: NewsPage });
const categories = ["All", ...NEWS_CATEGORIES] as const;
type LeadState =
  | { status: "loading" }
  | { status: "failed" }
  | { status: "ready"; article: NewsArticle | null };

function NewsPage() {
  const [activeCategory, setActiveCategory] = useState<"All" | NewsCategory>("All");
  const [leadState, setLeadState] = useState<LeadState>({ status: "loading" });
  const [leadRetryKey, setLeadRetryKey] = useState(0);
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [failed, setFailed] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loadMoreState, setLoadMoreState] = useState<"failed" | "idle" | "loading">("idle");
  const [loading, setLoading] = useState(true);
  const [nextPage, setNextPage] = useState(2);
  const [retryKey, setRetryKey] = useState(0);
  const requestVersion = useRef(0);

  useEffect(() => {
    let active = true;
    setLeadState({ status: "loading" });
    void getPublishedNewsLead()
      .then((article) => { if (active) setLeadState({ status: "ready", article }); })
      .catch(() => { if (active) setLeadState({ status: "failed" }); });
    return () => { active = false; };
  }, [leadRetryKey]);

  const leadId = leadState.status === "ready" ? leadState.article?.id : undefined;
  useEffect(() => {
    if (leadState.status !== "ready") return;
    if (!leadState.article) {
      setArticles([]);
      setLoading(false);
      return;
    }

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
      excludeId: leadId,
      limit: 12,
      page: 1,
    })
      .then((result) => {
        if (!active || requestVersion.current !== version) return;
        setArticles(result.articles);
        setHasNextPage(result.hasNextPage);
      })
      .catch(() => { if (active && requestVersion.current === version) setFailed(true); })
      .finally(() => { if (active && requestVersion.current === version) setLoading(false); });

    return () => {
      active = false;
      requestVersion.current += 1;
    };
  }, [activeCategory, leadId, leadState.status, retryKey]);

  const loadMore = () => {
    if (loadMoreState === "loading" || !leadId) return;
    const version = requestVersion.current;
    const requestedPage = nextPage;
    setLoadMoreState("loading");
    void getPublishedNewsPage({
      category: activeCategory === "All" ? undefined : activeCategory,
      excludeId: leadId,
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
      .catch(() => { if (requestVersion.current === version) setLoadMoreState("failed"); });
  };

  const lead = leadState.status === "ready" ? leadState.article : null;

  return (
    <>
      <SubpageBreadcrumb entries={newsroomBreadcrumb} />
      {leadState.status === "loading" ? (
        <section className="atf-container py-20" aria-label="Newsroom">
          <p role="status" className="text-atf-gray-500">Loading news...</p>
        </section>
      ) : null}
      {leadState.status === "failed" ? (
        <section className="atf-container py-20" aria-label="Newsroom">
          <h1 className="font-display text-3xl font-black text-atf-black">News temporarily unavailable</h1>
          <button type="button" className="atf-link mt-4" onClick={() => setLeadRetryKey((value) => value + 1)}>Retry</button>
        </section>
      ) : null}
      {leadState.status === "ready" && !lead ? (
        <section className="atf-container py-20" aria-label="Newsroom">
          <h1 className="font-display text-4xl font-black text-atf-black">Newsroom</h1>
          <p className="mt-6 text-atf-gray-500">No news published yet.</p>
        </section>
      ) : null}
      {lead ? (
        <>
          <NewsroomLeadStory article={lead} />
          <ContentBand aria-label="News Archive">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
              <div>
                <p className="font-display text-xs font-bold uppercase tracking-widest text-primary">Newsroom</p>
                <h2 className="mt-2 font-display text-3xl font-black text-atf-black">News Archive</h2>
              </div>
              <div className="flex flex-wrap gap-2" aria-label="Filter news articles">
                {categories.map((category) => (
                  <FilterChip key={category} active={activeCategory === category} onClick={() => {
                    if (category === activeCategory) return;
                    requestVersion.current += 1;
                    setArticles([]);
                    setLoading(true);
                    setActiveCategory(category);
                  }}>{category}</FilterChip>
                ))}
              </div>
            </div>
            {loading ? <p className="py-10 text-sm text-atf-gray-500" role="status">Loading news...</p> : null}
            {!loading && failed ? (
              <div className="border border-atf-gray-200 bg-atf-gray-50 p-6">
                <h3 className="font-display text-xl font-black uppercase text-atf-black">News Archive temporarily unavailable</h3>
                <button className="atf-link mt-4" onClick={() => setRetryKey((value) => value + 1)} type="button">Retry</button>
              </div>
            ) : null}
            {!loading && !failed ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {articles.map((article) => (
                  <NewsArchiveCard key={article.id} article={article} />
                ))}
              </div>
            ) : null}
            {!loading && !failed && articles.length === 0 ? (
              <p className="py-8 text-sm text-atf-gray-500">
                {activeCategory === "All" ? "No other news published yet." : "No updates in this category yet."}
              </p>
            ) : null}
            {!loading && !failed && hasNextPage && loadMoreState === "idle" ? (
              <button className="atf-link mt-8" onClick={loadMore} type="button">Load more</button>
            ) : null}
            {!loading && !failed && loadMoreState === "loading" ? (
              <p className="mt-8 text-sm text-atf-gray-500" role="status">Loading more news...</p>
            ) : null}
            {!loading && !failed && loadMoreState === "failed" ? (
              <div className="mt-8 border border-atf-gray-200 bg-atf-gray-50 p-4">
                <p className="text-sm text-atf-gray-500">More news temporarily unavailable.</p>
                <button className="atf-link mt-3" onClick={loadMore} type="button">Retry</button>
              </div>
            ) : null}
          </ContentBand>
        </>
      ) : null}
    </>
  );
}
