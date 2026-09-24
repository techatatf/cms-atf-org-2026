export type SiteHeaderTheme = "light" | "dark";

export const SITE_HEADER_THEME: SiteHeaderTheme = "dark";

export const siteHeaderPalette = {
  dark: {
    shell: "border-white/15 bg-atf-black text-white",
    logo: "bright",
    navigation: "text-white/80",
    mobileMenu: "border-white/15 bg-atf-black",
    mobileLink: "border-white/15 text-white/80",
    icon: "text-white",
    divider: "border-white/15",
    sectionLabel: "text-white/55",
    selectedNews: "data-[status=active]:text-white",
  },
  light: {
    shell: "border-atf-gray-200 bg-white text-atf-ink",
    logo: "fullColor",
    navigation: "text-atf-gray-700",
    mobileMenu: "border-atf-gray-200 bg-white",
    mobileLink: "border-atf-gray-200 text-atf-ink",
    icon: "text-atf-ink",
    divider: "border-atf-gray-200",
    sectionLabel: "text-atf-gray-500",
    selectedNews: "data-[status=active]:text-atf-ink",
  },
} as const satisfies Record<SiteHeaderTheme, {
  shell: string;
  logo: "bright" | "fullColor";
  navigation: string;
  mobileMenu: string;
  mobileLink: string;
  icon: string;
  divider: string;
  sectionLabel: string;
  selectedNews: string;
}>;
