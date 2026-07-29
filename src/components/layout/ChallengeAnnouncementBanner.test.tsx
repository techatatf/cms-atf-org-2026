/**
 * @vitest-environment jsdom
 */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ChallengeAnnouncementBanner } from "@/components/layout/ChallengeAnnouncementBanner";

afterEach(() => cleanup());

describe("ChallengeAnnouncementBanner", () => {
  it("renders the New tag as an Opportunity Button link", () => {
    render(<ChallengeAnnouncementBanner />);

    const newLink = screen.getByRole("link", { name: "New" });

    expect(newLink.getAttribute("href")).toBe("https://bit.ly/atf-wf");
    expect(newLink.getAttribute("data-slot")).toBe("opportunity-button");
    expect(newLink.getAttribute("data-variant")).toBe("primary");
    expect(newLink.getAttribute("data-size")).toBe("sm");
    expect(newLink.getAttribute("data-density")).toBe("compact");
  });

  it("shows the current challenge update and drops its description on mobile", () => {
    render(<ChallengeAnnouncementBanner />);

    const title = screen.getByText("ATF Challenge 2026");
    const body = screen.getByText(
      "— AI School registration is now closed. The build phase begins this September.",
    );
    const action = screen.getByRole("link", { name: "Follow the journey" });
    const copy = title.closest("p");

    expect(copy?.classList.contains("flex")).toBe(true);
    expect(copy?.classList.contains("min-w-0")).toBe(true);
    expect(title.classList.contains("whitespace-nowrap")).toBe(true);
    expect(title.classList.contains("truncate")).toBe(true);
    expect(body.classList.contains("truncate")).toBe(true);
    expect(body.classList.contains("min-w-0")).toBe(true);
    expect(body.classList.contains("hidden")).toBe(true);
    expect(body.classList.contains("sm:block")).toBe(true);
    expect(action.classList.contains("inline-flex")).toBe(true);
    expect(action.classList.contains("hidden")).toBe(false);
  });

  it("can be dismissed", () => {
    render(<ChallengeAnnouncementBanner />);

    fireEvent.click(screen.getByRole("button", { name: "Dismiss announcement" }));

    expect(
      screen.queryByText("ATF Challenge 2026"),
    ).toBeNull();
  });
});
