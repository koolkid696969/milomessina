# fomo Campus Wars

Static landing page for `https://milomessina.com/fomo/campuswars/`, using the existing GitHub/Vercel deployment. Three.js 0.180.0 is pinned in `vendor/` with its MIT license. There are no new dependencies, runtime endpoints, external assets, or build steps.

## Chapter snapshot and registration

`chapters.json` and the identical embedded HTML snapshot contain the five actual registrations supplied by the user: Sigma Chi 60/100, Kappa Sigma 34/69, Phi Delta Theta 21/50, Phi Kappa Psi 2/90, and Tau Kappa Epsilon 0/60. They total 117 joined out of 369 active members. This is a registration snapshot, not a live feed. Only those five chapters report membership. All other buildings and campus visitors are scenery.

Qualification is `ceil(active * 0.8)`. Progress divides joined by the full roster and marks the 80% threshold separately. Keep the JSON and embedded snapshot synchronized. Personal contact details and trader nominations are excluded.

Registration links continue to `https://www.aryatoufanian.com/fomo/onboard/`. This site does not create registrations or chapter invite links. Existing members get their chapter invite from their lead. The headline is `$500,000 committed`, supplied by the user; chapter qualification and individual prize rules retain their existing amounts.

## Village and controls

The six chapter lots and street grid retain their existing positions. Houses use Georgian/classical architecture with brick, columns, porticoes, balconies, shutters, roofs and porches. Chapters with fewer than 15 joined members have foundations, exposed timber, scaffolding and staged materials; a completed house appears at 15. House footprint and height grow with the absolute number onboarded, with bounded dimensions that fit the lots.

House-mounted cloth banners now have five distinct compositions using the real fraternity palettes: blue/gold Sigma Chi, scarlet/emerald Kappa Sigma, blue/silver Phi Delta Theta, cardinal/hunter-green Phi Kappa Psi, and cherry/gray TKE. Each shows Greek letters, chapter name and the real member count. Original artwork and source references are documented in [banner-references.md](banner-references.md); [tests/banner-gallery.html](tests/banner-gallery.html) provides a flat visual review. Their 2048-pixel textures use Aeonik, woven detail, stitching and modeled eyelets. Counter-scaling preserves lettering proportions as houses grow. The original `fomo /campus` lockup now hangs across the main domed library at (0, −120), on a 29-unit-wide façade banner. It uses a 3072-pixel texture and sits in front of the columns, suspended below the cornice. The previous ground logo is removed.

The opening camera retains the screenshot-matched position approximately `(10.194, 12.378, -52.779)`, looking at `(1.808, 2, -8.101)`. It slowly orbits at 0.06 rad/s until the first camera/house interaction. Reset returns to this composition. Drag or arrow keys orbit, Shift-drag pans, and zoom/fullscreen controls remain. House selection updates the detail panel and `#chapter=...` share link. The walk-around mode, avatar, minimap, shortcuts and instructional overlays remain removed.

The empty lot has a single purple floor reading `YOUR HOUSE / CLICK TO START` across its full 15×18 surface. Its freestanding sign, stakes and walkway are removed. Clicking any part of that floor follows the existing chapter registration link. The chapter roster and signup links remain usable if WebGL fails. Native sharing falls back to clipboard and then a selectable URL.

## A fuller, lived-in campus

`village-districts.js` streams nine blocks around the camera. Libraries, academic halls, unions, shops, residences, a recreation center, café, fountain and courts create distinct destinations. This is a representative campus combining chapters from multiple universities, not a geographic map of an actual campus.

The density pass adds:

- Foreground picnic areas, planted edges, hedgerows, low walls, bollards, parked bicycle racks, trash/recycling pairs, newspaper boxes, sandwich signs, cabinets, hydrants and banner poles.
- 76 static parked cars in the opening nine-block neighborhood, with parking pockets painted into the existing floor and checked against building footprints. Moving traffic remains eight vehicles and twelve cyclists.
- Gutters, downspouts, window boxes, address plaques, wall lights, chimneys, vents, roof hatches, dishes and utility poles with sagging wires. Existing modern buildings retain rooftop HVAC units and canopies.
- A permanent, non-streamed distant ring of dormitory silhouettes and tree mass, plus a water tower, bell tower and stadium lighting. Fog density is 0.0022 so the horizon remains legible as depth.
- 424 ambient people in the opening neighborhood, concentrated at plazas, café queues, picnic areas and entrances. Academic blocks have 64 each and Greek Row has 99; quieter surrounding streets have 31–35. These are scenery counts, never registration statistics.
- Doorway arrivals/departures with an indoor pause, a dog walker and leashed dog, skateboarders, a frisbee pair, and a groundskeeper, alongside existing walking, jogging, conversation, study and basketball.

`village-district-layout.js` supplies deterministic hashing and appearance palettes. Instance seeds replace repeating clothing stripes: 24 shirt colors, eight skin tones, eight hair colors, varied hair length, 0.9–1.1 height, jackets, shorts/pants and backpacks. Building tints and lit windows vary by seed. Trees use broad, narrow and conifer silhouettes with varied scale, rotation and trunk lean.

`village-layout.js` still creates exactly one person per joined chapter member. The 112 standing members occupy wider conversation groups of varied sizes, including pairs and a larger cluster, scattered over the lawn and porch. Placement scores prioritize body clearance. Five chapter members stroll. A single speaker per group makes small gestures while listeners breathe and nod; nobody jumps or holds both arms overhead.

## Human motion and appearance

