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

## 3D village

The primary experience is a real Three.js scene rendered with WebGL. Three.js 0.180.0 is pinned and served locally from `vendor/`; its MIT license is included. No third-party runtime requests or build step are needed.

`village-world.js` builds five distinct Georgian/classical fraternity houses with modeled brick facades, columns, porticoes, balconies, windows, roofs, porches, chapter pennants, speakers and tables. A sixth undeveloped lot has a claim sign. Shared streets, sidewalks, lamps, trees and benches connect the houses. Geometry follows the user's architectural references and earlier research on [Maryland's Georgian fraternity row](https://fsl.umd.edu/about/history) and [Alabama's Kappa Sigma building plans](https://buildingbama.ua.edu/wp-content/uploads/2022/09/Kappa-Sigma-Stage-3.pdf). This is a representative village combining chapters from multiple campuses, not a map of an actual campus.

`village-layout.js` creates one articulated 3D partygoer for each joined member: 60, 34, 21, 2, and 0. The visitor avatar is visually separate and does not contribute to these counts. Dance poses move shoulders, elbows, hands, torsos and legs with varied timing. Repeated architecture and body parts are instanced to limit draw calls. Old photographic panorama and crowd sprites are no longer used.

`village.js` handles orbiting, zoom, projected chapter markers, house picking, overview and walking modes, a visitor avatar, click-to-walk destinations, keyboard movement (WASD/arrows), touch movement controls, a clickable minimap, fullscreen, and synchronization with the chapter detail panel and deep links. Walking stays in the boulevard and front lawns outside building footprints. Click a house to focus it or walk toward its lawn. The empty lot links to the original chapter registration flow. These are outdoor village interactions; house interiors are not modeled.

The party can be paused. Animation stops offscreen and when the document is hidden, and reduced-motion preferences suppress idle dance motion. The chapter roster and registration links remain usable if WebGL or the module cannot load.

## Brand and artwork

The existing fomo.family palette and Aeonik typography remain: near-black, soft white and periwinkle. The scene uses warm brick, ivory columns and blue-hour lighting. The trophy campaign image is retained. Earlier generated-image prompts remain archived in `artwork-prompt.md`; they describe superseded assets.

## Validation

Run `node --test fomo/campuswars/tests/village.test.mjs` for member counts, reproducible crowds, six selectable lots, building orientation, walking boundaries, articulated animation transforms and geometry batching. Syntax checks and static reference checks cover the entry scripts, styles, local assets, unique HTML IDs, and matching chapter snapshots. The page has no compilation step. No test registrations were submitted. Browser interaction testing was not performed.
