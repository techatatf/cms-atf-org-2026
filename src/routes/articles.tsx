import { createFileRoute } from "@tanstack/react-router";
import { Calendar, User } from "lucide-react";

import { ArticleCard, ContentBand, SubpageTemplate } from "@/components/site/Page";
import { articles } from "@/lib/site-data";
import { homeCrumb, publicationsCrumb } from "@/components/site/SubpageBreadcrumb";

export const Route = createFileRoute("/articles")({
  component: ArticlesPage,
});

function ArticlesPage() {
  return (
    <SubpageTemplate
      muted
      hero={{
        breadcrumb: [homeCrumb, publicationsCrumb, { label: "Articles" }],
        title: "Articles",
        description:
          "Insights, analysis, and thought leadership from ATF's network of technology experts, researchers, and innovators.",
      }}
    >
      <ContentBand>
        <div className="grid gap-4">
          {articles.map((article) => (
            <ArticleCard
              key={article.title}
              eyebrow={article.category}
              title={article.title}
              description={article.excerpt}
            >
              <div className="mt-5 flex flex-wrap gap-4 text-sm text-atf-gray-500">
                <span className="inline-flex items-center gap-2">
                  <User className="size-4 text-primary" aria-hidden="true" />
                  {article.author}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Calendar className="size-4 text-primary" aria-hidden="true" />
                  {article.date}
                </span>
              </div>
            </ArticleCard>
          ))}
        </div>
      </ContentBand>
    </SubpageTemplate>
  );
}
