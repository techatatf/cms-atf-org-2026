import { useEffect, useState } from "react";

import {
  getPublishedNewsHighlights,
  type PublishedNewsHighlights,
} from "@/services/news";

export type PublishedNewsHighlightsState =
  | { status: "failed" }
  | { status: "loading" }
  | ({ status: "ready" } & PublishedNewsHighlights);

export function usePublishedNewsHighlights({
  nonFeaturedLimit,
}: {
  nonFeaturedLimit: number;
}) {
  const [retryKey, setRetryKey] = useState(0);
  const [state, setState] = useState<PublishedNewsHighlightsState>({
    status: "loading",
  });

  useEffect(() => {
    let active = true;
    setState({ status: "loading" });
    void getPublishedNewsHighlights({ nonFeaturedLimit })
      .then((result) => {
        if (active) setState({ status: "ready", ...result });
      })
      .catch(() => {
        if (active) setState({ status: "failed" });
      });

    return () => {
      active = false;
    };
  }, [nonFeaturedLimit, retryKey]);

  return {
    retry: () => setRetryKey((value) => value + 1),
    state,
  };
}
