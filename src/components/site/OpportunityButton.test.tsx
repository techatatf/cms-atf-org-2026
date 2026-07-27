/**
 * @vitest-environment jsdom
 */
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { OpportunityButton } from "@/components/site/OpportunityButton";

describe("OpportunityButton", () => {
  it("renders a link with stable Opportunity Button attributes when href is provided", () => {
    render(
      <OpportunityButton
        href="mailto:info@atfglobal.org"
        variant="outline"
        size="lg"
      >
        Apply now
      </OpportunityButton>,
    );

    const link = screen.getByRole("link", { name: "Apply now" });

    expect(link.tagName).toBe("A");
    expect(link.getAttribute("href")).toBe("mailto:info@atfglobal.org");
    expect(link.getAttribute("data-slot")).toBe("opportunity-button");
    expect(link.getAttribute("data-variant")).toBe("outline");
    expect(link.getAttribute("data-size")).toBe("lg");
    expect(link.getAttribute("data-density")).toBe("default");
  });

  it("renders a native button when href is absent", () => {
    render(<OpportunityButton>Open form</OpportunityButton>);

    const button = screen.getByRole("button", { name: "Open form" });

    expect(button.tagName).toBe("BUTTON");
    expect(button.getAttribute("type")).toBe("button");
    expect(button.getAttribute("data-slot")).toBe("opportunity-button");
    expect(button.getAttribute("data-variant")).toBe("primary");
    expect(button.getAttribute("data-size")).toBe("md");
    expect(button.getAttribute("data-density")).toBe("default");
  });

  it("does not suppress its stylesheet-owned focus-visible treatment", () => {
    render(<OpportunityButton>Focus target</OpportunityButton>);

    const button = screen.getByRole("button", { name: "Focus target" });

    expect(button.classList.contains("focus-visible:ring-0")).toBe(false);
    expect(button.classList.contains("focus-visible:ring-offset-0")).toBe(false);
  });

  it("supports compact density without changing the small size contract", () => {
    render(
      <OpportunityButton href="#challenge" size="sm" density="compact">
        New
      </OpportunityButton>,
    );

    const link = screen.getByRole("link", { name: "New" });

    expect(link.getAttribute("data-slot")).toBe("opportunity-button");
    expect(link.getAttribute("data-size")).toBe("sm");
    expect(link.getAttribute("data-density")).toBe("compact");
  });

  it("uses native disabled button behavior", () => {
    const onClick = vi.fn();

    render(
      <OpportunityButton disabled onClick={onClick}>
        Submit
      </OpportunityButton>,
    );

    const button = screen.getByRole("button", { name: "Submit" });

    expect(button.hasAttribute("disabled")).toBe(true);

    fireEvent.click(button);

    expect(onClick).not.toHaveBeenCalled();
  });

  it("represents disabled links without invoking click handlers", () => {
    const onClick = vi.fn();

    render(
      <OpportunityButton href="#apply" disabled onClick={onClick}>
        Apply
      </OpportunityButton>,
    );

    const link = screen.getByRole("link", { name: "Apply" });

    expect(link.getAttribute("href")).toBe("#apply");
    expect(link.getAttribute("aria-disabled")).toBe("true");
    expect(link.getAttribute("tabindex")).toBe("-1");

    fireEvent.click(link);

    expect(onClick).not.toHaveBeenCalled();
  });
});
