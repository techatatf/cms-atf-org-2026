import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { NewsArticlePage } from "@/components/site/NewsArticlePage";
import { OpportunityButton } from "@/components/site/OpportunityButton";
import { EmptyState } from "@/components/site/Page";
import {
  getPublishedNewsArticle,
  type NewsArticle,
} from "@/services/news";

export const Route = createFileRoute("/news_/$slug")({
  component: NewsArticleRoute,
});

type ArticleState =
  | { status: "loading" }
  | { status: "success"; article: NewsArticle }
  | { status: "not-found" }
  | { status: "error" };

function NewsArticleRoute() {
  const { slug } = Route.useParams();
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<ArticleState>({ status: "loading" });

  useEffect(() => {
    let isCurrentRequest = true;
    setState({ status: "loading" });

    getPublishedNewsArticle(slug)
      .then((article) => {
        if (!isCurrentRequest) return;
        setState(
          article
            ? { status: "success", article }
            : { status: "not-found" },
        );
      })
      .catch(() => {
        if (isCurrentRequest) {
          setState({ status: "error" });
        }
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [attempt, slug]);

  if (state.status === "loading") {
    return <ArticleLoading />;
  }

  if (state.status === "not-found") {
    return (
      <EmptyState
        title="Article not found."
        description="No published News Article uses this Public News Slug."
        href="/news"
        action="Back to News"
      />
    );
  }

  if (state.status === "error") {
    return (
      <ArticleUnavailable onRetry={() => setAttempt((value) => value + 1)} />
    );
  }

  return <NewsArticlePage article={state.article} />;
}

function ArticleLoading() {
  return (
    <section className="bg-white" aria-label="News Article">
      <div className="atf-container flex min-h-[50vh] items-center justify-center py-16">
        <p
          role="status"
          className="font-display text-sm font-bold uppercase text-atf-gray-500"
        >
          Loading News Article...
        </p>
      </div>
    </section>
  );
}

function ArticleUnavailable({ onRetry }: { onRetry: () => void }) {
  return (
    <section className="bg-white" aria-labelledby="news-unavailable-title">
      <div className="atf-container flex min-h-[50vh] items-center justify-center py-16">
        <div className="max-w-xl text-center">
          <h1
            id="news-unavailable-title"
            className="font-display text-4xl font-black uppercase text-atf-black"
          >
            News temporarily unavailable
          </h1>
          <p className="mt-4 text-atf-gray-500">
            The Backend CMS did not return this News Article.
          </p>
          <OpportunityButton className="mt-8" onClick={onRetry}>
            Retry
          </OpportunityButton>
        </div>
      </div>
    </section>
  );
}
