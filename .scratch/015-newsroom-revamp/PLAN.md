# Newsroom revamp

Status: Ready for AFK implementation in a new session.
Approved design: September 24, 2026.

## Destination and scope

Revamp the Newsroom landing page at `/news` and individual News Article pages
at `/news/<slug>`, with a reusable Subpage Breadcrumb. Add a shared site-header
theme setting and default it to black on every Public Site page.

The user accepted the recommendations from the design interview, selecting
prototype A for stories without images. Their only exception was the header:
they want a configurable dark variant, enabled globally. They requested a
handoff and prototype cleanup now, with implementation in a fresh session.

The homepage news section and other subpage body layouts are outside this
revamp. The global header change does apply to those pages. Breadcrumb rollout
starts on the two news page types and should support later adoption elsewhere.
Native Backend CMS administration is outside the Public Site header scope.

## Design sources

- [Newsroom landing reference](SCR-20260919-qcxn.png)
- [News Article reference](SCR-20260919-segp.png)
- Prototype archive: branch `prototype/newsroom-layouts`, commit
  `d236c69b7950f467532aa2ec5436be43625a034d`. Read its `PROTOTYPE.md` and
  `src/components/site/NewsroomPrototype.tsx` with
  `src/components/site/newsroom-prototype.css`.

This plan controls behavior and scope. The annotated references control the
image-based landing and article compositions. Prototype A supplies the chosen
no-image treatment. The prototype's white header is superseded by the approved
black header. Its sample copy, extra badges, and comparison controls must not
become production content or features. Do not merge the prototype branch.

## Newsroom landing page

### Lead Story

Select the published Featured News Article. If none is featured, select the
newest published News Article using the existing stable date/slug ordering.
Image presence must not influence editorial selection.

With an available hero image, use the complete split composition from the
landing reference: large image on the left, category and Lead story label,
headline, summary, primary link, and publication date on the right. The action
opens the selected News Article at its current Public News Slug. Use the
existing Opportunity Button for the primary action.

Without an image, use prototype A, Editorial masthead: a generous white text
area, prominent headline, summary, primary action, and publication date. Do
not reserve an empty image column or insert a generic picture.

On mobile, stack the image before the headline. A failed image load switches
the lead to the selected no-image treatment. A subsequent image URL change
must allow the new image to load.

Do not include the reference's Latest, Press Releases, In the Media, and Media
Kit tabs, Media Assets action, or location. Keep the publication date.

### News Archive

Below the lead, retain category filtering and Load more. Present the remaining
published stories newest first, excluding the lead without losing other
records or corrupting pagination. Category changes affect the archive, not
the editorial Lead Story.

Use the existing categories: Press, Programs, Research, Partnerships, and
Chapters, plus All. Retain the existing page size of 12. Use the prototype's
responsive text-card treatment as the visual starting point. Do not introduce
search, new content types, or new classification fields.

Preserve loading, empty, failure, timeout, retry, and stale-response behavior.
Distinguish an empty filtered archive from a site with no published news. If
the lead is the only published article, do not duplicate it in the archive.
The site layout must remain usable when the Backend CMS is unavailable.

## Individual News Article pages

Follow the article reference: wide text header, category, large title, summary,
publication date, optional hero image below the header, then a narrower body
column. Render the excerpt once, not again as the first body paragraph.

Use the existing category alone. Do not add the screenshot's Announcement or
ATF Challenge classifications, and do not turn the prototype's News Article
badge into another category. Lead story is a landing-page presentation label.

Remove All News from the top navigation row in favor of the breadcrumb. Do
not add the Programs or Notes to Editors controls shown on the reference's
right side. Metadata keeps Published and its date; omit location, reading
time, and contact.

Images remain optional. Missing or failed images leave the text layout intact
without a blank media area. Preserve the full rich-text body, accessible image
alt text, current/previous slug handling, and public access boundaries.

End with Back to Newsroom. Sharing tools and related-story sections are outside
this revamp. Live Preview must use the same presentation, including switching
between image and no-image states when an editor changes the draft.

## Subpage Breadcrumb

Create a reusable breadcrumb pattern directly below the site navigation and
above page content, with consistent spacing and alignment on both news pages.
Use an accessible navigation landmark and an ordered trail. Parent entries
are links. The current page is unlinked and marked with `aria-current="page"`.

