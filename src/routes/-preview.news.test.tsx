/**
 * @vitest-environment jsdom
 */
import { act, cleanup, render, screen } from "@testing-library/react";
import { RouterProvider, createMemoryHistory } from "@tanstack/react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const articleBody = {
  root: {
    children: [
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            text: "This body came from a Payload Live Preview message.",
            type: "text",
            version: 1,
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        type: "paragraph",
        version: 1,
      },
    ],
    direction: "ltr",
    format: "",
    indent: 0,
    type: "root",
    version: 1,
  },
};

const draftArticle = {
  id: 42,
  _status: "draft",
  body: articleBody,
  category: "Research",
  excerpt: "The private draft excerpt.",
  featured: false,
  heroImage: 7,
  publishedAt: "2026-08-30T12:00:00.000Z",
  slug: "private-draft",
  title: "Private Draft Preview",
};

const populatedHeroImage = {
  id: 7,
  alt: "Editors reviewing the draft hero image",
  url: "/api/media/file/draft-hero.jpg",
};

async function renderPreviewRoute({ homepageOnlyMode = false } = {}) {
  // Read each configuration afresh in both the route and the Media mapper.
  const { createAppRouter } = await import("@/router");
  const router = createAppRouter({
    homepageOnlyMode,
    history: createMemoryHistory({
      initialEntries: ["/preview/news/42"],
    }),
  });

  render(<RouterProvider router={router} />);
}

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv("VITE_BACKEND_CMS_ORIGIN", undefined);
  vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
  Object.defineProperty(Element.prototype, "scrollIntoView", {
    configurable: true,
    value: vi.fn(),
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  Reflect.deleteProperty(Element.prototype, "scrollIntoView");
});

describe("News Article Live Preview route", () => {
  it.each([
    {
      configuration: "trailing slash",
      configuredURL: "https://cms.example.test/",
      backendCMSOrigin: "https://cms.example.test",
    },
    {
      configuration: "no trailing slash",
      configuredURL: "https://cms.example.test",
      backendCMSOrigin: "https://cms.example.test",
    },
    {
      configuration: "local-development default",
      configuredURL: undefined,
      backendCMSOrigin: "http://localhost:3001",
    },
  ])(
    "populates trusted drafts with $configuration configuration",
    async ({ configuredURL, backendCMSOrigin }) => {
      vi.stubEnv("VITE_BACKEND_CMS_ORIGIN", configuredURL);
      const fetchSpy = vi
        .spyOn(globalThis, "fetch")
        .mockImplementation(async (_input, init) => {
          const requestBody = JSON.parse(String(init?.body)) as {
            data: typeof draftArticle;
          };

          return new Response(
            JSON.stringify({
              ...requestBody.data,
              heroImage: populatedHeroImage,
            }),
            { status: 200 },
          );
        });

      await renderPreviewRoute();

      expect(
        await screen.findByRole("heading", {
          level: 1,
          name: "Waiting for News Article preview",
        }),
      ).toBeTruthy();

      const lookalikeOrigin = new URL(backendCMSOrigin);
      lookalikeOrigin.hostname += ".untrusted.example";
      for (const origin of [
        "https://untrusted.example",
        lookalikeOrigin.origin,
      ]) {
        await act(async () => {
          window.dispatchEvent(
            new MessageEvent("message", {
              data: {
                collectionSlug: "news-articles",
                data: { ...draftArticle, title: "Untrusted Draft" },
                type: "payload-live-preview",
              },
              origin,
            }),
          );
        });

        expect(fetchSpy).not.toHaveBeenCalled();
        expect(screen.queryByText("Untrusted Draft")).toBeNull();
        expect(
          screen.getByRole("heading", {
            name: "Waiting for News Article preview",
          }),
        ).toBeTruthy();
      }

      window.dispatchEvent(
        new MessageEvent("message", {
          data: {
            collectionSlug: "news-articles",
            data: draftArticle,
            type: "payload-live-preview",
          },
          origin: backendCMSOrigin,
        }),
      );

      expect(
        await screen.findByRole("heading", {
          level: 1,
          name: "Private Draft Preview",
        }),
      ).toBeTruthy();
      expect(
        screen.getByText("This body came from a Payload Live Preview message."),
      ).toBeTruthy();
      const heroImage = screen.getByRole("img", {
        name: "Editors reviewing the draft hero image",
      });
      expect(heroImage.getAttribute("src")).toBe(
        `${backendCMSOrigin}/api/media/file/draft-hero.jpg`,
      );
      expect(screen.queryByText("Waiting for News Article preview")).toBeNull();
      expect(fetchSpy).toHaveBeenCalledTimes(1);

      const [requestURL, requestInit] = fetchSpy.mock.calls[0];
      expect(String(requestURL)).toBe(
        `${backendCMSOrigin}/api/news-articles/42`,
      );
      expect(requestInit).toMatchObject({
        credentials: "include",
        method: "POST",
      });
      expect(
        new Headers(requestInit?.headers).get("X-Payload-HTTP-Method-Override"),
      ).toBe("GET");
      expect(JSON.parse(String(requestInit?.body))).toMatchObject({
        data: draftArticle,
        depth: 1,
      });
    },
  );

  it("declares the dedicated preview route non-indexable", async () => {
    vi.spyOn(globalThis, "fetch");

    await renderPreviewRoute();

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Waiting for News Article preview",
      }),
    ).toBeTruthy();
    expect(
      document.head
        .querySelector('meta[name="robots"]')
        ?.getAttribute("content"),
    ).toBe("noindex, nofollow");
    expect(document.querySelector('a[href^="/preview"]')).toBeNull();
  });

  it("remains available while homepage-only mode hides ordinary public routes", async () => {
    vi.spyOn(globalThis, "fetch");

    await renderPreviewRoute({ homepageOnlyMode: true });

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Waiting for News Article preview",
      }),
    ).toBeTruthy();
  });
});
