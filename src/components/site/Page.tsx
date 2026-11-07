import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";

import { AppLink } from "@/components/site/AppLink";
import { OpportunityButton } from "@/components/site/OpportunityButton";
import { SubpageBreadcrumb, type BreadcrumbEntry } from "@/components/site/SubpageBreadcrumb";
import { cn } from "@/lib/utils";

type LogoVariant = "fullColor" | "bright" | "dark";

const logoSources: Record<LogoVariant, string> = {
  fullColor: "/atf-assets/v2/logo-full-color.png",
  bright: "/atf-assets/v2/logo-bright.png",
  dark: "/atf-assets/v2/logo-dark.png",
};

export function SiteLogo({
  variant = "fullColor",
  className,
}: {
  variant?: LogoVariant;
  className?: string;
}) {
  return (
    <img
      src={logoSources[variant]}
      alt="African Technology Forum"
      className={cn("block h-9 w-auto object-contain", className)}
    />
  );
}

export function IconButton({
  className,
  variant = "light",
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "light" | "dark" | "ghost";
}) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex size-10 items-center justify-center border transition-colors",
        variant === "dark" &&
          "border-white/15 bg-white/5 text-white/65 hover:border-primary hover:bg-primary hover:text-white",
        variant === "light" &&
          "border-atf-gray-200 bg-white text-atf-gray-500 hover:border-primary hover:text-primary",
        variant === "ghost" &&
          "border-transparent bg-transparent text-current hover:border-current/15 hover:bg-current/10",
        className,
      )}
      {...props}
    />
  );
}

export function FilterChip({
  active,
  className,
  children,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  active: boolean;
}) {
  return (
    <button
      type={type}
      className={cn(
        "border px-3 py-2 font-display text-xs font-bold uppercase transition-colors",
        active
          ? "border-atf-black bg-atf-black text-white"
          : "border-atf-gray-200 bg-white text-atf-gray-500 hover:border-atf-black hover:text-atf-black",
        className,
      )}
      aria-pressed={active}
      {...props}
    >
      {children}
    </button>
  );
}

export function TriangleBullet({
  className,
  light = false,
}: {
  className?: string;
  light?: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block h-0 w-0 shrink-0 border-y-[5px] border-l-[8px] border-y-transparent",
        light ? "border-l-white" : "border-l-primary",
        className,
      )}
    />
  );
}

export function Eyebrow({
  children,
  light = false,
}: {
  children: ReactNode;
  light?: boolean;
}) {
  return (
    <p className={cn("atf-eyebrow", light && "text-white/65")}>{children}</p>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  body,
  action,
  dark = false,
}: {
  eyebrow: string;
  title: ReactNode;
  body?: ReactNode;
  action?: ReactNode;
  dark?: boolean;
}) {
  return (
    <div className="mb-12 grid gap-6 lg:grid-cols-[1fr_0.75fr] lg:items-start">
      <div>
        <Eyebrow light={dark}>{eyebrow}</Eyebrow>
        <h2 className={cn("atf-section-title", dark && "text-white")}>
          {title}
        </h2>
      </div>
      {(body || action) && (
        <div className="space-y-6 justify-self-end">
          {body ? (
            <p className={cn("atf-body", dark && "text-white/60")}>{body}</p>
          ) : null}
          {action}
        </div>
      )}
    </div>
  );
}

type PageHeroProps = {
  /** Subpage Breadcrumb trail, rendered inside the hero. */
  breadcrumb: BreadcrumbEntry[];
  title: string;
  /** A phrase within `title` to highlight, as in the design reference. */
  titleAccent?: string;
  /** `wide` lets long sentence titles run to 22ch instead of 17ch. */
  titleMeasure?: "default" | "wide";
  description: ReactNode;
  /** Key Facts: short label/value pairs shown under the description. */
  meta?: readonly { label: string; value: string }[];
};

