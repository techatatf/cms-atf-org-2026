import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { InfoCellGrid } from "@/components/site/ContentBlocks";
import { MailtoForm } from "@/components/site/MailtoForm";
import {
  ContentBand,
  Eyebrow,
  FilterChip,
  SectionHeader,
  SubpageTemplate,
} from "@/components/site/Page";
import { SectionSubnav, sectionAnchorStyle } from "@/components/site/SectionSubnav";
import type { MailtoFormLayout } from "@/lib/mailto-form";
import {
  ATF_EMAIL,
  filterPartners,
  partnerCountries,
  partnerGroups,
  partners,
  type Partner,
  type PartnerRole,
} from "@/lib/who-we-are-data";
import { homeCrumb, whoWeAreCrumb } from "@/components/site/SubpageBreadcrumb";

export const Route = createFileRoute("/partners")({
  component: PartnersPage,
});

const subnav = [
  { id: "funders", label: "Funders" },
  { id: "wall", label: "All Partners" },
  { id: "how", label: "How Partners Help" },
  { id: "become", label: "Become a Partner" },
] as const;

const funders = [
  {
    name: "Google.org",
    body: "Supports the scaling of the ATF AI Challenge to Ghana, Nigeria, Kenya, and South Africa.",
    since: "Scaling partner",
  },
  {
    name: "OpenAI",
    body: "Sponsored the first ATF AI Challenge in Ghana in 2023.",
    since: "Founding sponsor · 2023",
  },
] as const;

const ways = [
  { title: "Problem statements", body: "Hospitals, companies, and agencies set real problems for Challenge teams to solve." },
  { title: "Mentors and experts", body: "Partners share specialists who guide teams in their field." },
  { title: "Funding", body: "Funders support programmes, from AI training to university chapters." },
  { title: "University partnerships", body: "Universities host chapters and bring their students into ATF programmes." },
] as const;

const enquiryForm: MailtoFormLayout = [
  [
    { kind: "text", id: "name", name: "Name", label: "Name", required: true, autoComplete: "name", placeholder: "Your full name" },
    { kind: "text", id: "org", name: "Organisation", label: "Organisation", required: true, placeholder: "Company, institution, or funder" },
  ],
  { kind: "email", id: "email", name: "Email", label: "Work email", required: true, autoComplete: "email", placeholder: "you@organisation.org" },
  {
    kind: "checkboxes",
    id: "interest",
    name: "Interest",
    label: "We'd like to",
    required: true,
    options: [
      { value: "Set a problem statement", label: "Set a problem" },
      { value: "Share mentors and experts", label: "Share mentors" },
      { value: "Fund a programme", label: "Fund a programme" },
      { value: "Host a university chapter", label: "Host a chapter" },
    ],
  },
  {
    kind: "select",
    id: "country",
    name: "Country",
    label: "Country of focus",
    options: ["Ghana", "Nigeria", "Kenya", "South Africa", "Several / all"].map((value) => ({ value, label: value })),
  },
  {
    kind: "textarea",
    id: "message",
    name: "Message",
    label: "What do you have in mind?",
    required: true,
    placeholder: "A few sentences on your organisation and what you'd like to support.",
  },
];

function PartnersPage() {
  return (
    <SubpageTemplate
      hero={{
        breadcrumb: [homeCrumb, whoWeAreCrumb, { label: "Partners & Funders" }],
        title: "Partners and funders.",
        titleAccent: "funders",
        description:
          "ATF's work depends on funders, institutions, and universities. Partners fund our programmes, set real problem statements for Challenge teams, and share their experts as mentors.",
      }}
    >
      <SectionSubnav items={subnav} />

      <ContentBand id="funders" style={sectionAnchorStyle}>
        <SectionHeader
          eyebrow="Funders"
          title="Supported by."
          body="Two funders have made the ATF AI Challenge possible — one at its start, one as it scales."
        />
        <div className="grid gap-6 md:grid-cols-2">
          {funders.map((funder) => (
            <div key={funder.name} className="border border-atf-gray-200 p-8">
              <h3 className="font-display text-3xl font-black uppercase text-atf-black">{funder.name}</h3>
              <p className="atf-body mt-4">{funder.body}</p>
              <p className="mt-6 font-display text-[11px] font-bold uppercase tracking-[0.08em] text-primary">
                {funder.since}
              </p>
            </div>
          ))}
        </div>
      </ContentBand>

      <ContentBand id="wall" muted style={sectionAnchorStyle}>
        <SectionHeader
          eyebrow="All Partners"
          title="The organisations we work with."
          body="Funders, problem-statement partners, and universities across our four countries."
        />
        <PartnerWall />
      </ContentBand>

      <ContentBand id="how" style={sectionAnchorStyle}>
        <SectionHeader eyebrow="How Partners Help" title="Four ways to work with ATF." />
        <InfoCellGrid cells={ways} />
      </ContentBand>

      <section id="become" style={sectionAnchorStyle} className="bg-primary text-white">
        <div className="atf-container grid gap-10 py-16 lg:grid-cols-[0.8fr_1fr] lg:py-24">
          <div>
            <Eyebrow light>Become a Partner</Eyebrow>
            <h2 className="font-display text-4xl font-black uppercase leading-tight md:text-5xl">
              Work with the forum.
            </h2>
            <p className="mt-6 max-w-lg text-base leading-7 text-white/80">
              Set a problem statement, share your experts, host a chapter, or fund a programme.
              Tell us what you have in mind and we will reply by email.
            </p>
            <div className="mt-10 border-t border-white/25 pt-6">
              <span className="block font-display text-[11px] font-bold uppercase tracking-[0.08em] text-white/65">
                Or write to us directly
              </span>
              <a
                href={`mailto:${ATF_EMAIL}?subject=Partnership%20enquiry`}
                className="mt-2 inline-block break-all font-semibold underline underline-offset-4"
              >
                {ATF_EMAIL}
              </a>
            </div>
          </div>
          <MailtoForm
            to={ATF_EMAIL}
            subject="Partnership enquiry"
            layout={enquiryForm}
            submitLabel="Send enquiry"
          />
        </div>
      </section>
    </SubpageTemplate>
  );
}

