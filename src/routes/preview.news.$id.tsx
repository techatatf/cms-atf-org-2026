import { useLivePreview } from "@payloadcms/live-preview-react";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, type ReactNode } from "react";

import { NewsArticlePage } from "@/components/site/NewsArticlePage";
import { SubpageBreadcrumb, newsArticleBreadcrumb } from "@/components/site/SubpageBreadcrumb";
import { BACKEND_CMS_ORIGIN } from "@/lib/backend-cms-origin";
import { mapLivePreviewNewsArticle } from "@/services/news";

export const Route = createFileRoute("/preview/news/$id")({
  component: NewsArticlePreviewRoute,
});

function NewsArticlePreviewRoute() {
  if (!BACKEND_CMS_ORIGIN) {
    return (
      <PreviewMessage title="News Article preview unavailable">
        This Public Site build has no Backend CMS origin configured.
      </PreviewMessage>
    );
  }

  return <ConnectedNewsArticlePreview backendCMSOrigin={BACKEND_CMS_ORIGIN} />;
}

function ConnectedNewsArticlePreview({ backendCMSOrigin }: { backendCMSOrigin: string }) {
  const { id } = Route.useParams();
  const initialData = useMemo(() => ({ id }), [id]);
  const { data, isLoading } = useLivePreview<Record<string, unknown>>({
    depth: 1,
    initialData,
    serverURL: backendCMSOrigin,
  });
  const article = mapLivePreviewNewsArticle(data);

  if (isLoading || !article) {
    return (
      <PreviewMessage title="Waiting for News Article preview">
        Keep this window connected to the Payload Live Preview panel.
      </PreviewMessage>
    );
  }

  return (
    <PreviewDocument>
      <NewsArticlePage article={article} />
    </PreviewDocument>
  );
}

function PreviewMessage({ children, title }: { children: ReactNode; title: string }) {
  return (
    <PreviewDocument>
      <SubpageBreadcrumb entries={newsArticleBreadcrumb()} />
      <section className="bg-white" aria-labelledby="preview-message-title">
        <div className="atf-container flex min-h-[50vh] items-center justify-center py-16">
          <div className="max-w-xl text-center">
            <h1
              id="preview-message-title"
              className="font-display text-4xl font-black uppercase text-atf-black"
            >
              {title}
            </h1>
            <p className="mt-4 text-atf-gray-500">{children}</p>
          </div>
        </div>
      </section>
    </PreviewDocument>
  );
}

function PreviewDocument({ children }: { children: ReactNode }) {
  return (
    <>
      <meta name="robots" content="noindex, nofollow" />
      {children}
    </>
  );
}
