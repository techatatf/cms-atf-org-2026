import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, FileText } from "lucide-react";

import { ArrowLink, CalloutBox, InfoCellGrid } from "@/components/site/ContentBlocks";
import { OpportunityButton } from "@/components/site/OpportunityButton";
import { ContentBand, SectionHeader, SubpageTemplate } from "@/components/site/Page";
import { SectionSubnav, sectionAnchorStyle } from "@/components/site/SectionSubnav";
import { ATF_EMAIL, reports, type Report } from "@/lib/who-we-are-data";
import { homeCrumb, whoWeAreCrumb } from "@/components/site/SubpageBreadcrumb";

export const Route = createFileRoute("/annual-reports")({
  component: AnnualReportsPage,
});

const subnav = [
  { id: "latest", label: "Latest" },
  { id: "archive", label: "All Reports" },
  { id: "contents", label: "What Reports Cover" },
  { id: "request", label: "Request Documents" },
] as const;

const contents = [
  { title: "Programmes", body: "What the Challenge, chapters, and consulting delivered, with the numbers behind it." },
  { title: "Finances", body: "Income, spending, and the financial statements for the year." },
  { title: "Governance", body: "Board membership, decisions, and changes to how ATF is run." },
  { title: "Partners", body: "The funders and institutions that supported the year's work." },
] as const;

const tagClass = "font-display text-[11px] font-bold uppercase tracking-[0.08em] text-primary";

function AnnualReportsPage() {
  const latest = reports.find((report) => report.type === "Annual report");

  return (
    <SubpageTemplate
      hero={{
        breadcrumb: [homeCrumb, whoWeAreCrumb, { label: "Annual Reports" }],
        title: "Annual reports.",
        titleAccent: "reports",
        description:
          "What ATF did each year, what it cost, and who paid for it. Reports and financial statements are published here once the Board of Directors approves them.",
      }}
    >
      <SectionSubnav items={subnav} />

      <ContentBand id="latest" style={sectionAnchorStyle}>
        <div className="grid gap-10 md:grid-cols-[0.6fr_1fr] md:items-center">
          <div
            aria-hidden="true"
            className="flex aspect-[3/4] max-w-xs items-center justify-center bg-atf-gray-100 text-atf-gray-500"
          >
            <FileText className="size-12" />
          </div>
          {latest ? <LatestReport report={latest} /> : <FirstReportPending />}
        </div>
      </ContentBand>

      <ContentBand id="archive" muted style={sectionAnchorStyle}>
        <SectionHeader
          eyebrow="All Reports"
          title="Reports and financial statements."
          body="Every report we publish stays here. Download any of them as a PDF."
        />
        <div className="overflow-x-auto">
          <table className={`w-full border-collapse ${reports.length ? "min-w-[32rem]" : ""} bg-white text-left text-sm`}>
            <thead>
              <tr className="border-b border-atf-gray-200 font-display text-[11px] uppercase tracking-[0.08em] text-atf-gray-500">
                <th className="p-4 font-bold">Year</th>
                <th className="p-4 font-bold">Document</th>
                <th className="p-4 font-bold">Type</th>
                <th className="p-4">
                  <span className="sr-only">Download</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {reports.length ? (
                reports.map((report) => (
                  <tr key={report.file} className="border-b border-atf-gray-200">
                    <td className="p-4 font-display font-black text-atf-black">{report.year}</td>
                    <td className="p-4 font-semibold text-atf-ink">{report.title}</td>
                    <td className="p-4">
                      <span className="border border-atf-gray-200 px-2 py-1 text-xs text-atf-gray-500">{report.type}</span>
                    </td>
                    <td className="p-4 text-right">
                      <a className="atf-link" href={report.file} download>
                        PDF <ArrowRight className="size-3.5" aria-hidden="true" />
                      </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-atf-gray-500">
                    No reports published yet. The first will appear here.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </ContentBand>

      <ContentBand id="contents" style={sectionAnchorStyle}>
        <SectionHeader
          eyebrow="What Reports Cover"
          title="Four things, every year."
          body="Each annual report follows the same structure, so one year can be read against the next."
        />
        <InfoCellGrid cells={contents} />
      </ContentBand>

      <ContentBand id="request" muted style={sectionAnchorStyle}>
        <CalloutBox
          dark
          title="Need a document that isn't listed?"
          body="Funders and partners can request registration documents or financial statements by email."
          action={
            <OpportunityButton
              href={`mailto:${ATF_EMAIL}?subject=Document%20request`}
              variant="inverse"
              className="max-w-full whitespace-normal break-all py-2 text-center"
            >
              Email {ATF_EMAIL}
            </OpportunityButton>
          }
        />
      </ContentBand>
    </SubpageTemplate>
  );
}

function LatestReport({ report }: { report: Report }) {
  return (
    <div>
      <p className={tagClass}>Latest report</p>
      <h2 className="atf-section-title mt-3">{report.title}</h2>
      {report.summary ? <p className="atf-body mt-4">{report.summary}</p> : null}
      <dl className="mt-6 flex flex-wrap gap-8">
        <div>
          <dt className="text-xs uppercase text-atf-gray-500">Year</dt>
          <dd className="font-display text-xl font-black">{report.year}</dd>
        </div>
        {report.pages ? (
          <div>
            <dt className="text-xs uppercase text-atf-gray-500">Pages</dt>
            <dd className="font-display text-xl font-black">{report.pages}</dd>
          </div>
        ) : null}
        <div>
          <dt className="text-xs uppercase text-atf-gray-500">Format</dt>
          <dd className="font-display text-xl font-black">PDF</dd>
        </div>
      </dl>
      {/* Plain anchor: report files are static assets, not router paths. */}
      <a href={report.file} download className="atf-link mt-8">
        Download the report <ArrowRight className="size-3.5" aria-hidden="true" />
      </a>
    </div>
  );
}

function FirstReportPending() {
  return (
    <div>
      <p className={tagClass}>First report</p>
      <h2 className="atf-section-title mt-3">Our first annual report is in preparation.</h2>
      <p className="atf-body mt-4">
        It will cover ATF’s programmes, finances, governance, and partners for the year, and will
        be published here once the Board approves it.
      </p>
      <div className="mt-8">
        <ArrowLink href={`mailto:${ATF_EMAIL}?subject=Notify%20me%3A%20annual%20report`}>
          Email me when it’s out
        </ArrowLink>
      </div>
    </div>
  );
}
