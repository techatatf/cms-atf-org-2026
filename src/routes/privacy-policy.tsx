import { createFileRoute } from "@tanstack/react-router";

import { ArticleCard, ContentBand, SubpageTemplate } from "@/components/site/Page";
import { homeCrumb } from "@/components/site/SubpageBreadcrumb";

export const Route = createFileRoute("/privacy-policy")({
  component: PrivacyPolicyPage,
});

const sections = [
  {
    title: "Information We Collect",
    content:
      "We collect information you provide directly to us, such as newsletter subscriptions, program applications, event registrations, and support requests.",
  },
  {
    title: "How We Use Your Information",
    content:
      "We use collected information to provide programs, communicate with participants, improve services, and protect ATF and its users.",
  },
  {
    title: "Information Sharing",
    content:
      "We do not sell personal information. We share information only with service providers, program partners, or where required by law.",
  },
  {
    title: "Data Security",
    content:
      "We take reasonable measures to protect personal information from loss, theft, misuse, and unauthorized access.",
  },
  {
    title: "Your Rights",
    content:
      "You may request access, correction, or deletion of personal information by contacting ATF.",
  },
  {
    title: "Contact Us",
    content:
      "Questions about this Privacy Policy can be sent to privacy@atfglobal.org.",
  },
];

function PrivacyPolicyPage() {
  return (
    <SubpageTemplate
      muted
      hero={{
        breadcrumb: [homeCrumb, { label: "Privacy Policy" }],
        title: "Privacy Policy",
        description:
          "Last updated: January 1, 2026. This policy explains how African Technology Forum collects, uses, and protects information.",
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
