import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  Instagram,
  Linkedin,
  Mail,
  Menu,
  Twitter,
  X,
  Youtube,
} from "lucide-react";

import { ChallengeAnnouncementBanner } from "@/components/layout/ChallengeAnnouncementBanner";
import { useHeaderHeight } from "@/components/layout/useHeaderHeight";
import { OpportunityButton } from "@/components/site/OpportunityButton";
import { IconButton, SiteLogo } from "@/components/site/Page";

const homepageNavigation = [
  { label: "About", hash: "about" },
  { label: "Programs", hash: "programs" },
  { label: "Chapters", hash: "chapters" },
] as const;

const homepageFooterNavigation = [
  ...homepageNavigation,
  { label: "Partner with Us", hash: "funder" },
  { label: "Student Opportunities", hash: "student" },
] as const;

const socialLinks = [
  { icon: Twitter, href: "https://x.com/AfTechForum", label: "Twitter" },
  {
    icon: Instagram,
    href: "https://www.instagram.com/africantech/",
    label: "Instagram",
  },
  {
    icon: Linkedin,
    href: "https://www.linkedin.com/company/africantechnologyforum/",
    label: "LinkedIn",
  },
  {
    icon: Youtube,
    href: "https://www.youtube.com/@africantechnologyforum",
    label: "YouTube",
  },
] as const;

export function HomepageOnlyShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const headerRef = useHeaderHeight<HTMLElement>();
  const closeMobile = () => setMobileOpen(false);

  useEffect(() => {
    if (!mobileOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;

      setMobileOpen(false);
      document.getElementById("homepage-mobile-menu-button")?.focus();
    };

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [mobileOpen]);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header
        ref={headerRef}
        className="sticky top-0 z-50 border-b border-atf-gray-200 bg-white shadow-sm"
      >
        <ChallengeAnnouncementBanner />
        <div className="atf-container flex h-[76px] items-center justify-between gap-6">
          <Link to="/" className="inline-flex items-center">
            <SiteLogo variant="fullColor" className="h-[38px] max-w-[220px]" />
          </Link>
          <nav
            aria-label="Homepage"
            className="hidden items-center gap-1 lg:flex"
          >
            {homepageNavigation.map((item) => (
              <Link
                key={item.hash}
                to="/"
                hash={item.hash}
                className="px-3 py-2 font-display text-xs font-bold uppercase text-atf-ink transition-colors hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
            <OpportunityButton href="/#funder" size="sm" className="ml-2">
              Partner with Us
            </OpportunityButton>
          </nav>
          <IconButton
            id="homepage-mobile-menu-button"
            variant="ghost"
            className="text-atf-ink lg:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-controls="homepage-mobile-navigation"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? (
              <X className="size-6" aria-hidden="true" />
            ) : (
              <Menu className="size-6" aria-hidden="true" />
            )}
          </IconButton>
        </div>
        {mobileOpen ? (
          <nav
            id="homepage-mobile-navigation"
            aria-label="Mobile homepage"
            className="atf-mobile-menu absolute inset-x-0 top-full overflow-y-auto border-t border-atf-gray-200 bg-white px-6 py-5 shadow-xl lg:hidden"
          >
            <div className="mx-auto grid max-w-7xl gap-1">
              {homepageNavigation.map((item) => (
                <Link
                  key={item.hash}
                  to="/"
                  hash={item.hash}
                  onClick={closeMobile}
                  className="border-b border-atf-gray-200 py-4 font-display text-base font-bold uppercase text-atf-ink hover:text-primary"
                >
                  {item.label}
                </Link>
              ))}
              <OpportunityButton
                href="/#funder"
                className="mt-4"
                onClick={closeMobile}
              >
                Partner with Us
              </OpportunityButton>
            </div>
          </nav>
        ) : null}
      </header>
      <main className="flex-1">{children}</main>
      <footer className="bg-atf-black text-white">
        <div className="atf-container py-12 lg:py-16">
          <div className="grid gap-10 border-b border-white/10 pb-10 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr]">
            <div>
              <Link to="/" className="inline-flex">
                <SiteLogo variant="bright" className="h-10 max-w-[220px]" />
              </Link>
              <p className="mt-5 max-w-sm text-sm leading-7 text-white/50">
                African Technology Forum champions technology-driven solutions
                for Africa's development challenges through consulting,
                innovation challenges, and capacity building.
              </p>
            </div>

            <nav aria-label="Footer homepage">
              <h2 className="font-display text-xs font-bold uppercase text-white">
                Explore
              </h2>
              <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 text-sm text-white/55">
                {homepageFooterNavigation.map((item) => (
                  <li key={item.hash}>
                    <Link
                      to="/"
                      hash={item.hash}
                      className="transition-colors hover:text-white"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div>
              <h2 className="font-display text-xs font-bold uppercase text-white">
                Connect
              </h2>
              <a
                href="mailto:info@africantechnologyforum.org"
                className="mt-5 inline-flex items-center gap-2 break-all text-sm text-white/55 transition-colors hover:text-white"
              >
                <Mail
                  className="size-4 shrink-0 text-primary"
                  aria-hidden="true"
                />
                info@africantechnologyforum.org
              </a>
              <div className="mt-5 flex gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="inline-flex size-10 items-center justify-center border border-white/15 text-white/55 transition-colors hover:border-primary hover:text-primary"
                  >
                    <social.icon className="size-4" aria-hidden="true" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 pt-8 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between">
            <p>
              &copy; {new Date().getFullYear()} African Technology Forum. All
              rights reserved.
            </p>
            <div className="flex flex-wrap gap-6 hidden">
              <Link to="/privacy-policy" className="hover:text-white/70">
                Privacy Policy
              </Link>
              <Link to="/terms-of-service" className="hover:text-white/70">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
