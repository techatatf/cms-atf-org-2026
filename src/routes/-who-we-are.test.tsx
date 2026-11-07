/**
 * @vitest-environment jsdom
 */
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { RouterProvider, createMemoryHistory } from "@tanstack/react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createAppRouter } from "@/router";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

async function renderPage(path: string) {
  vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
  const router = createAppRouter({
    homepageOnlyMode: false,
    history: createMemoryHistory({ initialEntries: [path] }),
  });
  render(<RouterProvider router={router} />);
  return router;
}

const pageHeadings = [
  ["/about", "Advancing the development of science and technology in Africa since 1988."],
  ["/team", "The people behind the forum."],
  ["/governance", "How ATF is governed."],
  ["/partners", "Partners and funders."],
  ["/annual-reports", "Annual reports."],
  ["/careers", "Work with the forum."],
] as const;

describe("Who We Are pages", () => {
  it.each(pageHeadings)("renders %s with the design-reference title", async (path, title) => {
    await renderPage(path);
    expect(await screen.findByRole("heading", { level: 1, name: title })).toBeTruthy();
  });

  it("links the Mission page subnav to its sections", async () => {
    await renderPage("/about");
    const subnav = await screen.findByRole("navigation", { name: "On this page" });
    const links = within(subnav)
      .getAllByRole("link")
      .map((link) => [link.textContent, link.getAttribute("href")]);

    expect(links).toEqual([
      ["How We Do It", "#mission"],
      ["Our Story", "#story"],
      ["Where We're Going", "#direction"],
      ["How We Work", "#pillars"],
      ["In Our Words", "#founding"],
    ]);
    for (const [, href] of links) {
      expect(document.querySelector(href!)).not.toBeNull();
    }
    expect(screen.getByRole("link", { name: "Partner with ATF" }).getAttribute("href")).toBe(
      "/partners#become",
    );
  });

  it("filters the Challenge team and steps through profiles", async () => {
    await renderPage("/team");
    await screen.findByRole("heading", { level: 1, name: "The people behind the forum." });

    expect(screen.getAllByRole("button", { name: /^View profile:/ })).toHaveLength(4 + 17);

    fireEvent.click(screen.getByRole("button", { name: /^Country Leads/ }));
    expect(screen.getAllByRole("button", { name: /^View profile:/ })).toHaveLength(4 + 4);

    fireEvent.click(screen.getByRole("button", { name: "View profile: Victor Mutua" }));
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByRole("heading", { name: "Victor Mutua" })).toBeTruthy();
    expect(within(dialog).getByText("ATF AI Challenge · Country Leads")).toBeTruthy();
    expect(within(dialog).getByText("3 / 4")).toBeTruthy();

    fireEvent.click(within(dialog).getByRole("button", { name: "Next person" }));
    expect(within(dialog).getByRole("heading", { name: "Ntsoaki Mohapi" })).toBeTruthy();
    fireEvent.click(within(dialog).getByRole("button", { name: "Next person" }));
    expect(within(dialog).getByRole("heading", { name: "Dr. Linda Sarpong" })).toBeTruthy();
  });

  it("filters the partner wall by role and country", async () => {
    await renderPage("/partners");
    await screen.findByRole("heading", { level: 1, name: "Partners and funders." });

    fireEvent.change(screen.getByRole("combobox", { name: "Filter by country" }), {
      target: { value: "Kenya" },
    });
    expect(screen.getByText("No problem-statement partners listed for this country yet.")).toBeTruthy();
    expect(screen.getByText("No universities listed for this country yet.")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /^Funders/ }));
    expect(screen.queryByRole("heading", { name: "Universities" })).toBeNull();
    expect(screen.getByRole("heading", { name: "Funders" })).toBeTruthy();
  });

  it("validates the volunteer form before opening the email app", async () => {
    await renderPage("/careers");
    await screen.findByRole("heading", { level: 1, name: "Work with the forum." });

    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    expect(screen.getAllByText("Please fill this in.").length).toBeGreaterThanOrEqual(3);
    expect(screen.getByText("Choose at least one.")).toBeTruthy();
    expect(screen.getByText("Please tick this box to continue.")).toBeTruthy();
  });

  it("shows the empty state until the first annual report is published", async () => {
    await renderPage("/annual-reports");
    expect(
      await screen.findByRole("heading", { name: "Our first annual report is in preparation." }),
    ).toBeTruthy();
    expect(screen.getByText("No reports published yet. The first will appear here.")).toBeTruthy();
  });
});

const heroBreadcrumbs = [
  ["/about", [["Home", "/"], ["Who We Are", "/about"]], "Mission & Story"],
  ["/team", [["Home", "/"], ["Who We Are", "/about"]], "Team"],
  ["/careers", [["Home", "/"], ["Who We Are", "/about"]], "Careers & Volunteering"],
  ["/consulting", [["Home", "/"], ["What We Do", "/consulting"]], "ATF Consulting"],
  ["/challenge", [["Home", "/"], ["What We Do", "/consulting"]], "ATF Challenge"],
  ["/chapters", [["Home", "/"], ["What We Do", "/consulting"]], "ATF Chapters"],
] as const;

describe("Page Hero", () => {
  it.each(heroBreadcrumbs)(
    "shows the %s breadcrumb inside the hero, with section crumbs leading to the entry page",
    async (path, links, current) => {
      await renderPage(path);
      const heading = await screen.findByRole("heading", { level: 1 });
      const hero = heading.closest("section")!;
      const trail = within(hero).getByRole("navigation", { name: "Breadcrumb" });

      expect(
        within(trail)
          .getAllByRole("link")
          .map((link) => [link.textContent, link.getAttribute("href")]),
      ).toEqual(links);
      const currents = trail.querySelectorAll('[aria-current="page"]');
      expect(currents).toHaveLength(1);
      expect(currents[0].textContent).toBe(current);
    },
  );

  it.each([
    ["/consulting", "The ATF network, on your problem.", "on your problem"],
    ["/challenge", "Learn AI. Build for a real problem.", "real"],
    ["/chapters", "Chapters inside universities.", "inside"],
    ["/governance", "How ATF is governed.", "governed"],
  ] as const)("renders the %s reference title with its accent", async (path, title, accent) => {
    await renderPage(path);
    const heading = await screen.findByRole("heading", { level: 1, name: title });
    expect(heading.querySelector("em")?.textContent).toBe(accent);
  });

  it("shows Key Facts from the design reference on What We Do pages", async () => {
    await renderPage("/chapters");
    await screen.findByRole("heading", { level: 1, name: "Chapters inside universities." });
    expect(screen.getByText("Chapters at peak").nextElementSibling?.textContent).toBe("6");
    expect(screen.getByText("Reactivating")).toBeTruthy();
  });
});
