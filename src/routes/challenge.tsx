import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

import { AppLink } from "@/components/site/AppLink";
import { NumberedCells, StatBand } from "@/components/site/ContentBlocks";
import { OpportunityButton } from "@/components/site/OpportunityButton";
import {
  ContentBand,
  Eyebrow,
  SectionHeader,
  SubpageTemplate,
} from "@/components/site/Page";
import { SectionSubnav, sectionAnchorStyle } from "@/components/site/SectionSubnav";
import { homeCrumb, whatWeDoCrumb } from "@/components/site/SubpageBreadcrumb";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/challenge")({
  component: ChallengePage,
});

const CHALLENGE_SITE = "https://atfchallenge.org";

const subnav = [
  { id: "how", label: "How It Works" },
  { id: "partners", label: "Problem Partners" },
  { id: "growth", label: "Since 2023" },
  { id: "faq", label: "FAQ" },
] as const;

const steps = [
  { title: "Train", body: "Participants learn applied AI: working with data, using models, and turning them into a tool someone can use." },
  { title: "Take a real problem", body: "Partner organisations set problem statements drawn from their own work — a hospital ward, a farm advisory service." },
  { title: "Build in teams", body: "Teams build a minimum viable product against the problem they chose, with input from the partner who set it." },
  { title: "Show the work", body: "Teams present working MVPs. In 2024, 450 students from 23 universities produced 22 of them." },
] as const;

const problemPartners = [
  { tag: "Health", name: "Korle Bu Teaching Hospital", body: "Ghana's national referral and teaching hospital, in Accra." },
  { tag: "Health", name: "37 Military Hospital", body: "A major hospital in Accra serving military and civilian patients." },
  { tag: "Agriculture", name: "Esoko", body: "A Ghanaian company providing information services to farmers." },
] as const;

const stages = [
  { date: "2023", title: "The first AI Challenge", body: "ATF runs its first AI Challenge in Ghana, with sponsorship from OpenAI." },
  { date: "2024", title: "450 students", body: "Students from 23 universities across Ghana take part and build 22 MVPs." },
  { date: "2025", title: "Into Nigeria", body: "The Challenge expands to Nigeria. Korle Bu, 37 Military Hospital, and Esoko set problem statements." },
  { date: "Next", title: "Four countries", body: "With support from Google.org, the Challenge scales to Ghana, Nigeria, Kenya, and South Africa.", now: true },
] as const;

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener" className="text-primary underline underline-offset-2">
      {children}
    </a>
  );
}