- Newsroom: Home / Newsroom.
- News Article: Home / Newsroom / Article title.

Derive the trail from the current route and resolved article data, not from
manually repeated labels or a title guessed from the slug. Truncate long
article titles visually while keeping the full title accessible. Avoid
horizontal overflow at narrow widths. During loading or failure, keep the
known Home / Newsroom ancestry without inventing an article title.

Build the pattern so later subpages can supply their own hierarchy. Do not
roll breadcrumbs out to unrelated pages during this implementation.

## Global site-header theme

Provide one shared named setting, such as `SITE_HEADER_THEME`, with `light` and
`dark` variants. Set the default to `dark`. This is a code-level setting, not
a visitor-facing theme switcher or a per-page preference.

Apply it to both the normal Navbar and HomepageOnlyShell, including mobile
navigation. Every Public Site page must default to a black header with readable
light text/icons, the appropriate existing light logo, and visible focus,
hover, expanded-menu, and selected states. Dropdowns must remain readable and
preserve their existing navigation and Opportunity Panel behavior.

Keep the announcement banner, existing navigation destinations, Partner with
Us action, menu behavior, and header-height calculations working. The light
variant should still render correctly when selected centrally.

Show the red Newsroom active underline on both `/news` and `/news/<slug>`.
Preserve appropriate active semantics in mobile menus and dropdown navigation.
Keep this theme change scoped to header/navigation elements; it is not a
site-wide dark-mode conversion.

## Implementation seams

Start with these existing files and their tests:

- `src/routes/news.tsx`: landing data, category filtering, pagination, states.
- `src/services/news.ts`: published page/highlights queries and content mapping.
- `src/components/site/NewsArticlePage.tsx`: shared article presentation.
- `src/components/site/NewsArticleImage.tsx`: existing image-failure behavior.
- `src/routes/news_.$slug.tsx`: detail lookup and Previous News Slug handling.
- `src/routes/preview.news.$id.tsx`: authenticated Live Preview presentation.
- `src/components/site/Page.tsx`: shared page components and logo variants.
- `src/components/layout/Navbar.tsx` and `HomepageOnlyShell.tsx`: both headers.
- `src/components/layout/useHeaderHeight.ts`: existing header measurement.
- `src/styles.css`: existing fonts, colors, and shared style conventions.

Reuse the existing CMS schema and native featured selection. A query helper
can change if necessary to exclude the lead before pagination. Do not solve
archive duplication by dropping unrelated stories or changing existing Home
and Publications highlight behavior.

Keep new presentation code reusable without copying the prototype's global
CSS selectors or sample-data logic. No `variant` comparison query, floating
prototype controls, or prototype cache configuration belongs in production.

## Verification and completion

Use behavior-focused tests at the query, route, shared article, breadcrumb,
and header seams. Cover:

- Featured and latest fallback selection, including a lead without an image.
- Filtered pagination without duplicates, omissions, or stale category results.
- Missing/failed hero images and later image replacement, including Live Preview.
- Correct breadcrumb ancestors and article title after navigation/slug changes.
- Global dark default in both header shells, configurable light variant, mobile
  menu usability, and Newsroom active state on the two news route types.
- Preserved loading, empty, failure, retry, and rich-text behavior.

Run focused tests and typechecking during implementation, then the full Public
Site suite once and the production build. Inspect desktop/mobile rendering
with long titles, both image states, and both header variants. Verify the
Live Preview regression using the real Payload hook test seam.

Useful existing checks:

```bash
npm test -- src/services/news.test.ts src/routes/-news.index.test.tsx 'src/routes/-news.$slug.test.tsx' src/routes/-preview.news.test.tsx src/components/layout/Navbar.test.tsx
npx tsc --noEmit
npm test
npm run build
```

Include any new focused tests in the implementation checks. Earlier sessions
recorded unrelated Public Site assertion failures; establish the current
baseline rather than assuming the historical failure count still applies.
Do not change unrelated expectations just to obtain a green suite.

Use the implement skill's final code review, address findings, and commit the
implementation on the current implementation branch. Deployment is outside
this handoff. All design decisions above are settled; the AFK agent can choose
routine implementation details without restarting the interview.
