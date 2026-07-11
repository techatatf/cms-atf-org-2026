import {
  Outlet,
  createRootRouteWithContext,
  redirect,
} from "@tanstack/react-router";

import { Footer } from "@/components/layout/Footer";
import { HomepageOnlyShell } from "@/components/layout/HomepageOnlyShell";
import { Navbar } from "@/components/layout/Navbar";
import type { AppRouterContext } from "@/router";

const redirectHashesByPath = new Map<string, string>([
  ["/about", "about"],
  ["/who-we-are", "about"],
  ["/team", "about"],
  ["/what-we-do", "programs"],
  ["/consulting", "funder"],
  ["/challenge", "student"],
  ["/chapters", "chapters"],
  ["/where-we-work", "chapters"],
  ["/publications", "news"],
  ["/articles", "news"],
  ["/research", "news"],
  ["/library", "news"],
  ["/news", "news"],
]);
const homepageOnlyAllowedPaths = new Set([
  "/",
  "/privacy-policy",
  "/terms-of-service",
]);

export const Route = createRootRouteWithContext<AppRouterContext>()({
  beforeLoad: ({ context, location }) => {
    if (!context.homepageOnlyMode) {
      return;
    }

    const hash = location.pathname.startsWith("/countries/")
      ? "chapters"
      : location.pathname.startsWith("/news/")
        ? "news"
        : redirectHashesByPath.get(location.pathname);

    if (hash) {
      throw redirect({ to: "/", hash, replace: true });
    }

    if (!homepageOnlyAllowedPaths.has(location.pathname)) {
      throw redirect({ to: "/", replace: true });
    }
  },
  component: RootLayout,
});

function RootLayout() {
  const { homepageOnlyMode } = Route.useRouteContext();
  const content = <Outlet />;

  if (homepageOnlyMode) {
    return <HomepageOnlyShell>{content}</HomepageOnlyShell>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1">{content}</main>
      <Footer />
    </div>
  );
}
