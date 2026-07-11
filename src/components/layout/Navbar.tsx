import { useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown, Menu, X } from "lucide-react";

import { ChallengeAnnouncementBanner } from "@/components/layout/ChallengeAnnouncementBanner";
import { useHeaderHeight } from "@/components/layout/useHeaderHeight";
import { OpportunityButton } from "@/components/site/OpportunityButton";
import { IconButton, SiteLogo } from "@/components/site/Page";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const NAV_ROW_HEIGHT_CLASS = "h-[76px]";
const NAV_LOGO_HEIGHT_CLASS = "h-[38px]";
const OPPORTUNITY_PANEL_CUT_PX = 16;
const DROPDOWN_PANEL_BORDER_PX = 1;
const PANEL_ITEM_CLASS =
  "rounded-none px-3 py-2 text-sm font-semibold text-atf-gray-700 transition-colors hover:bg-atf-gray-100 hover:text-primary focus:bg-atf-gray-100 focus:text-primary active:bg-primary active:text-white data-[status=active]:bg-primary data-[status=active]:text-white data-[status=active]:hover:bg-primary data-[status=active]:hover:text-white data-[status=active]:focus:bg-primary data-[status=active]:focus:text-white";

type DropdownPanel = "standard" | "opportunity";
type NavChild = { label: string; to: string };
type NavItem =
  | { label: string; to: string; children?: never; panel?: never }
  | {
      label: string;
      to?: never;
      children: NavChild[];
      panel?: DropdownPanel;
    };

const opportunityPanelClipPath = `polygon(0 0, 100% 0, 100% 100%, ${OPPORTUNITY_PANEL_CUT_PX}px 100%, 0 calc(100% - ${OPPORTUNITY_PANEL_CUT_PX}px))`;

const opportunityPanelSurfaceStyle: CSSProperties = {
  clipPath: opportunityPanelClipPath,
};

const opportunityPanelFrameStyle: CSSProperties = {
  ...opportunityPanelSurfaceStyle,
  padding: DROPDOWN_PANEL_BORDER_PX,
};

const navItems: NavItem[] = [
  {
    label: "Who We Are",
    panel: "opportunity",
    children: [
      { label: "Overview", to: "/who-we-are" },
      { label: "Our Mission, Vision and Story", to: "/about" },
      { label: "The Team And Contributors", to: "/team" },
    ],
  },
  {
    label: "What We Do",
    panel: "opportunity",
    children: [
      { label: "Overview", to: "/what-we-do" },
      { label: "ATF Consulting", to: "/consulting" },
      { label: "ATF Challenge", to: "/challenge" },
      { label: "ATF Chapters", to: "/chapters" },
    ],
  },
  {
    label: "Where We Work",
    panel: "opportunity",
    children: [
      { label: "Overview", to: "/where-we-work" },
      { label: "Ghana", to: "/countries/ghana" },
      { label: "Nigeria", to: "/countries/nigeria" },
      { label: "Kenya", to: "/countries/kenya" },
      { label: "South Africa", to: "/countries/south-africa" },
    ],
  },
  {
    label: "Publications",
    panel: "opportunity",
    children: [
      { label: "Overview", to: "/publications" },
      { label: "Newsroom", to: "/news" },
      { label: "Articles", to: "/articles" },
      { label: "Research Papers", to: "/research" },
      { label: "Library", to: "/library" },
    ],
  },
  { label: "Newsroom", to: "/news" },
];

