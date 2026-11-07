import { createFileRoute } from "@tanstack/react-router";

import {
  ArrowLink,
  CtaBand,
  NameTags,
} from "@/components/site/ContentBlocks";
import { OpportunityButton } from "@/components/site/OpportunityButton";
import {
  ContentBand,
  DiagonalAccentSection,
  Eyebrow,
  SectionHeader,
  SubpageTemplate,
} from "@/components/site/Page";
import { SectionSubnav, sectionAnchorStyle } from "@/components/site/SectionSubnav";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/about")({
  component: MissionPage,
});

const subnav = [
  { id: "mission", label: "How We Do It" },
  { id: "story", label: "Our Story" },
  { id: "direction", label: "Where We're Going" },
  { id: "pillars", label: "How We Work" },
  { id: "founding", label: "In Our Words" },
] as const;

const eras = [
  {
    year: "1988",
    tag: "Journal era · 1988 to early 2000s",
    title: "A journal and book drives",
    body: "African students and young professionals at MIT founded ATF to make the work of Africa's scientists and technologists visible. They published a journal with contributors from across Africa and the diaspora, and ran book drives that sent engineering and technology texts to university libraries across the continent. By 1992 the journal had about 23 volunteer staff, contributors in 15 countries, and more than 11,000 readers.",
  },
  {
    year: "2000s",
    tag: "Consulting era · Continues today",
    title: "A professional network",
    body: "As the founders built careers at companies, universities, and institutions in Africa and abroad, ATF became a professional network. ATF Consulting put that network's expertise to work on projects that needed it. Consulting remains part of ATF today.",
  },
  {
    year: "2012",
    tag: "University chapters era · 2012 to 2020",
    title: "Back to students",
    body: "ATF returned to its roots with student chapters inside universities. Chapters received funding, direction, access to experts, and exposure to emerging technologies such as nanotechnology and 3D printing. Six chapters ran at their peak: five in Ghana and one in Benin.",
  },
  {
    year: "2023",
    tag: "ATF Challenge era · 2023 to today",
    title: "The ATF AI Challenge",
    body: "With sponsorship from OpenAI, ATF ran its first AI Challenge in 2023. The 2024 Challenge drew 450 students from 23 universities in Ghana and produced 22 MVPs. In 2025 it expanded to Nigeria, with partners such as Korle Bu Teaching Hospital and Esoko setting real problem statements. With support from Google.org, the Challenge now runs in Ghana, Nigeria, Kenya, and South Africa. AI is this era's field; the method — training, real problems, a community behind it — is meant to outlast it.",
  },
] as const;

const path = ["Journals", "Nanotech", "3D printing", "AI", "Next"] as const;

const domains = [
  "Health",
  "Agriculture",
  "Industry & manufacturing",
  "Telecommunications",
  "Technology policy",
  "Core sciences",
  "Biotechnology",
] as const;

const pillars = [
  {
    number: "01",
    title: "Community",
    body: "Our oldest function. It covers alumni from every era, university chapters, the mentors and experts who support our programmes, and the professional network behind ATF Consulting. Programmes end, but the community carries on.",
    links: [
      { label: "Chapters", href: "/chapters" },
      { label: "Team", href: "/team" },
    ],
  },
  {
    number: "02",
    title: "Programmes",
    body: "Structured programmes for African technologists, each with a clear outcome. The ATF AI Challenge is our current flagship; the fields will change as Africa's needs do.",
    links: [{ label: "ATF Challenge", href: "/challenge" }],
  },
  {
    number: "03",
    title: "Knowledge",
    body: "Research, policy briefs, curricula, and the data our programmes produce. It continues the work of the journal that started ATF in 1988.",
    links: [{ label: "Publications", href: "/publications" }],
    dark: true,
  },
] as const;

