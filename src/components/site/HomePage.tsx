import { createContext, useContext, useMemo, useState } from "react";
import {
  ArrowRight,
  Briefcase,
  Globe2,
  Network,
  Play,
  Trophy,
  X,
} from "lucide-react";

import { AppLink } from "@/components/site/AppLink";
import { NewsletterSection } from "@/components/site/NewsletterSection";
import {
  OpportunityButton,
  type OpportunityButtonProps,
} from "@/components/site/OpportunityButton";
import {
  ContentBand,
  Eyebrow,
  FilterChip,
  IconButton,
  SectionHeader,
  SurfaceCard,
  TriangleBullet,
} from "@/components/site/Page";
import { homepageHashForHiddenPath } from "@/lib/homepage-only";
import { chapters, impactStats, newsItems, programs } from "@/lib/site-data";
import { cn } from "@/lib/utils";

const programIcons = {
  consulting: Briefcase,
  challenge: Trophy,
  chapters: Network,
} as const;

const newsCategories = [
  "All",
  "Press",
  "Programs",
  "Research",
  "Partnerships",
  "Chapters",
];

const homepageAnchorStyle = {
  scrollMarginTop: "var(--atf-header-height, 76px)",
};

const HomepageOnlyModeContext = createContext(false);

function resolveHomepageHref(href: string, homepageOnlyMode: boolean) {
  if (!homepageOnlyMode) return href;

  const hash = homepageHashForHiddenPath(href);

  return hash ? `/#${hash}` : href;
}

function HomepageOpportunityButton(props: OpportunityButtonProps) {
  const homepageOnlyMode = useContext(HomepageOnlyModeContext);

  if (!("href" in props) || !props.href) {
    return <OpportunityButton {...props} />;
  }

  return (
    <OpportunityButton
      {...props}
      href={resolveHomepageHref(props.href, homepageOnlyMode)}
    />
  );
}

function HomepageLink(props: Parameters<typeof AppLink>[0]) {
  const homepageOnlyMode = useContext(HomepageOnlyModeContext);

  return (
    <AppLink
      {...props}
      href={resolveHomepageHref(props.href, homepageOnlyMode)}
    />
  );
}

const heroContent = {
  eyebrow: "Established 1987 • Pan-African Science & Technology Network",
  headlinePrefixLines: ["Promoting the", "development of"],
  headlineEmphasis: "science & technology",
  headlineTail: "across Africa.",
  body: "For over three decades, the African Technology Forum has partnered with governments, institutions, and enterprises to build Africa's scientific and technological capacity.",
  ctas: [
    { href: "/consulting", label: "Partner With ATF" },
    { href: "/about", label: "Our Impact" },
  ],
  stats: [
    { value: "54", label: "Countries" },
    { value: "200+", label: "Programs" },
    { value: "10K+", label: "Members" },
  ],
} as const;

