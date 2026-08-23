# ATF Site Context

This context describes the public African Technology Forum website language used for brand, content, and interaction patterns.

## Language

**Content Management System (CMS)**:
The editorial system used to create and publish ATF website content. It may
provide its own administration interface and does not need to serve as ATF's
general-purpose backend.
_Avoid_: ATF Org Backend when referring only to editorial content management

**Backend CMS**:
The independently runnable editorial application that manages content for the
ATF website and provides its own administration interface and content API.
_Avoid_: ATF Org Backend, custom CMS frontend

**Production Launch**:
The first live Payload deployment used by the public ATF website as its content
source. It is not preceded by a separate demo-to-production promotion stage.
_Avoid_: Demo Deployment, pre-production CMS

**Fetched-CMS**:
The first CMS delivery phase. Public news uses optional browser-time REST reads,
while editors receive immediate private preview of draft changes.
_Avoid_: separate CMS product, final SEO architecture

**News Article**:
Newsroom content managed by the Backend CMS and published under `/news`. A News
Article is distinct from the site's long-form Article content under `/articles`.
_Avoid_: Article when the distinction from long-form content matters

**Public News Slug**:
The unique URL segment that identifies a News Article at `/news/<slug>`. It is
not the Payload document ID and is locked for Editors after first publication.
_Avoid_: article ID, Payload ID

**Previous News Slug**:
A retired Public News Slug retained after an Admin changes a published slug. It
continues to resolve to the News Article's current URL.
_Avoid_: deleted slug, reusable slug

**SEO-CMS**:
The target CMS delivery phase. Indexable public routes include published
content and metadata in their initial HTML while editors retain private preview.
_Avoid_: separate CMS product, server-only CMS

**Opportunity Triangle**:
ATF's core graphic device: a polygonal, diagonal brand shape that creates zones for emphasis, motion, or contrast.
_Avoid_: decorative triangle, generic triangle motif

**Opportunity Button**:
A branded ATF call-to-action control shaped as a real cut-corner trapezoid. The top-right cut is mandatory and connects the control to the Opportunity Triangle geometry.
_Avoid_: special triangle button, triangle button, CTA button

**Opportunity Panel**:
A non-button surface that uses Opportunity Triangle geometry as part of its shape. It can frame navigational or content surfaces, but it is not itself a call-to-action control.
_Avoid_: Opportunity Button when referring to non-button surfaces, cut-corner dropdown

**Panel Item State**:
The visual state of a navigational item inside an Opportunity Panel or standard navigation panel. A panel item can be hovered, pressed, or current-page selected while the panel remains open.
_Avoid_: assuming item selection means immediate panel dismissal

## Flagged Ambiguities

**Triangle Button vs Opportunity Button**:
Resolved to **Opportunity Button** when referring to the branded call-to-action control. Use **Opportunity Triangle** only for the underlying brand shape.

**Opportunity Button vs Opportunity Panel**:
Use **Opportunity Button** for branded call-to-action controls. Use **Opportunity Panel** for non-button surfaces that borrow Opportunity Triangle geometry.

**Panel Item Selection vs Panel Dismissal**:
Selecting a panel item does not necessarily dismiss the panel. When discussing selected panel items, preserve the possibility that the panel stays open and the item remains visibly selected.

## Example Dialogue

Developer: "Should this call to action use a normal button or an Opportunity Button?"

Domain expert: "Use an Opportunity Button for ATF's main actions. The mandatory top-right cut connects it to the Opportunity Triangle, but the button itself is the Opportunity Button."
