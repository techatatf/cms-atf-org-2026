import { useState } from "react";

import { AFRICA_MAP_VIEWBOX, africaCountries } from "@/lib/africa-map-data";
import { cn } from "@/lib/utils";

export type CountryStatus = "active" | "scaling" | "past";

export type MapRegion = {
  iso: string;
  name: string;
  status: CountryStatus;
  description: string;
};

const statusFill: Record<CountryStatus, string> = {
  active: "var(--atf-red)",
  scaling: "#7A1426",
  past: "#4A4A50",
};

const statusLabel: Record<CountryStatus, string> = {
  active: "Active",
  scaling: "Scaling",
  past: "Past chapter",
};

/** Label nudges so small neighbouring countries don't collide. */
const labelOffset: Record<string, [number, number]> = {
  BEN: [-2, -26],
  GHA: [0, 22],
};

/**
 * Map of Africa with ATF's countries highlighted, beside a legend. Hovering a
 * legend row dims the other highlighted countries.
 */
export function AfricaMap({ regions }: { regions: readonly MapRegion[] }) {
  const [focused, setFocused] = useState<string | null>(null);
  const byIso = new Map(regions.map((region) => [region.iso, region]));

  return (
    <div className="grid gap-0.5 lg:grid-cols-[1.35fr_1fr]">
      <div className="relative min-h-[380px] overflow-hidden bg-[#111] lg:min-h-[560px]">
        <svg
          viewBox={AFRICA_MAP_VIEWBOX}
          className="absolute inset-0 size-full"
          role="img"
          aria-label={`Map of Africa highlighting ${regions.map((r) => r.name).join(", ")}`}
        >
          {africaCountries.map((country) => {
            const region = byIso.get(country.iso);
            return (
              <path
                key={country.iso}
                d={country.d}
                fill={region ? statusFill[region.status] : "#1C1C1E"}
                stroke="#2A2A2E"
                strokeWidth={0.5}
                className="transition-opacity duration-200"
                opacity={region && focused && focused !== region.iso ? 0.25 : 1}
              />
            );
          })}
          {africaCountries
            .filter((country) => byIso.has(country.iso))
            .map((country) => {
              const [dx, dy] = labelOffset[country.iso] ?? [0, 4];
              return (
                <text
                  key={country.iso}
                  x={country.cx + dx}
                  y={country.cy + dy}
                  textAnchor="middle"
                  className="pointer-events-none fill-white font-display text-[10px] font-bold uppercase tracking-[0.08em]"
                  style={{ paintOrder: "stroke", stroke: "#0A0A0A", strokeWidth: 3 }}
                >
                  {byIso.get(country.iso)?.name}
                </text>
              );
            })}
        </svg>
        <ul className="absolute bottom-5 left-6 flex flex-wrap gap-4 font-display text-[10px] font-bold uppercase tracking-[0.12em] text-white/70">
          {(Object.keys(statusLabel) as CountryStatus[]).map((status) => (
            <li key={status} className="flex items-center gap-2">
              <i className="block size-[11px]" style={{ background: statusFill[status] }} />
              {statusLabel[status]}
            </li>
          ))}
        </ul>
      </div>
      <ul className="bg-[#141414] px-9 py-7">
        {regions.map((region) => (
          <li
            key={region.iso}
            onMouseEnter={() => setFocused(region.iso)}
            onMouseLeave={() => setFocused(null)}
            className="grid grid-cols-[14px_1fr] gap-4 border-b border-white/10 py-5 last:border-b-0"
          >
            <span className="mt-[3px] size-3.5" style={{ background: statusFill[region.status] }} />
            <div>
              <p
                className={cn(
                  "font-display text-base font-bold text-white transition-colors",
                  focused === region.iso && "text-atf-red-bright",
                )}
              >
                {region.name}
              </p>
              <p className="mt-1 text-[13px] leading-[1.55] text-white/65">{region.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
