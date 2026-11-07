import { createFileRoute } from "@tanstack/react-router";
import { Building2, Lightbulb, Users } from "lucide-react";

import {
  ActionCard,
  ContentBand,
  EmptyState,
  StatGrid,
  SubpageTemplate,
} from "@/components/site/Page";
import { countryData } from "@/lib/site-data";
import { homeCrumb, whereWeWorkCrumb } from "@/components/site/SubpageBreadcrumb";

export const Route = createFileRoute("/countries/$country")({
  component: CountryPage,
});

function CountryPage() {
  const { country } = Route.useParams();
  const data = countryData[country as keyof typeof countryData];

  if (!data) {
    return (
      <EmptyState
        title="Country Not Found"
        description="ATF does not have a public country profile for this route yet."
      />
    );
  }

  return (
    <SubpageTemplate
      muted
      hero={{
        breadcrumb: [homeCrumb, whereWeWorkCrumb, { label: data.name }],
        title: `ATF ${data.name}`,
        description: (
          <>
            Headquarters: {data.capital}. {data.description}
          </>
        ),
      }}
    >
      <ContentBand>
        <StatGrid stats={data.stats} />
      </ContentBand>
      <ContentBand muted>
        <div className="grid gap-6 md:grid-cols-3">
          <ActionCard
            icon={Users}
            title="Community"
            description={`ATF ${data.name} convenes local technologists, students, and practitioners through chapter programming.`}
          />
          <ActionCard
            icon={Building2}
            title="Partners"
            description="Local institutions, employers, and public-sector partners help connect programs to real operating needs."
          />
          <ActionCard
            icon={Lightbulb}
            title="Innovation"
            description="Challenge teams and chapter members build practical solutions for local development priorities."
          />
        </div>
      </ContentBand>
    </SubpageTemplate>
  );
}
