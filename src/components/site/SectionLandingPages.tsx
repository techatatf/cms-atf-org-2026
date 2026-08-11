import {
  ArrowRight,
  BookOpen,
  Briefcase,
  Eye,
  FileText,
  Heart,
  Library,
  Lightbulb,
  MapPin,
  Network,
  Newspaper,
  Target,
  Trophy,
  Users,
} from "lucide-react";

import { AppLink } from "@/components/site/AppLink";
import {
  ActionCard,
  ArticleCard,
  ContentBand,
  SectionHeader,
  StatGrid,
  SubpageTemplate,
  SurfaceCard,
} from "@/components/site/Page";
import {
  articles,
  chapters,
  impactStats,
  newsItems,
  programs,
  researchPapers,
} from "@/lib/site-data";

const whoWeAreDestinations = [
  {
    title: "Our Mission, Vision and Story",
    description:
      "The purpose, long-term ambition, and institutional story behind ATF's pan-African technology work.",
    href: "/about",
    icon: Heart,
  },
  {
    title: "The Team And Contributors",
    description:
      "The leadership, advisors, regional directors, program managers, and local contributors behind the network.",
    href: "/team",
    icon: Users,
  },
] as const;

const programIcons = {
  consulting: Briefcase,
  challenge: Trophy,
  chapters: Network,
} as const;

const countryOrder = ["ghana", "nigeria", "kenya", "south-africa"] as const;
const orderedChapters = countryOrder.map(
  (slug) => chapters.find((chapter) => chapter.slug === slug)!,
);

const publicationDestinations = [
  {
    title: "Newsroom",
    description:
      "Timely announcements, program updates, partnerships, and chapter stories from across the network.",
    href: "/news",
    icon: Newspaper,
  },
  {
    title: "Articles",
    description:
      "Opinion, analysis, and field notes from ATF contributors and technology practitioners.",
    href: "/articles",
    icon: FileText,
  },
  {
    title: "Research Papers",
    description:
      "Long-form studies, white papers, and market analysis on African technology ecosystems.",
    href: "/research",
    icon: BookOpen,
  },
  {
    title: "Library",
    description:
      "The full collection of ATF articles, research, reports, and implementation case studies.",
    href: "/library",
    icon: Library,
  },
] as const;

export function WhoWeAreLandingPage() {
  return (
    <SubpageTemplate
      hero={{
        eyebrow: "Who We Are",
        title: "A pan-African technology forum built for systemic change.",
        icon: Heart,
        description:
          "African Technology Forum is a trusted network of technology practitioners, policymakers, researchers, institutions, and young builders working across Africa's development priorities.",
      }}
    >
      <ContentBand>
        <nav
          aria-label="Who We Are detail pages"
          className="grid gap-6 md:grid-cols-2"
        >
          {whoWeAreDestinations.map((destination) => (
            <ActionCard
              key={destination.title}
              title={destination.title}
              description={destination.description}
              href={destination.href}
              icon={destination.icon}
            />
          ))}
        </nav>
      </ContentBand>

      <ContentBand muted>
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <SectionHeader
              eyebrow="Who We Are"
              title={
                <>
                  Three decades at the{" "}
                  <span className="text-primary italic">forefront</span> of
                  African technology.
                </>
              }
              body="Since 1987, ATF has helped institutions and communities translate technology ambition into practical capacity, evidence, and implementation."
            />
            <p className="atf-body">
              The forum works at the intersection of consulting, innovation, and
              capacity building. That combination keeps strategy connected to
              the people, partners, and delivery infrastructure needed for
              durable outcomes.
            </p>
          </div>
          <StatGrid
            stats={[
              { value: "1987", label: "Established as a professional forum" },
              { value: "30K+", label: "Participants reached through programs" },
              { value: "37+", label: "Active chapters across Africa" },
              { value: "3", label: "Flagship initiatives" },
            ]}
          />
        </div>
      </ContentBand>

      <ContentBand>
        <div className="grid gap-6 md:grid-cols-3">
          <ActionCard
            icon={Heart}
            title="Mission"
            description="Promote the development of science and technology in Africa through practical programs, advisory work, and community infrastructure."
          />
          <ActionCard
            icon={Eye}
            title="Vision"
            description="A technologically empowered Africa leading global innovation and solving the continent's most important development challenges."
          />
          <ActionCard
            icon={BookOpen}
            title="Story"
            description="ATF grew from a professional forum into a continent-wide implementation network connecting practitioners and institutions."
          />
        </div>
      </ContentBand>
    </SubpageTemplate>
  );
}

