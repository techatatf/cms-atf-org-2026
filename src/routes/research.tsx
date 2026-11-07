import { createFileRoute } from "@tanstack/react-router";
import { Download, ExternalLink } from "lucide-react";

import {
  ContentBand,
  IconButton,
  SubpageTemplate,
  SurfaceCard,
} from "@/components/site/Page";
import { researchPapers } from "@/lib/site-data";
import { homeCrumb, publicationsCrumb } from "@/components/site/SubpageBreadcrumb";

export const Route = createFileRoute("/research")({
  component: ResearchPage,
});

function ResearchPage() {
  return (
    <SubpageTemplate
      muted
      hero={{
        breadcrumb: [homeCrumb, publicationsCrumb, { label: "Research Papers" }],
        title: "Research Papers",
        description:
          "In-depth research and analysis on technology trends, opportunities, and challenges across the African continent.",
      }}
    >
      <ContentBand>
        <div className="grid gap-4">
          {researchPapers.map((paper) => (
            <SurfaceCard
              key={paper.title}
              className="flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between"
              hover={false}
            >
              <div>
                <p className="font-display text-xs font-bold uppercase text-primary">
                  {paper.type}
                </p>
                <h2 className="mt-3 font-display text-2xl font-black uppercase leading-tight text-atf-black">
                  {paper.title}
                </h2>
                <p className="mt-2 text-sm text-atf-gray-500">
                  {paper.pages} pages - {paper.year}
                </p>
              </div>
              <div className="flex gap-2">
                <IconButton
                  aria-label={`Download ${paper.title}`}
                >
                  <Download className="size-5" aria-hidden="true" />
                </IconButton>
                <IconButton
                  aria-label={`Open ${paper.title}`}
                >
                  <ExternalLink className="size-5" aria-hidden="true" />
                </IconButton>
              </div>
            </SurfaceCard>
          ))}
        </div>
      </ContentBand>
    </SubpageTemplate>
  );
}
