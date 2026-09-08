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

`assets/frat-row-human.jpg` is one original architectural panorama created with built-in image generation, used as a continuous background under six interactive lots. Five unique homes share a single sidewalk and consistent scale/light: Spanish Revival stucco, coastal clapboard, brick Greek Revival, stone Tudor, and Craftsman. No facades repeat. Selection changes labels and progress styling without lifting pieces of the street. The homes are visual representations, not authenticated photographs of the named chapters.

Artwork brief: photograph-like handcrafted scale-model street, near-black backdrop, overcast blue-hour lighting, warm light in selected windows, modest 2–3-story homes with weathered material, porch furniture, bicycle, uneven planting and a basketball. A sixth gravel lot has a simple stake and restrained periwinkle outline. No people, text, logos, glossy mansions or wireframe house. Central band composition for responsive cropping. Generated once with no retries, 2172×724. JPEG delivery asset. Exact prompt archived in `artwork-prompt.md`.

`assets/trophy.jpg` was generated using the built-in image tool as a chrome championship trophy on a deep cobalt background with metallic confetti and no text. It is campaign imagery.

## Validation

The page has no dependency install or compilation step. JavaScript syntax, local file references, unique HTML IDs, navigation anchors, and all five qualification targets were checked. The data is checked against the supplied screenshot. No test registrations were submitted.
