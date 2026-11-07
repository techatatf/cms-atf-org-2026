import { createFileRoute } from "@tanstack/react-router";

import { ArticleCard, ContentBand, SubpageTemplate } from "@/components/site/Page";
import { homeCrumb } from "@/components/site/SubpageBreadcrumb";

export const Route = createFileRoute("/terms-of-service")({
  component: TermsOfServicePage,
});

const sections = [
  {
    title: "Acceptance of Terms",
    content:
      "By accessing or using ATF services, you agree to be bound by these Terms of Service.",
  },
  {
    title: "Use of Services",
    content:
      "You agree to use ATF services only for lawful purposes and in accordance with these terms.",
  },
  {
    title: "Intellectual Property",
    content:
      "ATF content, trademarks, and intellectual property may not be used without permission.",
  },
  {
    title: "User Content",
    content:
      "You retain ownership of content you submit while granting ATF a license to use it in connection with programs and services.",
  },
  {
    title: "Limitation of Liability",
    content:
      "ATF is not liable for indirect, incidental, or consequential damages arising from use of its services.",
  },
  {
    title: "Changes to Terms",
    content:
      "ATF may update these terms from time to time. Continued use of services constitutes acceptance of updated terms.",
  },
  {
    title: "Governing Law",
    content:
      "These terms are governed by the laws of Ghana. Disputes shall be resolved in Accra, Ghana.",
  },
];

function TermsOfServicePage() {
  return (
    <SubpageTemplate
      muted
      hero={{
        breadcrumb: [homeCrumb, { label: "Terms of Service" }],
        title: "Terms of Service",
        description:
          "Last updated: January 1, 2026. Please read these terms carefully before using African Technology Forum services.",
      }}
    >
      <ContentBand>
        <div className="mx-auto grid max-w-3xl gap-5">
          {sections.map((section) => (
            <ArticleCard
              key={section.title}
              title={section.title}
              description={section.content}
            />
          ))}
        </div>
      </ContentBand>
    </SubpageTemplate>
  );
}
