import { Link } from "@tanstack/react-router";
import type { AnchorHTMLAttributes, ReactNode } from "react";

type AppLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children: ReactNode;
};

export function AppLink({ href, children, ...props }: AppLinkProps) {
  if (href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("#")) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  }

  const [to, hash] = href.split("#");

  return (
    <Link to={to as never} hash={hash || undefined} {...props}>
      {children}
    </Link>
  );
}
