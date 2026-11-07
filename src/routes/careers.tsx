import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { CalloutBox, InfoCellGrid } from "@/components/site/ContentBlocks";
import { MailtoForm } from "@/components/site/MailtoForm";
import { OpportunityButton } from "@/components/site/OpportunityButton";
import { ContentBand, Eyebrow, SectionHeader, SubpageTemplate } from "@/components/site/Page";
import { SectionSubnav, sectionAnchorStyle } from "@/components/site/SectionSubnav";
import type { MailtoFormLayout } from "@/lib/mailto-form";
import { ATF_EMAIL, ATF_LINKEDIN } from "@/lib/who-we-are-data";
import { homeCrumb, whoWeAreCrumb } from "@/components/site/SubpageBreadcrumb";

export const Route = createFileRoute("/careers")({
  component: CareersPage,
});

const subnav = [
  { id: "ways", label: "Ways to Help" },
  { id: "roles", label: "Open Roles" },
  { id: "join", label: "Volunteer" },
] as const;

const ways = [
  { eyebrow: "Practitioners", title: "Mentor a Challenge team", body: "Guide a student team through the ATF AI Challenge, from problem statement to working MVP." },
  { eyebrow: "Experts", title: "Judge or review", body: "Assess Challenge submissions and give teams honest, specific feedback." },
  { eyebrow: "Academics & alumni", title: "Support a chapter", body: "Speak at, advise, or help set up a university chapter in your field." },
  { eyebrow: "Writers & editors", title: "Write for ATF", body: "ATF began as a journal in 1988. Help us report, edit, and publish the work of African technologists." },
  { eyebrow: "Organisers", title: "Run events locally", body: "Help deliver programmes and events in Ghana, Nigeria, Kenya, or South Africa." },
  { eyebrow: "Professionals", title: "Lend a skill", body: "Design, finance, legal, communications, or engineering support on a defined project." },
] as const;

const steps = [
  { title: "Send the form", body: "Your interests, country, and how much time you have." },
  { title: "We match you", body: "We look for a programme, chapter, or project that fits." },
  { title: "Short call", body: "A conversation with the ATF team before you start." },
] as const;

const options = (values: string[]) => values.map((value) => ({ value, label: value }));

const volunteerForm: MailtoFormLayout = [
  [
    { kind: "text", id: "name", name: "Name", label: "Full name", required: true, autoComplete: "name", placeholder: "Your full name" },
    { kind: "email", id: "email", name: "Email", label: "Email", required: true, autoComplete: "email", placeholder: "you@example.com" },
  ],
  [
    {
      kind: "select",
      id: "country",
      name: "Country",
      label: "Country",
      required: true,
      options: [
        { value: "", label: "Choose a country" },
        ...options(["Ghana", "Nigeria", "Kenya", "South Africa", "Elsewhere in Africa", "Outside Africa"]),
      ],
    },
    {
      kind: "select",
      id: "time",
      name: "Time available",
      label: "Time available",
      options: options(["A few hours a month", "A few hours a week", "A single project"]),
    },
  ],
  {
    kind: "checkboxes",
    id: "interests",
    name: "Interests",
    label: "I'd like to",
    required: true,
    options: [
      { value: "Mentor a Challenge team", label: "Mentor" },
      { value: "Judge or review", label: "Judge or review" },
      { value: "Support a chapter", label: "Support a chapter" },
      { value: "Write for ATF", label: "Write" },
      { value: "Run events locally", label: "Run events" },
      { value: "Lend a skill", label: "Lend a skill" },
    ],
  },
  { kind: "url", id: "linkedin", name: "LinkedIn", label: "LinkedIn profile", optional: true, placeholder: "https://www.linkedin.com/in/…" },
  {
    kind: "textarea",
    id: "about",
    name: "About",
    label: "What would you bring?",
    required: true,
    placeholder: "Your field, experience, and what you'd like to work on.",
  },
  { kind: "consent", id: "consent", name: "Consent", label: "ATF may contact me about volunteering.", value: "Yes", required: true },
];

function CareersPage() {
  return (
    <SubpageTemplate
      hero={{
        breadcrumb: [homeCrumb, whoWeAreCrumb, { label: "Careers & Volunteering" }],
        title: "Work with the forum.",
        titleAccent: "with",
        description:
          "ATF has been run by volunteers for most of its history. Volunteers mentor Challenge teams, support university chapters, write, and help run programmes in Ghana, Nigeria, Kenya, and South Africa. When paid roles open, we list them here.",
      }}
    >
      <SectionSubnav items={subnav} />

      <ContentBand id="ways" style={sectionAnchorStyle}>
        <SectionHeader
          eyebrow="Ways to Help"
          title="Bring what you know."
          body="Most volunteers give a few hours a month. Some take on a single project. All of them work directly with students and the ATF team."
        />
        <InfoCellGrid cells={ways} columns={3} />
      </ContentBand>

      <ContentBand id="roles" muted style={sectionAnchorStyle}>
        <SectionHeader
          eyebrow="Open Roles"
          title="Paid positions."
          body="Staff roles are posted here and on our LinkedIn page when they open."
        />
        <CalloutBox
          title="No paid roles are open right now."
          body="Follow ATF on LinkedIn to see new roles first, or sign up below to volunteer in the meantime."
          action={
            <OpportunityButton href={ATF_LINKEDIN} target="_blank" rel="noopener" variant="outline">
              Follow on LinkedIn
              <ArrowRight className="size-4" aria-hidden="true" />
            </OpportunityButton>
          }
        />
      </ContentBand>

      <section id="join" style={sectionAnchorStyle} className="bg-atf-black text-white">
        <div className="atf-container grid gap-10 py-16 lg:grid-cols-[0.8fr_1fr] lg:py-24">
          <div>
            <Eyebrow light>Volunteer</Eyebrow>
            <h2 className="font-display text-4xl font-black uppercase leading-tight md:text-5xl">
              Tell us how you'd like to help.
            </h2>
            <p className="mt-6 max-w-lg text-base leading-7 text-white/70">
              Two minutes. We read every response and match it to the programmes that need you.
            </p>
            <ol className="mt-10 space-y-6">
              {steps.map((step, index) => (
                <li key={step.title} className="flex gap-4">
                  <span className="flex size-9 shrink-0 items-center justify-center bg-primary font-display text-sm font-black">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="font-display text-base font-black uppercase">{step.title}</h3>
                    <p className="mt-1 text-sm text-white/60">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <MailtoForm to={ATF_EMAIL} subject="Volunteer sign-up" layout={volunteerForm} submitLabel="Send" />
        </div>
      </section>
    </SubpageTemplate>
  );
}
