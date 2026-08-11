import { Link } from "@tanstack/react-router";
import {
  Facebook,
  Linkedin,
  Mail,
  MapPin,
  Twitter,
  Youtube,
} from "lucide-react";

import { SiteLogo } from "@/components/site/Page";

const footerLinks = {
  "What We Do": [
    { label: "ATF Consulting", to: "/consulting" },
    { label: "ATF Challenge", to: "/challenge" },
    { label: "ATF Chapters", to: "/chapters" },
    { label: "Our Story", to: "/about" },
    { label: "Our Team", to: "/team" },
  ],
  Resources: [
    { label: "Publications", to: "/publications" },
    { label: "News", to: "/news" },
    { label: "Research", to: "/research" },
    { label: "Articles", to: "/articles" },
  ],
};

const socialLinks = [
  { icon: Twitter, href: "#social-twitter", label: "Twitter" },
  { icon: Linkedin, href: "#social-linkedin", label: "LinkedIn" },
  { icon: Facebook, href: "#social-facebook", label: "Facebook" },
  { icon: Youtube, href: "#social-youtube", label: "YouTube" },
];

export function Footer() {
  return (
    <footer className="bg-atf-black text-white">
      <div className="atf-container py-16 lg:py-24">
        <div className="grid gap-4 border-b border-white/10 pb-12 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] lg:gap-10=">
          <div>
            <Link to="/" className="inline-flex">
              <SiteLogo variant="bright" className="h-10 max-w-[220px]" />
            </Link>
            <p className="mt-7 max-w-sm text-sm leading-7 text-white/45">
              African Technology Forum champions technology-driven solutions for
              Africa's development challenges through consulting, innovation
              challenges, and capacity building.
            </p>
            <div className="mt-8 flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="inline-flex size-10 items-center justify-center border border-white/10 text-white/45 transition-colors hover:border-atf-red-bright hover:text-atf-red-bright"
                >
                  <social.icon className="size-4" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h2 className="font-display text-xs font-bold uppercase text-white">
                {title}
              </h2>
              <ul className="mt-7 space-y-4">
                {links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-sm text-white/45 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h2 className="font-display text-xs font-bold uppercase text-white">
              Connect
            </h2>
            <ul className="mt-7 space-y-4 text-sm text-white/45">
              <li>
                <a
                  href="mailto:info@africantechnologyforum.org"
                  className="inline-flex items-center gap-2 transition-colors hover:text-white"
                >
                  <Mail className="size-4 text-primary" aria-hidden="true" />
                  info@africantechnologyforum.org
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="size-4 text-primary" aria-hidden="true" />
                Kokomlemle, Accra North, Ghana
              </li>
              <li>
                <Link
                  to="/consulting"
                  className="transition-colors hover:text-white"
                >
                  Partner With Us
                </Link>
              </li>
              <li>
                <Link
                  to="/chapters"
                  className="transition-colors hover:text-white"
                >
                  Join a Chapter
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-8 text-xs text-white/30 md:flex-row md:items-center md:justify-between">
          <p>
            &copy; {new Date().getFullYear()} African Technology Forum. All
            rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="/privacy-policy" className="hover:text-white/60">
              Privacy Policy
            </Link>
            <Link to="/terms-of-service" className="hover:text-white/60">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
