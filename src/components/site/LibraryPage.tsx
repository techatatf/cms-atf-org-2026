import { BookOpen, FileText, Library as LibraryIcon, Newspaper } from "lucide-react";

import { AppLink } from "@/components/site/AppLink";
import { ContentBand, SubpageTemplate, SurfaceCard } from "@/components/site/Page";
import { publicationCategories } from "@/lib/site-data";
import { homeCrumb, publicationsCrumb } from "@/components/site/SubpageBreadcrumb";

const icons = {
  Articles: Newspaper,
  "Research Papers": BookOpen,
  Reports: FileText,
  "Case Studies": LibraryIcon,
} as const;

export function LibraryPage() {
  return (
    <SubpageTemplate
      muted
      hero={{
        breadcrumb: [homeCrumb, publicationsCrumb, { label: "Library" }],
        title: "Library",
        description:
          "Explore ATF's library of thought leadership articles, research papers, reports, and implementation case studies.",
      }}
    >
      <ContentBand>
        <div className="grid gap-6 md:grid-cols-2">
          {publicationCategories.map((category) => {
            const Icon = icons[category.title];
            const card = (
              <SurfaceCard
                key={category.title}
                className="p-6"
              >
                <div className="mb-5 inline-flex size-12 items-center justify-center bg-primary/10 text-primary">
                  <Icon className="size-6" aria-hidden="true" />
                </div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-display text-xl font-black uppercase text-atf-black">
                      {category.title}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-atf-gray-500">
                      {category.description}
                    </p>
                  </div>
                  <span className="bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
                    {category.count}
                  </span>
                </div>
              </SurfaceCard>
            );

            if (!("href" in category)) return card;

            return (
              <AppLink key={category.title} href={category.href} className="block h-full">
                {card}
              </AppLink>
            );
          })}
        </div>
      </ContentBand>
    </SubpageTemplate>
  );
}
