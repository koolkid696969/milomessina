# Campus landing page and linked-site audit

Reviewed September 10, 2026. **28 findings**, ordered roughly by impact within each group. These include confirmed contradictions and behavior problems, missing explanations, and visual differences that may be intentional.

## Scope and verification

Started from [the campus landing page](https://milomessina.com/landingpage/) and followed its public navigation through:

- [Greek village](https://milomessina.com/fomo/campuswars/), including About, award FAQs, Chapters, and the leaderboard camera view.
- [Chapter onboarding](https://www.aryatoufanian.com/fomo/onboard/) and its [Greek Wars back-link destination](https://www.aryatoufanian.com/fomo/), including the national standings tab.
- [Internship](https://milomessina.com/fomo/).
- [Internship application](https://milomessina.com/fomo/apply), including all five role-specific entry URLs.
- [Creator program and submission form](https://milomessina.com/fomo/submit/), including the concept application route.

Inspected live content, desktop layouts at 1280 × 720, and selected phone layouts at 390 × 844. Read the local implementation to check links and behavior. The local HTML link/asset-reference scan found no missing local targets or anchor IDs in this reachable set. A valid anchor can still behave incorrectly; see finding 11.

No applications, registrations, posts, or payments were submitted. Successful delivery, post-submission screens, and later onboarding steps were not verified. This is a thorough public-page review, not a guarantee that every device, interaction, or backend state has been covered.

The portfolio homepage, photos, cars, invoice tool, old fomo portal, and weekly report are outside this navigation graph: the campus landing page and its linked pages do not link to them. Local application/form files also contain uncommitted changes; live behavior is the primary basis for this report, and source-only findings are identified below.

## Offers, prizes, and program rules

### 1. High — The $500 offer changes recipient, timing, and conditions

**Where:** [Landing page, Greek Wars](https://milomessina.com/landingpage/#greek-wars), [onboarding](https://www.aryatoufanian.com/fomo/onboard/), and [village About → award FAQ](https://milomessina.com/fomo/campuswars/).

The landing page presents the $500 as payment for onboarding a chapter, available once the chapter qualifies. Onboarding similarly ties the guarantee to reaching 80%. The village FAQ says it goes to the qualifying chapter’s **top trader at semester end**, and members must keep fomo downloaded throughout the semester. That is a materially different expectation from a chapter receiving money upon onboarding.

**Make consistent:** State the recipient, semester-end timing, 80% threshold, and retention condition together wherever the $500 is advertised.

### 2. High — One $250 campus bonus becomes two category bonuses

**Where:** [Landing page](https://milomessina.com/landingpage/#greek-wars), [village FAQ](https://milomessina.com/fomo/campuswars/), and [external Greek Wars page](https://www.aryatoufanian.com/fomo/).

The landing page awards the extra $250 to the first chapter at each campus. The other two pages specify the first fraternity **and** the first sorority. A visitor cannot tell from the landing page that these are separate races.

**Make consistent:** Use the same two-category explanation on every page, including who receives each bonus.

### 3. High — The national prize is hidden, fixed, and open-ended

**Where:** [Landing page](https://milomessina.com/landingpage/#greek-wars) and [external Greek Wars page](https://www.aryatoufanian.com/fomo/).

The landing page deliberately conceals the amount. The external page discloses a $10,000 grand prize in one section and $10,000+ in another. The mystery positioning and the amount do not agree.

**Make consistent:** Choose one approved amount or one consistent announcement policy.

### 4. High — The season dates conflict with the national leaderboard’s launch message

**Where:** [External Greek Wars page → National tab](https://www.aryatoufanian.com/fomo/).

The page dates the season August 24–December 11, 2026. On September 10, the national table still says its illustrative standings remain until the season opens. It is explicitly marked as sample data, which is useful, but its explanation is stale relative to its own dates. Meanwhile, the village reports live onboarding updates.

**Make consistent:** Explain the actual status of trading results, separately from onboarding data, and replace the obsolete pre-season wording.

### 5. High — A public onboarding page still contains an internal TODO

**Where:** [Chapter onboarding](https://www.aryatoufanian.com/fomo/onboard/), above the form.

Visitors can see: “TODO: link official rules before this goes live.” The page is already public and linked from the primary CTA. The promised rules link is missing.

**Make consistent:** Replace the internal note with the intended rules link and finished visitor-facing text.

### 6. Medium — The scope of the $500,000 commitment is unclear

**Where:** [Landing hero](https://milomessina.com/landingpage/) and [village About](https://milomessina.com/fomo/campuswars/).

The landing page places the commitment above all three programs; the village places it in a Greek Wars context. Neither explains whether the amount covers all campus activity, Greek Wars alone, creator payouts, internship budgets, or some combination. This is an ambiguity, not evidence that the amount is wrong.

**Make consistent:** Add one short description of what the commitment covers.

### 7. Medium — Creator payout precision exceeds the explanation of eligible views

**Where:** [Creator payouts and calculator](https://milomessina.com/fomo/submit/#pays).

The page gives a precise rate and calculator, but does not fully define a qualifying view. The paid-video checkbox excludes purchased views, yet the page does not explain treatment of promoted views, cross-posts, repeat submissions, or rounding. The calculator presents ordinary view counts as a definite payout, while the offer is conditional on qualifying views.

**Make consistent:** Define the counting rules and label the calculator as an estimate based on qualifying views.

## Navigation and behavior

### 8. High — The campus home logo does not return to the campus landing page

**Where:** Landing header/footer, creator header/footer, and application header.

The shared campus logo leads to `/fomo/`, which is specifically the internship page, rather than `/landingpage/`, which introduces all three programs. Even the landing page’s own home link sends visitors into a single program. On the internship page, the logo instead acts as an in-page scroll button.

**Make consistent:** Give the shared home identity one destination, with a separate link for internship details.

### 9. Medium — Onboarding’s back link leads to a different Greek Wars experience

**Where:** [Chapter onboarding](https://www.aryatoufanian.com/fomo/onboard/).

From the village or landing page, onboarding moves visitors to another domain. Its desktop back link goes to that domain’s separate Greek Wars page, not the village or campus landing page. At the reviewed phone width, the back link is not shown at all.

**Make consistent:** Provide an explicit return path and retain it on phones.

### 10. Medium — The three programs cannot be browsed through shared navigation

**Where:** Internship, creator program, and village.

The landing page presents three sibling programs, but their destination pages offer only their own section controls or application links. There is no shared program switcher. The village has neither a campus-home link nor links to the internship and creator program.

**Make consistent:** Add a small, shared way to return to all programs or switch between them.

### 11. Medium — A direct landing-section URL loses its intended destination

**Where:** [Landing page with the Internship fragment](https://milomessina.com/landingpage/#internship).

Confirmed on a fresh visit: the intro plays, then the page ends at the hero with the Internship section well below the viewport, even though the URL still contains `#internship`. The intro completion code always scrolls to the top. A shared section URL therefore behaves differently from clicking the section navigation after entry.

**Make consistent:** Honor the requested fragment after the intro finishes or is skipped.

### 12. Medium — Generic internship Apply links discard the selected role

**Where:** [Internship](https://milomessina.com/fomo/) → generic header/bottom Apply links, then [application](https://milomessina.com/fomo/apply).

Role-specific buttons include the role in the URL and show the correct question. The generic Apply links do not include it, and the form defaults to Content. Selecting Growth or Culture in the role browser does not update those generic links. Confirmed in the implementation; the individual role URLs were checked live.

**Make consistent:** Preserve the selected role on every Apply button, or require an explicit selection instead of silently defaulting to Content.

### 13. Medium — The village billboard sends visitors to the wrong place for full standings

**Where:** [Village → Leaderboard](https://milomessina.com/fomo/campuswars/).

The billboard says full standings are below the village. They are actually inside the **Chapters** drawer in the current full-screen layout.

**Make consistent:** Point visitors to Chapters, or make the leaderboard action open the complete list.

### 14. Medium — “Leaderboard” means onboarding progress in one place and trading performance in another

**Where:** Village leaderboard, landing Greek Wars copy, and external National tab.

The village board ranks percentage onboarded. The competition describes ranking by dollar profit and loss, and the external National tab illustrates that metric. The village billboard identifies onboarding once the visitor reaches it, but its generic button and the landing page’s competition copy do not clearly distinguish the two boards.

**Make consistent:** Name them Onboarding Progress and Trading Standings, with a clear explanation of which determines prizes.

## Content and expectations

### 15. High — Recommended creator ideas do not satisfy the stated requirements as written

**Where:** [Creator video requirements](https://milomessina.com/fomo/submit/#needs) versus [creator ideas](https://milomessina.com/fomo/submit/#ideas).

Requirements call for the creator and another person in frame, recognizable campus identity, and fomo as the story. The get-ready example describes a solo camera monologue; the dad example is a phone call; the sample prompts discuss crypto generically without showing how to include fomo or the school. Someone following the suggestions literally could make an ineligible video.

**Make consistent:** Rewrite the examples to demonstrate the requirements, or identify them as starting concepts that need adaptation.

### 16. Medium — The $25 approval bonus has no clear payment date

**Where:** [Creator program](https://milomessina.com/fomo/submit/#next).

The page consistently awards a one-time $25 bonus upon creator approval. Its payment schedule, however, describes video payouts after the 30-day view measurement period. It never specifies when the separate approval bonus is actually sent.

**Make consistent:** State the bonus payment schedule separately from video earnings.

### 17. Medium — The internship changes its description across the journey

**Where:** Landing Internship section, internship experience example, and application confirmation.

The entry point calls the program an internship. The experience example calls it Contract, and the application confirmation refers to ambassadors. These terms can coexist, but the pages do not explain their relationship. The funding copy describes an operating budget without clearly distinguishing that from personal compensation.

**Make consistent:** Explain the role arrangement and compensation in plain language before application.

### 18. Low — Sixty days and eight weeks are used interchangeably

**Where:** Landing Internship section and [internship plan](https://milomessina.com/fomo/).

The offer is repeatedly described as sixty days, but the plan covers eight weeks, or 56 days. Week eight also contains the 60-day report. This is small, but precise scheduling should agree.

**Make consistent:** Describe it as approximately eight weeks, or explain the remaining days.

### 19. Low — The experience example contains an impossible current duration

**Where:** Internship → experience card.

The example starts in September 2026 and runs to Present, while displaying two months of experience. At the September 10 review date, that duration cannot yet be correct. The dates are hardcoded.

**Make consistent:** Label the card as an illustrative future example or use internally consistent dates.

## Forms, accessibility, and phone behavior

### 20. Medium — Creator link validation is looser than the form’s instructions

**Where:** [Creator form](https://milomessina.com/fomo/submit/#send); source: `fomo/submit/creator-form.js`.

The paid-video route requests an actual TikTok, Reel, or Short post, but its validator only checks the domain. A platform homepage or profile can pass that check. The prior-UGC route likewise checks TikTok’s domain without requiring a profile URL. The selectable platform can also disagree with the entered URL. This is a source-confirmed validation gap; no application was submitted to test server acceptance.

**Make consistent:** Validate the expected URL shape and reconcile platform selection with the URL, while accommodating legitimate short links.

### 21. Medium — Selected roles are visible but not consistently announced

**Where:** Internship role cards and application role picker.

Their active role is expressed through styling, without a corresponding selected/pressed state on the buttons. The application’s active button was inspected live. By comparison, the internship’s mobile plan filters and the village chapter controls do expose their active state.

**Make consistent:** Use accessible radio or tab semantics, or pressed states where appropriate, for the role choices.

### 22. Medium — Reduced-motion preferences are handled inconsistently

**Where:** Landing intro versus shared form backgrounds and village activity controls.

Source review shows the landing checks the reduced-motion setting to suppress some transitions, yet still starts its autoplay intro. Other pages suppress animated star backgrounds or pause activity for that preference. The user preference therefore produces different behavior across the experience.

**Make consistent:** Offer a static or skipped intro under reduced motion, with an explicit replay option. This finding is source-based; an OS-level preference change was not tested.

### 23. Medium — Mobile navigation disappears on the creator page rather than moving into a menu

**Where:** [Internship](https://milomessina.com/fomo/) versus [creator program](https://milomessina.com/fomo/submit/) at 390 pixels wide.

The internship provides a working mobile menu. The creator page removes its section links and keeps only Apply, without a replacement menu. The creator header also stops being sticky at narrow widths, unlike the landing header. Visitors lose convenient access to payout details and next steps on a long page.

**Make consistent:** Retain important section navigation through a compact menu or another accessible phone pattern.

## Visual and naming differences

These are observed design inconsistencies, not claims that every page should look identical. A distinct 3D village can be intentional while shared brand elements remain consistent.

### 24. Low — Primary buttons use three different visual systems

The landing uses solid blue rounded rectangles. Internship buttons use a muted translucent violet treatment. Creator and application buttons use bright gradient pills with glow. Radius, emphasis, arrow placement, and hover behavior differ for comparable actions.

**Make consistent:** Share primary and secondary button styles across ordinary program pages.

### 25. Low — Heading case, weight, and emphasis change between pages

The landing’s program headings use title case and bold text. Internship and creator headings are lowercase, with different weights and gradient accents. The external Greek Wars page uses heavy uppercase display headings. Even equivalent role names shift capitalization.

**Make consistent:** Define a shared typography hierarchy and capitalization convention, with deliberate exceptions for campaign artwork.

### 26. Low — Backgrounds and card treatments make the journey feel fragmented

The landing uses flat dark cards and a restrained blue glow. Internship and creator pages use stars, aurora effects, and more transparent surfaces. The external onboarding page switches abruptly to a light lavender surface. The village uses full-screen 3D scenery. The change to onboarding is especially abrupt because it is a primary conversion step.

**Make consistent:** Carry shared header, spacing, form, and brand treatments into onboarding, even if the village keeps its own visual setting.

### 27. Low — Brand marks and browser-tab icons change

The landing and village use an `f.` favicon, while internship and form pages use the fomo symbol. The landing intro’s wordmark differs from its main-page logo, and its `/campus` suffix disappears at phone widths. External onboarding introduces a Greek Wars lockup rather than the shared campus identity.

**Make consistent:** Standardize the core mark and favicon, and define how program names attach to them.

### 28. Medium — The same competition has several unexplained names

Visitors encounter Greek Wars on the landing, Greek village in the 3D view, Campus Wars on its billboard, and Clan Wars alongside Greek Wars on the external page. “The row” is another label on the billboard. The connection between a program name, a visualization name, and an umbrella brand is not consistently explained.

**Make consistent:** Pick one public competition name and consistently identify the village as its onboarding visualization. Explain any umbrella brand once.

## What checked out

- The main linked pages opened successfully.
- All five role-specific application URLs displayed the corresponding role question.
- The creator concept CTA selected the concept route and updated its instructions.
- The landing and creator page agree on $2 per 1,000 qualifying views, the $5,000 per-video cap, the separate one-time $25 bonus, and the 30-day measurement point.
- The village rendered on desktop and phone; Chapters exposed registration counts and a live-update timestamp.
- The internship mobile menu opened successfully.
- No missing local HTML-linked pages, assets, or anchor IDs were found in the scoped scan.

## Recommended order

First resolve the money and eligibility discrepancies: **1–5 and 15**. Then repair the main journey: **8–14**. Follow with the remaining expectation, form, and accessibility issues, and finish by standardizing the shared visual elements.
