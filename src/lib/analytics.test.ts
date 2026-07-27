import { afterEach, describe, expect, it, vi } from "vitest";

import {
  captureAnalyticsEvent,
  setAnalyticsCapture,
} from "@/lib/analytics";

afterEach(() => {
  setAnalyticsCapture();
});

describe("application analytics boundary", () => {
  it("is a safe no-op when no capture implementation is configured", () => {
    setAnalyticsCapture();

    expect(() =>
      captureAnalyticsEvent("newsletter_subscribed", {
        page: "home",
        form_type: "newsletter",
        email_domain: "example.com",
      }),
    ).not.toThrow();
  });

  it("forwards a typed event to the configured capture implementation", () => {
    const capture = vi.fn();
    setAnalyticsCapture(capture);

    captureAnalyticsEvent("newsletter_subscribed", {
      page: "home",
      form_type: "newsletter",
      email_domain: "example.com",
    });

    expect(capture).toHaveBeenCalledOnce();
    expect(capture).toHaveBeenCalledWith("newsletter_subscribed", {
      page: "home",
      form_type: "newsletter",
      email_domain: "example.com",
    });
  });

  it("contains errors thrown by the capture implementation", () => {
    setAnalyticsCapture(() => {
      throw new Error("Analytics unavailable");
    });

    expect(() =>
      captureAnalyticsEvent("newsletter_subscribed", {
        page: "home",
        form_type: "newsletter",
        email_domain: "example.com",
      }),
    ).not.toThrow();
  });
});
