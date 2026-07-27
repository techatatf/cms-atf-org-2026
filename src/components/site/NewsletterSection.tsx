import { useRef, useState, type FormEvent } from "react";
import {
  CircleCheck,
  LoaderCircle,
  Mail,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";

import { OpportunityButton } from "@/components/site/OpportunityButton";
import {
  DiagonalAccentSection,
  Eyebrow,
} from "@/components/site/Page";
import { captureAnalyticsEvent } from "@/lib/analytics";
import { subscribeToNewsletter } from "@/services/newsletter";

const newsletterAnchorStyle = {
  scrollMarginTop: "var(--atf-header-height, 76px)",
};

const emailShape = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type SubmissionState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

type FeedbackPresentation = {
  className: string;
  icon: LucideIcon;
  iconClassName: string;
  label?: string;
  message: string;
};

function getFeedbackPresentation(
  submission: SubmissionState,
): FeedbackPresentation | undefined {
  switch (submission.status) {
    case "idle":
      return undefined;
    case "submitting":
      return {
        className: "border-white bg-atf-black text-white",
        icon: LoaderCircle,
        iconClassName: "animate-spin",
        message: "Subscribing…",
      };
    case "success":
      return {
        className: "border-[var(--color-success)] bg-white text-atf-ink",
        icon: CircleCheck,
        iconClassName: "text-[var(--color-success)]",
        label: "Success",
        message: submission.message,
      };
    case "error":
      return {
        className: "border-[var(--color-error)] bg-white text-atf-ink",
        icon: TriangleAlert,
        iconClassName: "text-[var(--color-error)]",
        label: "Error",
        message: submission.message,
      };
  }
}

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [submission, setSubmission] = useState<SubmissionState>({
    status: "idle",
  });
  const requestPending = useRef(false);

  const isSubmitting = submission.status === "submitting";
  const feedback = getFeedbackPresentation(submission);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (requestPending.current) return;

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setSubmission({
        status: "error",
        message: "Email address is required",
      });
      return;
    }

    if (!emailShape.test(trimmedEmail)) {
      setSubmission({
        status: "error",
        message: "Please enter a valid email address",
      });
      return;
    }

    requestPending.current = true;
    setSubmission({ status: "submitting" });

    try {
      const result = await subscribeToNewsletter(trimmedEmail);

      if (result.success) {
        setEmail("");
        setSubmission({
          status: "success",
          message:
            result.message ?? "Successfully subscribed to our newsletter!",
        });
        captureAnalyticsEvent("newsletter_subscribed", {
          page: "home",
          form_type: "newsletter",
          email_domain: trimmedEmail.split("@")[1].toLowerCase(),
        });
      } else {
        setSubmission({
          status: "error",
          message: result.message ?? "Failed to subscribe. Please try again.",
        });
      }
    } catch {
      setSubmission({
        status: "error",
        message: "Failed to subscribe. Please try again.",
      });
    } finally {
      requestPending.current = false;
    }
  }

  function handleEmailChange(value: string) {
    if (requestPending.current) return;

    setEmail(value);
    if (submission.status === "success" || submission.status === "error") {
      setSubmission({ status: "idle" });
    }
  }

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
        <form
          className="flex min-w-0 flex-col gap-3 sm:flex-row"
          noValidate
          onSubmit={handleSubmit}
        >
          <label className="sr-only" htmlFor="newsletter-email">
            Email address
          </label>
          <input
            id="newsletter-email"
            type="email"
            value={email}
            readOnly={isSubmitting}
            onChange={(event) => handleEmailChange(event.target.value)}
            placeholder="Enter your email"
            className="min-h-12 min-w-0 flex-1 border border-atf-gray-200 bg-white px-4 text-atf-ink outline-none placeholder:text-atf-gray-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
          />
          <OpportunityButton
            type="submit"
            variant="inverse"
            size="lg"
            className="w-full sm:w-auto"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Subscribing…" : "Subscribe"}
          </OpportunityButton>
        </form>
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          data-newsletter-status={submission.status}
          className={
            feedback
              ? `mt-4 flex items-start gap-3 border px-4 py-3 ${feedback.className}`
              : undefined
          }
        >
          {feedback && (
            <>
              <feedback.icon
                className={`mt-0.5 size-5 shrink-0 ${feedback.iconClassName}`}
                aria-hidden="true"
              />
              <p className="text-sm leading-6">
                {feedback.label ? (
                  <>
                    <strong className="font-display uppercase">
                      {feedback.label}
                    </strong>
                    <span className="ml-2">{feedback.message}</span>
                  </>
                ) : (
                  feedback.message
                )}
              </p>
            </>
          )}
        </div>
      </div>
    </DiagonalAccentSection>
  );
}
