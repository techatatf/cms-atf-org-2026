import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { AfricaMap, type MapRegion } from "@/components/site/AfricaMap";
import { AppLink } from "@/components/site/AppLink";
import { NumberedCells, TriangleList } from "@/components/site/ContentBlocks";
import { OpportunityButton } from "@/components/site/OpportunityButton";
import {
  ContentBand,
  Eyebrow,
  SectionHeader,
  SubpageTemplate,
} from "@/components/site/Page";
import { SectionSubnav, sectionAnchorStyle } from "@/components/site/SectionSubnav";
import { homeCrumb, whatWeDoCrumb } from "@/components/site/SubpageBreadcrumb";
import { ATF_EMAIL } from "@/lib/who-we-are-data";

export const Route = createFileRoute("/chapters")({
  component: ChaptersPage,
});

const subnav = [
  { id: "where", label: "Where We Work" },
  { id: "does", label: "What Chapters Do" },
  { id: "history", label: "History" },
  { id: "start", label: "Bring ATF to Your University" },
] as const;

const regions: readonly MapRegion[] = [
  { iso: "GHA", name: "Ghana", status: "active", description: "Registered here. University chapters since 2012; AI Challenge since 2023." },
  { iso: "NGA", name: "Nigeria", status: "active", description: "AI Challenge since 2025." },
  { iso: "KEN", name: "Kenya", status: "scaling", description: "AI Challenge scaling here with Google.org support." },
  { iso: "ZAF", name: "South Africa", status: "scaling", description: "AI Challenge scaling here with Google.org support." },
  { iso: "BEN", name: "Benin", status: "past", description: "University chapter, 2012 to 2020." },
];

const chapterBenefits = [
  {
    title: "Direction",
    body: "Chapters get guidance from ATF on what to run and how, so students spend their time building rather than organising from scratch.",
  },
  {
    title: "Access to experts",
    body: "Introductions to researchers and practitioners from the ATF network, in the fields students are studying.",
  },
  {
    title: "Emerging technology",
    body: "Early exposure to new fields across science and technology. Past chapters explored nanotechnology and 3D printing. Today that includes AI, and chapters will follow whatever frontier comes next.",
  },
  {
    title: "A lifelong community",
    body: (
      <>
        Members join a community that spans ATF's founding generation, former chapter members, and
        today's programme participants, with a route into ATF programmes such as the{" "}
        <AppLink href="/challenge" className="text-primary underline underline-offset-2">
          AI Challenge
        </AppLink>
        .
      </>
    ),
  },
];

const eras = [
  {
    tag: "2012 to 2020",
    title: "Six chapters at peak",
    body: "Five chapters in Ghana and one in Benin. Each received funding, direction, and access to experts, and introduced students to fields like nanotechnology and 3D printing.",
    image: "Chapter event photo, 2012–2020",
  },
  {
    tag: "Today",
    title: "Reactivating through universities",
    body: "We are reopening chapters through memoranda of understanding with universities, so each chapter has an institutional home and outlasts any one student cohort.",
    image: "Students at a partner university today",
  },
] as const;

const startSteps = [
  { title: "Get in touch", body: "Send us your university, your department, and the students or staff who want to lead." },
  { title: "Agree an MoU", body: "ATF and the university sign a memorandum of understanding that sets out how the chapter will run." },
  { title: "Appoint student leads", body: "The chapter is run by students, with a staff contact at the university." },
  { title: "Launch and connect", body: "The chapter joins the ATF community and takes part in ATF programmes where they run." },
] as const;

const provisions = [
  "Direction and programme materials",
  "Introductions to experts from the ATF network",
  "A route into ATF programmes, currently the AI Challenge",
  "ATF brand assets for chapter events",
] as const;

