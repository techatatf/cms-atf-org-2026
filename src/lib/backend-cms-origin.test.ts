import { afterEach, describe, expect, it, vi } from "vitest";

import { resolveBackendCMSOrigin } from "@/lib/backend-cms-origin";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Backend CMS origin", () => {
  it("normalizes a configured origin in any build", () => {
    expect(resolveBackendCMSOrigin("https://cms.example.test/admin", false)).toBe(
      "https://cms.example.test",
    );
    expect(resolveBackendCMSOrigin("https://cms.example.test/", true)).toBe(
      "https://cms.example.test",
    );
  });

  it("falls back to the local Backend CMS only in development", () => {
    expect(resolveBackendCMSOrigin(undefined, true)).toBe(
      "http://localhost:3001",
    );
    expect(resolveBackendCMSOrigin("", true)).toBe("http://localhost:3001");
  });

  it("leaves production builds without an origin and warns once", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    expect(resolveBackendCMSOrigin(undefined, false)).toBeUndefined();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]?.[0]).toContain("VITE_BACKEND_CMS_ORIGIN");
  });

  it("does not warn when an origin is configured or in development", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    resolveBackendCMSOrigin("https://cms.example.test", false);
    resolveBackendCMSOrigin(undefined, true);

    expect(warn).not.toHaveBeenCalled();
  });
});
