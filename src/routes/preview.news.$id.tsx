import { useLivePreview } from "@payloadcms/live-preview-react";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, type ReactNode } from "react";

import { NewsArticlePage } from "@/components/site/NewsArticlePage";
import { mapLivePreviewNewsArticle } from "@/services/news";

const backendCMSOrigin =
  import.meta.env.VITE_BACKEND_CMS_ORIGIN || "http://localhost:3001";

export const Route = createFileRoute("/preview/news/$id")({
  component: NewsArticlePreviewRoute,
});

function NewsArticlePreviewRoute() {
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
      <PreviewDocument>
        <section className="bg-white" aria-labelledby="preview-waiting-title">
          <div className="atf-container flex min-h-[50vh] items-center justify-center py-16">
            <div className="max-w-xl text-center">
              <h1
                id="preview-waiting-title"
                className="font-display text-4xl font-black uppercase text-atf-black"
              >
                Waiting for News Article preview
              </h1>
              <p className="mt-4 text-atf-gray-500">
                Keep this window connected to the Payload Live Preview panel.
              </p>
            </div>
          </div>
        </section>
      </PreviewDocument>
    );
  }

  return (
    <PreviewDocument>
      <NewsArticlePage article={article} />
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
