import {
  Outlet,
  createRootRouteWithContext,
  redirect,
} from "@tanstack/react-router";

import { Footer } from "@/components/layout/Footer";
import { HomepageOnlyShell } from "@/components/layout/HomepageOnlyShell";
import { Navbar } from "@/components/layout/Navbar";
import type { AppRouterContext } from "@/router";

export const Route = createRootRouteWithContext<AppRouterContext>()({
  beforeLoad: ({ context, location }) => {
    if (context.homepageOnlyMode && location.pathname === "/about") {
      throw redirect({ to: "/", hash: "about", replace: true });
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
