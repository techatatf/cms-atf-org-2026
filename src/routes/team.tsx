import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { AppLink } from "@/components/site/AppLink";
import {
  PeopleMasthead,
  PersonCardGrid,
  useProfileViewer,
} from "@/components/site/PeopleDirectory";
import { ContentBand, Eyebrow, SubpageTemplate } from "@/components/site/Page";
import { sectionAnchorStyle } from "@/components/site/SectionSubnav";
import { boardMembers, challengeTeam, teamGroups } from "@/lib/who-we-are-data";
import { homeCrumb, whoWeAreCrumb } from "@/components/site/SubpageBreadcrumb";

export const Route = createFileRoute("/team")({
  component: TeamPage,
});

const boardProfiles = boardMembers.map((person) => ({ ...person, team: "Board of Directors" }));

const involvement = [
  { title: "Mentor, judge, or support a chapter", meta: "Six ways to volunteer with ATF", href: "/careers#ways" },
  { title: "Open roles", meta: "Paid positions, when they open", href: "/careers#roles" },
  { title: "Sign up to volunteer", meta: "Two-minute form", href: "/careers#join" },
] as const;

function TeamPage() {
  const profiles = useProfileViewer();

  return (
    <SubpageTemplate
      hero={{
        breadcrumb: [homeCrumb, whoWeAreCrumb, { label: "Team" }],
        title: "The people behind the forum.",
        titleAccent: "the forum",
        description:
          "A volunteer board, including two of ATF's co-founders, provides oversight. A team in Ghana, Nigeria, Kenya, and South Africa delivers the ATF AI Challenge.",
      }}
    >
      <ContentBand id="board" style={sectionAnchorStyle}>
        <div className="mb-10 flex flex-wrap items-baseline justify-between gap-4">
          <Eyebrow>Board of Directors</Eyebrow>
          <p className="text-sm text-atf-gray-500">
            Two members of the board co-founded ATF at MIT in 1988.
          </p>
        </div>
        <PersonCardGrid
          people={boardMembers}
          onOpen={(index) => profiles.open(boardProfiles, index)}
        />
      </ContentBand>

      <ContentBand id="team" muted style={sectionAnchorStyle}>
        <Eyebrow>ATF AI Challenge Team</Eyebrow>
        <PeopleMasthead
          people={challengeTeam}
          groups={teamGroups}
          onOpen={(visible, index) =>
            profiles.open(
              visible.map((person) => ({ ...person, team: `ATF AI Challenge · ${person.group}` })),
              index,
            )
          }
        />
      </ContentBand>

      <ContentBand id="volunteer" style={sectionAnchorStyle}>
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <Eyebrow>Mentors and Volunteers</Eyebrow>
            <h2 className="atf-section-title">
              <span className="text-primary">120+</span> mentors and experts.
            </h2>
            <p className="atf-body mt-6">
              Mentors and domain experts support every Challenge cohort, in AI and machine
              learning, clinical medicine, agriculture, finance, legal services, and
              entrepreneurship. Like ATF itself, much of this work runs on people giving their
              time.
            </p>
          </div>
          <div>
            <p className="mb-2 font-display text-[11px] font-bold uppercase tracking-[0.08em] text-atf-gray-500">
              Ways to get involved
            </p>
            <ul className="border-t border-atf-gray-200">
              {involvement.map((item) => (
                <li key={item.title} className="border-b border-atf-gray-200">
                  <AppLink
                    href={item.href}
                    className="group flex items-center justify-between gap-4 py-5"
                  >
                    <span>
                      <span className="block font-display text-lg font-black uppercase text-atf-black group-hover:text-primary">
                        {item.title}
                      </span>
                      <span className="mt-1 block text-sm text-atf-gray-500">{item.meta}</span>
                    </span>
                    <ArrowRight className="size-4 shrink-0 text-primary transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </AppLink>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </ContentBand>

      {profiles.dialog}
    </SubpageTemplate>
  );
}
