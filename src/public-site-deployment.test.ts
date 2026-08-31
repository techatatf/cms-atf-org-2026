import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repositoryDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

function readVercelConfiguration() {
  return JSON.parse(
    readFileSync(path.join(repositoryDirectory, "vercel.json"), "utf8"),
  ) as {
    headers?: Array<{
      has?: Array<{ type?: string; value?: string }>;
      headers?: Array<{ key?: string; value?: string }>;
      source?: string;
    }>;
    rewrites?: Array<{ destination?: string; source?: string }>;
  };
}

describe("Public Site Vercel deployment", () => {
  it("serves index.html for direct application-route requests", () => {
    const configuration = readVercelConfiguration();

    expect(configuration.rewrites).toContainEqual({
      destination: "/index.html",
      source: "/(.*)",
    });
  });

  it("marks only the Demo Rehearsal host as non-indexable", () => {
    const configuration = readVercelConfiguration();

    expect(configuration.headers).toEqual([
      {
        has: [
          {
            type: "host",
            value: "public-demo.africantechnologyforum.org",
          },
        ],
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow",
          },
        ],
        source: "/(.*)",
      },
    ]);
  });
});
