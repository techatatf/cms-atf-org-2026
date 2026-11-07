/**
 * @vitest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { LibraryPage } from "@/components/site/LibraryPage";

vi.mock("@tanstack/react-router", () => ({
  useLinkProps: ({ to, ...props }: { to: string; [key: string]: unknown }) => ({
    href: to,
    ...props,
  }),
  Link: ({
    to,
    children,
    ...props
  }: {
    to: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

describe("LibraryPage", () => {
  it("keeps the library category collection at /library", () => {
    render(<LibraryPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Library" }),
    ).toBeTruthy();

    expect(
      screen.getByRole("link", { name: /Articles/i }).getAttribute("href"),
    ).toBe("/articles");
    expect(
      screen.getByRole("link", { name: /Research Papers/i }).getAttribute("href"),
    ).toBe("/research");
    expect(screen.getByRole("heading", { name: "Reports" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Case Studies" })).toBeTruthy();
  });
});
