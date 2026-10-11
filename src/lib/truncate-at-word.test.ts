import { describe, expect, it } from "vitest";

import { truncateAtWord } from "./truncate-at-word";

describe("truncateAtWord", () => {
  it("returns text at or under the limit unchanged", () => {
    expect(truncateAtWord("Short title", 28)).toBe("Short title");
    expect(truncateAtWord("x".repeat(28), 28)).toBe("x".repeat(28));
  });

  it("cuts at the last whole word and counts the ellipsis in the limit", () => {
    const result = truncateAtWord("African Technology Forum announces new fellows", 28);
    expect(result).toBe("African Technology Forum…");
    expect(Array.from(result).length).toBeLessThanOrEqual(28);
  });

  it("keeps the last word when the cut lands exactly on a space", () => {
    expect(truncateAtWord("abcd efgh ijkl", 10)).toBe("abcd efgh…");
  });

  it("removes trailing punctuation before the ellipsis", () => {
    expect(truncateAtWord("Africa's AI Summit: what comes next", 22)).toBe("Africa's AI Summit…");
    expect(truncateAtWord("Tech, Policy, and People", 15)).toBe("Tech, Policy…");
  });

  it("hard-cuts a single word longer than the limit", () => {
    expect(truncateAtWord("Supercalifragilistic", 10)).toBe("Supercali…");
  });

  it("never splits an emoji", () => {
    expect(truncateAtWord("🚀🚀🚀🚀🚀", 3)).toBe("🚀🚀…");
  });
});