function MissionPage() {
  return (
    <SubpageTemplate
      hero={{
        eyebrow: "Who We Are",
        title: "Advancing the development of science and technology in Africa since 1988.",
        description:
          "ATF was founded at MIT in 1988 by African students and young professionals. Its form has changed every decade: a journal, a professional network, university chapters, and now the ATF AI Challenge. Its mission has stayed the same.",
        meta: [
          { label: "Established", value: "1988" },
          { label: "Registered in", value: "Ghana" },
          { label: "Countries of operation", value: "4" },
          { label: "Eras", value: "4" },
        ],
      }}
    >
      <SectionSubnav items={subnav} />

      <ContentBand id="mission" style={sectionAnchorStyle}>
        <div className="grid gap-10 lg:grid-cols-[0.3fr_1fr]">
          <Eyebrow>How we do it</Eyebrow>
          <div>
            <h2 className="atf-section-title">
              By nurturing technologists, connecting them, and creating pathways to impact.
            </h2>
            <div className="atf-body mt-10 max-w-3xl space-y-5 text-lg leading-8">
              <p>
                We identify and nurture technologists across every discipline and career stage. We
                build the community and knowledge infrastructure that connects them to each other
                and to the wider world. And we create the pathways that turn learning into lasting
                impact.
              </p>
              <p>
                Our founding language said ATF <strong className="text-atf-ink">promotes</strong>{" "}
                this work. We now say <strong className="text-atf-ink">advancing</strong>, because
                ATF does more than advocate for it. We do the work.
              </p>
              <p>
                Today we operate in Ghana, Nigeria, Kenya, and South Africa. We have also run
                university chapters in Benin.
              </p>
            </div>
          </div>
        </div>
      </ContentBand>

      <ContentBand id="story" muted style={sectionAnchorStyle}>
        <SectionHeader
          eyebrow="Our Story"
          title="Four eras, one thread."
          body="Through every era, ATF has connected African technologists, students and professionals, to knowledge, to resources, and to each other."
        />
        <ol className="border-t border-atf-gray-200">
          {eras.map((era) => (
            <li
              key={era.year}
              className="grid gap-4 border-b border-atf-gray-200 py-8 lg:grid-cols-[0.5fr_1fr_1.4fr] lg:gap-10"
            >
              <p className="font-display text-5xl font-black text-primary">{era.year}</p>
              <div>
                <p className="font-display text-[11px] font-bold uppercase tracking-[0.08em] text-atf-gray-500">
                  {era.tag}
                </p>
                <h3 className="mt-2 font-display text-2xl font-black uppercase leading-tight text-atf-black">
                  {era.title}
                </h3>
              </div>
              <p className="atf-body">{era.body}</p>
            </li>
          ))}
        </ol>
      </ContentBand>

      <DiagonalAccentSection>
        <div>
          <Eyebrow light>The journal era</Eyebrow>
          <p className="font-display text-7xl font-black md:text-8xl">
            11,000<span className="text-primary lg:text-white">+</span>
          </p>
        </div>
        <div className="lg:pl-10">
          <h3 className="font-display text-2xl font-black uppercase leading-tight md:text-3xl">
            Readers of the ATF journal by 1992.
          </h3>
          <p className="mt-4 max-w-xl text-base leading-7 text-white/75">
            About 23 volunteers produced it, with contributors in 15 countries. The journal was
            ATF’s first piece of knowledge infrastructure, and it is why Knowledge is one of our
            three pillars today.
          </p>
        </div>
      </DiagonalAccentSection>

      <ContentBand id="direction" style={sectionAnchorStyle}>
        <Eyebrow>Where We're Going</Eyebrow>
        <div className="mt-6 grid gap-10 lg:grid-cols-2">
          <h2 className="atf-section-title">
            Not an AI organisation. An organisation that connects African technologists to
            whatever comes next.
          </h2>
          <div className="atf-body space-y-6">
            <p>
              ATF has never been tied to one technology. We have moved from journals to book
              drives, to a professional network, to nanotechnology and 3D printing, and now to AI —
              always keeping the community that makes each step possible.
            </p>
            <ol
              aria-label="ATF's technology focus over time"
              className="flex flex-wrap items-center gap-2 font-display text-xs font-bold uppercase"
            >
              {path.map((step, index) => (
                <li key={step} className="flex items-center gap-2">
                  {index > 0 ? <span aria-hidden="true" className="text-atf-gray-500">→</span> : null}
                  <span
                    className={cn(
                      "border px-3 py-2",
                      step === "AI"
                        ? "border-primary bg-primary text-white"
                        : step === "Next"
                          ? "border-dashed border-atf-gray-500 text-atf-gray-500"
                          : "border-atf-gray-200 text-atf-ink",
                    )}
                  >
                    {step}
                  </span>
                </li>
              ))}
            </ol>
            <p>
              AI is the field that matters most right now, and the{" "}
              <strong className="text-atf-ink">ATF AI Challenge</strong> is where we are building
              the capacity to work at scale. But our work is to build pathways from learning to
              impact for African technologists, in whichever field offers the most at the time.
            </p>
            <p>That is why we follow fields beyond AI that will shape Africa's next decade:</p>
            <NameTags names={domains} />
          </div>
        </div>
      </ContentBand>

      <ContentBand id="pillars" muted style={sectionAnchorStyle}>
        <SectionHeader
          eyebrow="How We Work"
          title="Three pillars."
          body="Each pillar has its own job, and they rely on each other. Programmes are stronger when a community stands behind them and when what they teach us gets published."
        />
        <div className="grid gap-px border border-atf-gray-200 bg-atf-gray-200 lg:grid-cols-3">
          {pillars.map((pillar) => {
            const dark = "dark" in pillar && pillar.dark;
            return (
              <div key={pillar.title} className={cn("flex flex-col p-8", dark ? "bg-atf-black text-white" : "bg-white")}>
                <p className="font-display text-sm font-black text-primary">{pillar.number}</p>
                <h3 className={cn("mt-4 font-display text-2xl font-black uppercase", dark ? "text-white" : "text-atf-black")}>
                  {pillar.title}
                </h3>
                <p className={cn("mt-4 text-sm leading-7", dark ? "text-white/70" : "text-atf-gray-500")}>
                  {pillar.body}
                </p>
                <div className="mt-auto flex flex-wrap gap-6 pt-8">
                  {pillar.links.map((link) => (
                    <ArrowLink key={link.label} href={link.href} light={dark}>
                      {link.label}
                    </ArrowLink>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </ContentBand>

      <ContentBand id="founding" dark style={sectionAnchorStyle}>
        <div className="max-w-4xl">
          <Eyebrow light>In our own words</Eyebrow>
          <blockquote className="font-display text-2xl font-black uppercase leading-snug md:text-4xl">
            "We seek to identify and nurture young minds in various disciplines to discuss,
            research, and publish information relating to the application of science and
            technology to solve <span className="text-primary">Africa's problems</span>."
          </blockquote>
          <p className="mt-8 text-sm text-white/60">
            <strong className="block font-display uppercase text-white">ATF's founding-era mission</strong>
            The commitment our mission still carries forward
          </p>
          <OpportunityButton href="/team#board" variant="inverseOutline" className="mt-10">
            Meet the co-founders
          </OpportunityButton>
        </div>
      </ContentBand>

      <ContentBand className="border-b border-atf-gray-200 !py-12">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <Eyebrow>Supported by</Eyebrow>
            <NameTags names={["Google.org", "OpenAI"]} />
          </div>
          <div>
            <Eyebrow>Challenge partners include</Eyebrow>
            <NameTags names={["Korle Bu Teaching Hospital", "37 Military Hospital", "Esoko"]} />
          </div>
        </div>
      </ContentBand>

      <CtaBand
        title="Work with the forum."
        actions={[
          { label: "Partner with ATF", href: "/partners#become" },
          { label: "Volunteer", href: "/careers" },
        ]}
      />
    </SubpageTemplate>
  );
}