const faqs: readonly { question: string; answer: ReactNode }[] = [
  {
    question: "Who can take part?",
    answer: (
      <>
        The Challenge is for university students in the countries where it runs. Eligibility
        rules for each round are published on{" "}
        <ExternalLink href={CHALLENGE_SITE}>atfchallenge.org</ExternalLink>.
      </>
    ),
  },
  {
    question: "Which countries does it run in?",
    answer:
      "Ghana since 2023 and Nigeria since 2025. With support from Google.org, it is scaling to Kenya and South Africa.",
  },
  {
    question: "Who sets the problems?",
    answer:
      "Partner organisations. Korle Bu Teaching Hospital, 37 Military Hospital, and Esoko have all set problem statements for Challenge teams.",
  },
  {
    question: "Can my organisation set a problem?",
    answer: (
      <>
        Yes. Hospitals, companies, and agencies can bring a problem statement and share experts as
        mentors.{" "}
        <AppLink href="/partners#become" className="text-primary underline underline-offset-2">
          Start a partnership enquiry
        </AppLink>
        .
      </>
    ),
  },
  {
    question: "Where do I apply?",
    answer: (
      <>
        On <ExternalLink href={CHALLENGE_SITE}>atfchallenge.org</ExternalLink>, which carries the
        current dates and application form.
      </>
    ),
  },
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
      <div className="bg-primary text-white">
        <div className="atf-container flex flex-wrap items-center justify-between gap-6 py-4">
          <p className="flex flex-wrap items-baseline gap-x-3.5 gap-y-1">
            <strong className="font-display text-base font-extrabold">Taking part?</strong>
            <span className="text-sm">Dates, eligibility, and applications are on atfchallenge.org.</span>
          </p>
          <OpportunityButton href={CHALLENGE_SITE} target="_blank" rel="noopener" variant="inverse" size="sm">
            Go to atfchallenge.org
            <ArrowRight className="size-4" aria-hidden="true" />
          </OpportunityButton>
        </div>
      </div>

      <SectionSubnav items={subnav} />

      <ContentBand id="how" style={sectionAnchorStyle}>
        <SectionHeader
          eyebrow="How It Works"
          title="Training first. Then a real brief."
          body="The Challenge is built around one idea: students learn fastest when the problem belongs to someone who needs it solved."
        />
        <NumberedCells cells={steps} />
      </ContentBand>

      <ContentBand id="partners" dark style={sectionAnchorStyle}>
        <SectionHeader
          dark
          eyebrow="Problem Partners"
          title="Who sets the problems."
          body="Since 2025, institutions have brought their own problem statements to the Challenge. Teams work on problems these partners actually face."
        />
        <div className="grid gap-0.5 lg:grid-cols-3">
          {problemPartners.map((partner) => (
            <article key={partner.name} className="relative overflow-hidden bg-[#141416] px-9 pb-10 pt-11">
              <p className="mb-6 font-display text-[10.5px] font-bold uppercase tracking-[0.15em] text-atf-red-bright">
                {partner.tag}
              </p>
              <h3 className="font-display text-2xl font-extrabold leading-[1.1] tracking-tight text-white">
                {partner.name}
              </h3>
              <p className="mt-3.5 max-w-[34ch] text-sm leading-[1.7] text-white/70">{partner.body}</p>
              <p className="mt-7 font-display text-[11px] font-bold uppercase tracking-[0.12em] text-white/60">
                Problem partner since 2025
              </p>
              <span
                aria-hidden="true"
                className="absolute bottom-0 right-0 h-0 w-0 border-b-[56px] border-l-[56px] border-b-primary border-l-transparent"
              />
            </article>
          ))}
        </div>
        <OpportunityButton href="/partners#become" variant="inverseOutline" className="mt-11">
          Set a problem statement
          <ArrowRight className="size-4" aria-hidden="true" />
        </OpportunityButton>
      </ContentBand>

      <ContentBand id="growth" style={sectionAnchorStyle}>
        <SectionHeader
          eyebrow="Since 2023"
          title={
            <>
              From one country to <em className="not-italic text-primary">four</em>.
            </>
          }
          body="The Challenge is the latest chapter in ATF's work since 1988: finding technologists early and giving them a way in."
        />
        <ol className="grid gap-0.5 sm:grid-cols-2 lg:grid-cols-4">
          {stages.map((stage) => {
            const now = "now" in stage && stage.now;
            return (
              <li
                key={stage.date}
                className={cn(
                  "border-t-[3px] px-6 pb-8 pt-7",
                  now ? "border-primary bg-atf-gray-50" : "border-atf-gray-200 bg-white",
                )}
              >
                <p
                  className={cn(
                    "mb-4 font-display text-[34px] font-black leading-none tracking-tight",
                    now ? "text-primary" : "text-atf-ink",
                  )}
                >
                  {stage.date}
                </p>
                <h3 className="font-display text-base font-bold text-atf-black">{stage.title}</h3>
                <p className="mt-2 text-[13.5px] leading-[1.65] text-atf-gray-500">{stage.body}</p>
                {now ? (
                  <span className="mt-4 inline-block bg-primary px-2 py-1 font-display text-[9.5px] font-bold uppercase tracking-[0.13em] text-white">
                    Under way
                  </span>
                ) : null}
              </li>
            );
          })}
        </ol>
      </ContentBand>

      <StatBand
        eyebrow="The 2024 Challenge"
        value="22"
        title="Working MVPs from a single year of the Challenge."
        body="450 students from 23 Ghanaian universities trained, formed teams, and built. The next step is taking the same model to Nigeria, Kenya, and South Africa."
      />

      <section className="grid bg-atf-black lg:grid-cols-[1fr_1.15fr]">
        <div className="flex flex-col justify-center px-6 py-14 md:px-10 lg:px-20 lg:py-[104px]">
          <Eyebrow light>The campaign</Eyebrow>
          <h2 className="mt-6 max-w-[18ch] font-display text-[clamp(28px,2.9vw,46px)] font-black uppercase leading-[1.04] tracking-tight text-white">
            Don't just watch the AI revolution. Build it.
          </h2>
          <p className="mt-5 max-w-[44ch] text-base leading-[1.72] text-white/70">
            Recruitment runs through universities and chapters as well as online — posters on
            campus, word of mouth between classmates, and lecturers who pass it on.
          </p>
        </div>
        <div className="relative min-h-[360px] bg-[#141416] p-0.5">
          <img
            src="/atf-assets/v2/billboard-1.jpg"
            alt="ATF Challenge campaign artwork"
            className="absolute inset-0.5 size-[calc(100%-4px)] object-cover"
          />
        </div>
      </section>

      <ContentBand id="faq" muted style={sectionAnchorStyle}>
        <div className="mx-auto max-w-[960px]">
          <Eyebrow>FAQ</Eyebrow>
          <h2 className="atf-section-title mb-12">Common questions.</h2>
          <div className="border-t border-atf-gray-200">
            {faqs.map((faq, index) => (
              <details key={faq.question} open={index === 0} className="group border-b border-atf-gray-200">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 font-display text-[17px] font-bold text-atf-ink hover:text-primary [&::-webkit-details-marker]:hidden">
                  {faq.question}
                  <span aria-hidden="true" className="text-[22px] leading-none text-primary">
                    <span className="group-open:hidden">+</span>
                    <span className="hidden group-open:inline">−</span>
                  </span>
                </summary>
                <p className="max-w-[74ch] pb-6 text-sm leading-[1.75] text-atf-gray-500">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </ContentBand>

      <section className="relative isolate overflow-hidden bg-atf-black text-white">
        <span
          aria-hidden="true"
          className="absolute bottom-0 left-0 h-0 w-0 border-b-[48px] border-r-[48px] border-b-primary border-r-transparent"
        />
        <div className="atf-container flex flex-col items-center py-16 text-center lg:py-24">
          <Eyebrow light>The next Challenge</Eyebrow>
          <h2 className="font-display text-4xl font-black uppercase leading-tight md:text-5xl">
            Build something that gets used.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-white/70">
            Students apply on atfchallenge.org. Organisations can set a problem statement or mentor a
            team.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <OpportunityButton href={CHALLENGE_SITE} target="_blank" rel="noopener" size="lg">
              Apply on atfchallenge.org
              <ArrowRight className="size-4" aria-hidden="true" />
            </OpportunityButton>
            <OpportunityButton href="/partners#become" size="lg" variant="inverseOutline">
              Partner on the Challenge
            </OpportunityButton>
          </div>
        </div>
      </section>
    </SubpageTemplate>
  );
}
