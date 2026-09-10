# Campus consistency fixes

Updated September 10, 2026. Changes are in the local project and have not been published. This record follows the numbering in `landingpage-inconsistency-audit.md`; the original audit remains a record of the earlier state.

## Confirmed program rules

- Every chapter that completes onboarding receives $500, paid to the chapter. The existing 80% active-member threshold remains.
- The first chapter at each school receives an additional $250. Fraternities and sororities share that race.
- The national prize amount remains hidden.
- fomo has committed $500,000 to fomo / campus.
- The one-time $25 creator bonus is paid when the creator is approved.
- Paid videos must be original, organic TikTok content. No cross-posting, reposts, repeat submissions, promoted views, or purchased views. A second person, campus branding, and a fomo topic are not mandatory.
- Internship compensation remains unspecified.
- Arya’s external pages are deferred at the owner’s request.

## Changes against the audit

| Finding | Result |
| --- | --- |
| 1. $500 recipient and conditions | Local landing and village copy now agree: payment to each qualifying chapter, without the top-trader or semester-end conditions. External copy deferred. |
| 2. $250 bonus categories | One first-chapter bonus per school throughout local copy. External copy deferred. |
| 3. National prize disclosure | Amount remains hidden locally. External amounts deferred. |
| 4. External season/sample-data message | Deferred with Arya’s pages. |
| 5. External rules TODO | Deferred with Arya’s pages. |
| 6. $500,000 scope | Landing and village explicitly identify fomo / campus. |
| 7. Eligible views and calculator | Organic-view rules explained; calculator labeled as an estimate and rounded to cents. |
| 8. Campus home destination | Shared home links return to the landing page. Application has a separate internship-details link. |
| 9. External onboarding back link | Deferred with Arya’s pages. |
| 10. Shared program navigation | Ordinary pages share program navigation; village includes All programs and program links in About. |
| 11. Landing section links | Intro completion and skipping restore the requested section and focus. |
| 12. Selected internship role | All generic Apply links carry the selected role. |
| 13. Billboard directions | Billboard directs visitors to Chapters for the full list. |
| 14. Two kinds of rankings | Village control is named Onboarding board; local copy distinguishes onboarding progress from trading performance. |
| 15. Creator examples and eligibility | Requirements match the approved organic-content rules; ideas are optional starting points. |
| 16. $25 bonus timing | Approval bonus payment is explicitly separate from video payout timing. |
| 17. Internship descriptions | Contract/ambassador terminology reconciled with campus-team wording. Compensation left unspecified. |
| 18. Eight weeks versus 60 days | Eight weeks cover the plan; days 57–60 cover reporting and handoff. |
| 19. Experience example dates | Impossible hardcoded duration replaced with an illustrative-role label. |
| 20. Creator link validation | UGC requires a TikTok profile; paid submissions require a TikTok video or supported share link. Platform is fixed to TikTok. |
| 21. Accessible role selection | Role buttons expose pressed states on the internship and application pages. |
| 22. Reduced motion | Landing intro is skipped under reduced motion, with explicit Replay still available. |
| 23. Phone navigation | Creator and internship pages retain section links in an accessible menu and shared sticky header. |
| 24. Buttons | Shared primary/secondary button styling across ordinary pages; village controls aligned. |
| 25. Headings | Main local headings use consistent case, weight, and emphasis. External styling deferred. |
| 26. Backgrounds and cards | Ordinary local pages share backgrounds and card treatments; village retains its 3D setting. External onboarding deferred. |
| 27. Brand and favicon | Local pages use the shared fomo mark/favicon and campus header identity. External identity deferred. |
| 28. Competition naming | Local competition wording standardized to Greek Wars, with the village identified as its onboarding visualization. External naming deferred. |

## Verification

- 26 landing/creator automated tests passed, including section restoration, reduced motion, and TikTok URL validation.
- 30 village automated tests passed.
- Five local pages checked: 93 local references resolved, with no duplicate IDs or missing anchor destinations.
- All executable inline scripts passed syntax checks; no whitespace errors found in the diff.
- Browser checks covered role selection through application, creator submission modes, shared navigation, mobile section menus, and village prize details. Phone layout checked at 390 × 844.
- No applications or registrations were submitted. Live backend delivery and payment operations were not exercised. The local static preview does not serve the production village API.

Existing application phone-field and shared form-validation edits were preserved.
