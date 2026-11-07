/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen, within } from "@testing-library/react";
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

async function subnavLinks() {
  const subnav = await screen.findByRole("navigation", { name: "On this page" });
  return within(subnav)
    .getAllByRole("link")
    .map((link) => [link.textContent, link.getAttribute("href")]);
}

describe("What We Do pages", () => {
  it.each([
    ["/consulting", "The ATF network, on your problem."],
    ["/challenge", "Learn AI. Build for a real problem."],
    ["/chapters", "Chapters inside universities."],
  ])("renders %s with the design-reference title", async (path, title) => {
    await renderPage(path);
    expect(await screen.findByRole("heading", { level: 1, name: title })).toBeTruthy();
  });

  it("gives Consulting its sections and an enquiry form", async () => {
    await renderPage("/consulting");
    expect(await subnavLinks()).toEqual([
      ["What We Do", "#services"],
      ["How We Work", "#method"],
      ["Where It Comes From", "#history"],
      ["Work With Us", "#engage"],
    ]);
    expect(screen.getByRole("heading", { name: "Four kinds of work." })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Request a conversation/ })).toBeTruthy();
  });

  it("sends Challenge applicants to atfchallenge.org and answers FAQs", async () => {
    await renderPage("/challenge");
    expect(await subnavLinks()).toEqual([
      ["How It Works", "#how"],
      ["Problem Partners", "#partners"],
      ["Since 2023", "#growth"],
      ["FAQ", "#faq"],
    ]);
    const apply = screen.getByRole("link", { name: /Apply on atfchallenge.org/ });
    expect(apply.getAttribute("href")).toBe("https://atfchallenge.org");
    expect(screen.getByText("Who can take part?")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Korle Bu Teaching Hospital" })).toBeTruthy();
  });

  it("maps where ATF works and explains how to start a chapter", async () => {
    await renderPage("/chapters");
    expect(await subnavLinks()).toEqual([
      ["Where We Work", "#where"],
      ["What Chapters Do", "#does"],
      ["History", "#history"],
      ["Bring ATF to Your University", "#start"],
    ]);
    expect(
      screen.getByRole("img", { name: /Map of Africa highlighting Ghana, Nigeria, Kenya, South Africa, Benin/ }),
    ).toBeTruthy();
    const email = screen.getByRole("link", { name: /Email us about a chapter/ });
    expect(email.getAttribute("href")).toBe(
      "mailto:info@africantechnologyforum.org?subject=Chapter%20enquiry",
    );
  });
});
