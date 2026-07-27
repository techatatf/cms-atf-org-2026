import { afterEach, describe, expect, it, vi } from "vitest";

import { subscribeToNewsletter } from "@/services/newsletter";

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("newsletter subscription transport", () => {
  it("posts the trimmed address to the exact ATF email-service contract", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: true, message: "Welcome!" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await expect(
      subscribeToNewsletter(" Visitor+tag@Example.COM "),
    ).resolves.toEqual({ success: true, message: "Welcome!" });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://atf-emails-buckket.up.railway.app/emails",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "Visitor+tag@Example.COM" }),
        signal: expect.any(AbortSignal),
      }),
    );
    expect(Object.keys(JSON.parse(String(fetchSpy.mock.calls[0]?.[1]?.body))))
      .toEqual(["email"]);
  });

  it.each([
    {
      name: "a service rejection",
      status: 200,
      body: { success: false, message: "Already subscribed" },
      expected: { success: false, message: "Already subscribed" },
    },
    {
      name: "an HTTP rejection even when the body claims success",
      status: 409,
      body: { success: true, message: "Already subscribed" },
      expected: { success: false, message: "Already subscribed" },
    },
    {
      name: "a successful response without a message",
      status: 200,
      body: { success: true },
      expected: { success: true },
    },
  ])("parses $name", async ({ status, body, expected }) => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(body), { status }),
    );

    await expect(subscribeToNewsletter("person@example.com")).resolves.toEqual(
      expected,
    );
  });

  it.each([
    ["a non-string message", { unexpected: true }],
    ["an empty message", ""],
    ["a whitespace-only message", "   "],
    ["an over-length message", "x".repeat(201)],
    [
      "a raw over-length message whose trimmed text is shorter",
      ` ${"x".repeat(199)} `,
    ],
  ])(
    "drops %s from success and failure response data",
    async (_name, message) => {
      vi.spyOn(globalThis, "fetch")
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ success: true, message }), {
            status: 200,
          }),
        )
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ success: false, message }), {
            status: 400,
          }),
        );

      await expect(
        subscribeToNewsletter("person@example.com"),
      ).resolves.toEqual({ success: true });
      await expect(
        subscribeToNewsletter("person@example.com"),
      ).resolves.toEqual({ success: false });
    },
  );

  it("trims a usable service message before returning it", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: false, message: "  Try again  " }), {
        status: 400,
      }),
    );

    await expect(subscribeToNewsletter("person@example.com")).resolves.toEqual({
      success: false,
      message: "Try again",
    });
  });

  it("accepts a backend message at the 200-character limit", async () => {
    const message = "x".repeat(200);
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: true, message }), { status: 200 }),
    );

    await expect(subscribeToNewsletter("person@example.com")).resolves.toEqual({
      success: true,
      message,
    });
  });

  it.each([
    ["malformed JSON", "not json"],
    ["a missing success value", JSON.stringify({ message: "No status" })],
    ["a non-boolean success value", JSON.stringify({ success: "yes" })],
    ["a null body", "null"],
  ])("rejects %s", async (_name, body) => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(body, { status: 200 }),
    );

    await expect(
      subscribeToNewsletter("person@example.com"),
    ).rejects.toBeInstanceOf(Error);
  });

  it("propagates a rejected request", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("offline"));

    await expect(
      subscribeToNewsletter("person@example.com"),
    ).rejects.toThrow("offline");
  });

  it("aborts a request after exactly ten seconds", async () => {
    vi.useFakeTimers();
    let requestSignal: AbortSignal | undefined;
    vi.spyOn(globalThis, "fetch").mockImplementation((_input, init) => {
      requestSignal = init?.signal ?? undefined;
      return new Promise((_resolve, reject) => {
        requestSignal?.addEventListener("abort", () => {
          reject(new DOMException("Timed out", "AbortError"));
        });
      });
    });

    const request = subscribeToNewsletter("person@example.com");
    const rejection = expect(request).rejects.toMatchObject({
      name: "AbortError",
    });
    expect(requestSignal?.aborted).toBe(false);

    await vi.advanceTimersByTimeAsync(9_999);
    expect(requestSignal?.aborted).toBe(false);

    await vi.advanceTimersByTimeAsync(1);
    expect(requestSignal?.aborted).toBe(true);
    await rejection;
    expect(vi.getTimerCount()).toBe(0);
  });

  it("clears the abort timeout when the request settles first", async () => {
    vi.useFakeTimers();
    let requestSignal: AbortSignal | undefined;
    vi.spyOn(globalThis, "fetch").mockImplementation((_input, init) => {
      requestSignal = init?.signal ?? undefined;
      return Promise.resolve(
        new Response(JSON.stringify({ success: true }), { status: 200 }),
      );
    });

    await expect(
      subscribeToNewsletter("person@example.com"),
    ).resolves.toEqual({ success: true });

    expect(vi.getTimerCount()).toBe(0);
    await vi.advanceTimersByTimeAsync(10_000);
    expect(requestSignal?.aborted).toBe(false);
  });
});
