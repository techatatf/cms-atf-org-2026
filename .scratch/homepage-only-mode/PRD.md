Status: ready-for-agent

# Homepage-Only Mode

## Problem Statement

The organization temporarily needs its public website to present only the homepage while keeping the existing subpages available for later restoration. Common users must not be able to reach hidden subpage content through navigation, homepage calls to action, footer links, bookmarks, or direct URL entry. Privacy Policy and Terms of Service must remain accessible.

This is a temporary visibility control, not an authorization or confidentiality boundary. The feature must be controlled per Vercel deployment through an environment variable and must fail closed: deployments that omit the variable must remain in homepage-only mode.

## Solution

Add a build-time `VITE_HOMEPAGE_ONLY_MODE` feature flag that defaults to enabled and is disabled only by the explicit value `false`.

When enabled, the application will use a small, temporary, responsive site shell designed specifically for homepage-only mode. Its navigation and footer will link to stable homepage sections instead of subpages. Any direct visit to a hidden route will redirect to the semantically closest homepage section before hidden content renders. The homepage, Privacy Policy, and Terms of Service will remain accessible.

When disabled, the existing navigation, footer, internal links, routes, and subpage behavior will be restored unchanged.

## User Stories

1. As a site visitor, I want the temporary website navigation to contain only useful homepage destinations, so that I do not encounter unavailable subpages.
2. As a desktop visitor, I want simple navigation buttons instead of dropdown menus, so that the temporary information architecture is clear.
3. As a mobile visitor, I want a compact responsive menu containing the same destinations as desktop navigation, so that the homepage remains easy to navigate on a small screen.
4. As a visitor, I want the site logo to return me to the top of the homepage, so that I have a predictable home action.
5. As a visitor, I want the About navigation button to take me to the homepage About section, so that I can learn about the organization without opening a subpage.
6. As a visitor, I want the Programs navigation button to take me to the homepage Programs section, so that I can review the organization's work from the homepage.
7. As a visitor, I want the Chapters navigation button to take me to the homepage Chapters section, so that I can discover the organization's geographic presence without opening a subpage.
8. As a visitor, I want the News navigation button to take me to the homepage News section, so that I can see current content without opening the newsroom.
9. As a prospective partner, I want the Partner with Us action to take me to the homepage funder section, so that I can find the relevant partnership information.
10. As a visitor, I want homepage cards and calls to action that formerly opened hidden pages to lead to the closest useful homepage section, so that every visible internal link remains functional.
11. As a visitor, I want footer links to expose only homepage sections, contact and social destinations, and legal pages, so that the footer does not advertise hidden content.
12. As a visitor following an external or email link, I want that link to remain unchanged, so that homepage-only mode does not interfere with off-site actions or contact flows.
13. As a visitor opening a bookmarked About, Who We Are, or Team URL, I want to be redirected to the homepage About section, so that hidden organizational pages are not displayed.
14. As a visitor opening the What We Do URL, I want to be redirected to the homepage Programs section, so that hidden program overview content is not displayed.
15. As a visitor opening the Consulting URL, I want to be redirected to the homepage funder section, so that I reach the closest available partnership content.
16. As a visitor opening the Challenge URL, I want to be redirected to the homepage student section, so that I reach the closest available challenge content.
17. As a visitor opening a Chapters, Where We Work, or country URL, I want to be redirected to the homepage Chapters section, so that hidden geographic pages are not displayed.
18. As a visitor opening a Publications, Articles, Research, Library, News, or news-article URL, I want to be redirected to the homepage News section, so that hidden publication pages are not displayed.
19. As a visitor opening any future or unrecognized non-legal route while homepage-only mode is active, I want to return to the homepage, so that newly introduced routes are hidden by default.
20. As a visitor, I want redirects to occur before hidden content renders, so that subpage content does not flash briefly on screen.
21. As a visitor, I want Privacy Policy to remain directly accessible, so that I can review how the organization handles personal information.
22. As a visitor, I want Terms of Service to remain directly accessible, so that I can review the site's terms.
23. As a visitor reading a legal page, I want the temporary navigation and footer to remain available, so that I can return to homepage sections easily.
24. As a site operator, I want homepage-only mode enabled when its environment variable is missing, so that a deployment configuration mistake does not expose subpages.
25. As a site operator, I want only the explicit environment value `false` to expose subpages, so that ambiguous values fail closed.
26. As a site operator, I want to configure the flag independently for local, preview, and production deployments, so that each built deployment has deliberate behavior.
27. As a site operator, I accept that changing the flag requires a new build and deployment, so that the implementation can remain compatible with the static Vite application.
28. As a site operator, I want disabling homepage-only mode to restore the current site without reconstructing its navigation or route definitions, so that removal of the temporary mode is low risk.
29. As a maintainer, I want the temporary navigation and footer isolated from the existing shell, so that the temporary implementation can be deleted cleanly.
30. As a maintainer, I want hidden-route behavior governed from a single application-level boundary, so that new routes cannot accidentally bypass homepage-only mode.