export function HomePage({
  homepageOnlyMode = false,
}: {
  homepageOnlyMode?: boolean;
}) {
  const [videoOpen, setVideoOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");

  const featuredNews = newsItems.find((item) => item.featured) ?? newsItems[0];
  const filteredNews = useMemo(
    () =>
      newsItems.filter(
        (item) =>
          !item.featured &&
          (activeCategory === "All" || item.category === activeCategory),
      ),
    [activeCategory],
  );

  return (
    <HomepageOnlyModeContext.Provider value={homepageOnlyMode}>
      <HeroSection videoOpen={videoOpen} onVideoOpen={setVideoOpen} />
      <TrustBar />
      <ImpactSection />
      <AboutSection />
      <ProgramsSection />
      <FunderSection />
      <ChaptersSection />
      <StudentSection />
      <NewsSection
        activeCategory={activeCategory}
        featuredNews={featuredNews}
        filteredNews={filteredNews}
        onCategoryChange={setActiveCategory}
      />
      <NewsletterSection />
      <PartnersSection />
    </HomepageOnlyModeContext.Provider>
  );
}

function HeroSection({
  videoOpen,
  onVideoOpen,
}: {
  videoOpen: boolean;
  onVideoOpen: (open: boolean) => void;
}) {
  return (
    <>
      <DesktopHero videoOpen={videoOpen} onVideoOpen={onVideoOpen} />
      <CompactHero
        videoOpen={videoOpen}
        onVideoOpen={onVideoOpen}
        tone="light"
      />
    </>
  );
}

function DesktopHero({
  videoOpen,
  onVideoOpen,
}: {
  videoOpen: boolean;
  onVideoOpen: (open: boolean) => void;
}) {
  return (
    <section
      aria-label="ATF desktop hero"
      className="atf-desktop-hero relative isolate hidden overflow-hidden bg-atf-black lg:block"
    >
      <div className="absolute inset-0 z-0">
        <img
          src="/atf-assets/v2/hero-person.jpg"
          alt="Young African technologist working at a computer"
          className="size-full object-cover object-[22%_22%]"
        />
      </div>
      <div
        className="absolute -inset-px z-10 hidden bg-primary lg:block"
        style={{ clipPath: "polygon(54% 0%, 100% 0%, 100% 100%, 34% 100%)" }}
        aria-hidden="true"
      />
      <div
        className="absolute top-0 z-20 hidden h-0 w-0 border-l-[18px] border-r-[18px] border-t-[28px] border-l-transparent border-r-transparent border-t-primary lg:left-[53%] lg:block"
        aria-hidden="true"
      />

      <div className="atf-desktop-hero-grid relative z-20 grid lg:grid-cols-[55%_45%]">
        <div className="relative">
          <HeroPlayButton onClick={() => onVideoOpen(true)} />
        </div>

        <div className="flex items-center bg-transparent py-14 pl-0 pr-20 text-white">
          <div className="max-w-xl">
            <p className="mb-6 flex items-center gap-3 font-display text-[10px] xl:text-xs tracking-wider font-bold uppercase text-white/85">
              {heroContent.eyebrow}
            </p>

            <h1 className="font-display text-[clamp(34px,3.2vw,54px)] font-black uppercase leading-[0.98]">
              {heroContent.headlinePrefixLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
              <span className="block text-white italic">
                {heroContent.headlineEmphasis}
              </span>
              <span className="block">{heroContent.headlineTail}</span>
            </h1>
            <p className="mt-6 max-w-[420px] text-base leading-[1.6] text-white/90">
              {heroContent.body}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <HomepageOpportunityButton
                href={heroContent.ctas[0].href}
                variant="inverse"
                size="lg"
              >
                {heroContent.ctas[0].label}
              </HomepageOpportunityButton>
              <HomepageOpportunityButton
                href={heroContent.ctas[1].href}
                variant="inverseOutline"
                size="lg"
              >
                {heroContent.ctas[1].label}
              </HomepageOpportunityButton>
            </div>
            <div className="mt-9 flex flex-wrap gap-x-10 gap-y-4 border-t border-white/20 pt-6">
              {heroContent.stats.map((stat) => (
                <div key={stat.label}>
                  <div className="font-display text-3xl font-black">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-xs font-bold uppercase leading-4 text-white/70">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {videoOpen ? (
        <HeroVideoOverlay
          className="absolute inset-0 z-40"
          onClose={() => onVideoOpen(false)}
        />
      ) : null}
    </section>
  );
}

type CompactHeroTone = "light" | "dark" | "brand";

const compactHeroToneClasses: Record<CompactHeroTone, string> = {
  light: "bg-atf-gray-50 text-atf-ink",
  dark: "bg-atf-black text-white",
  brand: "bg-primary text-white",
};

const compactHeroPanelToneClasses: Record<CompactHeroTone, string> = {
  light: "bg-white text-atf-ink",
  dark: "bg-atf-black text-white",
  brand: "bg-white text-atf-ink",
};

function CompactHero({
  videoOpen,
  onVideoOpen,
  tone = "light",
}: {
  videoOpen: boolean;
  onVideoOpen: (open: boolean) => void;
  tone?: CompactHeroTone;
}) {
  return (
    <section
      aria-label="ATF compact hero"
      className={cn(
        "relative isolate overflow-hidden lg:hidden",
        compactHeroToneClasses[tone],
      )}
      data-tone={tone}
    >
      <div className="atf-compact-hero-media relative h-[54dvh] min-h-[360px] max-h-[560px] overflow-hidden bg-atf-black">
        <img
          src="/atf-assets/v2/hero-person.jpg"
          alt="Young African technologist working at a computer"
          className="absolute inset-0 size-full object-cover object-[24%_18%]"
        />
        <div className="absolute inset-0 bg-atf-black/15" aria-hidden="true" />
        <HeroPlayButton compact onClick={() => onVideoOpen(true)} />
      </div>

      <div
        className={cn(
          "atf-compact-hero-panel relative z-10 px-6 py-9 sm:px-8 sm:py-11",
          compactHeroPanelToneClasses[tone],
        )}
      >
        <div className="mx-auto max-w-2xl">
          <p className="mb-5 flex items-center gap-3 font-display text-xs font-bold uppercase leading-5 tracking-wider text-primary">
            {heroContent.eyebrow}
          </p>
          <h1 className="font-display text-3xl font-black uppercase leading-[0.98] text-atf-black sm:text-4xl">
            {heroContent.headlinePrefixLines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
            <span className="block text-primary italic">
              {heroContent.headlineEmphasis}
            </span>
            <span className="block">{heroContent.headlineTail}</span>
          </h1>
          <p className="mt-5 max-w-[420px] text-base leading-[1.6] text-atf-gray-500">
            {heroContent.body}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <HomepageOpportunityButton
              href={heroContent.ctas[0].href}
              variant="primary"
              size="lg"
            >
              {heroContent.ctas[0].label}
            </HomepageOpportunityButton>
            <HomepageOpportunityButton
              href={heroContent.ctas[1].href}
              variant="outline"
              size="lg"
            >
              {heroContent.ctas[1].label}
            </HomepageOpportunityButton>
          </div>
          <div className="mt-7 flex flex-wrap gap-x-10 gap-y-4 border-t border-atf-gray-200 pt-5">
            {heroContent.stats.map((stat) => (
              <div key={stat.label} className="min-w-0">
                <div className="font-display text-2xl font-black leading-none text-atf-black sm:text-3xl">
                  {stat.value}
                </div>
                <div className="mt-1.5 break-words font-display text-[10px] font-bold uppercase leading-4 text-atf-gray-500">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {videoOpen ? (
        <HeroVideoOverlay
          className="fixed inset-0 z-[80]"
          onClose={() => onVideoOpen(false)}
        />
      ) : null}
    </section>
  );
}

function HeroVideoOverlay({
  className,
  onClose,
}: {
  className?: string;
  onClose: () => void;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center bg-atf-black/95 p-6",
        className,
      )}
    >
      <div className="relative w-full max-w-3xl border border-white/15 bg-white/5 p-10 text-center text-white">
        <IconButton
          variant="dark"
          className="absolute right-4 top-4"
          aria-label="Close video"
          onClick={onClose}
        >
          <X className="size-5" aria-hidden="true" />
        </IconButton>
        <div className="mx-auto mb-5 inline-flex size-16 items-center justify-center rounded-full border border-white/30">
          <Play className="ml-1 size-7 fill-current" aria-hidden="true" />
        </div>
        <h2 className="font-display text-xl font-black uppercase">
          Feature Video
        </h2>
        <p className="mt-3 text-sm leading-7 text-white/60">
          ATF's feature film is being prepared for publication.
        </p>
      </div>
    </div>
  );
}

function HeroPlayButton({
  compact = false,
  onClick,
}: {
  compact?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={cn(
        "group absolute z-30 flex items-center text-left text-white transition-transform hover:translate-y-[-2px]",
        compact
          ? "bottom-6 left-5 gap-3 p-2 pr-4 sm:left-6"
          : "bottom-12 left-14 gap-4 p-3 pr-5",
      )}
      aria-label="Play ATF feature video"
      onClick={onClick}
    >
      <span
        className={cn(
          "atf-hero-play-disc inline-flex items-center justify-center rounded-full bg-primary text-white shadow-[0_12px_40px_rgba(249,0,54,0.4)] transition-transform group-hover:scale-[1.06]",
          compact ? "size-16" : "size-[72px]",
        )}
        aria-hidden="true"
      >
        <Play
          className={cn("ml-1 fill-current", compact ? "size-6" : "size-7")}
        />
      </span>
      <span className="relative">
        <span className="block font-display text-xs font-black uppercase">
          Watch the film
        </span>
        <span className="mt-1 block font-display text-[10px] font-semibold uppercase text-white/70">
          Our work, 2026
        </span>
      </span>
    </button>
  );
}

function TrustBar() {
  return (
    <div className="border-b border-atf-gray-200 bg-atf-gray-50">
      <div className="atf-container flex flex-wrap items-center gap-6 py-5">
        <p className="font-display text-xs font-bold uppercase text-atf-gray-500">
          Supported and trusted by
        </p>
        <div className="flex flex-wrap items-center gap-6 font-display text-sm font-bold uppercase text-atf-gray-500/65">
          <span>Google.org</span>
          <span>UNDP</span>
          <span>African Union</span>
          <span>World Bank</span>
          <span>UNESCO</span>
        </div>
      </div>
    </div>
  );
}

function ImpactSection() {
  return (
    <section className="bg-atf-black text-white">
      <div className="atf-container grid sm:grid-cols-2 lg:grid-cols-4">
        {impactStats.map((stat) => (
          <div
            key={stat.label}
            className="border-white/10 py-12 lg:border-r lg:py-16 lg:pl-12 first:lg:pl-0 last:lg:border-r-0"
          >
            <div className="font-display text-5xl font-black leading-none text-white md:text-6xl">
              {stat.value}
            </div>
            <p className="mt-3 max-w-52 font-display text-xs font-semibold uppercase leading-6 text-white/50">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function AboutSection() {
  return (
    <ContentBand
      id="about"
      style={homepageAnchorStyle}
    >
      <div className="grid gap-12 lg:grid-cols-[1fr_0.9fr] lg:items-start">
        <div>
          <Eyebrow>Who We Are</Eyebrow>
          <h2 className="atf-section-title">
            Three decades at the{" "}
            <span className="text-primary italic">forefront</span> of African
            technology.
          </h2>
          <p className="atf-body mt-7">
            The African Technology Forum is a pan-African institution dedicated
            to harnessing technology for Africa's development challenges. Since
            1987, ATF has built one of the continent's most trusted networks of
            technology practitioners, policymakers, and innovators.
          </p>
          <p className="atf-body mt-4">
            We work at the intersection of consulting, innovation, and capacity
            building to create systemic change across sectors and borders.
          </p>
          <HomepageLink href="/about" className="atf-link mt-8">
            Explore our story
            <ArrowRight className="size-4" aria-hidden="true" />
          </HomepageLink>
        </div>
        <div className="grid grid-cols-2 gap-px bg-atf-gray-200 lg:mt-12">
          {[
            { value: "30+", label: "Years partnering with institutions" },
            { value: "12", label: "Countries with active programs" },
            { value: "3", label: "Flagship initiatives" },
            { value: "1K+", label: "Research publications and briefs" },
          ].map((fact, index) => (
            <div
              key={fact.label}
              className={cn(
                "p-7",
                index === 0 ? "bg-primary text-white" : "bg-atf-gray-50",
              )}
            >
              <div className="font-display text-4xl font-black">
                {fact.value}
              </div>
              <p
                className={cn(
                  "mt-2 text-xs font-bold uppercase leading-5",
                  index === 0 ? "text-white/75" : "text-atf-gray-500",
                )}
              >
                {fact.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </ContentBand>
  );
}

function ProgramsSection() {
  return (
    <ContentBand id="programs" style={homepageAnchorStyle} muted>
      <SectionHeader
        eyebrow="What We Do"
        title={
          <>
            Three flagship{" "}
            <span className="text-primary italic">initiatives</span> driving
            technology innovation.
          </>
        }
        // body="Our work spans expert advisory services, grassroots innovation, and community-led capacity building."
      />
      <div className="grid gap-px bg-atf-gray-200 lg:grid-cols-3">
        {programs.map((program) => {
          const Icon = programIcons[program.slug];
          return (
            <HomepageLink
              key={program.slug}
              href={program.href}
              className="group relative overflow-hidden bg-white p-8 transition-colors hover:bg-atf-gray-50"
            >
              <div className="absolute inset-x-0 top-0 h-[3px] bg-atf-gray-200 transition-colors group-hover:bg-primary" />
              <div className="font-display text-xs font-bold text-atf-gray-500">
                {program.index}
              </div>
              <Icon
                className="mt-8 size-11 text-atf-black"
                aria-hidden="true"
              />
              <h3 className="mt-7 font-display text-2xl font-black uppercase leading-tight text-atf-black">
                {program.title}
              </h3>
              <p className="atf-body mt-4 text-sm">{program.summary}</p>
              <span className="mt-8 inline-flex items-center gap-2 font-display text-xs font-bold uppercase text-atf-ink group-hover:text-primary">
                Learn more
                <ArrowRight
                  className="size-4 transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </span>
            </HomepageLink>
          );
        })}
      </div>
    </ContentBand>
  );
}

function FunderSection() {
  return (
    <ContentBand id="funder" style={homepageAnchorStyle} dark>
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1fr] lg:items-start">
        <div>
          <Eyebrow light>For Partners & Funders</Eyebrow>
          <h2 className="atf-section-title text-white">
            Invest in Africa's{" "}
            <span className="text-primary italic">digital future</span> with us.
          </h2>
          <p className="mt-6 text-base leading-8 text-white/60">
            ATF has a 30+ year track record of delivering measurable technology
            impact across Africa. We work with governments, development
            institutions, and private sector partners to design, fund, and
            implement programs at scale.
          </p>
        </div>
        <div className="grid gap-0 mt-12">
          {[
            {
              title: "Submit a Partnership Inquiry",
              body: "Tell us about your organization and goals.",
              href: "/#newsletter",
            },
            // Restore this action when published impact reports are available.
            // {
            //   title: "Download Our Impact Report",
            //   body: "Three decades of data, case studies, and results.",
            //   href: "/research",
            // },
            {
              title: "Book a Meeting",
              body: "Speak with our partnerships team in Accra, Ghana.",
              href: "/#newsletter",
            },
          ].map((item) => (
            <HomepageLink
              key={item.title}
              href={item.href}
              className="group flex items-center justify-between gap-6 border border-white/10 bg-white/5 p-6 transition-colors hover:bg-white/10"
            >
              <span>
                <span className="block font-display text-base font-black uppercase text-white">
                  {item.title}
                </span>
                <span className="mt-2 block text-sm leading-6 text-white/50">
                  {item.body}
                </span>
              </span>
              <span className="inline-flex size-11 shrink-0 items-center justify-center border border-white/15 transition-colors group-hover:border-primary group-hover:bg-primary">
                <ArrowRight className="size-5 text-white" aria-hidden="true" />
              </span>
            </HomepageLink>
          ))}
        </div>
      </div>
    </ContentBand>
  );
}

function ChaptersSection() {
  return (
    <ContentBand id="chapters" style={homepageAnchorStyle}>
      <SectionHeader
        eyebrow="Where We Work"
        title={
          <>
            Our <span className="text-primary italic">chapters</span> span
            across Africa.
          </>
        }
        action={
          <HomepageLink href="/chapters" className="atf-link">
            View all chapters
            <ArrowRight className="size-4" aria-hidden="true" />
          </HomepageLink>
        }
      />
      <div className="grid gap-px bg-atf-gray-200 md:grid-cols-2 lg:grid-cols-4">
        {chapters.map((chapter) => (
          <HomepageLink
            key={chapter.slug}
            href={`/countries/${chapter.slug}`}
            className="group relative overflow-hidden bg-atf-gray-50 p-7 transition-colors hover:bg-white"
          >
            <div className="text-4xl leading-none" aria-hidden="true">
              {chapter.flag}
            </div>
            <h3 className="mt-6 font-display text-xl font-black uppercase text-atf-black">
              {chapter.country}
            </h3>
            <p className="mt-1 font-display text-xs font-bold uppercase text-primary">
              {chapter.count} Chapters
            </p>
            <p className="mt-4 text-sm leading-7 text-atf-gray-500">
              {chapter.description}
            </p>
            <span className="mt-6 inline-flex items-center gap-2 font-display text-xs font-bold uppercase text-atf-ink group-hover:text-primary">
              View country
              <ArrowRight
                className="size-4 transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </span>
            <span className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 bg-primary transition-transform group-hover:scale-x-100" />
          </HomepageLink>
        ))}
      </div>
    </ContentBand>
  );
}

function StudentSection() {
  return (
    <section
      id="student"
      style={homepageAnchorStyle}
      className="relative grid overflow-hidden bg-primary text-white lg:grid-cols-2"
    >
      <div
        className="absolute bottom-0 left-0 z-10 h-0 w-0 border-b-[56px] border-r-[56px] border-b-atf-black border-r-transparent"
        aria-hidden="true"
      />
      <div className="flex flex-col justify-center px-6 py-16 md:px-10 lg:px-20 lg:py-24">
        <p className="mb-7 flex items-center gap-3 font-display text-xs font-bold uppercase text-white/70">
          <TriangleBullet light />
          For Students & Young Professionals
        </p>
        <h2 className="font-display text-5xl font-black uppercase leading-none md:text-7xl">
          Don't just watch the AI revolution,{" "}
          <span className="italic">build it.</span>
        </h2>
        <ul className="mt-8 grid gap-3 font-display text-sm font-bold uppercase text-white/90">
          {[
            "Get free AI training",
            "Build real-world solutions",
            "Launch your career",
          ].map((item) => (
            <li key={item} className="flex items-center gap-3">
              <TriangleBullet light />
              {item}
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-wrap gap-3">
          <HomepageOpportunityButton
            href="https://bit.ly/atf-wf"
            variant="inverse"
            size="lg"
            target="_blank"
            rel="noreferrer"
          >
            Apply to ATF Challenge
          </HomepageOpportunityButton>
          <HomepageOpportunityButton
            href="/chapters"
            variant="inverseOutline"
            size="lg"
          >
            Join a Chapter
          </HomepageOpportunityButton>
        </div>
      </div>
      <div className="relative min-h-[340px] bg-atf-black">
        <img
          src="/atf-assets/v2/billboard-1.jpg"
          alt="ATF AI Challenge billboard"
          className="absolute inset-0 size-full object-cover opacity-75"
        />
        <div className="absolute bottom-10 left-8 font-display text-6xl font-black uppercase leading-none text-white/10 md:text-8xl">
          Build it.
        </div>
      </div>
    </section>
  );
}

function NewsSection({
  activeCategory,
  featuredNews,
  filteredNews,
  onCategoryChange,
}: {
  activeCategory: string;
  featuredNews: (typeof newsItems)[number];
  filteredNews: readonly (typeof newsItems)[number][];
  onCategoryChange: (category: string) => void;
}) {
  const homepageOnlyMode = useContext(HomepageOnlyModeContext);

  return (
    <ContentBand
      id="news"
      style={homepageAnchorStyle}
      className={cn(homepageOnlyMode && "hidden")}
    >
      <SectionHeader
        eyebrow="Newsroom"
        title={
          <>
            The <span className="text-primary italic">latest</span> from across
            the network.
          </>
        }
        action={
          <HomepageLink href="/news" className="atf-link">
            View all news
            <ArrowRight className="size-4" aria-hidden="true" />
          </HomepageLink>
        }
      />
      <div className="grid gap-12 lg:grid-cols-[1.25fr_1fr]">
        <HomepageLink href={`/news/${featuredNews.id}`} className="group block">
          <div className="relative aspect-[16/10] overflow-hidden bg-atf-gray-100">
            <img
              src="/atf-assets/atf-award-ceremony-2024.jpg"
              alt="ATF award ceremony audience and presenters"
              className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
            <span className="absolute left-0 top-0 bg-primary px-3 py-2 font-display text-xs font-bold uppercase text-white">
              Featured
            </span>
          </div>
          <p className="mt-7 font-display text-xs font-bold uppercase text-primary">
            {featuredNews.category} - {featuredNews.date}
          </p>
          <h3 className="mt-3 font-display text-2xl font-black uppercase leading-tight text-atf-black group-hover:text-primary md:text-3xl">
            {featuredNews.title}
          </h3>
          <p className="atf-body mt-4">{featuredNews.excerpt}</p>
          <span className="mt-6 inline-flex items-center gap-2 font-display text-xs font-bold uppercase text-atf-ink group-hover:text-primary">
            Read the story
            <ArrowRight
              className="size-4 transition-transform group-hover:translate-x-1"
              aria-hidden="true"
            />
          </span>
        </HomepageLink>

        <div>
          <div className="mb-4 flex flex-wrap gap-2" aria-label="Filter news">
            {newsCategories.map((category) => (
              <FilterChip
                key={category}
                active={activeCategory === category}
                onClick={() => onCategoryChange(category)}
              >
                {category}
              </FilterChip>
            ))}
          </div>
          <div className="border-t border-atf-gray-200">
            {filteredNews.map((item) => (
              <HomepageLink
                href={`/news/${item.id}`}
                key={item.id}
                className="group block border-b border-atf-gray-200 py-5"
              >
                <p className="font-display text-xs font-bold uppercase text-primary">
                  {item.category} - {item.date}
                </p>
                <h3 className="mt-2 font-display text-lg font-bold leading-snug text-atf-ink group-hover:text-primary">
                  {item.title}
                </h3>
              </HomepageLink>
            ))}
            {filteredNews.length === 0 ? (
              <p className="py-8 text-sm text-atf-gray-500">
                No updates in this category yet.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </ContentBand>
  );
}

function PartnersSection() {
  return (
    <ContentBand muted>
      <SurfaceCard
        hover={false}
        className="border-0 bg-transparent p-0 text-center"
      >
        <Globe2
          className="mx-auto mb-5 size-10 text-primary"
          aria-hidden="true"
        />
        <p className="font-display text-xs font-bold uppercase text-atf-gray-500">
          Trusted by leading organizations across Africa and beyond
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-8 font-display text-base font-bold uppercase text-atf-gray-500/65">
          <span>Google.org</span>
          <span>UNDP</span>
          <span>African Union</span>
          <span>World Bank</span>
          <span>ECOWAS</span>
          <span>UNESCO</span>
        </div>
      </SurfaceCard>
    </ContentBand>
  );
}