export function DiagonalAccentSection({
  children,
  className,
  layout = "split",
  ...props
}: ComponentProps<"section"> & {
  layout?: "split" | "stacked";
}) {
  return (
    <section
      className={cn(
        "relative isolate overflow-hidden bg-atf-black text-white",
        className,
      )}
      {...props}
    >
      {layout === "stacked" ? (
        <div className="absolute inset-0 hidden lg:block" aria-hidden="true">
          <div className="atf-container h-full">
            <div className="relative h-full max-w-5xl">
              <div
                className="absolute inset-y-0 left-[calc(100%+1rem)] w-screen bg-primary"
                style={{ clipPath: "polygon(96px 0, 100% 0, 100% 100%, 0 100%)" }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div
          className="absolute inset-y-0 right-0 hidden w-[64%] bg-primary lg:block"
          style={{ clipPath: "polygon(36% 0, 100% 0, 100% 100%, 12% 100%)" }}
          aria-hidden="true"
        />
      )}
      <div
        className="absolute bottom-0 left-0 h-0 w-0 border-b-[48px] border-r-[48px] border-b-primary border-r-transparent"
        aria-hidden="true"
      />
      <div className="atf-container relative z-10 py-16 lg:py-24">
        <div
          className={cn(
            "grid gap-10",
            layout === "split"
              ? "lg:grid-cols-[0.72fr_1fr] lg:items-center"
              : "lg:grid-cols-1 lg:gap-4",
          )}
        >
          {children}
        </div>
      </div>
    </section>
  );
}

/** Splits `title` so the first occurrence of `accent` renders in brand red. */
function AccentedTitle({ title, accent }: { title: string; accent?: string }) {
  const at = accent ? title.indexOf(accent) : -1;
  if (!accent || at < 0) return <>{title}</>;
  return (
    <>
      {title.slice(0, at)}
      <em className="not-italic text-primary">{accent}</em>
      {title.slice(at + accent.length)}
    </>
  );
}

export function PageHero({
  breadcrumb,
  title,
  titleAccent,
  titleMeasure = "default",
  description,
  meta,
}: PageHeroProps) {
  return (
    <section className="relative isolate overflow-hidden bg-atf-black text-white">
      <div
        aria-hidden="true"
        className="absolute bottom-0 right-0 h-0 w-0 border-b-[120px] border-l-[120px] border-b-primary border-l-transparent opacity-90 lg:border-b-[190px] lg:border-l-[190px]"
      />
      <div className="atf-container relative z-10 pb-20 pt-20 lg:pb-[92px] lg:pt-[104px]">
        <SubpageBreadcrumb entries={breadcrumb} tone="hero" />
        <h1
          className={cn(
            "font-display text-[clamp(42px,5.4vw,82px)] font-black leading-[0.98] tracking-[-0.025em]",
            titleMeasure === "wide" ? "max-w-[22ch]" : "max-w-[17ch]",
          )}
        >
          <AccentedTitle title={title} accent={titleAccent} />
        </h1>
        <p className="mt-[30px] max-w-[60ch] text-pretty text-[clamp(16px,1.35vw,19.5px)] leading-[1.65] text-white/70">
          {description}
        </p>
        {meta?.length ? (
          <dl className="mt-[54px] flex flex-wrap gap-x-14 gap-y-8 border-t border-white/12 pt-[34px]">
            {meta.map((item) => (
              <div key={item.label}>
                <dt className="mb-[9px] font-display text-[11px] font-bold uppercase tracking-[0.14em] text-white/45">
                  {item.label}
                </dt>
                <dd className="font-display text-[25px] font-extrabold tracking-[-0.01em]">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}
      </div>
    </section>
  );
}

export function PageShell({
  children,
  muted = false,
}: {
  children: ReactNode;
  muted?: boolean;
}) {
  return (
    <div className={cn("min-h-[70vh]", muted ? "bg-atf-gray-50" : "bg-white")}>
      {children}
    </div>
  );
}

export function SubpageTemplate({
  hero,
  children,
  muted = false,
}: {
  hero: PageHeroProps;
  children: ReactNode;
  muted?: boolean;
}) {
  return (
    <PageShell muted={muted}>
      <PageHero {...hero} />
      {children}
    </PageShell>
  );
}

export function ContentBand({
  children,
  dark = false,
  muted = false,
  className,
  ...sectionProps
}: React.ComponentPropsWithoutRef<"section"> & {
  dark?: boolean;
  muted?: boolean;
}) {
  return (
    <section
      {...sectionProps}
      className={cn(
        "py-16 lg:py-24",
        dark
          ? "bg-atf-black text-white"
          : muted
            ? "bg-atf-gray-50"
            : "bg-white",
        className,
      )}
    >
      <div className="atf-container">{children}</div>
    </section>
  );
}

export function StatGrid({
  stats,
  dark = false,
}: {
  stats: readonly { value: string; label: string }[];
  dark?: boolean;
}) {
  return (
    <div
      className={cn(
        "grid gap-px overflow-hidden border sm:grid-cols-1 lg:grid-cols-3",
        dark
          ? "border-white/10 bg-white/10"
          : "border-atf-gray-200 bg-atf-gray-200",
      )}
    >
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={cn("p-6", dark ? "bg-atf-black" : "bg-white")}
        >
          <div
            className={cn(
              "font-display text-4xl font-black",
              dark ? "text-white" : "text-atf-black",
            )}
          >
            {stat.value}
          </div>
          <p
            className={cn(
              "mt-2 text-sm leading-6",
              dark ? "text-white/55" : "text-atf-gray-500",
            )}
          >
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  );
}

export function SurfaceCard({
  children,
  href,
  dark = false,
  className,
  hover = true,
}: {
  children: ReactNode;
  href?: string;
  dark?: boolean;
  className?: string;
  hover?: boolean;
}) {
  const content = (
    <article
      className={cn(
        "group h-full border p-6 transition-colors",
        dark
          ? "border-white/10 bg-white/5 text-white"
          : "border-atf-gray-200 bg-white text-atf-ink",
        hover && dark && "hover:bg-white/10",
        hover && !dark && "hover:bg-atf-gray-50",
        className,
      )}
    >
      {children}
    </article>
  );

  if (!href) return content;

  return (
    <AppLink href={href} className="block h-full no-underline">
      {content}
    </AppLink>
  );
}

export function ActionCard({
  title,
  description,
  href,
  icon: Icon,
  dark = false,
}: {
  title: string;
  description: ReactNode;
  href?: string;
  icon?: LucideIcon;
  dark?: boolean;
}) {
  return (
    <SurfaceCard href={href} dark={dark}>
      {Icon ? (
        <div
          className={cn(
            "mb-5 inline-flex size-11 items-center justify-center",
            dark ? "bg-white/10 text-white" : "bg-primary/10 text-primary",
          )}
        >
          <Icon className="size-5" aria-hidden="true" />
        </div>
      ) : null}
      <h3 className="font-display text-xl font-black uppercase leading-tight">
        {title}
      </h3>
      <p
        className={cn(
          "mt-3 text-sm leading-7",
          dark ? "text-white/55" : "text-atf-gray-500",
        )}
      >
        {description}
      </p>
      {href ? (
        <span
          className={cn(
            "mt-6 inline-flex items-center gap-2 font-display text-xs font-bold uppercase",
            dark ? "text-white" : "text-atf-ink",
          )}
        >
          Learn more
          <ArrowRight
            className="size-4 transition-transform group-hover:translate-x-1"
            aria-hidden="true"
          />
        </span>
      ) : null}
    </SurfaceCard>
  );
}

export function ArticleCard({
  eyebrow,
  title,
  description,
  children,
  href,
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  href?: string;
  className?: string;
}) {
  return (
    <SurfaceCard href={href} className={cn("p-6", className)}>
      {eyebrow ? (
        <p className="font-display text-xs font-bold uppercase text-primary">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-3 font-display text-2xl font-black uppercase leading-tight text-atf-black group-hover:text-primary">
        {title}
      </h2>
      {description ? (
        <p className="atf-body mt-3 text-sm">{description}</p>
      ) : null}
      {children}
    </SurfaceCard>
  );
}

export function EmptyState({
  title,
  description,
  href = "/",
  action = "Back to Home",
}: {
  title: string;
  description: string;
  href?: string;
  action?: string;
}) {
  return (
    <section className="bg-white">
      <div className="atf-container flex min-h-[50vh] items-center justify-center py-16">
        <div className="max-w-xl text-center">
          <h1 className="font-display text-4xl font-black uppercase text-atf-black">
            {title}
          </h1>
          <p className="mt-4 text-atf-gray-500">{description}</p>
          <OpportunityButton href={href} className="mt-8">
            {action}
          </OpportunityButton>
        </div>
      </div>
    </section>
  );
}

export type PageHeroComponentProps = ComponentProps<typeof PageHero>;
