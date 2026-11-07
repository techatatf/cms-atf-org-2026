import { useLinkProps } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { truncateAtWord } from "@/lib/truncate-at-word";
import { cn } from "@/lib/utils";

export const BREADCRUMB_LABEL_MAX_CHARS = 20;

export type BreadcrumbEntry = { label: string; href?: string };

/**
 * `bar` is the standalone strip used above content (e.g. the Newsroom).
 * `hero` sits inside a dark Page Hero, matching the design reference.
 */
export function SubpageBreadcrumb({
  entries,
  tone = "bar",
}: {
  entries: BreadcrumbEntry[];
  tone?: "bar" | "hero";
}) {
  const isHero = tone === "hero";
  return (
    <nav aria-label="Breadcrumb" className={isHero ? "mb-8" : "border-b border-atf-gray-200 bg-white"}>
      <ol
        className={cn(
          "flex min-w-0 items-center overflow-hidden font-display text-[11px] uppercase",
          isHero
            ? "gap-2.5 font-semibold tracking-[0.16em] text-white/45"
            : "atf-container gap-3 py-4 font-bold tracking-[0.12em] text-atf-gray-500",
        )}
      >
        {entries.map((entry, index) => (
          <li
            key={`${entry.href ?? "current"}-${index}`}
            className={cn(
              "flex items-center",
              isHero ? "gap-2.5" : "gap-3",
              index === entries.length - 1 ? "min-w-0 flex-1 overflow-hidden" : "shrink-0",
            )}
          >
            {index > 0 ? (
              <span aria-hidden="true" className={cn("shrink-0", !isHero && "text-atf-gray-300")}>
                /
              </span>
            ) : null}
            {entry.href ? (
              <CrumbLink
                href={entry.href}
                className={cn(
                  "shrink-0",
                  isHero
                    ? "hover:text-white focus-visible:text-white"
                    : "hover:text-primary focus-visible:text-primary",
                )}
              >
                {entry.label}
              </CrumbLink>
            ) : index === entries.length - 1 ? (
              <CurrentPageLabel label={entry.label} tone={tone} />
            ) : (
              <span className="shrink-0">{entry.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/**
 * A router link that never marks itself as the current page. A section crumb
 * can point at the page being viewed (e.g. "Who We Are" on Mission & Story),
 * but only the last crumb is the current page.
 */
function CrumbLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  const { "aria-current": _ariaCurrent, ...linkProps } = useLinkProps({
    to: href as never,
    className,
  });
  return <a {...linkProps}>{children}</a>;
}

function CurrentPageLabel({ label, tone }: { label: string; tone: "bar" | "hero" }) {
  // The hero has room for full labels; only the standalone bar shortens them.
  const shortLabel = tone === "hero" ? label : truncateAtWord(label, BREADCRUMB_LABEL_MAX_CHARS);

  return (
    <span
      aria-current="page"
      className={cn("block min-w-0 truncate", tone === "bar" && "text-atf-ink")}
      title={label}
    >
      {shortLabel === label ? (
        label
      ) : (
        <>
          <span aria-hidden="true">{shortLabel}</span>
          <span className="sr-only">{label}</span>
        </>
      )}
    </span>
  );
}

export const homeCrumb: BreadcrumbEntry = { label: "Home", href: "/" };

/** Section crumbs lead to each section's entry page: its first dropdown page. */
export const whoWeAreCrumb: BreadcrumbEntry = { label: "Who We Are", href: "/about" };
export const whatWeDoCrumb: BreadcrumbEntry = { label: "What We Do", href: "/consulting" };
export const whereWeWorkCrumb: BreadcrumbEntry = { label: "Where We Work", href: "/where-we-work" };
export const publicationsCrumb: BreadcrumbEntry = { label: "Publications", href: "/publications" };

export const newsroomBreadcrumb: BreadcrumbEntry[] = [
  { label: "Home", href: "/" },
  { label: "Newsroom" },
];

export function newsArticleBreadcrumb(title?: string): BreadcrumbEntry[] {
  return [
    { label: "Home", href: "/" },
    { label: "Newsroom", href: "/news" },
    ...(title ? [{ label: title }] : []),
  ];
}