function SmartLink({
  to,
  children,
  className,
  onClick,
  exactActive = false,
}: {
  to: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  exactActive?: boolean;
}) {
  const activeOptions = exactActive ? { exact: true } : undefined;

  if (to.startsWith("/countries/")) {
    const country = to.replace("/countries/", "");
    return (
      <Link
        to="/countries/$country"
        params={{ country }}
        activeOptions={activeOptions}
        className={className}
        onClick={onClick}
      >
        {children}
      </Link>
    );
  }

  return (
    <Link
      to={to}
      activeOptions={activeOptions}
      className={className}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}

function NavDropdownPanel({
  panel = "standard",
  children,
}: {
  panel?: DropdownPanel;
  children: ReactNode;
}) {
  if (panel === "opportunity") {
    return (
      <DropdownMenuContent
        align="start"
        className="min-w-64 rounded-none border-0 bg-transparent p-0 text-atf-ink shadow-none"
      >
        <div
          className="bg-primary drop-shadow-xl"
          style={opportunityPanelFrameStyle}
        >
          <div className="bg-white p-2" style={opportunityPanelSurfaceStyle}>
            {children}
          </div>
        </div>
      </DropdownMenuContent>
    );
  }

  return (
    <DropdownMenuContent
      align="start"
      className="min-w-64 rounded-none border-primary bg-white p-2 text-atf-ink shadow-xl"
    >
      {children}
    </DropdownMenuContent>
  );
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const headerChromeRef = useHeaderHeight<HTMLDivElement>();

  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-atf-gray-200 bg-white text-atf-ink shadow-sm">
      <div ref={headerChromeRef}>
        <ChallengeAnnouncementBanner />

        <div
          className={cn(
            "atf-container flex items-center justify-between gap-6",
            NAV_ROW_HEIGHT_CLASS,
          )}
        >
          <Link to="/" className="inline-flex items-center">
            <SiteLogo
              variant="fullColor"
              className={cn(NAV_LOGO_HEIGHT_CLASS, "max-w-[220px]")}
            />
          </Link>

          <nav
            aria-label="Primary"
            className="hidden items-center gap-1 lg:flex"
          >
            {navItems.map((item) =>
              item.children ? (
                <DropdownMenu key={item.label} modal={false}>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 px-3 py-2 font-display text-xs font-bold uppercase text-atf-gray-700 transition-colors hover:text-primary data-[state=open]:text-primary [&[data-state=open]>svg]:rotate-180"
                    >
                      {item.label}
                      <ChevronDown
                        className="size-4 transition-transform duration-200"
                        aria-hidden="true"
                      />
                    </button>
                  </DropdownMenuTrigger>
                  <NavDropdownPanel panel={item.panel}>
                    {item.children.map((child) => (
                      <DropdownMenuItem
                        key={child.to}
                        asChild
                        className={PANEL_ITEM_CLASS}
                      >
                        <SmartLink to={child.to} exactActive>
                          {child.label}
                        </SmartLink>
                      </DropdownMenuItem>
                    ))}
                  </NavDropdownPanel>
                </DropdownMenu>
              ) : (
                <SmartLink
                  key={item.to}
                  to={item.to}
                  className="px-3 py-2 font-display text-xs font-bold uppercase text-atf-gray-700 transition-colors hover:text-primary"
                >
                  {item.label}
                </SmartLink>
              ),
            )}
          </nav>

          <div className="flex items-center gap-3">
            <OpportunityButton
              href="/consulting"
              variant="primary"
              size="sm"
              className="hidden lg:inline-flex"
            >
              Partner with Us
            </OpportunityButton>
            <IconButton
              variant="ghost"
              className="text-atf-ink lg:hidden"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
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
        </div>
      </div>

      {mobileOpen ? (
        <nav
          aria-label="Mobile"
          className="atf-mobile-menu overflow-y-auto overscroll-contain border-t border-atf-gray-200 bg-white px-6 py-6 lg:hidden"
        >
          <div className="flex flex-col gap-1">
            {navItems.map((item) =>
              item.children ? (
                <div
                  key={item.label}
                  className="border-b border-atf-gray-200 py-3"
                >
                  <p className="mb-3 font-display text-xs font-bold uppercase text-atf-gray-500">
                    {item.label}
                  </p>
                  <div className="grid gap-2">
                    {item.children.map((child) => (
                      <SmartLink
                        key={child.to}
                        to={child.to}
                        onClick={closeMobile}
                        className="py-2 font-display text-base font-bold uppercase text-atf-ink hover:text-primary"
                      >
                        {child.label}
                      </SmartLink>
                    ))}
                  </div>
                </div>
              ) : (
                <SmartLink
                  key={item.to}
                  to={item.to}
                  onClick={closeMobile}
                  className="border-b border-atf-gray-200 py-4 font-display text-base font-bold uppercase text-atf-ink hover:text-primary"
                >
                  {item.label}
                </SmartLink>
              ),
            )}
          </div>
          <div className="mt-6 grid gap-3">
            <OpportunityButton
              href="/consulting"
              variant="primary"
              onClick={closeMobile}
            >
              Partner with Us
            </OpportunityButton>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
