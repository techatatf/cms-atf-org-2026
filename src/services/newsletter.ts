const NEWSLETTER_ENDPOINT =
  "https://atf-emails-buckket.up.railway.app/emails";

const REQUEST_TIMEOUT_MS = 10_000;

export type NewsletterSubscriptionResult = {
  success: boolean;
  message?: string;
};

export async function subscribeToNewsletter(
  email: string,
): Promise<NewsletterSubscriptionResult> {
  const controller = new AbortController();
  const timeout = globalThis.setTimeout(
    () => controller.abort(),
    REQUEST_TIMEOUT_MS,
  );

  try {
    const response = await fetch(NEWSLETTER_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim() }),
      signal: controller.signal,
    });
    const body: unknown = await response.json();

    if (
      typeof body !== "object" ||
      body === null ||
      !("success" in body) ||
      typeof body.success !== "boolean"
    ) {
      throw new Error("Unexpected newsletter response");
    }

    const responseBody = body as Record<string, unknown>;
    const rawMessage =
      typeof responseBody.message === "string"
        ? responseBody.message
        : undefined;
    const trimmedMessage = rawMessage?.trim();
    const message =
      rawMessage !== undefined && rawMessage.length <= 200 && trimmedMessage
        ? trimmedMessage
        : undefined;

    return {
      success: response.ok && body.success,
      ...(message ? { message } : {}),
    };
  } finally {
    globalThis.clearTimeout(timeout);
  }
}
