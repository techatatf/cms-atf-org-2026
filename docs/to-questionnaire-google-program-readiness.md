# Google program and mobile-readiness discovery questionnaire

**Purpose:** Decide which Google program the ATF website must qualify for and define the requirements that belong in the SEO-CMS PRD.

**From:** ATF website project team

**To:** ATF team coordinator

**How your answers will be used:** We will update the SEO-CMS PRD, set its mobile acceptance criteria, and prepare the correct Google re-review.

## Context

Google for Nonprofits rejected a recent activation because the website had a "poor mobile experience." That phrase appears in Google's [Ad Grants website policy](https://support.google.com/nonprofits/answer/1657899?hl=en). It does not identify an AdSense rejection. Ad Grants and AdSense have separate reviews, and the current Ad Grants policy says not to display AdSense ads on the website. We need to confirm the intended program before we change the PRD. The repository already has responsive layouts, but it has no real-browser mobile or PageSpeed acceptance gate.

## How to answer

Return this questionnaire by **[insert deadline]**. It should take about 10 minutes. Select an option where options appear, then add any useful details. Partial answers and "I don't know" are useful. Mark any answer that needs confirmation from Google.

## Confirm the Google program

### Which Google product was being activated when Google sent the rejection?

- [ ] Google Ad Grants
- [ ] General Google for Nonprofits membership
- [ ] Google AdSense
- [ ] Another product: **[name it]**
- [ ] I don't know

_Why this matters: the email names Google for Nonprofits, while its rejection reason matches the Ad Grants website policy._

>

### Which Google product should `https://africantechnologyforum.org` prioritize now?

- [ ] Google Ad Grants
- [ ] Google AdSense
- [ ] Both
- [ ] Another product: **[name it]**

_Why this matters: Ad Grants provides advertising credit to promote ATF, while AdSense displays paid ads on ATF's website._

>

### If ATF wants both Ad Grants and AdSense, may the team use separate domains for them?

- [ ] Yes
- [ ] No
- [ ] This requires a policy decision from Google
- [ ] Not applicable because ATF will pursue only one product

_Why this matters: the current Ad Grants website policy says not to display AdSense ads on the Ad Grants website._

>

## Place the requirement

### Which project should own mobile readiness for Google's re-review?

- [ ] SEO-CMS
- [ ] A separate mobile-remediation project
- [ ] The earlier website design project
- [ ] Another project: **[name it]**

_Why this matters: SEO-CMS controls initial HTML, published media, CMS content rendering, and whole-site delivery, but responsive design began in an earlier project._

>

### Should Google re-review readiness block completion of SEO-CMS?

- [ ] Yes
- [ ] No
- [ ] Only the internal mobile checks should block completion

>

## Define success

### Which event should count as completion of the PRD requirement?

- [ ] The production website passes ATF's documented mobile and site-quality checks
- [ ] ATF submits the website to Google for re-review
- [ ] Google approves the activation
- [ ] Another event: **[describe it]**

_Why this matters: the engineering team can control website readiness and re-submission, but Google controls approval._

>

### What evidence does the coordinator need before requesting Google's re-review?

Examples include mobile screenshots, a route checklist, PageSpeed reports, Core Web Vitals results, tested forms, or a written defect log.

>

## Set the website boundary

### Which domain did Google review?

The repository identifies `https://africantechnologyforum.org` as the production website. Correct this address if Google reviewed another domain or subdomain.

>

### Which pages must pass the mobile-readiness checks?

- [ ] Every public page on the production domain
- [ ] Every indexable page
- [ ] Only the homepage and key application or donation journeys
- [ ] Only CMS-generated news pages
- [ ] Another boundary: **[describe it]**

_Why this matters: Google evaluates the website as a whole, while the current SEO-CMS PRD focuses on indexable routes and CMS content._

>

### Which user journeys must work on a phone before re-review?

List the required journeys, such as navigation, program discovery, applications, contact forms, donations, news reading, privacy-policy access, and not-found recovery.

>

## Timing and ownership

### When does ATF need to request the Google re-review?

>

### Who may approve the website for re-submission to Google?

>

### Who will reply to Google after the website passes the agreed checks?

>

## Anything else?

What else should the website team know before it changes the SEO-CMS PRD or prepares the Google re-review?

>