export function WhatWeDoLandingPage() {
  return (
    <SubpageTemplate
      muted
      hero={{
        eyebrow: "What We Do",
        title: "Programs that connect strategy, talent, and implementation.",
        icon: Target,
        description:
          "ATF combines advisory work, youth innovation, and chapter infrastructure so technology strategy can move into real programs and local capacity.",
      }}
    >
      <ContentBand>
        <nav
          aria-label="What We Do detail pages"
          className="grid gap-6 md:grid-cols-3"
        >
          {programs.map((program) => {
            const Icon = programIcons[program.slug];
            return (
              <ActionCard
                key={program.slug}
                title={program.title}
                description={program.summary}
                href={program.href}
                icon={Icon}
              />
            );
          })}
        </nav>
      </ContentBand>

      <ContentBand muted>
        <SectionHeader
          eyebrow="What We Do"
          title={
            <>
              Three flagship{" "}
              <span className="text-primary italic">initiatives</span> driving
              technology innovation.
            </>
          }
          body="The homepage introduces the initiatives. This overview shows how they reinforce one another across strategy, talent development, and community-led implementation."
        />
        <div className="grid gap-px bg-atf-gray-200 lg:grid-cols-3">
          {programs.map((program) => {
            const Icon = programIcons[program.slug];
            return (
              <AppLink
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
                <h2 className="mt-7 font-display text-2xl font-black uppercase leading-tight text-atf-black">
                  {program.title}
                </h2>
                <p className="atf-body mt-4 text-sm">{program.summary}</p>
                <span className="mt-8 inline-flex items-center gap-2 font-display text-xs font-bold uppercase text-atf-ink group-hover:text-primary">
                  Learn more
                  <ArrowRight
                    className="size-4 transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </span>
              </AppLink>
            );
          })}
        </div>
      </ContentBand>

      <ContentBand>
        <div className="grid gap-6 md:grid-cols-3">
          <ActionCard
            icon={Briefcase}
            title="Strategy"
            description="Advisory engagements help partners define technology priorities, implementation models, and delivery capacity."
          />
          <ActionCard
            icon={Lightbulb}
            title="Talent"
            description="The ATF Challenge gives students and young professionals structured pathways into applied technology work."
          />
          <ActionCard
            icon={Network}
            title="Implementation"
            description="Chapters keep programs grounded in local communities, institutions, mentors, and operating needs."
          />
        </div>
      </ContentBand>
    </SubpageTemplate>
  );
}

export function WhereWeWorkLandingPage() {
  return (
    <SubpageTemplate
      muted
      hero={{
        eyebrow: "Where We Work",
        title: "A chapter network rooted across Africa.",
        icon: MapPin,
        description:
          "ATF chapters connect local technology communities to a broader pan-African network of programs, mentors, partners, and implementation experience.",
      }}
    >
      <ContentBand>
        <nav
          aria-label="Where We Work detail pages"
          className="grid gap-px bg-atf-gray-200 md:grid-cols-2 lg:grid-cols-4"
        >
          {orderedChapters.map((chapter) => (
            <AppLink
              key={chapter.slug}
              href={`/countries/${chapter.slug}`}
              className="group bg-white p-7 transition-colors hover:bg-atf-gray-50"
            >
              <div aria-hidden="true">
                <img
                  src={`/country-flags/${chapter.flag}.png`}
                  alt=""
                  className="size-12 object-contain"
                />
              </div>
              <h2 className="mt-6 font-display text-xl font-black uppercase text-atf-black">
                {chapter.country}
              </h2>
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
            </AppLink>
          ))}
        </nav>
      </ContentBand>

      <ContentBand muted>
        <SectionHeader
          eyebrow="Where We Work"
          title={
            <>
              Our <span className="text-primary italic">chapters</span> span
              across Africa.
            </>
          }
          body="The homepage introduces the visible chapter footprint. This overview expands that view into country entry points, local community roles, and the way chapters connect students, practitioners, partners, and programs."
          action={
            <AppLink href="/chapters" className="atf-link">
              View all chapters
              <ArrowRight className="size-4" aria-hidden="true" />
            </AppLink>
          }
        />
        <StatGrid
          stats={[
            { value: "37+", label: "Active chapters across the continent" },
            { value: "12", label: "Countries with active programs" },
            { value: "10K+", label: "Members connected through chapters" },
            { value: "4", label: "Featured country networks" },
          ]}
        />
      </ContentBand>

      <ContentBand>
        <div className="grid gap-6 md:grid-cols-3">
          <ActionCard
            icon={Users}
            title="Community"
            description="Local chapters convene technologists, students, and practitioners through peer groups, meetups, and events."
          />
          <ActionCard
            icon={Lightbulb}
            title="Workshops"
            description="Chapter programming gives members hands-on exposure to practical tools, applied projects, and mentor review."
          />
          <ActionCard
            icon={Network}
            title="Mentorship"
            description="Country networks connect local builders to regional directors, industry contributors, and diaspora expertise."
          />
        </div>
      </ContentBand>
    </SubpageTemplate>
  );
}

