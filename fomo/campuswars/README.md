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

`village-layout.js` creates one articulated 3D partygoer for each joined member: 60, 34, 21, 2, and 0. 112 members stand in conversation circles, facing their group, with one speaker at a time and low-key arm gestures, head nods and breathing. Five members stroll around their chapter lawns; no members jump or hold both hands overhead. Repeated architecture and body parts are instanced to limit draw calls. Old photographic panorama and crowd sprites are no longer used.

`village.js` handles orbiting, zoom, house-mounted membership banners, house picking, view reset, Shift-drag panning, arrow-key camera rotation, fullscreen, and synchronization with the chapter detail panel and deep links. The visitor avatar, walk mode, movement controls, ground destinations, pathfinding, minimap, place shortcuts and status/instruction overlay have been removed. The hero action links and village population subtitle were also removed. Existing chapter registration links elsewhere on the page remain available.

Village activity can be paused. Animation stops offscreen and when the document is hidden, and reduced-motion preferences suppress idle activity. The chapter roster and registration links remain usable if WebGL or the module cannot load.

## Brand and artwork

The existing fomo.family palette and Aeonik typography remain: near-black, soft white and periwinkle. The scene uses warm brick, ivory columns and blue-hour lighting. The trophy campaign image is retained. Earlier generated-image prompts remain archived in `artwork-prompt.md`; they describe superseded assets.

## Validation

Run `node --test fomo/campuswars/tests/village.test.mjs` for member counts, reproducible crowds, six selectable lots, building orientation, conversation turn-taking, neighborhood streaming, articulated transforms and geometry batching. Syntax checks and static reference checks cover the entry scripts, styles, local assets, unique HTML IDs, and matching chapter snapshots. The page has no compilation step. No test registrations were submitted. Browser interaction testing was not performed.

## Rendering budget

Fog density is 0.0035, reduced from 0.0085. Rendering uses a maximum pixel ratio of 1.25 (1 on touch devices), cached 1024px shadows refreshed on neighborhood/light-region changes, cheaper background materials, fixed architectural transforms and bounded crowd culling. Ambient activity updates at most 24 times per second and only near the viewer; idle rendering targets 30 frames per second while camera input can render at the display cadence. Chapter names and membership totals are printed on 3D cloth banners attached beneath the porch beams; they use normal scene depth and perspective instead of floating screen overlays. Banners are selectable, and the accessible chapter roster remains below the scene. Actual browser frame rates have not been measured.

## Street surface stability

`village-streets.js` owns one persistent street plane. Asphalt, intersections, sidewalks, crossings and lane paint are drawn into a repeating texture on the same surface, removing near-coplanar road intersections and duplicate markings. District streaming only manages buildings and scenery; roads stay loaded. The texture repeats every 100 world units, matching the collision and block grid. Mipmaps and anisotropic filtering stabilize distant markings.

The floor now includes opaque grass in the same texture as roads and sidewalks. The separate terrain plane and alpha cutouts were removed to eliminate overlapping depth layers and angle-dependent mipmap threshold changes. The orbit camera uses a 1–450 clipping range for better depth precision.

House width, depth and roof height grow smoothly with the absolute number of onboarded members. Growth is bounded to fit the existing lots. Porch entrances stay aligned with paths; lawn dimensions and people keep their original scale.

## Campus surroundings and activity

The surrounding architecture now uses a campus plan with a domed library, humanities halls, a science building with a glazed entrance, student unions with terraces, arts buildings, a curved-roof recreation center, L-shaped residences, townhouses, and street-level shops. Setbacks, heights, roof profiles and building orientations vary by district. Textured brick and stone, irregular tree canopies, groves, bicycle racks, bus shelters and café furniture replace the repeated detached-villa template. The representative design takes cues from [UVA's shared lawns and gathering spaces](https://www.virginia.edu/life-uva/) and [Maryland's connected campus circulation](https://facilities.umd.edu/projects-programs/campus-facilities-plan).

`village-campus-kit.js` shares geometry and textured materials. Static meshes are batched by geometry and texture with per-instance colors, reducing the new nine-block environment to about 150 draws including building signs. `village-campus-life.js` adds roughly 300 ambient visitors with rounded, articulated bodies, varied clothes, backpacks, books, conversational gestures, jogging, seated studying, café queues and basketball. Eight vehicles include a campus shuttle, and twelve cyclists pedal and turn along separate lane centers. These visitors are scenery and never change registration counts. All activity follows the existing pause, visibility and reduced-motion controls. Browser frame rates have not been measured.

The one opaque ground texture now repeats over 300 world units, with pedestrian academic axes, varied street widths, rounded intersections, bike lanes, crosswalks, pullouts and parking courts. Tests sample entire traffic circuits against the floor paint, check pedestrian/building intersections, and validate streaming resource bounds and finite animated transforms.

The main headline and homepage share title are `$500,000 committed`, as supplied by the user. Chapter qualification and individual prize rules retain their existing amounts.

The ground marking reuses the original fomo symbol and lowercase `fomo /campus` lockup from `/fomo/`, with Aeonik loaded before the texture is refreshed. The initial overview slowly orbits while visible and unpaused; the first pointer interaction, keyboard input or house focus hands over control permanently for that visit. Reduced-motion preferences suppress the automatic orbit.

Chapters with 0–14 onboarded members display a concrete foundation, exposed timber framing, scaffolding, ladders and staged materials instead of a finished house. Their membership banner remains on the construction frontage. A finished house appears at 15 members. The starting overview is 0.38 radians above the horizon (about 22 degrees) and orbits at 0.06 radians per second before interaction.

## Banner and rendering quality

Banners use 2048-pixel-wide textures sized to their physical aspect ratio, with an ivory woven field, a Greek-letter panel, Aeonik chapter names and member counts, stitched borders and modeled metal eyelets. The banner is counter-scaled vertically as its house grows so the lettering keeps its proportions. Fonts trigger a texture refresh when ready. A subtle fabric bump and sheen provide cloth detail without adding animation cost.

The renderer starts at up to 2× pixel density on desktop and 1.5× on touch devices, stepping down if slow frames persist. Desktop shadows use a cached 2048px map; touch retains 1024px. Softer neutral fill light, lower exposure, less haze, smoother foreground columns and tree canopies, and finer brick courses improve close-up quality. Browser frame rates and visual interaction testing have not been measured/performed.

The opening camera now matches the user-supplied street-level screenshot, looking south between Kappa Sigma and Sigma Chi: position approximately (10.194, 12.378, -52.779), target (1.808, 2, -8.101). It starts directly at that composition, and Reset view returns there. The existing 0.06 rad/s orbit speed remains unchanged. The preset is calibrated from scene landmarks in the reference image.
