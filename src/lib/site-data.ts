export const programs = [
  {
    slug: "challenge",
    title: "ATF Challenge",
    index: "01 / 03",
    href: "/challenge",
    summary:
      "Our flagship programme: a pan-African innovation initiative training 20,000+ young people across four countries to build AI solutions for real-world problems. Backed by Google.org, with free AI training and mentorship.",
  },
  {
    slug: "chapters",
    title: "ATF Chapters",
    index: "02 / 03",
    href: "/chapters",
    summary:
      "A growing pan-African network of 30 local chapters fostering technology communities, professional development, and grassroots innovation from the ground up.",
  },
  {
    slug: "consulting",
    title: "ATF Consulting",
    index: "03 / 03",
    href: "/consulting",
    summary:
      "Strategic technology advisory for governments, NGOs, and enterprises. We design and implement transformation programs that create lasting impact across Africa.",
  },
] as const;

export const chapters = [
  {
    country: "Nigeria",
    slug: "nigeria",
    flag: "nigeria-flag",
    count: 12,
    description:
      "Rapidly growing tech ecosystem with strong university partnerships and an emerging startup culture.",
  },
  {
    country: "Ghana",
    slug: "ghana",
    flag: "ghana-flag",
    count: 8,
    description:
      "Our founding nation with the largest concentration of chapters, programs, and our headquarters in Accra.",
  },
  {
    country: "Kenya",
    slug: "kenya",
    flag: "kenya-flag",
    count: 6,
    description:
      "East Africa's leading tech hub, driving mobile-first innovation and fintech solutions at scale.",
  },
  {
    country: "South Africa",
    slug: "south-africa",
    flag: "south-africa-flag",
    count: 4,
    description:
      "Connecting established tech industry with emerging innovation ecosystems across Southern Africa.",
  },
] as const;

export const impactStats = [
  {
    value: `${new Date().getFullYear() - 1988}`,
    label: "Years of dedicated service since 1988",
  },
  {
    value: "30",
    label: "Active chapters across the continent",
  },
  {
    value: "23K",
    label: "Participants empowered through our programs",
  },
  // {
  //   value: "1K+",
  //   label: "Research articles and insights published",
  // },
] as const;

export const articles = [
  {
    title: "The Future of AI in African Healthcare",
    author: "Dr. Amara Okafor",
    date: "January 2026",
    category: "Healthcare",
    excerpt:
      "How local data, practical clinical workflows, and responsible AI design can improve care delivery.",
  },
  {
    title: "Building Sustainable Tech Ecosystems",
    author: "Kwame Mensah",
    date: "December 2025",
    category: "Ecosystem",
    excerpt:
      "A field guide to the partnerships, financing models, and talent pathways that help ecosystems endure.",
  },
  {
    title: "Digital Transformation in Government Services",
    author: "Fatima Hassan",
    date: "November 2025",
    category: "GovTech",
    excerpt:
      "What public agencies need before procurement, platforms, and digital identity programs can succeed.",
  },
  {
    title: "Youth Innovation: Africa's Greatest Asset",
    author: "Chidi Eze",
    date: "October 2025",
    category: "Innovation",
    excerpt:
      "Why student builders and young professionals are central to Africa's next technology cycle.",
  },
] as const;

export const researchPapers = [
  {
    title: "State of African Tech Ecosystems 2025",
    type: "Annual Report",
    pages: 120,
    year: 2025,
  },
  {
    title: "Digital Infrastructure Gap Analysis",
    type: "Research Paper",
    pages: 45,
    year: 2025,
  },
  {
    title: "AI Readiness in Sub-Saharan Africa",
    type: "White Paper",
    pages: 32,
    year: 2024,
  },
  {
    title: "Funding Landscape for African Startups",
    type: "Market Analysis",
    pages: 58,
    year: 2024,
  },
] as const;

export const countryData = {
  ghana: {
    name: "Ghana",
    capital: "Accra",
    description:
      "Ghana serves as ATF's headquarters and flagship location, where consulting and challenge programs were first established.",
    stats: [
      { label: "Chapters", value: "8" },
      { label: "Challenge Winners", value: "12" },
      { label: "Active Members", value: "500+" },
    ],
  },
  nigeria: {
    name: "Nigeria",
    capital: "Lagos",
    description:
      "Nigeria represents ATF's largest market with vibrant technology ecosystems in Lagos, Abuja, and Port Harcourt.",
    stats: [
      { label: "Chapters", value: "12" },
      { label: "Challenge Winners", value: "8" },
      { label: "Active Members", value: "800+" },
    ],
  },
  kenya: {
    name: "Kenya",
    capital: "Nairobi",
    description:
      "Kenya's innovation hub status makes it a key focus for ATF's East African expansion and mobile technology initiatives.",
    stats: [
      { label: "Chapters", value: "6" },
      { label: "Challenge Winners", value: "6" },
      { label: "Active Members", value: "350+" },
    ],
  },
  "south-africa": {
    name: "South Africa",
    capital: "Johannesburg",
    description:
      "South Africa anchors ATF's Southern African presence with corporate partnerships and university collaborations.",
    stats: [
      { label: "Chapters", value: "4" },
      { label: "Challenge Winners", value: "10" },
      { label: "Active Members", value: "600+" },
    ],
  },
} as const;

export const publicationCategories = [
  {
    title: "Articles",
    description: "Opinion pieces, analysis, and thought leadership",
    count: 45,
    href: "/articles",
  },
  {
    title: "Research Papers",
    description: "In-depth studies and academic research",
    count: 12,
    href: "/research",
  },
  {
    title: "Reports",
    description: "Annual reports and ecosystem analyses",
    count: 8,
  },
  {
    title: "Case Studies",
    description: "Success stories and implementation guides",
    count: 20,
  },
] as const;
