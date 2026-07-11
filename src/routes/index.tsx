import { createFileRoute } from "@tanstack/react-router";

import { HomePage } from "@/components/site/HomePage";

export const Route = createFileRoute("/")({
  component: HomeRoute,
});

function HomeRoute() {
  const { homepageOnlyMode } = Route.useRouteContext();

  return <HomePage homepageOnlyMode={homepageOnlyMode} />;
}
