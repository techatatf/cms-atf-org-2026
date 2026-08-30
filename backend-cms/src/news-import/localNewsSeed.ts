import type { NewsImportRecord } from './importNewsArticles'

export const localNewsSeed = [
  {
    body: [
      'African Technology Forum is expanding the ATF Challenge into a continent-wide AI training and mentorship program for students and young professionals.',
      'The 2026 edition brings together local chapters, university partners, and industry mentors to help participants build real-world solutions in healthcare, agriculture, education, climate, and financial inclusion.',
      'ATF chapters in Lagos, Nairobi, Accra, and Johannesburg will host build weekends and project reviews throughout the application cycle.',
    ],
    category: 'Press',
    excerpt:
      "This year's edition expands free AI training and mentorship to twelve countries with chapters hosting in-person build weekends.",
    featured: true,
    legacyId: 'inside-atf-challenge-2026',
    publishedAt: '2026-05-24T12:00:00.000Z',
    status: 'published',
    title:
      'Inside ATF Challenge 2026: how 5,000 young Africans will train on AI this year',
  },
  {
    body: [
      "ATF's Lagos chapter has opened a hardware lab for student inventors building applied technology solutions.",
      'The lab will host weekly workshops and provide access to prototyping equipment, mentorship, and challenge preparation sessions.',
    ],
    category: 'Programs',
    excerpt:
      'The new lab gives students access to rapid prototyping tools, technical workshops, and local mentors.',
    featured: false,
    legacyId: 'lagos-hardware-lab',
    publishedAt: '2026-05-14T12:00:00.000Z',
    status: 'published',
    title: 'Lagos chapter opens a hardware lab for student inventors',
  },
  {
    body: [
      'ATF researchers have released a new analysis of digital-skills investments across twelve African markets.',
      'The report compares program models, local employer demand, and the long-term value of practical mentorship.',
    ],
    category: 'Research',
    excerpt:
      "ATF's latest research examines training outcomes, employability, and local ecosystem value.",
    featured: false,
    legacyId: 'digital-skills-roi-report',
    publishedAt: '2026-04-30T12:00:00.000Z',
    status: 'published',
    title: 'New report measures digital-skills ROI across 12 African markets',
  },
  {
    body: [
      'ATF and UNDP have renewed a five-year partnership focused on digital capacity building and innovation fellowships.',
      'The agreement expands programming for public-sector teams and early-career technologists across participating chapters.',
    ],
    category: 'Partnerships',
    excerpt:
      'The renewed partnership will support public-sector digital capability programs and innovation fellowships.',
    featured: false,
    legacyId: 'undp-partnership-renewal',
    publishedAt: '2026-04-18T12:00:00.000Z',
    status: 'published',
    title: 'ATF and UNDP renew a five-year capacity-building partnership',
  },
  {
    body: [
      "ATF Nairobi has become the organization's largest chapter, reaching 1,200 active members.",
      "The chapter's growth has been driven by strong university partnerships, peer-led technical groups, and career mentoring.",
    ],
    category: 'Chapters',
    excerpt:
      "Kenya's chapter growth reflects strong demand for community-led technical training and mentorship.",
    featured: false,
    legacyId: 'nairobi-largest-chapter',
    publishedAt: '2026-04-03T12:00:00.000Z',
    status: 'published',
    title: "Nairobi becomes ATF's largest chapter at 1,200 members",
  },
  {
    body: [
      'The African Union has named ATF to its digital advisory council, recognizing decades of work supporting technology development across Africa.',
      'ATF will contribute research, practitioner networks, and implementation insight to council working groups.',
    ],
    category: 'Press',
    excerpt:
      "The appointment recognizes ATF's long-standing work across policy, research, and program delivery.",
    featured: false,
    legacyId: 'au-digital-advisory-council',
    publishedAt: '2026-03-27T12:00:00.000Z',
    status: 'published',
    title: "ATF named to the African Union's digital advisory council",
  },
] satisfies NewsImportRecord[]
