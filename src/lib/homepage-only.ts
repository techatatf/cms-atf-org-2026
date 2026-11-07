const homepageHashesByPath = new Map<string, string>([
  ["/about", "about"],
  ["/who-we-are", "about"],
  ["/team", "about"],
  ["/governance", "about"],
  ["/partners", "about"],
  ["/annual-reports", "about"],
  ["/careers", "about"],
  ["/what-we-do", "programs"],
  ["/consulting", "funder"],
  ["/challenge", "student"],
  ["/chapters", "chapters"],
  ["/where-we-work", "chapters"],
  ["/publications", "about"],
  ["/articles", "about"],
  ["/research", "about"],
  ["/library", "about"],
]);

export function homepageHashForHiddenPath(pathname: string) {
  if (pathname.startsWith("/countries/")) return "chapters";

  return homepageHashesByPath.get(pathname);
}
