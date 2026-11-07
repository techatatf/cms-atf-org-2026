/**
 * @vitest-environment jsdom
 */
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Navbar } from "@/components/layout/Navbar";
import { HomepageOnlyShell } from "@/components/layout/HomepageOnlyShell";

let activePath = "/";

afterEach(() => {
  cleanup();
  document.documentElement.style.removeProperty("--atf-header-height");
  vi.restoreAllMocks();
  activePath = "/";
});

function rectWithHeight(height: number): DOMRect {
  return {
    bottom: height,
    height,
    left: 0,
    right: 0,
    top: 0,
    width: 0,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  };
}

vi.mock("@tanstack/react-router", () => ({
  Link: ({
    to,
    params,
    activeOptions,
    children,
    ...props
  }: {
    to: string;
    params?: Record<string, string>;
    activeOptions?: { exact?: boolean };
    children: React.ReactNode;
    [key: string]: unknown;
  }) => {
    const href =
      params && "country" in params ? `/countries/${params.country}` : to;
    const active = activeOptions?.exact
      ? activePath === href
      : activePath === href || activePath.startsWith(`${href}/`);

    return (
      <a
        href={href}
        data-status={active ? "active" : undefined}
        aria-current={active ? "page" : undefined}
        {...props}
      >
        {children}
      </a>
    );
  },
}));

