import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import {
  ArrowLink,
  CalloutBox,
  FactGrid,
} from "@/components/site/ContentBlocks";
import { OpportunityButton } from "@/components/site/OpportunityButton";
import { ContentBand, SectionHeader, SubpageTemplate } from "@/components/site/Page";
import { SectionSubnav, sectionAnchorStyle } from "@/components/site/SectionSubnav";
import { boardMembers } from "@/lib/who-we-are-data";
import { homeCrumb, whoWeAreCrumb } from "@/components/site/SubpageBreadcrumb";

export const Route = createFileRoute("/governance")({
  component: GovernancePage,
});

const subnav = [
  { id: "board", label: "Board" },
  { id: "structure", label: "Structure" },
  { id: "reports", label: "Annual Reports" },
] as const;

const structure = [
  { label: "Registered in", value: "Ghana" },
  { label: "Countries of operation", value: "Ghana, Nigeria, Kenya, South Africa" },
  { label: "Governed by", value: "Board of Directors" },
  { label: "Established", value: "1988" },
] as const;

function GovernancePage() {
  return (
    <SubpageTemplate
      hero={{
        breadcrumb: [homeCrumb, whoWeAreCrumb, { label: "Governance" }],
        title: "How ATF is governed.",
        titleAccent: "governed",
        description:
          "ATF is registered in Ghana and governed by a Board of Directors. Its members serve without pay.",
      }}
    >
      <SectionSubnav items={subnav} />

      <ContentBand id="board" style={sectionAnchorStyle}>
        <SectionHeader
          eyebrow="Board of Directors"
          title="Board of Directors."
          body="Two members of the board co-founded ATF in 1988."
        />
        <ul className="grid gap-px border border-atf-gray-200 bg-atf-gray-200 sm:grid-cols-2 lg:grid-cols-4">
          {boardMembers.map((member) => (
            <li key={member.slug} className="bg-white p-6">
              <strong className="block font-display text-lg font-black uppercase leading-tight text-atf-black">
                {member.name}
              </strong>
              <span className="mt-2 block text-sm text-atf-gray-500">{member.role}</span>
            </li>
          ))}
        </ul>
        <div className="mt-9">
          <ArrowLink href="/team#board">Board profiles</ArrowLink>
        </div>
      </ContentBand>

      <ContentBand id="structure" muted style={sectionAnchorStyle}>
        <SectionHeader
          eyebrow="Structure"
          title="One organisation, four countries."
          body="ATF operates as a single organisation, with country leads running programmes locally."
        />
        <FactGrid facts={structure} />
      </ContentBand>

      <ContentBand id="reports" style={sectionAnchorStyle}>
        <CalloutBox
          title="Annual reports and financial statements"
          body="Reports are published once the Board approves them. See them all on the Annual Reports page."
          action={
            <OpportunityButton href="/annual-reports" variant="outline">
              Annual Reports
              <ArrowRight className="size-4" aria-hidden="true" />
            </OpportunityButton>
          }
        />
      </ContentBand>
    </SubpageTemplate>
  );
}
