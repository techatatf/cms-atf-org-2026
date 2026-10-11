import { Link } from "@tanstack/react-router";

import { truncateAtWord } from "@/lib/truncate-at-word";

export const BREADCRUMB_LABEL_MAX_CHARS = 20;

export type BreadcrumbEntry = { label: string; href?: string };

export function SubpageBreadcrumb({ entries }: { entries: BreadcrumbEntry[] }) {
  return (
    <nav aria-label="Breadcrumb" className="border-b border-atf-gray-200 bg-white">
      <ol className="atf-container flex min-w-0 items-center gap-3 overflow-hidden py-4 font-display text-[11px] font-bold uppercase tracking-[0.12em] text-atf-gray-500">
        {entries.map((entry, index) => (
          <li key={`${entry.href ?? "current"}-${index}`} className={entry.href ? "flex shrink-0 items-center gap-3" : "flex min-w-0 flex-1 items-center gap-3 overflow-hidden"}>
            {index > 0 ? <span aria-hidden="true" className="shrink-0 text-atf-gray-300">/</span> : null}
            {entry.href ? (
              <Link to={entry.href as never} activeOptions={{ exact: true }} className="shrink-0 hover:text-primary focus-visible:text-primary">
                {entry.label}
              </Link>
            ) : (
              <CurrentPageLabel label={entry.label} />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

function CurrentPageLabel({ label }: { label: string }) {
  const shortLabel = truncateAtWord(label, BREADCRUMB_LABEL_MAX_CHARS);

  return (
    <span aria-current="page" className="block min-w-0 truncate text-atf-ink" title={label}>
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
