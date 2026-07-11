import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";

import { useHeaderHeight } from "@/components/layout/useHeaderHeight";
import { SiteLogo } from "@/components/site/Page";

export function HomepageOnlyShell({ children }: { children: ReactNode }) {
  const headerRef = useHeaderHeight<HTMLElement>();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header
        ref={headerRef}
        className="sticky top-0 z-50 border-b border-atf-gray-200 bg-white shadow-sm"
      >
        <div className="atf-container flex h-[76px] items-center justify-between gap-6">
          <Link to="/" className="inline-flex items-center">
            <SiteLogo variant="fullColor" className="h-[38px] max-w-[220px]" />
          </Link>
          <nav aria-label="Homepage">
            <Link
              to="/"
              hash="about"
              className="font-display text-sm font-bold uppercase text-atf-ink transition-colors hover:text-primary"
            >
              About
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="bg-atf-black text-white">
        <div className="atf-container flex flex-wrap gap-6 py-8 text-sm text-white/60">
          <Link to="/privacy-policy" className="hover:text-white">
            Privacy Policy
          </Link>
          <Link to="/terms-of-service" className="hover:text-white">
            Terms of Service
          </Link>
        </div>
      </footer>
    </div>
  );
}
