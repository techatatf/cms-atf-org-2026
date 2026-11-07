import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";

import { AppLink } from "@/components/site/AppLink";
import { OpportunityButton } from "@/components/site/OpportunityButton";
import { DiagonalAccentSection } from "@/components/site/Page";
import { cn } from "@/lib/utils";

/** Text link with a trailing arrow, e.g. "Board profiles →". */
export function ArrowLink({
  href,
  children,
  light = false,
  className,
}: {
  href: string;
  children: ReactNode;
  light?: boolean;
  className?: string;
}) {
  const external = href.startsWith("http");
  return (
    <AppLink
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener" : undefined}
      className={cn("atf-link group", light && "text-white hover:text-white/80", className)}
    >
      {children}
      <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
    </AppLink>
  );
}

/** Grid of short title + body cells, e.g. board responsibilities. */
export function InfoCellGrid({
  cells,
  columns = 4,
}: {
  cells: readonly { title: string; body: ReactNode; eyebrow?: string }[];
  columns?: 3 | 4;
}) {
  return (
    <div
      className={cn(
        "grid gap-px border border-atf-gray-200 bg-atf-gray-200 sm:grid-cols-2",
        columns === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3",
      )}
    >
      {cells.map((cell) => (
        <div key={cell.title} className="bg-white p-6 lg:p-8">
          {cell.eyebrow ? (
            <p className="mb-3 font-display text-[11px] font-bold uppercase tracking-[0.08em] text-primary">
              {cell.eyebrow}
            </p>
          ) : null}
          <h3 className="font-display text-lg font-black uppercase leading-tight text-atf-black">
            {cell.title}
          </h3>
          <p className="mt-3 text-sm leading-7 text-atf-gray-500">{cell.body}</p>
        </div>
      ))}
    </div>
  );
}

/** Label/value pairs, e.g. "Registered in — Ghana". */
export function FactGrid({
  facts,
  dark = false,
}: {
  facts: readonly { label: string; value: string }[];
  dark?: boolean;
}) {
  return (
    <dl
      className={cn(
        "grid gap-px border sm:grid-cols-2 lg:grid-cols-4",
        dark ? "border-white/10 bg-white/10" : "border-atf-gray-200 bg-atf-gray-200",
      )}
    >
      {facts.map((fact) => (
        <div key={fact.label} className={cn("p-5", dark ? "bg-atf-black" : "bg-white")}>
          <dt
            className={cn(
              "font-display text-[11px] font-bold uppercase tracking-[0.08em]",
              dark ? "text-white/55" : "text-atf-gray-500",
            )}
          >
            {fact.label}
          </dt>
          <dd
            className={cn(
              "mt-2 font-display text-xl font-black uppercase leading-tight",
              dark ? "text-white" : "text-atf-black",
            )}
          >
            {fact.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** Bordered box with a heading, a sentence, and one action. */
export function CalloutBox({
  title,
  body,
  action,
  dark = false,
}: {
  title: string;
  body: ReactNode;
  action: ReactNode;
  dark?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-6 border p-8 md:flex-row md:items-center md:justify-between",
        dark ? "border-atf-black bg-atf-black text-white" : "border-atf-gray-200 bg-white",
      )}
    >
      <div className="max-w-2xl">
        <h3
          className={cn(
            "font-display text-2xl font-black uppercase leading-tight",
            dark ? "text-white" : "text-atf-black",
          )}
        >
          {title}
        </h3>
        <p className={cn("mt-3 text-sm leading-7", dark ? "text-white/65" : "text-atf-gray-500")}>
          {body}
        </p>
      </div>
      <div className="shrink-0">{action}</div>
    </div>
  );
}

/** Closing band with a headline and up to two buttons. */
export function CtaBand({
  title,
  actions,
}: {
  title: string;
  actions: readonly { label: string; href: string }[];
}) {
  return (
    <DiagonalAccentSection>
      <h2 className="font-display text-4xl font-black uppercase leading-tight md:text-5xl">{title}</h2>
      <div className="flex flex-wrap gap-4 lg:justify-end">
        {actions.map((action, index) => (
          <OpportunityButton
            key={action.label}
            href={action.href}
            size="lg"
            variant={index === 0 ? "inverse" : "inverseOutline"}
          >
            {action.label}
          </OpportunityButton>
        ))}
      </div>
    </DiagonalAccentSection>
  );
}

/** Horizontal list of partner or domain names, shown as plain labels. */
export function NameTags({ names, dark = false }: { names: readonly string[]; dark?: boolean }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {names.map((name) => (
        <li
          key={name}
          className={cn(
            "border px-3 py-2 font-display text-xs font-bold uppercase",
            dark ? "border-white/15 text-white/80" : "border-atf-gray-200 text-atf-ink",
          )}
        >
          {name}
        </li>
      ))}
    </ul>
  );
}
