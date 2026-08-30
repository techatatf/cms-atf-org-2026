/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { RouterProvider, createMemoryHistory } from "@tanstack/react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createAppRouter } from "@/router";

const backendCMSOrigin =
  import.meta.env.VITE_BACKEND_CMS_ORIGIN || "http://localhost:3001";

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
  heroImage: null,
  publishedAt: "2026-08-30T12:00:00.000Z",
  slug: "private-draft",
  title: "Private Draft Preview",
};

function renderPreviewRoute({ homepageOnlyMode = false } = {}) {
  const router = createAppRouter({
    homepageOnlyMode,
    history: createMemoryHistory({
      initialEntries: ["/preview/news/42"],
    }),
  });

  render(<RouterProvider router={router} />);
}

beforeEach(() => {
  vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
  Object.defineProperty(Element.prototype, "scrollIntoView", {
    configurable: true,
    value: vi.fn(),
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  Reflect.deleteProperty(Element.prototype, "scrollIntoView");
});

describe("News Article Live Preview route", () => {
  it("renders draft messages only from the configured Backend CMS origin", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(
      async (_input, init) => {
        const requestBody = JSON.parse(String(init?.body)) as {
          data: typeof draftArticle;
        };

        return new Response(JSON.stringify(requestBody.data), { status: 200 });
      },
    );

    renderPreviewRoute();

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Waiting for News Article preview",
      }),
    ).toBeTruthy();

    window.dispatchEvent(
      new MessageEvent("message", {
        data: {
          collectionSlug: "news-articles",
          data: { ...draftArticle, title: "Untrusted Draft" },
          type: "payload-live-preview",
        },
        origin: "https://untrusted.example",
      }),
    );

    await waitFor(() => expect(fetchSpy).not.toHaveBeenCalled());
    expect(screen.queryByText("Untrusted Draft")).toBeNull();

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
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    const [requestURL, requestInit] = fetchSpy.mock.calls[0];
    expect(String(requestURL)).toBe(`${backendCMSOrigin}/api/news-articles/42`);
    expect(requestInit).toMatchObject({
      credentials: "include",
      method: "POST",
    });
    expect(new Headers(requestInit?.headers).get("X-Payload-HTTP-Method-Override")).toBe(
      "GET",
    );
  });

  it("declares the dedicated preview route non-indexable", async () => {
    vi.spyOn(globalThis, "fetch");

    renderPreviewRoute();

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

    renderPreviewRoute({ homepageOnlyMode: true });

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Waiting for News Article preview",
      }),
    ).toBeTruthy();
  });
});
