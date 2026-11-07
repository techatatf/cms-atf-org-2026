// Hardcoded content for the Who We Are pages. Copy follows the design
// reference in .scratch/design-reference-website word for word.

export const ATF_EMAIL = "info@africantechnologyforum.org";
export const ATF_LINKEDIN = "https://www.linkedin.com/company/africantechnologyforum";

export type Fact = { label: string; value: string };
export type InfoCell = { title: string; body: string };

export type Person = {
  slug: string;
  name: string;
  role: string;
  bio: string;
  /** Profile URL. Empty means no LinkedIn link is shown. */
  linkedin: string;
};

export type TeamGroup =
  | "Leads"
  | "Country Leads"
  | "Programme Managers"
  | "Technical";

export type TeamMember = Person & { group: TeamGroup };

/* ---------------------------------------------------------------- Board -- */

export const boardMembers: Person[] = [
  {
    slug: "mawuli-tse",
    name: "Mawuli Tse",
    role: "Board Chair and Co-founder",
    bio: "Chairs the board and leads its oversight of strategy, governance, and finances.",
    linkedin: "",
  },
  {
    slug: "karanja-gakio",
    name: "Karanja Gakio",
    role: "Co-founder and Director",
    bio: "Guides ATF’s strategic direction and governance.",
    linkedin: "",
  },
  {
    slug: "michael-tekletsion-berhan",
    name: "Michael Tekletsion Berhan",
    role: "Director",
    bio: "Oversees ATF’s governance and finances.",
    linkedin: "",
  },
  {
    slug: "michael-owu",
    name: "Michael Owu",
    role: "Director",
    bio: "Provides oversight of ATF’s programmes and governance.",
    linkedin: "",
  },
];

/* ----------------------------------------------------------------- Team -- */

export const teamGroups: TeamGroup[] = [
  "Leads",
  "Country Leads",
  "Programme Managers",
  "Technical",
];

const programmeManagerBio =
  "Manages Challenge cohorts, participants, and partner coordination.";

export const challengeTeam: TeamMember[] = [
  { group: "Leads", slug: "samuel-alomenu", name: "Samuel Alomenu", role: "Programs Lead", bio: "Leads delivery of the ATF AI Challenge across all four countries.", linkedin: "" },
  { group: "Leads", slug: "elorm-mensah", name: "Elorm Mensah", role: "M&E Lead", bio: "Leads monitoring and evaluation of participant outcomes and results.", linkedin: "" },
  { group: "Leads", slug: "enyonam-agbenyegah", name: "Enyonam Agbenyegah", role: "Finance Lead", bio: "Manages finance, grant reporting, and compliance.", linkedin: "" },
  { group: "Leads", slug: "michael-adjei", name: "Michael Adjei", role: "Communications Lead", bio: "Leads communications, media, and public outreach.", linkedin: "" },
  { group: "Country Leads", slug: "linda-sarpong", name: "Dr. Linda Sarpong", role: "Country Lead, Ghana", bio: "Leads the Challenge in Ghana, including university and institutional partnerships.", linkedin: "" },
  { group: "Country Leads", slug: "seun-awoyele", name: "Seun Awoyele", role: "Country Lead, Nigeria", bio: "Leads the Challenge in Nigeria, including university and institutional partnerships.", linkedin: "" },
  { group: "Country Leads", slug: "victor-mutua", name: "Victor Mutua", role: "Country Lead, Kenya", bio: "Leads the Challenge in Kenya, including university and institutional partnerships.", linkedin: "" },
  { group: "Country Leads", slug: "ntsoaki-mohapi", name: "Ntsoaki Mohapi", role: "Country Lead, South Africa", bio: "Leads the Challenge in South Africa, including university and institutional partnerships.", linkedin: "" },
  { group: "Programme Managers", slug: "amanda-addai-tinagyaa", name: "Amanda Addai-Tinagyaa", role: "Programme Manager", bio: programmeManagerBio, linkedin: "" },
  { group: "Programme Managers", slug: "faith-chepkoech-malel", name: "Faith Chepkoech Malel", role: "Programme Manager", bio: programmeManagerBio, linkedin: "" },
  { group: "Programme Managers", slug: "oluchi-obijuru", name: "Oluchi Obijuru", role: "Programme Manager", bio: programmeManagerBio, linkedin: "" },
  { group: "Programme Managers", slug: "ursula-itumeleng", name: "Ursula Itumeleng", role: "Programme Manager", bio: programmeManagerBio, linkedin: "" },
  { group: "Technical", slug: "sami-amegavi", name: "Sami Amegavi", role: "Technical Lead", bio: "Leads the technical team that builds the Challenge platforms and develops its curriculum.", linkedin: "" },
  { group: "Technical", slug: "youssouf-da-silva", name: "Youssouf Da Silva", role: "Technical Team", bio: "Builds the community platforms for the ATF AI Challenge.", linkedin: "" },
  { group: "Technical", slug: "salifu-mutaru", name: "Salifu Mutaru", role: "Technical Team", bio: "Builds the platforms for the ATF AI Challenge.", linkedin: "" },
  { group: "Technical", slug: "prince-anani", name: "Prince Anani", role: "Technical Team", bio: "Supports curriculum development and delivery.", linkedin: "" },
  { group: "Technical", slug: "abib-duut", name: "Abib Duut", role: "Technical Team", bio: "Champions curriculum development for the ATF AI Challenge.", linkedin: "" },
];

export function personInitials(name: string) {
  return name
    .replace(/^Dr\.\s+/, "")
    .split(/\s+/)
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/* ------------------------------------------------------------- Partners -- */

export type PartnerRole = "Funder" | "Problem partner" | "University";
export type PartnerCountry = "Ghana" | "Nigeria" | "Kenya" | "South Africa" | "All";

export type Partner = {
  name: string;
  role: PartnerRole;
  country: PartnerCountry;
  note?: string;
  logo?: string;
};

export const partners: Partner[] = [
  { name: "Google.org", role: "Funder", country: "All", note: "Scaling partner" },
  { name: "OpenAI", role: "Funder", country: "All", note: "Since 2023" },
  { name: "Korle Bu Teaching Hospital", role: "Problem partner", country: "Ghana", note: "Health · since 2025" },
  { name: "37 Military Hospital", role: "Problem partner", country: "Ghana", note: "Health · since 2025" },
  { name: "Esoko", role: "Problem partner", country: "Ghana", note: "Agriculture · since 2025" },
];

export const partnerGroups: { role: PartnerRole; title: string; empty?: string }[] = [
  { role: "Funder", title: "Funders" },
  { role: "Problem partner", title: "Problem-statement partners" },
  {
    role: "University",
    title: "Universities",
    empty:
      "Students from 23 universities in Ghana took part in the 2024 Challenge. University partners will be listed here as agreements are signed.",
  },
];

export const partnerCountries = ["Ghana", "Nigeria", "Kenya", "South Africa"] as const;

export function filterPartners(
  list: Partner[],
  role: PartnerRole | "all",
  country: string,
) {
  return list.filter(
    (partner) =>
      (role === "all" || partner.role === role) &&
      (country === "all" || partner.country === country || partner.country === "All"),
  );
}

/* -------------------------------------------------------------- Reports -- */

export type Report = {
  year: number;
  title: string;
  type: "Annual report" | "Financial statements";
  pages?: number;
  file: string;
  summary?: string;
};

/**
 * Add one entry per document, newest first. Example:
 * { year: 2025, title: "Annual Report 2025", type: "Annual report", pages: 32,
 *   file: "/reports/atf-annual-report-2025.pdf", summary: "One or two sentences on the year." }
 */
export const reports: Report[] = [];
