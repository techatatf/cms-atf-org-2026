/**
 * @vitest-environment jsdom
 */
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { RouterProvider, createMemoryHistory } from "@tanstack/react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createAppRouter } from "@/router";

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
            text: "This body came from Payload rich text.",
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

function createDeferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });

  return { promise, reject, resolve };
}

function payloadResponse(
  heroImage: null | { alt: string; url: string } = null,
) {
  return new Response(
    JSON.stringify({
      docs: [
        {
          id: 7,
          _status: "published",
          body: articleBody,
          category: "Research",
          excerpt: "The public article excerpt.",
          featured: false,
          heroImage,
          publishedAt: "2026-08-29T12:00:00.000Z",
          slug: "fetched-public-article",
          title: "Fetched Public Article",
        },
      ],
      totalDocs: 1,
    }),
    { status: 200 },
  );
}

function renderArticleRoute(
  initialEntry = "/news/fetched-public-article",
) {
  const router = createAppRouter({
    homepageOnlyMode: false,
    history: createMemoryHistory({
      initialEntries: [initialEntry],
    }),
  });

  render(<RouterProvider router={router} />);

  return router;
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

describe("published News Article route", () => {
  it("keeps the shared layout visible while loading and renders Payload rich text", async () => {
    const response = createDeferred<Response>();
    vi.spyOn(globalThis, "fetch").mockReturnValue(response.promise);

    renderArticleRoute();

    expect(await screen.findByRole("banner")).toBeTruthy();
    expect(screen.getByRole("contentinfo")).toBeTruthy();
    expect(screen.getByRole("status").textContent).toContain(
      "Loading News Article...",
    );

    response.resolve(payloadResponse());

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Fetched Public Article",
      }),
    ).toBeTruthy();
    expect(screen.getAllByText("The public article excerpt.")).toHaveLength(2);
    expect(
      screen.getByText("This body came from Payload rich text."),
    ).toBeTruthy();
  });

  it("replaces a failed hero image without hiding the News Article text", async () => {
    const alt = "Editors reviewing a workshop prototype";
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      payloadResponse({
        alt,
        url: "/api/media/file/workshop-prototype.jpg",
      }),
    );

    renderArticleRoute();

    const image = await screen.findByRole("img", { name: alt });
    fireEvent.error(image);

    expect(screen.getByText("Image unavailable")).toBeTruthy();
    expect(
      screen.getByRole("img", { name: `${alt}. Image unavailable.` }),
    ).toBeTruthy();
    expect(screen.getByText("This body came from Payload rich text.")).toBeTruthy();
  });

  it("replaces a Previous News Slug history entry with the current URL", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(payloadResponse());
    const router = renderArticleRoute("/news/previous-public-news-slug");

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Fetched Public Article",
      }),
    ).toBeTruthy();
    await waitFor(() => {
      expect(router.state.location.pathname).toBe(
        "/news/fetched-public-article",
      );
    });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it("shows Article not found. after a successful empty response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ docs: [], totalDocs: 0 }), { status: 200 }),
    );

    renderArticleRoute();

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Article not found.",
      }),
    ).toBeTruthy();
    expect(screen.getByRole("banner")).toBeTruthy();
    expect(screen.getByRole("contentinfo")).toBeTruthy();
  });

  it("waits for a visible Retry action before making a second request", async () => {
    const retryResponse = createDeferred<Response>();
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockRejectedValueOnce(new TypeError("offline"))
      .mockReturnValueOnce(retryResponse.promise);

    renderArticleRoute();

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "News temporarily unavailable",
      }),
    ).toBeTruthy();
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    expect(screen.getByRole("status").textContent).toContain(
      "Loading News Article...",
    );
    expect(fetchSpy).toHaveBeenCalledTimes(2);

    retryResponse.resolve(payloadResponse());

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Fetched Public Article",
      }),
    ).toBeTruthy();
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });
});
