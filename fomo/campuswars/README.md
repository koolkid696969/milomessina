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

The primary experience is a real Three.js scene rendered with WebGL. `village-districts.js` streams nine surrounding blocks at a time and releases old blocks as the camera pans. A continuous ground plane, roads and atmospheric distance haze replace the isolated street slab. `village-district-layout.js` supplies repeatable house layouts and block coordinates. Shared places include a coffee terrace with bicycle parking, a fountain quad, and outdoor courts. Shift-drag pans the overview. Surrounding buildings and ambient campus visitors are scenery with no invented registration statistics; only the original five marked chapters report membership. Three.js 0.180.0 is pinned and served locally from `vendor/`; its MIT license is included. No third-party runtime requests or build step are needed.

`village-world.js` builds five distinct Georgian/classical fraternity houses with modeled brick facades, columns, porticoes, balconies, windows, roofs, porches, chapter pennants, speakers and tables. A sixth undeveloped lot has a claim sign. Shared streets, sidewalks, lamps, trees and benches connect the houses. Geometry follows the user's architectural references and earlier research on [Maryland's Georgian fraternity row](https://fsl.umd.edu/about/history) and [Alabama's Kappa Sigma building plans](https://buildingbama.ua.edu/wp-content/uploads/2022/09/Kappa-Sigma-Stage-3.pdf). This is a representative village combining chapters from multiple campuses, not a map of an actual campus.

`village-layout.js` creates one articulated 3D partygoer for each joined member: 60, 34, 21, 2, and 0. The visitor avatar is visually separate and does not contribute to these counts. 112 members stand in conversation circles, facing their group, with one speaker at a time and low-key arm gestures, head nods and breathing. Five members stroll around their chapter lawns; no members jump or hold both hands overhead. Repeated architecture and body parts are instanced to limit draw calls. Old photographic panorama and crowd sprites are no longer used.

`village.js` handles orbiting, zoom, projected chapter markers, house picking, view reset, Shift-drag panning, arrow-key camera rotation, fullscreen, and synchronization with the chapter detail panel and deep links. The visitor avatar, walk mode, movement controls, ground destinations, pathfinding, minimap, place shortcuts and status/instruction overlay have been removed. The hero action links and village population subtitle were also removed. Existing chapter registration links elsewhere on the page remain available.

Village activity can be paused. Animation stops offscreen and when the document is hidden, and reduced-motion preferences suppress idle activity. The chapter roster and registration links remain usable if WebGL or the module cannot load.

## Brand and artwork

The existing fomo.family palette and Aeonik typography remain: near-black, soft white and periwinkle. The scene uses warm brick, ivory columns and blue-hour lighting. The trophy campaign image is retained. Earlier generated-image prompts remain archived in `artwork-prompt.md`; they describe superseded assets.

## Validation

Run `node --test fomo/campuswars/tests/village.test.mjs` for member counts, reproducible crowds, six selectable lots, building orientation, conversation turn-taking, neighborhood streaming, articulated transforms and geometry batching. Syntax checks and static reference checks cover the entry scripts, styles, local assets, unique HTML IDs, and matching chapter snapshots. The page has no compilation step. No test registrations were submitted. Browser interaction testing was not performed.

## Rendering budget

Fog density is 0.0035, reduced from 0.0085. Rendering uses a maximum pixel ratio of 1.25 (1 on touch devices), cached 1024px shadows refreshed on neighborhood/light-region changes, cheaper background materials, fixed architectural transforms and bounded crowd culling. Ambient activity updates at most 24 times per second and only near the viewer; idle rendering targets 30 frames per second while camera input can render at the display cadence. House marker positions only update when the camera or selection changes. Actual browser frame rates have not been measured.

## Street surface stability

`village-streets.js` owns one persistent street plane. Asphalt, intersections, sidewalks, crossings and lane paint are drawn into a repeating texture on the same surface, removing near-coplanar road intersections and duplicate markings. District streaming only manages buildings and scenery; roads stay loaded. The texture repeats every 100 world units, matching the collision and block grid. Mipmaps and anisotropic filtering stabilize distant markings.