describe("Navbar", () => {
  it("keeps the section parents as dropdown triggers", () => {
    render(<Navbar />);

    const primaryNav = screen.getByRole("navigation", { name: "Primary" });
    const dropdownTriggers = within(primaryNav)
      .getAllByRole("button")
      .map((button) => ({
        label: button.textContent,
        hasMenu: button.getAttribute("aria-haspopup"),
      }));

    expect(dropdownTriggers).toEqual([
      { label: "Who We Are", hasMenu: "menu" },
      { label: "What We Do", hasMenu: "menu" },
    ]);
  });

  it("lists the Who We Are pages in order and keeps Publications and Newsroom elevated", () => {
    render(<Navbar />);

    fireEvent.pointerDown(screen.getByRole("button", { name: "Who We Are" }));

    const menu = screen.getByRole("menu");
    const desktopItems = within(menu)
      .getAllByRole("link")
      .map((item) => ({
        label: item.textContent,
        href: item.getAttribute("href"),
      }));

    expect(desktopItems).toEqual([
      { label: "Mission & Story", href: "/about" },
      { label: "Team", href: "/team" },
      { label: "Governance", href: "/governance" },
      { label: "Partners & Funders", href: "/partners" },
      { label: "Annual Reports", href: "/annual-reports" },
      { label: "Careers & Volunteering", href: "/careers" },
    ]);

    const primaryNav = screen.getByRole("navigation", { name: "Primary" });
    expect(
      within(primaryNav).getByRole("link", { name: "Publications" }).getAttribute("href"),
    ).toBe("/publications");
    expect(
      within(primaryNav).getByRole("link", { name: "Newsroom" }).getAttribute("href"),
    ).toBe("/news");
  });

  it("omits challenge CTAs and keeps the mobile menu scrollable", () => {
    render(<Navbar />);

    expect(
      screen.queryByRole("link", { name: "Join Challenge" }),
    ).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));

    const mobileMenu = screen.getByRole("navigation", { name: "Mobile" });

    expect(
      within(mobileMenu).queryByRole("link", { name: "Apply to Challenge" }),
    ).toBeNull();
    expect(mobileMenu.classList.contains("overflow-y-auto")).toBe(true);
    expect(mobileMenu.classList.contains("overscroll-contain")).toBe(true);
    expect(mobileMenu.classList.contains("atf-mobile-menu")).toBe(true);
  });

  it("writes measured header chrome height for viewport-aware layout", async () => {
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue(
      rectWithHeight(126),
    );

    render(<Navbar />);

    await waitFor(() => {
      expect(
        document.documentElement.style.getPropertyValue("--atf-header-height"),
      ).toBe("126px");
    });

    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));

    const mobileMenu = screen.getByRole("navigation", { name: "Mobile" });

    expect(mobileMenu.classList.contains("atf-mobile-menu")).toBe(true);
    expect(mobileMenu.className).not.toContain("126px");
  });

  it("mirrors the section hierarchy in the mobile menu", () => {
    render(<Navbar />);

    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));

    const mobileMenu = screen.getByRole("navigation", { name: "Mobile" });
    const mobileLinks = within(mobileMenu)
      .getAllByRole("link")
      .map((link) => ({
        label: link.textContent,
        href: link.getAttribute("href"),
      }));

    expect(mobileLinks).toEqual([
      { label: "Mission & Story", href: "/about" },
      { label: "Team", href: "/team" },
      { label: "Governance", href: "/governance" },
      { label: "Partners & Funders", href: "/partners" },
      { label: "Annual Reports", href: "/annual-reports" },
      { label: "Careers & Volunteering", href: "/careers" },
      { label: "ATF Consulting", href: "/consulting" },
      { label: "ATF Challenge", href: "/challenge" },
      { label: "ATF Chapters", href: "/chapters" },
      { label: "Publications", href: "/publications" },
      { label: "Newsroom", href: "/news" },
      { label: "Partner with Us", href: "/consulting" },
    ]);
  });

  it("uses the primary Opportunity Button for partner actions", () => {
    render(<Navbar />);

    const desktopPartner = screen.getByRole("link", {
      name: "Partner with Us",
    });

    expect(desktopPartner.getAttribute("data-slot")).toBe("opportunity-button");
    expect(desktopPartner.getAttribute("data-variant")).toBe("primary");

    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));

    const mobileMenu = screen.getByRole("navigation", { name: "Mobile" });
    const mobilePartner = within(mobileMenu).getByRole("link", {
      name: "Partner with Us",
    });

    expect(mobilePartner.getAttribute("data-slot")).toBe("opportunity-button");
    expect(mobilePartner.getAttribute("data-variant")).toBe("primary");
  });

  it("applies the panel item state styling contract to dropdown links", () => {
    render(<Navbar />);

    fireEvent.pointerDown(screen.getByRole("button", { name: "Who We Are" }));

    const menu = screen.getByRole("menu");
    const item = within(menu).getByRole("link", { name: "Team" });

    expect(item.className).toContain("font-semibold");
    expect(item.className).toContain("hover:bg-atf-gray-100");
    expect(item.className).toContain("hover:text-primary");
    expect(item.className).toContain("focus:bg-atf-gray-100");
    expect(item.className).toContain("focus:text-primary");
    expect(item.className).toContain("active:bg-primary");
    expect(item.className).toContain("active:text-white");
    expect(item.className).toContain("data-[status=active]:bg-primary");
    expect(item.className).toContain("data-[status=active]:text-white");
    expect(item.className).toContain(
      "data-[status=active]:hover:bg-primary",
    );
    expect(item.className).toContain(
      "data-[status=active]:focus:text-white",
    );
  });

  it("keeps the Newsroom navigation active on landing and article pages", () => {
    activePath = "/news";
    render(<Navbar />);

    const primary = () => screen.getByRole("navigation", { name: "Primary" });
    expect(within(primary()).getByRole("link", { name: "Newsroom" }).getAttribute("aria-current")).toBe("page");
    expect(within(primary()).getByRole("link", { name: "Publications" }).getAttribute("aria-current")).toBeNull();

    cleanup();
    activePath = "/news/some-article";
    render(<Navbar />);

    const primaryNewsroom = within(primary()).getByRole("link", { name: "Newsroom" });
    expect(primaryNewsroom.getAttribute("aria-current")).toBe("page");
    expect(primaryNewsroom.className).toContain("data-[status=active]:border-primary");
    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    expect(within(screen.getByRole("navigation", { name: "Mobile" })).getByRole("link", { name: "Newsroom" }).getAttribute("aria-current")).toBe("page");
  });

  it("defaults both header shells to dark and supports the shared light variant", () => {
    render(<Navbar />);
    expect(screen.getByRole("banner").getAttribute("data-header-theme")).toBe("dark");
    expect(screen.getByAltText("African Technology Forum").getAttribute("src")).toBe("/atf-assets/v2/logo-bright.png");
    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    expect(screen.getByRole("navigation", { name: "Mobile" }).className).toContain("bg-atf-black");

    cleanup();
    render(<Navbar theme="light" />);
    expect(screen.getByRole("banner").getAttribute("data-header-theme")).toBe("light");
    expect(screen.getByAltText("African Technology Forum").getAttribute("src")).toBe("/atf-assets/v2/logo-full-color.png");

    cleanup();
    render(<HomepageOnlyShell><p>Home</p></HomepageOnlyShell>);
    expect(screen.getByRole("banner").getAttribute("data-header-theme")).toBe("dark");
    cleanup();
    render(<HomepageOnlyShell theme="light"><p>Home</p></HomepageOnlyShell>);
    expect(screen.getByRole("banner").getAttribute("data-header-theme")).toBe("light");
  });
});