export function PublicationsLandingPage() {
  const featuredNews = newsItems.find((item) => item.featured) ?? newsItems[0];
  const latestNews = newsItems
    .filter((item) => item.id !== featuredNews.id)
    .slice(0, 3);
  const latestArticle = articles[0];
  const latestResearch = researchPapers[0];

  return (
    <SubpageTemplate
      muted
      hero={{
        eyebrow: "Publications",
        title: "Insights, news, and research from across the ATF network.",
        icon: Newspaper,
        description:
          "The Publications section gathers ATF's latest updates, expert analysis, research papers, reports, and implementation learning in one place.",
      }}
    >
      <ContentBand>
        <nav
          aria-label="Publications detail pages"
          className="grid gap-6 md:grid-cols-2 xl:grid-cols-4"
        >
          {publicationDestinations.map((destination) => (
            <ActionCard
              key={destination.title}
              title={destination.title}
              description={destination.description}
              href={destination.href}
              icon={destination.icon}
            />
          ))}
        </nav>
      </ContentBand>

      <ContentBand muted>
        <SectionHeader
          eyebrow="Newsroom"
          title="A wider view of the latest from the network."
          body="The homepage highlights the newest updates. This overview adds context, groups the publication paths, and keeps timely Newsroom stories close to research and long-form analysis."
          action={
            <AppLink href="/news" className="atf-link">
              Visit the newsroom
              <ArrowRight className="size-4" aria-hidden="true" />
            </AppLink>
          }
        />
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <ArticleCard
            href={`/news/${featuredNews.id}`}
            eyebrow={`${featuredNews.category} - ${featuredNews.date}`}
            title={featuredNews.title}
            description={featuredNews.excerpt}
            className="p-8"
          >
            <span className="mt-6 inline-flex items-center gap-2 font-display text-xs font-bold uppercase text-atf-ink group-hover:text-primary">
              Read the story
              <ArrowRight
                className="size-4 transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </span>
          </ArticleCard>

          <SurfaceCard hover={false}>
            <h2 className="font-display text-xl font-black uppercase text-atf-black">
              Recent updates
            </h2>
            <div className="mt-5 divide-y divide-atf-gray-200">
              {latestNews.map((item) => (
                <AppLink
                  key={item.id}
                  href={`/news/${item.id}`}
                  className="group block py-4 first:pt-0"
                >
                  <p className="font-display text-xs font-bold uppercase text-primary">
                    {item.category} - {item.date}
                  </p>
                  <h3 className="mt-2 font-display text-base font-bold leading-snug text-atf-ink group-hover:text-primary">
                    {item.title}
                  </h3>
                </AppLink>
              ))}
            </div>
          </SurfaceCard>
        </div>
      </ContentBand>

      <ContentBand>
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <SectionHeader
              eyebrow="Research & Analysis"
              title="A practical knowledge base for African technology work."
              body="ATF publications connect what the network is seeing in the field with the research, evidence, and implementation notes partners need to act."
            />
            <StatGrid stats={impactStats} />
          </div>

          <div className="grid gap-5">
            <ArticleCard
              href="/articles"
              eyebrow={latestArticle.category}
              title={latestArticle.title}
              description={latestArticle.excerpt}
            />
            <ArticleCard
              href="/research"
              eyebrow={`${latestResearch.type} - ${latestResearch.year}`}
              title={latestResearch.title}
              description={`${latestResearch.pages} pages of analysis from ATF's research library.`}
            />
            <SurfaceCard href="/library">
              <p className="font-display text-xs font-bold uppercase text-primary">
                Library
              </p>
              <h2 className="mt-3 font-display text-2xl font-black uppercase leading-tight text-atf-black group-hover:text-primary">
                Browse the full publication collection.
              </h2>
              <p className="atf-body mt-3 text-sm">
                Find articles, research papers, reports, and case studies from
                ATF's long-running knowledge base.
              </p>
            </SurfaceCard>
          </div>
        </div>
      </ContentBand>
    </SubpageTemplate>
  );
}
