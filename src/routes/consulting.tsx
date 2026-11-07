import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, CheckCircle, Target, Users } from "lucide-react";

import { OpportunityButton } from "@/components/site/OpportunityButton";
import {
  ActionCard,
  ContentBand,
  SubpageTemplate,
  SurfaceCard,
} from "@/components/site/Page";
import { homeCrumb, whatWeDoCrumb } from "@/components/site/SubpageBreadcrumb";

export const Route = createFileRoute("/consulting")({
  component: ConsultingPage,
});

const services = [
  "Digital transformation strategy",
  "Technology assessment and advisory",
  "Capacity building programs",
  "Innovation ecosystem development",
];

function ConsultingPage() {
  return (
    <SubpageTemplate
      muted
      hero={{
        breadcrumb: [homeCrumb, whatWeDoCrumb, { label: "ATF Consulting" }],
        title: "The ATF network, on your problem.",
        titleAccent: "on your problem",
        description:
          "ATF Consulting puts the professional expertise of the ATF network to work for African institutions — in whichever field of science and technology the problem sits. It began in the early 2000s, when ATF's founding generation, by then senior in companies, universities, and institutions across Africa and the diaspora, started taking on projects together.",
        meta: [
          { label: "Practice since", value: "Early 2000s" },
          { label: "Draws on", value: "A network built since 1988" },
          { label: "Works with", value: "Governments, institutions, companies" },
        ],
      }}
    >
      <ContentBand>
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1fr]">
          <div>
            <h2 className="atf-section-title">Advisory that moves into implementation.</h2>
            <p className="atf-body mt-6">
              ATF consulting engagements combine continental context, technical
              fluency, and a network of practitioners who can support delivery
              beyond the strategy document.
            </p>
            <OpportunityButton href="mailto:info@atfglobal.org" className="mt-8">
              Start a partnership inquiry
              <ArrowRight className="size-4" aria-hidden="true" />
            </OpportunityButton>
          </div>
          <SurfaceCard hover={false}>
            <h3 className="font-display text-xl font-black uppercase text-atf-black">
              Core Services
            </h3>
            <ul className="mt-6 grid gap-4">
              {services.map((service) => (
                <li key={service} className="flex items-start gap-3 text-atf-ink">
                  <CheckCircle className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                  <span>{service}</span>
                </li>
              ))}
            </ul>
          </SurfaceCard>
        </div>
      </ContentBand>
      <ContentBand muted>
        <div className="grid gap-6 md:grid-cols-2">
          <ActionCard
            icon={Users}
            title="Expert Team"
            description="Consultants and contributors bring decades of experience in African technology development, program design, and public-sector delivery."
          />
          <ActionCard
            icon={Target}
            title="Tailored Solutions"
            description="Every engagement is shaped around the organization's context, constraints, local partners, and long-term operating capacity."
          />
        </div>
      </ContentBand>
    </SubpageTemplate>
  );
}
