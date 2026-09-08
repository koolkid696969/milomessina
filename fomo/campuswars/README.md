# fomo Campus Wars

Static landing page for `https://milomessina.com/fomo/campuswars/`, following the existing Vercel/GitHub deployment structure.

## Chapter snapshot

`chapters.json` contains only chapter names, schools, chapter type, joined and active counts, registration dates, and artwork identifiers from the user-provided registration screenshot. Contact information and trader nominations are intentionally excluded. The same snapshot is embedded in the HTML for immediate interaction without a network dependency. Update both copies together when refreshing records.

The row is explicitly marked as a registration snapshot, not live data. Qualification is `ceil(active * 0.8)`; onboarding bars divide joined members by the full active roster. The 80% mark is shown separately. The five records total 117 joined out of 369 active members.

Clicking a house updates its target panel. Mouse dragging, native touch scrolling, and keyboard arrows/Home/End navigate the row. The empty lot opens the claim panel. Chapter share links use `#chapter=...` and restore selection. Native sharing falls back to clipboard, then to a selectable URL.

## Registration

Calls to action preserve the original operational registration destination:
`https://www.aryatoufanian.com/fomo/onboard/`.
This page does not claim to register a chapter or create a join link itself. Existing members are instructed to get the chapter invite from their lead.

## Brand and artwork

Palette and Aeonik typography match fomo.family: near-black #060510, soft white #EAEDFF, periwinkle #606AF7. Font files were extracted from this repository's existing fomo font stylesheet.

`assets/frat-row-columns.jpg` is an original architectural panorama used as one continuous background under six interactive lots. Five substantial chapter houses share a sidewalk, consistent scale and lighting: brick pediment and balcony, a six-column portico, a mansion with broad wings, a white classical facade, and a taller dark-brick house. The sixth lot remains empty. These are visual representations, not authenticated photographs of the named chapters.

Architecture follows the user's three reference photos and primary references from [Maryland's Georgian fraternity row](https://fsl.umd.edu/about/history), [Maryland's House 7](https://drf.umd.edu/facilities/residence-halls-communities/house-7), and [Alabama's Kappa Sigma building plans](https://buildingbama.ua.edu/wp-content/uploads/2022/09/Kappa-Sigma-Stage-3.pdf). Tall white columns, substantial brick facades, porticoes, balconies, side wings and broad lawns replace the earlier small residential houses.

`assets/party-people.png` is a transparent 6×2 atlas of twelve original adult student sprites. `crowd.js` produces deterministic positions for exactly one person per joined member. `site.js` creates 60, 34, 21, 2 and 0 sprites directly from the same records used for chapter counters: 117 total, without decorative extras or people baked into the panorama. Updating the snapshot updates the crowds on page load. Motion pauses offscreen, in hidden tabs, via the Pause party button, and for reduced-motion preferences. The empty lot has no people.

Both assets were generated once without retries. Exact prompts are archived in `artwork-prompt.md`.

`assets/trophy.jpg` was generated using the built-in image tool as a chrome championship trophy on a deep cobalt background with metallic confetti and no text. It is campaign imagery.

## Validation

The page has no dependency install or compilation step. JavaScript syntax, local file references, unique HTML IDs, navigation anchors, and all five qualification targets were checked. The data is checked against the supplied screenshot. Crowd layout checks verify exact counts, unique member positions, deterministic output, sprite bounds and invalid-count rejection. No test registrations were submitted.