## Implementation Decisions

- The canonical feature name is **homepage-only mode**. A route unavailable in this mode is a **hidden route**.
- The feature is a visibility mechanism for common users. It is not authentication, authorization, access control for confidential data, or a guarantee that hidden source code is absent from deployed assets.
- The build-time environment variable is `VITE_HOMEPAGE_ONLY_MODE`.
- Homepage-only mode is enabled when the variable is missing or contains any value other than the explicit string `false`.
- Changing the Vercel environment variable requires a new deployment because Vite compiles client environment values into the build.
- Flag evaluation will have one canonical implementation so the router, shell, and links cannot interpret the value differently.
- The existing site shell remains intact. Homepage-only mode selects a separate, temporary navbar and footer that can later be deleted without reconstructing the existing components.
- The temporary navbar uses simple buttons rather than dropdowns on desktop.
- The temporary mobile navbar uses a compact menu control and exposes the same destinations as desktop navigation.
- Temporary navbar destinations are About to `#about`, Programs to `#programs`, Chapters to `#chapters`, News to `#news`, and Partner with Us to `#funder`.
- The logo navigates to the top of the homepage.
- The temporary footer contains only homepage section links, existing contact and social destinations, Privacy Policy, and Terms of Service.
- Stable anchors will be added to the relevant homepage sections. Anchor navigation must account for the fixed site header and work when initiated from either the homepage or a legal page.
- All visible internal links that currently target hidden routes, including homepage cards and calls to action, will resolve to the approved homepage destination while the mode is enabled. External URLs and email links remain unchanged.
- Route protection is enforced at the application router boundary before hidden route content renders.
- While enabled, the route allowlist consists of `/`, `/privacy-policy`, and `/terms-of-service`.
- Direct-route redirects use the following mapping:

  | Hidden route family | Homepage destination |
  | --- | --- |
  | `/who-we-are`, `/about`, `/team` | `/#about` |
  | `/what-we-do` | `/#programs` |
  | `/consulting` | `/#funder` |
  | `/challenge` | `/#student` |
  | `/chapters`, `/where-we-work`, `/countries/*` | `/#chapters` |
  | `/publications`, `/articles`, `/research`, `/library`, `/news`, `/news/*` | `/#news` |
  | Any future or unrecognized non-legal route | `/` |

- Legal pages use the temporary navbar and footer while homepage-only mode is enabled.
- When the feature flag is disabled, the existing shell, navigation destinations, direct route access, and subpage behavior remain unchanged.

## Testing Decisions

- Tests will exercise external behavior rather than component internals, exact implementation structure, or private helper functions.
- The primary test seam is the application router rendered under each feature-flag state. This is the highest existing seam that can verify the shell, link destinations, allowlist, and redirects together.
- Tests will establish that a missing environment value enables homepage-only mode and that only explicit `false` disables it.
- Enabled-mode tests will verify the temporary desktop navigation labels and homepage destinations.
- Enabled-mode tests will verify that the responsive mobile menu exposes the same destinations and remains operable.
- Enabled-mode tests will verify the temporary footer's homepage, contact, social, and legal destinations and the absence of hidden-route links.
- Enabled-mode tests will verify representative homepage cards and calls to action resolve to their approved homepage sections while external and email links remain unchanged.
- Router tests will cover each redirect family, including parameterized country and news-article routes, plus the fallback for unrecognized routes.
- Router tests will verify the homepage and both legal pages remain directly renderable and use the temporary shell.
- Router tests will verify hidden page content does not render before a redirect.
- Disabled-mode tests will verify the existing navbar, footer, link destinations, and representative subpages remain available unchanged.
- Existing component and route tests provide prior art for rendering navigation and site pages. They should be extended or exercised through the application-router seam where possible rather than duplicated across many isolated test suites.
- Responsive behavior will be verified at desktop and mobile viewport sizes, with explicit checks that controls fit, menus remain usable, and content is not obscured by the fixed header.

## Out of Scope

- Authentication, authorization, password protection, or any other security boundary.
- Removing hidden page source code, route modules, or content from deployed JavaScript assets.
- Server-side or Vercel-edge HTTP redirects before the application loads.
- Runtime flag changes without a new build and deployment.
- Deleting or rewriting the existing navbar, footer, route modules, or subpage content.
- Redesigning the homepage or changing the substantive content of homepage sections.
- Hiding Privacy Policy or Terms of Service.
- Changing external links, email links, social links, or the external challenge application URL.
- Permanent information-architecture changes after the temporary mode is removed.

## Further Notes

- The feature is intentionally temporary. Isolation of the temporary shell and preservation of the existing site experience are important removal criteria.
- The mode should fail closed both for operational safety and for future route additions: only allowlisted routes remain directly accessible while enabled.
- The current homepage sections require stable anchor identifiers before the temporary navigation and redirect mapping can work reliably.
