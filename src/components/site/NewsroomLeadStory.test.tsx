/**
 * @vitest-environment jsdom
 */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import { NewsroomLeadStory } from "@/components/site/NewsroomLeadStory";
import type { NewsArticle } from "@/services/news";

vi.mock("@/components/site/OpportunityButton", () => ({
  OpportunityButton: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

afterEach(cleanup);

it("uses the compact title and excerpt sizes on wide screens only when the Lead Story has an image", () => {
  const article = {
    id: "1", body: { root: { children: [], direction: "ltr", format: "", indent: 0, type: "root", version: 1 } },
    category: "Press", excerpt: "Summary", featured: true,
    heroImage: { alt: "Lead photo", url: "https://cms.example.test/first.jpg" },
    publishedAt: "2026-08-30T09:00:00.000Z", slug: "lead", title: "Lead",
  } as NewsArticle;
  const { rerender } = render(<NewsroomLeadStory article={article} />);
  expect(screen.getByRole("heading", { name: "Lead" }).className).toContain("lg:text-3xl");
  expect(screen.getByText("Summary").className).toContain("lg:text-base");
  rerender(<NewsroomLeadStory article={{ ...article, heroImage: null }} />);
  expect(screen.getByRole("heading", { name: "Lead" }).className).not.toContain("lg:text-3xl");
  expect(screen.getByText("Summary").className).not.toContain("lg:text-base");
});

it("recovers the Lead Story image when an editor supplies a new URL", () => {
  const article = {
    id: "1", body: { root: { children: [], direction: "ltr", format: "", indent: 0, type: "root", version: 1 } },
    category: "Press", excerpt: "Summary", featured: true,
    heroImage: { alt: "Lead photo", url: "https://cms.example.test/first.jpg" },
    publishedAt: "2026-08-30T09:00:00.000Z", slug: "lead", title: "Lead",
  } as NewsArticle;
  const { rerender } = render(<NewsroomLeadStory article={article} />);
  fireEvent.error(screen.getByRole("img", { name: "Lead photo" }));
  expect(screen.queryByRole("img", { name: "Lead photo" })).toBeNull();
  rerender(<NewsroomLeadStory article={{ ...article, heroImage: { alt: "Replacement photo", url: "https://cms.example.test/second.jpg" } }} />);
  expect(screen.getByRole("img", { name: "Replacement photo" }).getAttribute("src")).toBe("https://cms.example.test/second.jpg");
});
