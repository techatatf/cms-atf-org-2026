import { useEffect, useRef } from "react";

export function useHeaderHeight<T extends HTMLElement>() {
  const headerRef = useRef<T>(null);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const root = document.documentElement;
    const syncHeaderHeight = () => {
      root.style.setProperty(
        "--atf-header-height",
        `${header.getBoundingClientRect().height}px`,
      );
    };

    syncHeaderHeight();
    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(syncHeaderHeight);
    resizeObserver?.observe(header);
    window.addEventListener("resize", syncHeaderHeight);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", syncHeaderHeight);
      root.style.removeProperty("--atf-header-height");
    };
  }, []);

  return headerRef;
}