function ChaptersPage() {
  return (
    <SubpageTemplate
      hero={{
        breadcrumb: [homeCrumb, whatWeDoCrumb, { label: "ATF Chapters" }],
        title: "Chapters inside universities.",
        titleAccent: "inside",
        description:
          "ATF chapters are student groups based at universities. They give students direction, access to experts, and early exposure to emerging technology. We are now bringing chapters back through formal agreements with universities.",
        meta: [
          { label: "First chapters", value: "2012" },
          { label: "Chapters at peak", value: "6" },
          { label: "Chapter countries", value: "Ghana, Benin" },
          { label: "Now", value: "Reactivating" },
        ],
      }}
    >
      <SectionSubnav items={subnav} />

      <ContentBand id="where" dark style={sectionAnchorStyle}>
        <SectionHeader
          dark
          eyebrow="Where We Work"
          title="Four countries today. Five in our history."
          body="ATF is registered in Ghana and operates in Ghana, Nigeria, Kenya, and South Africa. We also ran a university chapter in Benin."
        />
        <AfricaMap regions={regions} />
      </ContentBand>

      <ContentBand id="does" style={sectionAnchorStyle}>
        <SectionHeader
          eyebrow="What Chapters Do"
          title="A way in, on campus."
          body="Chapters belong to ATF's Community pillar. A chapter is where a student first meets ATF — and often where they first meet someone already doing the work they want to do, in any field of science and technology."
        />
        <NumberedCells cells={chapterBenefits} />
      </ContentBand>

      <ContentBand id="history" muted style={sectionAnchorStyle}>
        <SectionHeader
          eyebrow="History"
          title={
            <>
              Back to students, <em className="not-italic text-primary">again</em>.
            </>
          }
          body="ATF was founded by students at MIT in 1988. Chapters are how it keeps returning to them."
        />
        <div className="grid gap-0.5 md:grid-cols-2">
          {eras.map((era) => (
            <article key={era.title} className="bg-white px-7 py-10 lg:px-10 lg:py-11">
              <div
                role="img"
                aria-label={era.image}
                className="mb-7 flex aspect-video items-center justify-center bg-atf-black p-6 text-center font-display text-xs font-bold uppercase tracking-[0.1em] text-white/40"
              >
                {era.image}
              </div>
              <p className="mb-3 font-display text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
                {era.tag}
              </p>
              <h3 className="font-display text-2xl font-extrabold tracking-tight text-atf-black">
                {era.title}
              </h3>
              <p className="atf-body mt-3 max-w-[48ch]">{era.body}</p>
            </article>
          ))}
        </div>
      </ContentBand>

      <section id="start" style={sectionAnchorStyle} className="grid lg:grid-cols-[1fr_1.1fr]">
        <div className="bg-atf-gray-50 px-6 py-14 md:px-10 lg:px-20 lg:py-[104px]">
          <Eyebrow>Bring ATF to Your University</Eyebrow>
          <h2 className="atf-section-title mb-8">No chapter on your campus? Start the conversation.</h2>
          <p className="mb-9 max-w-[46ch] text-base leading-[1.72] text-atf-gray-500">
            Students, lecturers, and university administrators can all get in touch. Tell us your
            university, who is involved, and why a chapter would help.
          </p>
          <OpportunityButton href={`mailto:${ATF_EMAIL}?subject=Chapter%20enquiry`}>
            Email us about a chapter
            <ArrowRight className="size-4" aria-hidden="true" />
          </OpportunityButton>
          <p className="mt-5 text-[13px] text-atf-gray-500">{ATF_EMAIL}</p>
        </div>
        <div className="border-atf-gray-200 bg-white px-6 py-14 md:px-10 lg:border-l lg:px-20 lg:py-[104px]">
          <div className="mb-7">
            <Eyebrow>How it works</Eyebrow>
          </div>
          <ol>
            {startSteps.map((step, index) => (
              <li
                key={step.title}
                className="grid grid-cols-[46px_1fr] gap-5 border-b border-atf-gray-200 py-6 last:border-b-0"
              >
                <span className="flex size-[34px] items-center justify-center bg-primary font-display text-base font-black text-white">
                  {index + 1}
                </span>
                <div>
                  <h3 className="font-display text-[17px] font-bold text-atf-black">{step.title}</h3>
                  <p className="mt-2 text-sm leading-[1.7] text-atf-gray-500">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-12">
            <Eyebrow>What ATF provides</Eyebrow>
          </div>
          <TriangleList items={provisions} />
        </div>
      </section>
    </SubpageTemplate>
  );
}
