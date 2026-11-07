import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowLeft, ArrowRight, X } from "lucide-react";

import { FilterChip } from "@/components/site/Page";
import { OpportunityButton } from "@/components/site/OpportunityButton";
import { personInitials, type Person } from "@/lib/who-we-are-data";
import { cn } from "@/lib/utils";

/** A person plus the team label shown in their profile, e.g. "Board of Directors". */
export type ProfileEntry = Person & { team: string };

function Portrait({ name, size = "lg" }: { name: string; size?: "sm" | "lg" }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "flex items-center justify-center bg-atf-black font-display font-black text-white",
        size === "lg" ? "aspect-[4/5] w-full text-4xl" : "size-12 shrink-0 text-sm",
      )}
    >
      {personInitials(name)}
    </div>
  );
}

function LinkedInLink({ person }: { person: Person }) {
  if (!person.linkedin) return null;
  return (
    <a
      href={person.linkedin}
      target="_blank"
      rel="noopener"
      className="atf-link mt-3"
      onClick={(event) => event.stopPropagation()}
    >
      LinkedIn
    </a>
  );
}

/**
 * Shared state for opening one profile at a time, stepping through the
 * people currently visible on the page.
 */
export function useProfileViewer() {
  const [state, setState] = useState<{ list: ProfileEntry[]; index: number } | null>(null);
  return {
    open: (list: ProfileEntry[], index: number) => setState({ list, index }),
    dialog: (
      <PersonProfileDialog
        state={state}
        onClose={() => setState(null)}
        onStep={(step) =>
          setState((current) =>
            current
              ? { ...current, index: (current.index + step + current.list.length) % current.list.length }
              : current,
          )
        }
      />
    ),
  };
}

function PersonProfileDialog({
  state,
  onClose,
  onStep,
}: {
  state: { list: ProfileEntry[]; index: number } | null;
  onClose: () => void;
  onStep: (step: number) => void;
}) {
  const person = state ? state.list[state.index] : null;

  return (
    <Dialog.Root open={Boolean(person)} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-atf-black/70" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed left-1/2 top-1/2 z-50 max-h-[90dvh] w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto bg-white text-atf-ink shadow-xl"
        >
          {person && state ? (
            <div className="grid sm:grid-cols-[0.8fr_1.2fr]">
              <div className="hidden sm:block">
                <Portrait name={person.name} />
              </div>
              <div className="flex flex-col p-6 sm:p-8">
                <p className="font-display text-[11px] font-bold uppercase tracking-[0.08em] text-primary">
                  {person.team}
                </p>
                <Dialog.Title className="mt-3 font-display text-3xl font-black uppercase leading-tight text-atf-black">
                  {person.name}
                </Dialog.Title>
                <p className="mt-2 font-semibold text-atf-ink">{person.role}</p>
                <p className="atf-body mt-4">{person.bio}</p>
                {person.linkedin ? (
                  <OpportunityButton
                    href={person.linkedin}
                    target="_blank"
                    rel="noopener"
                    variant="outline"
                    className="mt-6 self-start"
                  >
                    LinkedIn
                  </OpportunityButton>
                ) : null}
                <div className="mt-auto flex items-center justify-between gap-4 border-t border-atf-gray-200 pt-5 sm:mt-10">
                  <button
                    type="button"
                    aria-label="Previous person"
                    onClick={() => onStep(-1)}
                    className="atf-link"
                  >
                    <ArrowLeft className="size-3.5" aria-hidden="true" /> Previous
                  </button>
                  <span className="text-sm text-atf-gray-500">
                    {state.index + 1} / {state.list.length}
                  </span>
                  <button
                    type="button"
                    aria-label="Next person"
                    onClick={() => onStep(1)}
                    className="atf-link"
                  >
                    Next <ArrowRight className="size-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          ) : null}
          <Dialog.Close
            aria-label="Close"
            className="absolute right-3 top-3 inline-flex size-10 items-center justify-center bg-white text-atf-ink hover:text-primary"
          >
            <X className="size-5" aria-hidden="true" />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/** Large cards for a small group, e.g. the board. */
export function PersonCardGrid({
  people,
  onOpen,
}: {
  people: readonly Person[];
  onOpen: (index: number) => void;
}) {
  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {people.map((person, index) => (
        <li key={person.slug} className="flex flex-col border border-atf-gray-200 bg-white">
          <button
            type="button"
            onClick={() => onOpen(index)}
            aria-label={`View profile: ${person.name}`}
            className="group text-left"
          >
            <Portrait name={person.name} />
            <div className="p-5">
              <p className="font-display text-[11px] font-bold uppercase tracking-[0.08em] text-primary">
                {person.role}
              </p>
              <p className="mt-2 font-display text-xl font-black uppercase leading-tight text-atf-black group-hover:text-primary">
                {person.name}
              </p>
              <p className="mt-3 text-sm leading-6 text-atf-gray-500">{person.bio}</p>
            </div>
          </button>
          <div className="px-5 pb-5 empty:hidden">
            <LinkedInLink person={person} />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Filterable list of people grouped by team. */
export function PeopleMasthead<G extends string>({
  people,
  groups,
  onOpen,
}: {
  people: readonly (Person & { group: G })[];
  groups: readonly G[];
  onOpen: (visible: (Person & { group: G })[], index: number) => void;
}) {
  const [filter, setFilter] = useState<G | "all">("all");
  const visible = people.filter((person) => filter === "all" || person.group === filter);
  const count = (group: G | "all") =>
    group === "all" ? people.length : people.filter((person) => person.group === group).length;

  return (
    <div>
      <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label="Filter team">
        {(["all", ...groups] as const).map((group) => (
          <FilterChip key={group} active={filter === group} onClick={() => setFilter(group)}>
            {group === "all" ? "All" : group} <span className="ml-1 opacity-60">{count(group)}</span>
          </FilterChip>
        ))}
      </div>
      <div className="hidden grid-cols-[3rem_1fr_1fr_2fr] gap-6 border-b border-atf-gray-200 pb-3 font-display text-[11px] font-bold uppercase tracking-[0.08em] text-atf-gray-500 md:grid" aria-hidden="true">
        <span />
        <span>Name</span>
        <span>Role</span>
        <span>Responsibility</span>
      </div>
      <ul className="divide-y divide-atf-gray-200 border-b border-atf-gray-200">
        {visible.map((person, index) => (
          <li key={person.slug}>
            <button
              type="button"
              onClick={() => onOpen(visible, index)}
              aria-label={`View profile: ${person.name}`}
              className="group grid w-full grid-cols-[3rem_1fr] items-center gap-x-6 gap-y-1 py-4 text-left transition-colors hover:bg-white md:grid-cols-[3rem_1fr_1fr_2fr]"
            >
              <Portrait name={person.name} size="sm" />
              <span className="font-display text-base font-black uppercase text-atf-black group-hover:text-primary">
                {person.name}
              </span>
              <span className="col-start-2 text-sm font-semibold text-atf-ink md:col-start-auto">
                {person.role}
              </span>
              <span className="col-start-2 text-sm leading-6 text-atf-gray-500 md:col-start-auto">
                {person.bio}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
