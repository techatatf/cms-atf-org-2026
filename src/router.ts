import { createRouter } from "@tanstack/react-router";
import type { RouterHistory } from "@tanstack/react-router";

import { routeTree } from "@/routeTree.gen";

export type AppRouterContext = {
  homepageOnlyMode: boolean;
};

type CreateAppRouterOptions = {
  homepageOnlyMode?: boolean;
  history?: RouterHistory;
};

export function resolveHomepageOnlyMode(value: string | undefined) {
  return value !== "false";
}

export function createAppRouter({
  homepageOnlyMode = resolveHomepageOnlyMode(
    import.meta.env.VITE_HOMEPAGE_ONLY_MODE,
  ),
  history,
}: CreateAppRouterOptions = {}) {
  return createRouter({
    routeTree,
    context: { homepageOnlyMode },
    history,
    defaultPreload: "intent",
    scrollRestoration: true,
    defaultStructuralSharing: true,
    defaultPreloadStaleTime: 0,
  });
}

export type AppRouter = ReturnType<typeof createAppRouter>;
