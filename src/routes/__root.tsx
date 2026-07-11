import {
  Outlet,
  createRootRouteWithContext,
  redirect,
} from "@tanstack/react-router";

import { Footer } from "@/components/layout/Footer";
import { HomepageOnlyShell } from "@/components/layout/HomepageOnlyShell";
import { Navbar } from "@/components/layout/Navbar";
import { homepageHashForHiddenPath } from "@/lib/homepage-only";
import type { AppRouterContext } from "@/router";

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

    const hash = homepageHashForHiddenPath(location.pathname);

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
