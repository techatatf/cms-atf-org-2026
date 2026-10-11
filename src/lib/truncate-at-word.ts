const trailingBreak = /[\s,:;–—-]+$/u;

export function truncateAtWord(text: string, maxChars: number) {
  const chars = Array.from(text);
  if (chars.length <= maxChars) return text;

  const budget = Math.max(maxChars - 1, 0);
  const hardCut = chars.slice(0, budget).join("");
  const endsOnWord = /\s/u.test(chars[budget] ?? "");
  const lastSpace = hardCut.search(/\s\S*$/u);
  const wordCut = endsOnWord ? hardCut : lastSpace > 0 ? hardCut.slice(0, lastSpace) : hardCut;
  const trimmed = wordCut.replace(trailingBreak, "") || hardCut;

  return `${trimmed}…`;
}
