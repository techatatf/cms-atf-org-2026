import { createFileRoute } from "@tanstack/react-router";
import { Award, Calendar, Lightbulb } from "lucide-react";

import { OpportunityButton } from "@/components/site/OpportunityButton";
import {
  ActionCard,
  ContentBand,
  SubpageTemplate,
  SurfaceCard,
} from "@/components/site/Page";
import { homeCrumb, whatWeDoCrumb } from "@/components/site/SubpageBreadcrumb";

export const Route = createFileRoute("/challenge")({
  component: ChallengePage,
});

const timeline = [
  { phase: "Applications Open", date: "May 1, 2026" },
  { phase: "Application Deadline", date: "June 30, 2026" },
  { phase: "Build Weekends", date: "July-August 2026" },
  { phase: "Winners Announced", date: "September 2026" },
];

function ChallengePage() {
  return (
    <SubpageTemplate
      hero={{
        breadcrumb: [homeCrumb, whatWeDoCrumb, { label: "ATF Challenge" }],
        title: "Learn AI. Build for a real problem.",
        titleAccent: "real",
        description:
          "The ATF AI Challenge trains university students in applied AI, then sets them real problems from hospitals and companies to build against. It started in Ghana in 2023. With support from Google.org, it is scaling to Ghana, Nigeria, Kenya, and South Africa.",
        meta: [
          { label: "First Challenge", value: "2023" },
          { label: "Students, 2024", value: "450" },
          { label: "Universities, 2024", value: "23" },
          { label: "MVPs built, 2024", value: "22" },
        ],
      }}
    >
      <section className="grid bg-primary text-white lg:grid-cols-2">
        <div className="flex flex-col justify-center px-6 py-16 md:px-10 lg:px-20">
          <h2 className="font-display text-4xl font-black uppercase leading-tight md:text-6xl">
            Don't just watch the AI revolution, build it.
          </h2>
          <p className="mt-6 max-w-xl text-base leading-8 text-white/80">
            Participants receive AI training, mentor review, and a structured
            path to build real-world solutions in healthcare, agriculture,
            education, climate, and financial inclusion.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <OpportunityButton
              href="https://bit.ly/atf-wf"
              variant="inverse"
              size="lg"
              target="_blank"
              rel="noreferrer"
            >
              Apply Now
            </OpportunityButton>
          </div>
        </div>
        <div className="relative min-h-[360px] bg-atf-black">
          <img
            src="/atf-assets/v2/billboard-1.jpg"
            alt="ATF AI Challenge billboard"
            className="absolute inset-0 size-full object-cover opacity-80"
          />
        </div>
      </section>
      <ContentBand muted>
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1fr]">
          <div>
            <h2 className="atf-section-title">2026 challenge timeline.</h2>
            <p className="atf-body mt-6">
              The current application window is open through June 30, 2026,
              followed by chapter-hosted build weekends and mentor review.
            </p>
          </div>
          <SurfaceCard hover={false}>
            <h3 className="flex items-center gap-2 font-display text-xl font-black uppercase text-atf-black">
              <Calendar className="size-5 text-primary" aria-hidden="true" />
              Key Dates
            </h3>
            <ol className="mt-6 grid gap-5">
              {timeline.map((item) => (
                <li
                  key={item.phase}
                  className="grid grid-cols-[10px_1fr] gap-4"
                >
                  <span className="mt-2 h-0 w-0 border-y-[5px] border-l-[8px] border-y-transparent border-l-primary" />
                  <span>
                    <span className="block font-display text-sm font-bold uppercase text-atf-black">
                      {item.phase}
                    </span>
                    <span className="text-sm text-atf-gray-500">
                      {item.date}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </SurfaceCard>
        </div>
      </ContentBand>
      <ContentBand>
        <div className="grid gap-6 md:grid-cols-2">
          <ActionCard
            icon={Award}
            title="Prizes & Recognition"
            description="Selected teams receive recognition, mentorship, partner introductions, and pathways to scale promising solutions."
          />
          <ActionCard
            icon={Lightbulb}
            title="Focus Areas"
            description="The challenge centers practical technology ideas across healthcare, agriculture, education, climate, and financial inclusion."
          />
        </div>
      </ContentBand>
    </SubpageTemplate>
  );
}