Chapter members and ambient visitors now share `village-human-motion.js`: proportional bodies, articulated hips/knees/ankles, upper/lower arms, hands, necks, shaped hair, small noses and shoes. Clothing and accessory colors remain seeded, with sleeves and exposed calves on shorts. Nearby chapter models have more rounded geometry; ambient models retain a smaller geometry budget and the same six instance batches per block.

Walking cycles follow distance traveled and individual height. Feet move backward at travel speed during ground contact, then lift and return on a continuous curve. Knees solve to fixed leg lengths, arms counter-swing, hips shift weight, shoulders counter-rotate, and heads glance ahead through rounded turns. Standing people settle into a taller relaxed stance with planted feet, subtle breathing, independent glances and smoothly eased conversation gestures. Joggers, seated students, skateboarders and people holding a leash or pushing a mower retain distinct poses.

The five chapter walkers follow a constant-speed loop around the conversation groups, with sampled clearance above half a world unit. Doorway visitors ease to a stop and turn over two seconds before returning. The groundskeeper follows a rounded route instead of reversing instantly. These are procedural routes, not a general crowd collision or navigation system; ambient visitors can still overlap when overtaking.

The motion tests check ground-contact sliding, stride-boundary continuity, leg lengths and knee direction, fixed standing feet, route speed/clearance, and continuous speaking/turning transitions. The local browser review covered character close-ups, the full village and pause/resume. The historical rendering measurements below predate this change; full-scene frame rates and updated triangle counts have not been benchmarked.

## Ground and rendering architecture

`village-streets.js` owns one persistent, opaque floor. Its 300-unit repeating texture carries roads, rounded junctions, sidewalks, crossings, bicycle lanes, parking, wheel wear, repairs, cracks, desire paths, leaf litter, damp patches, manholes, drains and chalk. There are no added overlapping decal planes. Streaming never removes or replaces the floor. Mipmaps, anisotropy and the 1–450 camera clipping range preserve surface stability.

All added geometry uses the batching/instancing helpers in `village-campus-kit.js`. Static geometry batches share material properties and use per-instance colors; animated people and their props share instance buffers. Distant scenery is batched once. Wires use thin triangular prisms, distant foliage has a modest polygon count, and tiny shoes use simpler rounded geometry to fund the additional population. Removed chunks dispose their instance buffers and owned materials/textures while shared resources remain cached.

Active people now update on every rendered frame, removing the separate 24 Hz timer that could reduce visible animation to approximately 15 Hz when combined with the old 30 Hz rendering cap. Pause, reduced-motion preferences, hidden-document and offscreen controls remain in `village.js`; no new animation loop was introduced. Adaptive pixel ratio remains 2× maximum desktop / 1.5× touch, stepping down under sustained slow frames. Cached shadow maps remain 2048px desktop / 1024px touch.

## Verification and measured rendering budget

Run:

```sh
node --test fomo/campuswars/tests/village.test.mjs
```

All 22 tests pass. They cover exact chapter counts, six selectable lots, construction thresholds, reproducible crowds and hashed campus builds, clothing diversity, conversation turns and body clearance, pavement-bound traffic, building/parking separation, nine-block resource bounds, permanent horizon identity, and finite transforms through all new activities and distant streaming positions. Sampled scene bounds remain below 200 mesh objects and 22,000 instances; browser draw calls are measured separately below.

Density-pass measurements below predate the later empty-lot floor, library banner and surrounding-page edits. Measured in an isolated headless Chrome 142 WebGL browser using SwiftShader, with the same 1320×720 scene viewport, opening/close-up camera positions, frozen reduced-motion state and warmed cached shadows for both builds. Counters are `renderer.info.render` from the actual rendered frame, not scene-object estimates. Baseline is commit `161e653` immediately before this density pass. Its measurements differ from the older figures in the brief.

| View | Before draw calls | After draw calls | Before triangles | After triangles |
| --- | ---: | ---: | ---: | ---: |
| Opening | 201 | 177 | 631,298 | 680,432 |
| Sigma Chi close-up | 134 | 103 | 478,382 | 479,768 |

The opening is below the requested approximately 200 draws / 700,000 triangles. Initial detail exceeded the triangle limit and was reduced before shipping. Opening and chapter close-up screenshots were inspected. Browser frame rates were **not measured**; draw-call and triangle counts do not establish device FPS. No test registrations were submitted.

## Brand and architectural references

The existing fomo.family colors and Aeonik remain, with warm brick and ivory architecture. The standalone prize section and its trophy image are removed from the page, along with the corresponding navigation link. Earlier superseded artwork and prompts remain archived.

Architectural references from earlier work include [Maryland's Georgian fraternity row](https://fsl.umd.edu/about/history), [Alabama's Kappa Sigma plans](https://buildingbama.ua.edu/wp-content/uploads/2022/09/Kappa-Sigma-Stage-3.pdf), [UVA's shared campus spaces](https://www.virginia.edu/life-uva/) and [Maryland's campus circulation plan](https://facilities.umd.edu/projects-programs/campus-facilities-plan).

## Village-centered page

The surrounding page follows the same progression as the scene: claim an empty lot, bring the first 15 members to build the house, then reach 80% to qualify. Inline architectural illustrations explain those stages without additional runtime assets or another WebGL scene. Buttons return to the actual empty lot, Phi Kappa Psi construction site or Sigma Chi house, using the existing selection and camera controls.

The village appears immediately below the navigation. “Get your frat paid” and “$500,000 committed” sit directly beneath the scene; the previous above-village hero is removed. The mobile signup bar observes the village itself. Prize amounts and qualification rules are unchanged. Navigation, chapter details, sharing, the closing invitation, FAQs and the mobile signup bar all follow the village theme. Trading performance and onboarding are explicitly explained as separate determinants of competition rank and house growth.
