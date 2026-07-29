import { useState } from "react";
import { ArrowRight, X } from "lucide-react";

import { OpportunityButton } from "@/components/site/OpportunityButton";

const announcement = {
  label: "New",
  title: "ATF Challenge 2026",
  body: "AI School registration is now closed. The build phase begins this September.",
  href: "https://bit.ly/atf-wf",
  action: "Follow the journey",
};

export function ChallengeAnnouncementBanner() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="relative border-b border-white/10 bg-atf-black text-white">
      <div className="flex min-h-[46px] items-center justify-start gap-1 py-2 pl-4 pr-12 sm:gap-3 lg:justify-center lg:gap-[18px] lg:px-14 lg:py-0">
        <OpportunityButton
          href={announcement.href}
          variant="primary"
          size="sm"
          density="compact"
          target="_blank"
          rel="noreferrer"
          className="shrink-0"
        >
          {announcement.label}
        </OpportunityButton>
        <p className="flex min-w-0 flex-1 items-baseline gap-1.5 text-[10.5px] leading-5 text-white/80 sm:text-[13px] lg:flex-none lg:text-[13.5px]">
          <strong className="min-w-0 truncate whitespace-nowrap font-semibold text-white sm:shrink-0">
            {announcement.title}
          </strong>
          <span className="hidden min-w-0 truncate sm:block">
            — {announcement.body}
          </span>
        </p>
        <a
          href={announcement.href}
          target="_blank"
          rel="noreferrer"
          className="inline-flex shrink-0 items-center gap-1.5 border-b-2 border-primary pb-0.5 font-display text-[9.5px] font-bold uppercase text-white transition-colors hover:text-atf-red-bright focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-atf-black sm:text-[11px]"
        >
          {announcement.action}
          <ArrowRight className="hidden size-3.5 sm:block" aria-hidden="true" />
        </a>
      </div>
      <button
        type="button"
        className="absolute right-4 top-1/2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-atf-black"
        aria-label="Dismiss announcement"
        onClick={() => setVisible(false)}
      >
        <X className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}
