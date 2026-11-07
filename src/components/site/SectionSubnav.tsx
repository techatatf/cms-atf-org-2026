import { useEffect, useState, type CSSProperties } from "react";

import { cn } from "@/lib/utils";

export type SectionSubnavItem = { id: string; label: string };

const SUBNAV_HEIGHT = "3.25rem";
const ACTIVE_OFFSET_PX = 200;

/**
 * Apply to each section a subnav links to, so anchor jumps land below the
 * sticky header and the subnav.
 */
export const sectionAnchorStyle: CSSProperties = {
  scrollMarginTop: `calc(var(--atf-header-height, 76px) + ${SUBNAV_HEIGHT})`,
};

export function activeSectionId(
  ids: readonly string[],
  offsets: Record<string, number>,
  scrollY: number,
) {
  let current = ids[0];
  for (const id of ids) {
    if (id in offsets && offsets[id] <= scrollY + ACTIVE_OFFSET_PX) current = id;
  }
  return current;
}

/** Sticky in-page navigation that highlights the section in view. */
export function SectionSubnav({ items }: { items: readonly SectionSubnavItem[] }) {
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    const ids = items.map((item) => item.id);
    const sync = () => {
      const offsets: Record<string, number> = {};
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el) offsets[id] = el.getBoundingClientRect().top + window.scrollY;
      }
      setActive(activeSectionId(ids, offsets, window.scrollY));
    };
    sync();
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [items]);

  return (
    <nav
      aria-label="On this page"
      className="sticky z-40 border-b border-atf-gray-200 bg-white/95 backdrop-blur"
      style={{ top: "var(--atf-header-height, 76px)" }}
    >
      <div
        className="atf-container flex items-center gap-6 overflow-x-auto [scrollbar-width:none]"
        style={{ minHeight: SUBNAV_HEIGHT }}
      >
        {items.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            aria-current={active === item.id ? "location" : undefined}
            className={cn(
              "shrink-0 border-b-2 py-4 font-display text-[11px] font-bold uppercase tracking-[0.12em] transition-colors",
              active === item.id
                ? "border-primary text-atf-ink"
                : "border-transparent text-atf-gray-500 hover:text-primary",
            )}
          >
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
