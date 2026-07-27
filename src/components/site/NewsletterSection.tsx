import { useState } from "react";
import { Mail } from "lucide-react";

import { OpportunityButton } from "@/components/site/OpportunityButton";
import {
  DiagonalAccentSection,
  Eyebrow,
} from "@/components/site/Page";

const newsletterAnchorStyle = {
  scrollMarginTop: "var(--atf-header-height, 76px)",
};

export function NewsletterSection() {
  const [email, setEmail] = useState("");

  return (
    <DiagonalAccentSection id="newsletter" style={newsletterAnchorStyle}>
      <div>
        <Eyebrow light>Newsletter</Eyebrow>
        <div className="mb-6 inline-flex size-14 items-center justify-center bg-primary text-white">
          <Mail className="size-7" aria-hidden="true" />
        </div>
        <h2 className="atf-section-title text-white">Stay Connected</h2>
        <p className="mt-5 max-w-xl text-base leading-7 text-white/70">
          Subscribe for the latest research highlights, event invitations, and
          ecosystem news delivered straight to your inbox.
        </p>
      </div>

      <div className="bg-primary p-6 sm:p-8 lg:bg-transparent lg:pl-16 lg:pr-0">
        <p
          className="mb-5 border border-white/50 bg-atf-black px-4 py-3 font-display text-xs font-bold uppercase text-white"
          data-newsletter-review-marker
        >
          Prototype review — subscription is not live
        </p>
        <form
          className="flex min-w-0 flex-col gap-3 sm:flex-row"
          noValidate
          onSubmit={(event) => event.preventDefault()}
        >
          <label className="sr-only" htmlFor="newsletter-email">
            Email address
          </label>
          <input
            id="newsletter-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter your email"
            className="min-h-12 min-w-0 flex-1 border border-atf-gray-200 bg-white px-4 text-atf-ink outline-none placeholder:text-atf-gray-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
          />
          <OpportunityButton
            type="submit"
            variant="inverse"
            size="lg"
            className="w-full sm:w-auto"
          >
            Subscribe
          </OpportunityButton>
        </form>
      </div>
    </DiagonalAccentSection>
  );
}
