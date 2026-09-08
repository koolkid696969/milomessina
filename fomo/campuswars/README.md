# fomo Campus Wars

Static landing page for `https://milomessina.com/fomo/campuswars/`, following the existing Vercel/GitHub deployment structure.

## Chapter snapshot

`chapters.json` contains only chapter names, schools, chapter type, joined and active counts, registration dates, and artwork identifiers from the user-provided registration screenshot. Contact information and trader nominations are intentionally excluded. The same snapshot is embedded in the HTML for immediate interaction without a network dependency. Update both copies together when refreshing records.

The row is explicitly marked as a registration snapshot, not live data. Qualification is `ceil(active * 0.8)`; onboarding bars divide joined members by the full active roster. The 80% mark is shown separately. The five records total 117 joined out of 369 active members.

Campus selection filters the real snapshot. Clicking a house updates its target panel. Mouse dragging, native touch scrolling, arrow controls, and keyboard arrows/Home/End navigate the row. The empty lot opens the claim panel. Chapter share links use `#chapter=...` and restore selection. Native sharing falls back to clipboard, then to a selectable URL.

## Registration

Calls to action preserve the original operational registration destination:
`https://www.aryatoufanian.com/fomo/onboard/`.
This page does not claim to register a chapter or create a join link itself. Existing members are instructed to get the chapter invite from their lead.

## Brand and artwork

Palette and Aeonik typography match fomo.family: near-black #060510, soft white #EAEDFF, periwinkle #606AF7. Font files were extracted from this repository's existing fomo font stylesheet.

`assets/frat-row.jpg` is an original 3D-style architectural illustration created with built-in image generation. The houses are visual representations, not authenticated photographs or models of the named chapter buildings. The row is a lightweight image composition with interactive chapter controls, not a WebGL model.

Artwork brief: a wide 3:1 realistic miniature fraternity row on near-black, with three distinct American fraternity houses (white-column Greek revival, brick Georgian, cream stone classical) and a fourth empty lot outlined in periwinkle with a faint house wireframe. Warm window light, dark roof materials, clean architectural details, continuous sidewalk, no words, people, logos or UI. Generated once without variants. Source 2172×724; JPEG optimized for delivery.

`assets/trophy.jpg` was generated using the built-in image tool as a chrome championship trophy on a deep cobalt background with metallic confetti and no text. It is campaign imagery.

## Validation

The page has no dependency install or compilation step. JavaScript syntax, local file references, unique HTML IDs, navigation anchors, and all five qualification targets were checked. The data is checked against the supplied screenshot. No test registrations were submitted.
