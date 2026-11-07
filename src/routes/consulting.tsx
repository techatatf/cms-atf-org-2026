import { createFileRoute } from "@tanstack/react-router";

import { NumberedCells, StatBand } from "@/components/site/ContentBlocks";
import { MailtoForm } from "@/components/site/MailtoForm";
import {
  ContentBand,
  Eyebrow,
  SectionHeader,
  SubpageTemplate,
} from "@/components/site/Page";
import { SectionSubnav, sectionAnchorStyle } from "@/components/site/SectionSubnav";
import { homeCrumb, whatWeDoCrumb } from "@/components/site/SubpageBreadcrumb";
import type { MailtoFormLayout } from "@/lib/mailto-form";
import { cn } from "@/lib/utils";
import { ATF_EMAIL } from "@/lib/who-we-are-data";

export const Route = createFileRoute("/consulting")({
  component: ConsultingPage,
});

const subnav = [
  { id: "services", label: "What We Do" },
  { id: "method", label: "How We Work" },
  { id: "history", label: "Where It Comes From" },
  { id: "engage", label: "Work With Us" },
] as const;

const services = [
  {
    title: "Technology strategy & policy",
    body: "Advice for ministries and institutions planning how science and technology will serve their goals — from national skills strategies to an institution's first technology plan.",
    proof: "ATF works in four countries, each developing national digital and technology skills strategies.",
  },
  {
    title: "Skills & capability",
    body: "Curriculum and training for your students or staff in the technical fields you need, built to be taught again once we hand it over.",
    proof: "ATF has introduced students to nanotechnology and 3D printing, and now designs and delivers AI training across four countries.",
  },
  {
    title: "Sector expertise",
    body: "Access to practitioners from the ATF network who work in your field — not a generalist pool.",
    proof: "The network spans founding-era professionals, former chapter members, and more than 120 mentors and experts in medicine, agriculture, finance, law, and engineering.",
  },
  {
    title: "Problem definition & evaluation",
    body: "Turning an institution's challenge into a problem technologists can work on — and measuring afterwards whether the solution worked.",
    proof: "Korle Bu Teaching Hospital, 37 Military Hospital, and Esoko have framed problem statements with ATF.",
  },
] as const;

const fields = [
  "Health",
  "Agriculture",
  "Industry & manufacturing",
  "Telecommunications",
  "Technology policy",
  "Core sciences",
  "Biotechnology",
  "AI & data",
] as const;

const phases = [
  { title: "Listen", body: "We start with your problem, your constraints, and the people who will own the result." },
  { title: "Match", body: "We find the practitioners in the ATF network who know your sector and have done this work before." },
  { title: "Deliver", body: "They work alongside your staff, never as a parallel team." },
  { title: "Hand over", body: "Your team leaves with the skills, documents, and ownership to carry on." },
] as const;

const models = [
  { title: "Advisory", body: "Ongoing access to ATF practitioners for your team." },
  { title: "Defined project", body: "A scoped piece of work: a problem definition, a design, or an evaluation." },
  { title: "Training programme", body: "Curriculum designed and delivered for your students or staff." },
  { title: "Independent review", body: "A second opinion on a technology programme already under way." },
] as const;

const option = (value: string) => ({ value, label: value });

const consultingForm: MailtoFormLayout = [
  [
    { kind: "text", id: "name", name: "Name", label: "Name", required: true, autoComplete: "name", placeholder: "Your full name" },
    { kind: "text", id: "organisation", name: "Organisation", label: "Organisation", required: true, placeholder: "Ministry, institution, or company" },
  ],
  { kind: "email", id: "email", name: "Email", label: "Work email", required: true, autoComplete: "email", placeholder: "you@organisation.org" },
  [
    {
      kind: "select",
      id: "area",
      name: "Area",
      label: "Area",
      options: [...services.map((service) => option(service.title)), option("Not sure yet")],
    },
    {
      kind: "select",
      id: "country",
      name: "Country",
      label: "Country",
      options: ["Ghana", "Nigeria", "Kenya", "South Africa", "Elsewhere"].map(option),
    },
  ],
  {
    kind: "textarea",
    id: "brief",
    name: "Brief",
    label: "What are you trying to do?",
    required: true,
    placeholder: "A few sentences on the problem, the timeline, and who else is involved.",
  },
];