function PartnerWall() {
  const [role, setRole] = useState<PartnerRole | "all">("all");
  const [country, setCountry] = useState("all");
  const count = (r: PartnerRole | "all") => filterPartners(partners, r, "all").length;
  const groups = partnerGroups.filter((group) => role === "all" || group.role === role);

  return (
    <div>
      <div className="mb-10 flex flex-wrap items-center gap-2">
        <FilterChip active={role === "all"} onClick={() => setRole("all")}>
          All <span className="ml-1 opacity-60">{count("all")}</span>
        </FilterChip>
        {partnerGroups.map((group) => (
          <FilterChip key={group.role} active={role === group.role} onClick={() => setRole(group.role)}>
            {group.title} <span className="ml-1 opacity-60">{count(group.role)}</span>
          </FilterChip>
        ))}
        <select
          aria-label="Filter by country"
          value={country}
          onChange={(event) => setCountry(event.target.value)}
          className="border border-atf-gray-200 bg-white px-3 py-2 font-display text-xs font-bold uppercase text-atf-ink"
        >
          <option value="all">All countries</option>
          {partnerCountries.map((name) => (
            <option key={name}>{name}</option>
          ))}
        </select>
      </div>

      <div className="space-y-12">
        {groups.map((group) => {
          const list = filterPartners(partners, group.role, country);
          return (
            <div key={group.role}>
              <div className="mb-4 flex items-baseline justify-between border-b border-atf-gray-200 pb-3">
                <h3 className="font-display text-xl font-black uppercase text-atf-black">{group.title}</h3>
                <span className="text-sm text-atf-gray-500">{list.length}</span>
              </div>
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {list.length ? (
                  list.map((partner) => <PartnerTile key={partner.name} partner={partner} />)
                ) : (
                  <li className="border border-dashed border-atf-gray-200 p-6 text-sm leading-6 text-atf-gray-500 sm:col-span-2">
                    {group.empty && country === "all"
                      ? group.empty
                      : `No ${group.title.toLowerCase()} listed for this country yet.`}
                  </li>
                )}
                {group.role !== "Funder" ? (
                  <li>
                    <a
                      href="#become"
                      className="flex h-full flex-col justify-center border border-dashed border-atf-gray-500 p-6 text-sm text-atf-gray-500 transition-colors hover:border-primary hover:text-primary"
                    >
                      <strong className="text-atf-ink">Your organisation here.</strong>
                      Become a partner →
                    </a>
                  </li>
                ) : null}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PartnerTile({ partner }: { partner: Partner }) {
  return (
    <li className="flex items-center gap-4 border border-atf-gray-200 bg-white p-5">
      <div className="flex size-16 shrink-0 items-center justify-center bg-atf-gray-50">
        {partner.logo ? (
          <img src={partner.logo} alt={`${partner.name} logo`} className="max-h-12 max-w-full object-contain" />
        ) : (
          <span aria-hidden="true" className="font-display text-sm font-black text-atf-gray-500">
            {partner.name.slice(0, 2).toUpperCase()}
          </span>
        )}
      </div>
      <div>
        <p className="font-display text-base font-black uppercase leading-tight text-atf-black">{partner.name}</p>
        <p className="mt-1 text-xs text-atf-gray-500">
          {partner.note || partner.role}
          {partner.country !== "All" ? ` · ${partner.country}` : ""}
        </p>
      </div>
    </li>
  );
}
