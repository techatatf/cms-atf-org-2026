import { createFileRoute } from "@tanstack/react-router";
import { Building, Globe, MapPin, Users } from "lucide-react";

import { AppLink } from "@/components/site/AppLink";
import { OpportunityButton } from "@/components/site/OpportunityButton";
import {
  ActionCard,
  ContentBand,
  SubpageTemplate,
} from "@/components/site/Page";
import { chapters } from "@/lib/site-data";

export const Route = createFileRoute("/chapters")({
  component: ChaptersPage,
});

function ChaptersPage() {
  return (
    <SubpageTemplate
      muted
      hero={{
        eyebrow: "Where We Work",
        title: "ATF Chapters",
        icon: MapPin,
        description:
          "A growing network of chapters across Africa fostering local technology communities, capacity building, and professional development.",
      }}
    >
      <ContentBand>
        <div className="grid gap-px bg-atf-gray-200 md:grid-cols-2 lg:grid-cols-4">
          {chapters.map((chapter) => (
            <AppLink
              key={chapter.slug}
              href={`/countries/${chapter.slug}`}
              className="group bg-white p-7 transition-colors hover:bg-atf-gray-50"
            >
              <div aria-hidden="true">
                <img
                  src={`/country-flags/${chapter.flag}.png`}
                  alt=""
                  className="size-12 object-contain"
                />
              </div>
              <h2 className="mt-6 font-display text-xl font-black uppercase text-atf-black">
                {chapter.country}
              </h2>
              <p className="mt-1 font-display text-xs font-bold uppercase text-primary">
                {chapter.count} Chapters
              </p>
              <p className="mt-4 text-sm leading-7 text-atf-gray-500">
                {chapter.description}
              </p>
            </AppLink>
          ))}
        </div>
      </ContentBand>
      <ContentBand muted>
        <div className="grid gap-6 md:grid-cols-3">
          <ActionCard
            icon={Users}
            title="Community Building"
            description="Regular meetups, peer groups, and networking events for technologists and students."
          />
          <ActionCard
            icon={Building}
            title="Workshops"
            description="Hands-on technical training sessions delivered with local partners and mentors."
          />
          <ActionCard
            icon={Globe}
            title="Mentorship"
            description="Connections with industry experts and ATF contributors across the continent and diaspora."
          />
        </div>
      </ContentBand>
      <ContentBand dark>
        <div className="grid gap-8 lg:grid-cols-[1fr_0.5fr] lg:items-center">
          <div>
            <h2 className="atf-section-title text-white">
              Start a chapter in your community.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/60">
              ATF is expanding its chapter network with organizers who can host
              practical technical programming and connect local builders to a
              broader pan-African network.
            </p>
          </div>
          <OpportunityButton
            href="mailto:info@atfglobal.org"
            className="justify-self-start lg:justify-self-end"
          >
            Apply to Start a Chapter
          </OpportunityButton>
        </div>
      </ContentBand>
    </SubpageTemplate>
  );
}