function ConsultingPage() {
  return (
    <SubpageTemplate
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
      <SectionSubnav items={subnav} />

      <ContentBand id="services" style={sectionAnchorStyle}>
        <SectionHeader
          eyebrow="What We Do"
          title="Four kinds of work."
          body="ATF has never been tied to one technology. Our work has moved from journals to nanotechnology to 3D printing to AI. Consulting follows the same logic: the field changes, the network stays."
        />
        <div className="grid gap-0.5 bg-atf-gray-200 md:grid-cols-2">
          {services.map((service, index) => (
            <article
              key={service.title}
              className={cn(
                "border-t-[3px] bg-white px-7 py-10 lg:px-12 lg:pb-12 lg:pt-[52px]",
                index === 0 || index === 3 ? "border-primary" : "border-atf-ink",
              )}
            >
              <p className="mb-5 font-display text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="font-display text-[27px] font-extrabold leading-[1.08] tracking-tight text-atf-black">
                {service.title}
              </h3>
              <p className="atf-body mt-4 max-w-[46ch]">{service.body}</p>
              <p className="mt-5 max-w-[46ch] border-t border-atf-gray-200 pt-4 text-[13.5px] leading-relaxed text-atf-ink">
                {service.proof}
              </p>
            </article>
          ))}
        </div>
        <div className="mb-4 mt-14">
          <Eyebrow>Fields we draw on</Eyebrow>
        </div>
        <ul aria-label="Fields" className="flex flex-wrap gap-0.5">
          {fields.map((field) => (
            <li
              key={field}
              className="flex-[1_1_160px] bg-atf-black px-6 py-[26px] font-display text-[13px] font-extrabold uppercase tracking-[0.1em] text-white"
            >
              {field}
            </li>
          ))}
        </ul>
      </ContentBand>

      <ContentBand id="method" muted style={sectionAnchorStyle}>
        <SectionHeader
          eyebrow="How We Work"
          title="From your problem to the right people."
          body="Every engagement is staffed from the network and scoped to end with your team running the work."
        />
        <NumberedCells cells={phases} mutedNumbers emphasizeLast />
      </ContentBand>

      <StatBand
        id="history"
        style={sectionAnchorStyle}
        eyebrow="Where it comes from"
        value="1988"
        title="A journal first. Then a network. Then a practice."
        body="ATF began at MIT in 1988 as a journal connecting African scientists. By 1992 it had contributors in 15 countries and more than 11,000 readers. As those readers built careers across Africa and abroad, ATF Consulting grew out of the network to put their expertise to work at home."
      />

      <section id="engage" style={sectionAnchorStyle} className="grid lg:grid-cols-2">
        <div className="bg-atf-black px-6 py-14 text-white md:px-10 lg:px-20 lg:py-[104px]">
          <Eyebrow light>Work With Us</Eyebrow>
          <h2 className="mt-6 max-w-[20ch] font-display text-[clamp(30px,3vw,46px)] font-black uppercase leading-[1.04] tracking-tight">
            Start with a conversation.
          </h2>
          <p className="mb-9 mt-5 max-w-[46ch] text-base leading-[1.72] text-white/70">
            Tell us what you are trying to do. If the ATF network is the right fit, we will
            propose how to work together. If it isn't, we will say so.
          </p>
          <dl>
            {models.map((model) => (
              <div key={model.title} className="border-t border-white/15 py-5">
                <dt className="font-display text-base font-bold text-white">{model.title}</dt>
                <dd className="mt-1 text-[13.5px] leading-[1.55] text-white/65">{model.body}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="bg-atf-gray-50 px-6 py-14 md:px-10 lg:px-[72px] lg:py-[104px]">
          <div className="mb-7">
            <Eyebrow>Request a conversation</Eyebrow>
          </div>
          <MailtoForm
            to={ATF_EMAIL}
            subject="Consulting enquiry"
            layout={consultingForm}
            submitLabel="Request a conversation"
          />
        </div>
      </section>
    </SubpageTemplate>
  );
}
