const homepageHashesByPath = new Map<string, string>([
  ["/about", "about"],
  ["/who-we-are", "about"],
  ["/team", "about"],
  ["/what-we-do", "programs"],
  ["/consulting", "funder"],
  ["/challenge", "student"],
  ["/chapters", "chapters"],
  ["/where-we-work", "chapters"],
  ["/publications", "about"],
  ["/articles", "about"],
  ["/research", "about"],
  ["/library", "about"],
  ["/news", "about"],
]);

export function homepageHashForHiddenPath(pathname: string) {
  if (pathname.startsWith("/countries/")) return "chapters";
  if (pathname.startsWith("/news/")) return "about";

  return homepageHashesByPath.get(pathname);
}
