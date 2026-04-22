// Seed 18 seasonal Santa Cruz blog posts with future publish dates.
//
// Cadence: every 2 weeks from May 4 2026 through Dec 28 2026.
// Each post is inserted with published=0 and published_at set to the target date.
// The in-process scheduler (server/scheduler.js) flips published=1 when the
// date arrives. No external cron required.
//
// Idempotent: INSERT OR IGNORE on the unique slug. Safe to re-run.
// Run:  node scripts/seed-seasonal-posts.js

require('dotenv').config();
const db = require('../db');

// ---------- Schedule ----------
// Midnight-Pacific publish time (stored as naive ISO — SQLite's datetime()
// treats it as UTC for ordering, which is fine for "has the day arrived" checks).
const schedule = [
  '2026-05-04', '2026-05-18',
  '2026-06-01', '2026-06-15', '2026-06-29',
  '2026-07-13', '2026-07-27',
  '2026-08-10', '2026-08-24',
  '2026-09-07', '2026-09-21',
  '2026-10-05', '2026-10-19',
  '2026-11-02', '2026-11-16', '2026-11-30',
  '2026-12-14', '2026-12-28',
];
const when = (i) => `${schedule[i]} 08:00:00`; // 8am local-ish = mid-morning email-friendly

// ---------- Posts ----------
const posts = [
  // ------------------------------------------------------------- May 4
  {
    slug: 'spring-storm-damage-santa-cruz-home-check',
    title: 'Spring Storm Damage: What to Check on Your Santa Cruz Home Before Summer',
    excerpt: 'The rainy season is ending. Before the dry heat sets in, here are the eight things worth checking — most take 10 minutes and can save thousands.',
    body: `<p>By late April the winter storms are mostly behind us, but the damage they leave behind doesn't show up until the dry weather starts pulling moisture out of the wood. If you walk your property now, you'll catch problems while they're still cheap to fix.</p>

<h2>1. Look up at the roof</h2>
<p>You don't need to get on a ladder — stand across the street and use your phone zoom. Look for lifted shingles, missing ridge caps, and dark streaks running down from flashing around chimneys or vents. Santa Cruz's wind-driven rain finds anything that isn't sealed.</p>

<h2>2. Walk the drip line</h2>
<p>The drip line is the line of dirt directly below the edge of your roof, where rainwater falls. If there are deep divots, ruts, or splash-back onto the siding, your gutters overflowed this winter. That water was running behind your fascia and down the exterior wall.</p>

<h2>3. Check the siding at grade</h2>
<p>Push gently on any wood siding within 12 inches of the soil. If it gives, that's rot. Redwood and cedar are common around here and both rot from the bottom up when they stay wet through the rainy season.</p>

<h2>4. Test the exterior doors</h2>
<p>Do they still close cleanly? A door that suddenly sticks in April is usually your framing moving as it dries out. Small movement is normal — a door that's gone out of square is worth a second look.</p>

<h2>5. Look at the deck and stairs</h2>
<p>Probe the joists from underneath with a screwdriver. If it sinks in more than 1/8", the wood is compromised. Deck collapses in California almost always happen in summer, after the wood has finished drying and shrinking away from its fasteners.</p>

<h2>6. Open the crawl-space hatch</h2>
<p>Bring a flashlight. You're looking for standing water, a wet vapor barrier, or efflorescence (white crystalline deposits) on the foundation. Any of those mean drainage around the house isn't working.</p>

<h2>7. Windows: look at the sills outside</h2>
<p>Peeling paint, swollen wood, or soft spots at the corners of the sill all signal that water got behind the trim. Caught early, it's a caulk-and-paint fix. Caught late, it's a sill replacement.</p>

<h2>8. Attic: a 30-second check</h2>
<p>Pop your head into the attic on a sunny day. If you see pinpricks of daylight anywhere, that's where rain came in.</p>

<p>If anything on this list raises a flag, <a href="/#contact">reach out</a> — most of these are straightforward to fix if you catch them in May or June, before the summer scheduling crunch hits.</p>`,
  },

  // ------------------------------------------------------------- May 18
  {
    slug: 'wildfire-ready-home-santa-cruz-ignition-resistant',
    title: 'Wildfire-Ready Home Prep: Ignition-Resistant Upgrades to Plan Before Fire Season',
    excerpt: 'Santa Cruz County sits in a high fire-hazard zone. The upgrades that actually move the needle — and how to sequence them with a remodel.',
    body: `<p>Most of Santa Cruz County — including parts of the city, the entire San Lorenzo Valley, and the hills above Soquel and Aptos — is mapped as either High or Very High Fire Hazard Severity Zone. Insurance companies know this, and after the CZU fires they got a lot stricter about what they'll cover.</p>

<p>Here are the upgrades that actually reduce ignition risk. If you're already planning a remodel or addition, this is the cheapest moment to fold them in.</p>

<h2>Roof: Class A is the floor</h2>
<p>Composition shingle, metal standing-seam, or tile are all Class A when installed correctly. Wood shake is effectively uninsurable in our hills now. If your roof is older than 20 years and your carrier is hinting at non-renewal, this is probably the reason.</p>

<h2>Vents: ember-resistant, not just screened</h2>
<p>Embers fly miles ahead of a fire front. They don't burn the house down — they drift into attic vents and ignite the insulation from inside. WUI-rated vents (Vulcan, Brandguard, and similar) have a thermal shutter that closes when temperature spikes. They're code for new construction in the WUI, and retrofitting them into an existing house is a half-day job.</p>

<h2>Eaves and soffits: boxed and sealed</h2>
<p>Open-eave construction — where you can see the rafter tails from below — traps heat and embers. Boxing the eaves with fiber-cement or stucco closes that vulnerability. If your house has tongue-and-groove open eaves (common in mid-century homes), this is worth doing.</p>

<h2>Siding: fiber-cement is the quiet winner</h2>
<p>James Hardie fiber-cement looks like painted wood, holds up to coastal weather, and has a Class A fire rating. We use it on almost every siding replacement in the hills. Metal siding works too, but the aesthetic rarely fits a residential neighborhood.</p>

<h2>Windows: dual-pane tempered, at minimum</h2>
<p>Single-pane windows crack from the heat before a fire arrives. The glass fails, and the fire has an open door into the house. Dual-pane with one tempered layer is far more resistant and is standard on any new window you'd buy today.</p>

<h2>Decks: noncombustible or composite</h2>
<p>A wood deck attached to the house is one of the most common points of fire entry — embers land on the deck, ignite the wood, and climb the siding. Composite decking (Trex, TimberTech) or a poured concrete/tile patio eliminates that vector.</p>

<h2>Defensible space: the free upgrade</h2>
<p>Zone 0 is the 5 feet closest to your house. Nothing flammable in that zone: no bark mulch, no juniper, no firewood stacks, no wood fencing attached to the siding. Zone 0 is now code in California's highest-risk areas. Even if it isn't required on your parcel, your insurance adjuster will check it.</p>

<h2>The pragmatic order</h2>
<p>If you're doing everything on a budget, prioritize in this order: vents → defensible space → roof (at its next replacement) → windows (at next upgrade) → siding (when it's due anyway).</p>

<p>If you've gotten a non-renewal letter or are seeing your premium spike, <a href="/#contact">let's talk</a> — we can often package these upgrades into a single permitted project and help you document the changes for your carrier.</p>`,
  },

  // ------------------------------------------------------------- Jun 1
  {
    slug: 'summer-kitchen-remodel-timing-santa-cruz',
    title: 'Summer Kitchen Remodel Timing: Why a June Start Beats an August Start',
    excerpt: 'Kitchen remodels take 8–12 weeks. The difference between starting in June vs. August is whether you cook Thanksgiving in your new kitchen or a rental.',
    body: `<p>Every year we get the same call in late August: "We want to be in our new kitchen by Thanksgiving — is that doable?" Sometimes yes. Often no. Here's the math.</p>

<h2>The real timeline</h2>
<p>A mid-range Santa Cruz kitchen remodel runs 8 to 12 weeks of active construction, assuming no structural changes and no permit drama. Add 2–4 weeks of pre-construction — design finalization, cabinet ordering, permit issuance, appliance arrival. Total: 10 to 16 weeks from contract signature to cooking.</p>

<p>Most cabinet lines are 6 to 8 weeks out right now. Custom walnut or painted shaker fronts can push 10 to 12. If you order on June 1, cabinets arrive mid-July. Demo starts the week they arrive. That puts completion somewhere between late September and late October.</p>

<p>If you order on August 1, cabinets arrive mid-September. Completion slides to November or December. And every other project in Santa Cruz is on the same curve, so your sub-trades are booked three deep.</p>

<h2>What actually slows things down</h2>
<ul>
  <li><strong>Cabinet backorders.</strong> One discontinued door style or a cabinet damaged in shipping resets the install date by weeks.</li>
  <li><strong>Counter templating.</strong> Most fabricators are 2–3 weeks out from template to install. Templating can only happen after cabinets are set.</li>
  <li><strong>Permit corrections.</strong> Santa Cruz City averages 4–6 weeks for a kitchen plan check; Santa Cruz County is 6–10. Corrections add a round-trip each.</li>
  <li><strong>Electrical panel upgrades.</strong> If your panel is <200A, an induction range pushes you over capacity. PG&E involvement adds 4–8 weeks.</li>
</ul>

<h2>The June-start advantage</h2>
<p>Starting in June gives you slack. If cabinets show up damaged, you can still reorder and hit the holidays. If the inspector flags something during rough-in, you have time to fix it without the schedule collapsing. Subs aren't yet in full summer-chaos mode.</p>

<h2>If you're starting later</h2>
<p>You can still do a kitchen this year. You'll need to accept one of three compromises: (1) shorter cabinet lead time means picking from in-stock lines rather than custom, (2) less design iteration — decisions have to happen in one meeting rather than three, (3) November or December completion, meaning you cook the holidays somewhere else.</p>

<h2>When we'd say wait</h2>
<p>If you want layout changes (moving a wall, relocating plumbing, expanding the footprint) and you're asking in August, our honest answer is usually: start design now, permit this fall, build in January–March. Your kitchen will be done by Easter. Rushing a structural kitchen in the fall means paying premium rates to subs who are turning down other work to make your Thanksgiving.</p>

<p><a href="/#contact">Reach out</a> if you want to walk through your timeline specifically — we'll tell you honestly whether summer-start is realistic for your scope.</p>`,
  },

  // ------------------------------------------------------------- Jun 15
  {
    slug: 'adu-permits-june-2026-move-in-2027-santa-cruz',
    title: 'Start ADU Permits in June, Move In by 2027: The Real Santa Cruz Timeline',
    excerpt: 'From feasibility call to certificate of occupancy, a Santa Cruz ADU is a 12–18 month project. Here is how the timeline actually breaks down.',
    body: `<p>We get asked about ADU timelines more than any other project type. Most people underestimate it by 6 months because they only count construction. The permit phase is where the real time lives.</p>

<h2>Phase 1 — Feasibility (2–4 weeks)</h2>
<p>Before you pay for drawings, you want to know: can this lot actually support an ADU? We do a site visit, pull the parcel from the county GIS, check setbacks, easements, coastal zone status, sewer vs. septic, and verify the lot meets minimum size requirements. If you're in a coastal zone (anywhere west of Highway 1 in the city, or oceanfront county parcels), add 2 weeks for coastal development permit screening.</p>

<h2>Phase 2 — Design (6–10 weeks)</h2>
<p>Schematic design, then design development, then construction documents. For a detached ADU on a straightforward lot, 6 weeks is realistic. For attached conversions (garage → ADU) or for hill lots with soils/drainage work, expect 10.</p>

<h2>Phase 3 — Permit submittal + plan check (8–16 weeks)</h2>
<p>This is where timelines go sideways. Santa Cruz City and Santa Cruz County both have ministerial ADU review — by state law, a complete application must be approved within 60 days. That's the good news. The bad news is that "complete" is an evidence-based decision, and first submittals rarely qualify. Expect one round of corrections, which adds 3–6 weeks.</p>

<p>If you're on septic, add soils testing + septic engineer sign-off: another 4 weeks.</p>

<p>If you're in the CZU fire rebuild area or near a creek, add riparian/WUI review: another 4–8 weeks.</p>

<h2>Phase 4 — Pre-construction (2–4 weeks)</h2>
<p>After permit issuance: contractor mobilization, utility coordination, final material ordering. Don't skip this — mobilizing the day after permit issues means every supply-chain hiccup stops your framing.</p>

<h2>Phase 5 — Construction (5–8 months)</h2>
<p>For a 600 sq ft detached ADU: 5 months typical, 6 months with normal delays. For a 1,000+ sq ft unit or a hillside build: 7–9 months. Weather matters — starting framing in December in the San Lorenzo Valley means waiting out storms.</p>

<h2>Phase 6 — Final inspection + CO (2–6 weeks)</h2>
<p>Final electrical, plumbing, mechanical, and building inspections. Utility connection activation (new PG&E meter adds 4 weeks on its own). Certificate of Occupancy.</p>

<h2>The June 2026 → 2027 math</h2>
<p>If we start feasibility in June 2026:</p>
<ul>
  <li>June–July: feasibility + schematic</li>
  <li>August–October: design development + permit drawings</li>
  <li>November 2026–February 2027: plan check</li>
  <li>March 2027: permit issues, mobilize</li>
  <li>April–September 2027: construction</li>
  <li>October 2027: final inspections, CO</li>
</ul>

<p>That's the realistic path to moving in by late 2027. Every month you delay the start pushes the CO into 2028.</p>

<h2>What actually goes faster</h2>
<p>Prefab / factory-built ADUs can compress phase 5 from 6 months to 6 weeks — but phase 3 (permitting) is still the same, and factory slots book 4–6 months out. Net time savings is real but smaller than the marketing suggests.</p>

<p>If you're thinking 2027 occupancy, this month is when the design conversation starts. <a href="/services/adu-construction">Learn more about our ADU process</a> or <a href="/#contact">reach out for a feasibility call</a>.</p>`,
  },

  // ------------------------------------------------------------- Jun 29
  {
    slug: 'deck-outdoor-living-summer-santa-cruz-2026',
    title: 'Decks and Outdoor Living: What\'s Actually Worth Doing This Summer',
    excerpt: 'Santa Cruz has three months of perfect deck weather. Here are the outdoor-living upgrades that earn their keep, and the ones that look great but disappoint.',
    body: `<p>Late June through late September is the Santa Cruz outdoor-living window. The fog burns off early, evenings are warm, and the mosquitos that torment the rest of California mostly don't exist here. Worth investing in. Here's what actually pays off.</p>

<h2>Worth it: composite decking</h2>
<p>Redwood is beautiful for the first two summers. Then it silvers, splinters, and needs refinishing every 3–4 years — which is a weekend of sanding and sealing that most homeowners stop doing by year 5. Composite (Trex Transcend, TimberTech Azek) holds its color for 20+ years, doesn't splinter, and survives the damp winters. 2x the material cost, but you never sand again.</p>

<h2>Worth it: outdoor shower</h2>
<p>If you're within 15 minutes of a beach, an outdoor shower pays for itself in saved towel loads and un-sanded carpets. Plumb it hot + cold. Drain into a small gravel pit — greywater doesn't need a sewer connection for a shower used seasonally.</p>

<h2>Worth it: a real patio cover</h2>
<p>Not a pergola-with-gaps — a solid roof over at least part of the seating area. The fog rolls back in around 4pm on half the summer days, and a little shelter means you're still outside at 6pm eating dinner rather than retreating inside.</p>

<h2>Maybe: pizza oven</h2>
<p>If you already bake a lot, yes. If you're buying it to host summer parties, it gets used twice a year and becomes a planter. Budget option: a quality portable unit (Ooni, Gozney) gives you most of the experience without the $5–15k masonry project.</p>

<h2>Maybe: outdoor kitchen</h2>
<p>The honest math: an outdoor kitchen with a built-in grill, fridge, and sink runs $20–40k. If you're an entertaining household with 20+ outdoor dinners a year, it transforms how you live. If it's aspirational, the grill gets used; the fridge and sink become very expensive weather-protected boxes.</p>

<h2>Skip: permanent gas firepit</h2>
<p>Red flag tier in Santa Cruz. Insurance companies are getting unhappy with permanent gas firepits on hillside properties in fire zones. A portable propane firepit gives you the same ambiance and disappears during fire-red-flag days.</p>

<h2>Skip: synthetic turf for large areas</h2>
<p>It melts around firepits. It heats to 150°F+ in direct sun. It off-gasses. For a small dog-run area, sure. For a whole backyard, decomposed granite, California native ground cover, or gravel-with-stepping-stones ages better and doesn't become landfill in 10 years.</p>

<h2>The permit question</h2>
<p>Decks under 30 inches off grade and under 200 sq ft don't need a permit in most Santa Cruz jurisdictions. Anything bigger, or anything attached to the house, does. Don't skip this — an unpermitted attached deck becomes a disclosure headache when you sell, and attached decks that fail can become a liability issue.</p>

<p><a href="/#contact">Reach out</a> if you want to scope an outdoor-living project that'll still be earning its keep in 10 years.</p>`,
  },

  // ------------------------------------------------------------- Jul 13
  {
    slug: 'living-in-house-during-remodel-santa-cruz',
    title: 'Living in Your House During a Remodel: Strategies That Actually Work',
    excerpt: 'Relocating during a 3-month remodel costs $18k+ in Santa Cruz. Here\'s how to stay in the house without losing your mind — and when to bite the bullet and leave.',
    body: `<p>Short-term rentals in Santa Cruz run $6,000–$9,000 per month furnished. On a 12-week kitchen or bath remodel, that's $18–27k of rent on top of construction. Most of our clients want to stay put if they can. Here's what actually works.</p>

<h2>It comes down to one question</h2>
<p>Is the room you're remodeling essential daily infrastructure, or a nice-to-have? A single bath remodel in a 2-bath house: stay. A whole-home remodel with no functional kitchen for 8 weeks: go.</p>

<h2>Kitchen remodels: the 4-week rule</h2>
<p>You can usually survive a kitchen remodel in place if your no-kitchen phase is 4 weeks or less. The middle stage — demo is done, cabinets are in, but counters, plumbing, and appliances aren't — is when the kitchen is truly unusable. We sequence so that phase stays tight.</p>

<p>Make-it-work setup: microwave + toaster oven + instant pot + electric kettle in the dining room. Mini-fridge in the garage. Paper plates. Order a deep-clean for when it's done — you'll need it.</p>

<h2>Primary bath remodels: the second-bath dependency</h2>
<p>If you have a second full bath, a 4–6 week primary bath remodel is fine. If you don't, install a portable shower in the garage (sounds insane, works fine), or rent an RV and park it in the driveway for the shower-only weeks.</p>

<h2>Whole-home remodels: honest math</h2>
<p>For a down-to-studs whole-home, relocation is almost always right. The house has no drywall, no insulation in walls, no HVAC for chunks of it, and air quality is rough. Your kids can't sleep there; your pets shouldn't be there. Budget $15–35k for relocation.</p>

<h2>Dust control: it's not optional</h2>
<p>Real dust control adds 1–2% to the project cost and makes the difference between "we survived" and "we never doing this again." What it looks like: zipwall plastic barriers with zippered doors, negative-pressure HEPA scrubbers, sticky floor mats at thresholds, daily vacuuming. If your contractor isn't proposing this, ask.</p>

<h2>Noise + hours</h2>
<p>Most Santa Cruz jurisdictions allow construction 7am–7pm weekdays, 9am–5pm Saturdays, no Sunday work. In practice: framing and demo make the most noise (week 1–2), then it gets quieter. If anyone in the house works from home, either coordinate meetings around the noise schedule or plan to work elsewhere for those two weeks.</p>

<h2>Pets</h2>
<p>They'll hate it. Dogs get anxious around strange people coming and going; cats disappear under beds for weeks. If your pet is older or already anxious, doggy daycare or a friend's house for the noisy phase is kind.</p>

<h2>What surprises people</h2>
<ul>
  <li><strong>Utility shutoffs.</strong> Water off for 4 hours during rough plumbing; power off for 6 hours during panel upgrade. We'll tell you the day before.</li>
  <li><strong>Parking.</strong> The dumpster takes your driveway. The crew truck takes the street in front. Neighbor relationships matter here.</li>
  <li><strong>Decisions.</strong> Someone needs to be available within 24 hours for field decisions — "we opened the wall and found an unexpected beam, how do you want to handle it." If both owners are in heavy meetings, things stall.</li>
</ul>

<p><a href="/#contact">Reach out</a> if you want to walk through a specific project and figure out whether you can stay or should plan to go.</p>`,
  },

  // ------------------------------------------------------------- Jul 27
  {
    slug: 'marine-layer-humidity-interior-finishes-santa-cruz',
    title: 'The Marine Layer and Your Interior Finishes: What Humidity Actually Does',
    excerpt: 'Santa Cruz interiors see 70–85% humidity for months at a time. Here\'s what that does to hardwood, cabinets, drywall, and paint — and how to spec around it.',
    body: `<p>Inland California homes see 20–40% relative humidity most of the year. Santa Cruz coastal homes routinely sit at 70–85%. That single difference changes what materials work and what doesn't.</p>

<h2>Hardwood floors: species matters more than price</h2>
<p>The dimensional stability of wood depends on species. White oak, walnut, and hickory handle 70%+ humidity without cupping. Brazilian cherry, bamboo (especially carbonized), and many exotic hardwoods swell, then cup, then gap as humidity cycles seasonally.</p>

<p>If you're near the beach or in the fog belt (anywhere west of Highway 17, roughly), engineered wood outperforms solid wood. The cross-ply construction is dimensionally stable; solid hardwood moves seasonally. Engineered has caught up on thickness — 5/8" engineered with a 4mm wear layer sands and refinishes like solid.</p>

<h2>Cabinets: the particleboard-vs-plywood debate matters here</h2>
<p>Particleboard cabinet boxes (the cheap stuff in big-box lines) swell irreversibly when exposed to sustained high humidity. Once the bottom of your sink cabinet gets wet — not from a leak, just from ambient humidity plus occasional splashes — the panel expands and never contracts back. Plywood boxes handle the same conditions fine.</p>

<p>For painted cabinets in humid environments, MDF doors are actually better than wood doors (fewer joints to move). But only if the finish is factory-applied conversion varnish or catalyzed lacquer. Latex paint on MDF will check and chip within a year of coastal humidity.</p>

<h2>Drywall: spec the right kind</h2>
<p>Standard drywall in bathrooms fails. Moisture-resistant (green board) is the minimum for baths, laundries, and kitchen backsplash areas. Mold-resistant (purple board) is worth it for full bathrooms on exterior walls. For wet zones — shower walls, tub surrounds — cement board or foam-board (Schluter Kerdi) is non-negotiable.</p>

<h2>Paint: sheens for humid rooms</h2>
<p>Flat paint in a Santa Cruz bathroom is a recipe for mildew. Use eggshell minimum in bedrooms, satin in baths, semi-gloss on trim and doors. The higher the sheen, the less porous the surface, the less mildew grows. Good paint brands now have bathroom-specific formulas with mildewcides — worth the $15/gallon upcharge.</p>

<h2>Metal: galvanic corrosion is real</h2>
<p>The salt air 2 miles from the beach shortens the life of cheap metal. Door hardware, window hardware, light fixtures, range hoods — spec stainless, solid brass, or oil-rubbed bronze. Painted steel hardware rusts through from the inside in 3–5 years within a mile of the ocean.</p>

<h2>Windows: the condensation problem</h2>
<p>Dual-pane windows fog when the seal fails and the inert gas leaks out. In our humidity, that happens faster than inland. Budget vinyl windows typically fail at the seal in 15–20 years. Better-quality fiberglass or aluminum-clad wood push that to 30+.</p>

<h2>HVAC: ventilation, not just heating</h2>
<p>Adequate bathroom ventilation is non-negotiable. A 50 CFM fan from 2005 isn't enough for a modern walk-in shower. Spec 80–110 CFM, run on a humidistat (not a timer) so it runs until the room actually dries out.</p>

<p>For whole-home, ERVs (energy recovery ventilators) exchange stale humid interior air for fresh outdoor air without losing heating/cooling energy. In tight new homes they're almost mandatory. In older leaky homes they can still meaningfully improve air quality.</p>

<p><a href="/#contact">Reach out</a> if you want a walk-through on material spec for your specific location — the difference between a house 2 blocks from West Cliff and one in Scotts Valley is real.</p>`,
  },

  // ------------------------------------------------------------- Aug 10
  {
    slug: 'defensible-space-home-hardening-checklist-santa-cruz',
    title: 'Defensible Space and Home Hardening: The Santa Cruz Homeowner\'s Pre-Fire-Season Checklist',
    excerpt: 'August is when fire conditions peak. Here is the walk-the-property checklist we use, plus the structural upgrades that matter most if you have budget.',
    body: `<p>The most dangerous weeks of Santa Cruz's fire season are mid-August through late October. The CZU Lightning Complex started August 16. The Loma Fire started September 26. If you have any work left from your spring inspection, now is when it matters.</p>

<h2>Zone 0: the first five feet</h2>
<p>State law now requires Zone 0 (0–5 feet from any structure) to be "ember-resistant" in Very High Fire Hazard Severity Zones. In plain English:</p>
<ul>
  <li>No bark mulch, wood chips, or dry leaves against the foundation</li>
  <li>No wood fencing attached directly to siding (break with metal gate post)</li>
  <li>No firewood stacks under decks or against walls</li>
  <li>No juniper, rosemary, or other resinous shrubs (they're basically kindling)</li>
  <li>Gutters cleaned — dry needles in gutters catch embers instantly</li>
</ul>

<p>Replace plantings in Zone 0 with hardscape (gravel, decomposed granite, stone), bare soil, or well-watered succulents. Our preference: a 3-foot band of river rock or gravel right against the foundation.</p>

<h2>Zone 1: 5–30 feet</h2>
<ul>
  <li>Grass mowed to 4 inches or less</li>
  <li>Trees limbed up 6–10 feet from ground</li>
  <li>10-foot gap between tree crowns and the house</li>
  <li>No overhanging branches above the roof</li>
  <li>Dead/dying vegetation removed</li>
</ul>

<h2>Zone 2: 30–100 feet</h2>
<ul>
  <li>Ladder fuels removed (low shrubs under trees that let fire climb)</li>
  <li>Dead brush cleared</li>
  <li>Tree spacing widened — aim for 10 feet between crowns</li>
</ul>

<h2>Structural checklist</h2>
<ul>
  <li><strong>Attic vents:</strong> ember-resistant rated? If not, that's your highest-ROI retrofit. $200–500 per vent, half-day install.</li>
  <li><strong>Gutter guards:</strong> metal mesh (not plastic) that keeps needles out</li>
  <li><strong>Eave undersides:</strong> boxed in, or screened with 1/8" metal mesh</li>
  <li><strong>Deck framing:</strong> check for dry debris trapped between deck boards and joists</li>
  <li><strong>Under-deck and crawl-space openings:</strong> screened with 1/8" metal mesh</li>
  <li><strong>Garage door:</strong> sealed at the bottom (embers roll under)</li>
  <li><strong>Exterior-mounted propane tanks:</strong> 10 feet from house, vegetation-clear</li>
</ul>

<h2>Go-bag, evacuation prep</h2>
<ul>
  <li>Address sign visible from the road (big, reflective) — emergency vehicles need to find you fast</li>
  <li>Driveway clear for a 10-foot vehicle width, 14-foot clearance</li>
  <li>Gates can be opened without power</li>
  <li>Garden hose on every side of the house, long enough to reach anywhere on the roof</li>
</ul>

<h2>What to do if CalFire red-flags your property</h2>
<p>If CalFire or the county does an inspection and issues a notice, don't panic. They'll specify exactly what needs to change and a deadline. Most notices are 30–60 days. Comply and you're done. Ignore it and it escalates.</p>

<h2>The insurance connection</h2>
<p>Document everything with photos, before and after. Save receipts for tree work, vent upgrades, and defensible-space contractors. When your insurer does their annual review (more are doing this now), the photos help. If you've been non-renewed, documented hardening work is sometimes enough to reopen the conversation.</p>

<p>If you need help with structural fire-hardening — vents, eaves, siding, decks — <a href="/#contact">reach out</a>. We've folded this work into dozens of remodel projects over the last three years.</p>`,
  },

  // ------------------------------------------------------------- Aug 24
  {
    slug: 'home-office-guest-suite-before-school-santa-cruz',
    title: 'Home Office or Guest Suite Before School Starts: What\'s Actually Possible in 3 Weeks',
    excerpt: 'The "finish it before school starts" call comes every August. Here is what\'s realistic for a 3-week turnaround, and what needs to wait.',
    body: `<p>By late August we get calls from parents who need a home office, a guest room, or a teen retreat "before school starts." Here's the realistic scope for different timelines.</p>

<h2>2–3 weeks: cosmetic refresh of an existing room</h2>
<p>Realistic. This is: new paint, new flooring (LVP or carpet — hardwood install needs more acclimation time), new trim, updated lighting (replace fixtures; don't rewire), maybe a built-in desk or closet system. Budget $6–18k depending on room size and material choices.</p>

<p>What you need to decide this week: paint color, floor selection, lighting. Order today means install starts next week.</p>

<h2>4–6 weeks: repurposing a room (bedroom → office)</h2>
<p>Still possible. Adds: small electrical additions (new outlets for standing desk, monitor array), data drops (hardwire beats wifi for kids' remote schooling), maybe a small built-in. Permits: generally not required if you're not altering structure or adding HVAC.</p>

<h2>8–12 weeks: garage conversion to office or guest suite</h2>
<p>Not happening by September. A permitted garage conversion in Santa Cruz is an 8–16 week project from contract to finish. Start the design conversation now, build through fall, move in by Christmas.</p>

<h2>12–20 weeks: ADU-style detached office in the backyard</h2>
<p>Absolutely not possible by fall. A detached office (under 120 sq ft avoids permits in most jurisdictions; over requires full ADU permitting) takes months. If your kid is starting high school and you're going to need WFH space for 4+ years, this is the right project — just not this year.</p>

<h2>The "quick win" combos we see work</h2>
<ul>
  <li><strong>Garage corner conversion (not full conversion):</strong> insulate one bay, add a Murphy bed or fold-out desk, drop in a mini-split. Not permitted, not legal as a bedroom, but functional as an office or occasional guest space. 2–3 weeks, $8–15k.</li>
  <li><strong>Closet-to-cloffice:</strong> a walk-in closet converted to a built-in office nook with power, good lighting, and a door that closes. 1–2 weeks, $3–6k.</li>
  <li><strong>Loft bed + desk for teen bedroom:</strong> doubles the usable floor area. Built-in cabinet + loft system, 5–7 days, $4–9k.</li>
</ul>

<h2>What slows things down in August</h2>
<p>Every other family in Santa Cruz is making the same call. Trim carpenters and painters are triple-booked. Electricians who do small residential work are 2–3 weeks out. If you call us on September 5 for a September 10 start, we're probably saying "October."</p>

<h2>The honest recommendation</h2>
<p>If the timeline is tight and the need is real, scope it small. A $12k closet conversion you actually use beats a $40k garage conversion that finishes in December. If you can wait until spring, the bigger projects are better done with time.</p>

<p><a href="/#contact">Reach out</a> if you want a quick scoping call — we can usually tell you in 15 minutes whether your timeline is realistic.</p>`,
  },

  // ------------------------------------------------------------- Sep 7
  {
    slug: 'rainy-season-prep-roof-gutters-drainage-santa-cruz',
    title: 'Rainy Season Prep: Roof, Gutters, and Drainage Before the First Storm',
    excerpt: 'The first atmospheric river usually hits Santa Cruz between mid-October and early November. Here is the 2-hour walkthrough that prevents the expensive problems.',
    body: `<p>Santa Cruz's first real storm of the year lands somewhere between October 15 and November 15 most years. If you're going to fix water problems, now is the month — before the contractor schedule is full and before the damage is already done.</p>

<h2>The roof walk</h2>
<p>Don't get on a steep roof. Use binoculars from the yard, or call for a professional inspection (most roofers do a free fall inspection if you're a candidate for repair).</p>
<p>Look for:</p>
<ul>
  <li><strong>Lifted or missing shingles</strong> — especially at ridges and hips</li>
  <li><strong>Flashing gaps</strong> around chimneys, skylights, and plumbing vents</li>
  <li><strong>Granule loss in the gutters</strong> — the sandy stuff from old shingles. If gutters are full of granules, the roof is past half-life</li>
  <li><strong>Exposed nail heads</strong> — they rust and pull through shingles over time</li>
  <li><strong>Sagging ridgelines</strong> — rafter or truss movement</li>
</ul>

<h2>Gutters: clean, then test</h2>
<p>Clean them, then wait for the next rain and watch them work. Signs of problems:</p>
<ul>
  <li>Water overshooting the gutter at the low end (undersized gutter or downspout)</li>
  <li>Water behind the gutter — pulled away from the fascia</li>
  <li>Downspout that dumps against the foundation (should extend 4–6 feet)</li>
  <li>Any gutter seam dripping (should be watertight, not just water-shedding)</li>
</ul>

<p>5-inch K-style gutters are standard; if your roof is over 1,500 sq ft or you're in a heavy-rainfall area (the San Lorenzo Valley gets 50+ inches/year), 6-inch gutters handle volume better.</p>

<h2>Grading around the house</h2>
<p>Soil should slope away from the foundation at minimum 6 inches drop over the first 10 feet. In Santa Cruz, the common failure is negative slope caused by years of settled mulch and landscaping — water ends up flowing toward the house. Fix: rake away mulch, top-dress with soil, re-slope. Takes a half-day.</p>

<h2>Crawl-space vents and drainage</h2>
<p>If water pools near the foundation, it finds the crawl-space vents. A vent at grade that's below the water line becomes an open pipe into the crawl space.</p>
<p>Solutions:</p>
<ul>
  <li><strong>Window wells</strong> around at-grade vents, with drainage</li>
  <li><strong>French drain</strong> around the uphill perimeter, daylighted downhill</li>
  <li><strong>Crawl-space encapsulation</strong> — vapor barrier, sealed vents, dehumidifier. $6–15k depending on square footage, but transforms the moisture environment under the whole house</li>
</ul>

<h2>The mysterious leak tracker</h2>
<p>If you got water inside last winter and you don't know from where, this is the month to find it. Run a hose on the roof, section by section, with a helper inside watching for drips. Most "roof leaks" are actually flashing failures, clogged valleys, or wall penetrations — not the roof field itself.</p>

<h2>Sump pumps (for low crawl spaces)</h2>
<p>If you have a history of standing water in the crawl space, test your sump pump now by pouring 5 gallons of water into the pit. It should cycle on, evacuate, and shut off. If it doesn't, replace it — not in January.</p>

<h2>Decks and stair treads</h2>
<p>Winter is when deck boards warp and nails back out. A 30-minute walkthrough now, tightening any loose fasteners, catches problems before they become trip hazards in the rainy dark.</p>

<p>If anything above is out of your DIY zone, <a href="/#contact">reach out</a>. Early October is the last good window for roof repairs and drainage work before rates climb and schedules lock up.</p>`,
  },

  // ------------------------------------------------------------- Sep 21
  {
    slug: 'fall-remodeling-window-santa-cruz-contractor-sweet-spot',
    title: 'The Fall Remodeling Window: Why September–November is the Contractor Sweet Spot',
    excerpt: 'Summer is busiest, winter is slowest, fall is the quiet optimum. What you get by starting a remodel in October vs. March.',
    body: `<p>Ask any Santa Cruz contractor what their favorite start month is, and the honest answer is October. Here's why — and why that's good for clients who start then too.</p>

<h2>The summer crush</h2>
<p>June–September is peak demand. Everyone is remodeling kitchens before the holidays, building ADUs for fall move-in, adding decks before summer ends. Subs are triple-booked, lead times blow out, and small problems become big ones because there's no slack in anyone's schedule.</p>

<p>Winter is the opposite — slow, cold, hard to pour concrete or roof. Framing in the San Lorenzo Valley in January is miserable and exterior trade work slows dramatically.</p>

<h2>The October window</h2>
<p>Summer projects are wrapping up. Winter weather hasn't arrived. Subs have availability but aren't yet desperate for work. Your GC can give you their A-team crew rather than whoever was free.</p>

<h2>What this means for pricing</h2>
<p>Honest answer: not as much as you'd hope. Materials pricing is macro — plywood, cabinets, and steel don't discount for your start month. Labor is where seasonal variation shows up, and it's a 5–10% swing, not a 30% one.</p>

<p>What you actually get: more attention, fewer compromises. Your contractor is bidding your project to win it, not to squeeze it between three others.</p>

<h2>Interior vs. exterior scope</h2>
<p>Fall is ideal for interior work — kitchens, baths, flooring, paint, built-ins. The weather doesn't matter for anything indoor-dominant. Your crew can work efficiently regardless of rain, and finishes cure at reliable interior temperatures.</p>

<p>Exterior work (siding, roofing, additions, ADUs, decks) wants to finish the envelope (roof + windows + siding) before the November rains. A September 15 start on an addition gets you dried-in by mid-November; a November 15 start leaves framing exposed through the winter.</p>

<h2>Permit timing works in your favor</h2>
<p>Santa Cruz's building departments are less swamped in Q4. A permit submission in mid-September often comes back in 4 weeks rather than the 8 weeks you'd see in spring. Cabinet lead times also shrink — fewer people ordering at once.</p>

<h2>Thanksgiving and Christmas disruptions</h2>
<p>We plan around them. Most projects go dark Thanksgiving week and the last 10 days of December. On a 12-week project, that's 3 weeks of downtime you need to factor in. A good contractor's schedule already has this baked in; a bad one's schedule magically forgets.</p>

<h2>When fall is wrong</h2>
<ul>
  <li><strong>New construction or major additions.</strong> If you can't dry in before November 1, wait for spring. Framing a roof in an atmospheric river is brutal on the crew and bad for the wood.</li>
  <li><strong>Outdoor-living projects.</strong> Start these in spring so you enjoy them through the summer they finish.</li>
  <li><strong>Driveways, site work, foundations.</strong> Concrete and grading want dry conditions. Fall works if you get started by early October; later is a gamble.</li>
</ul>

<h2>The planning call</h2>
<p>If you're thinking about a 2026 remodel, the conversation starts now. Design + permits + lead-time sourcing all takes 2–4 months, which means October starts typically get contracted in July–August. A September conversation points toward a January–February start — which is fine, and sometimes better for specific scopes.</p>

<p><a href="/#contact">Reach out</a> to walk through your scope and timing. We'll tell you honestly whether fall, winter, or spring fits your project best.</p>`,
  },

  // ------------------------------------------------------------- Oct 5
  {
    slug: 'bathroom-remodel-humidity-ventilation-santa-cruz',
    title: 'Bathroom Remodels in Santa Cruz: The Humidity and Ventilation Deep-Dive',
    excerpt: 'Santa Cruz bathrooms get hit by marine humidity outside and shower steam inside. Here is how to build one that stays mildew-free for 20 years.',
    body: `<p>The single most common bathroom complaint we hear from Santa Cruz homeowners: "We remodeled five years ago and there's already mildew in the grout / peeling paint / soft drywall." Nine times out of ten, the root cause is ventilation — specified too small, installed wrong, or not run long enough.</p>

<h2>The ventilation math</h2>
<p>Code minimum for a bathroom fan is 50 CFM (cubic feet per minute). For a modern Santa Cruz bath with a walk-in shower, 50 CFM isn't enough. Real numbers:</p>
<ul>
  <li><strong>Powder room:</strong> 50–70 CFM</li>
  <li><strong>Standard full bath:</strong> 80–100 CFM</li>
  <li><strong>Primary bath with large walk-in shower:</strong> 110–150 CFM, ideally with a second inlet over the shower itself</li>
  <li><strong>Steam shower:</strong> dedicated exhaust + condensate drain, engineered</li>
</ul>

<h2>The 20-minute rule</h2>
<p>Your fan needs to run for at least 20 minutes after the shower ends — not just while you're in there. Options:</p>
<ul>
  <li><strong>Humidistat switch</strong> (Panasonic WhisperControl, Broan SensAire): runs fan until humidity drops below setpoint. Hands-off.</li>
  <li><strong>Timer switch</strong>: press once, runs for preset duration. Works if everyone in the house remembers to press it.</li>
  <li><strong>Motion sensor</strong>: turns fan on when room is used, runs for delay after. Fine for frequently-used baths.</li>
</ul>

<p>Standard wall switch that turns off with the light? Wrong answer in a humid climate. People turn off the light when they leave; steam is still in the room; drywall pays the price.</p>

<h2>Duct the exhaust out</h2>
<p>Fan exhaust must vent to the outside, not into the attic. This used to be a common shortcut; it's now a code violation everywhere, and it creates attic-condensation problems that destroy insulation and invite mold. Short, straight, insulated duct run, exhausting through the soffit or roof with a proper hooded cap.</p>

<h2>The wet zone</h2>
<p>Inside the shower walls, drywall — even moisture-resistant drywall — is not acceptable. What works:</p>
<ul>
  <li><strong>Cement board (HardieBacker, Durock)</strong> with a waterproofing membrane painted over (RedGard, Hydro Ban)</li>
  <li><strong>Schluter Kerdi</strong> — an orange membrane over any substrate. Our preference; waterproofs reliably and quickly</li>
  <li><strong>Wedi or Kerdi foam board</strong> — pre-waterproofed, fast to install</li>
</ul>

<p>All of these are multiples more expensive than just installing drywall and tiling over it. Worth every dollar. A wall-floor intersection failure becomes a studs-out demolition to fix.</p>

<h2>Tile layout choices that matter</h2>
<ul>
  <li><strong>Linear drain at a threshold-free shower</strong>: single-plane slope, no curb. Accessible for aging-in-place, and dramatically easier to keep clean</li>
  <li><strong>Large-format tile (12x24+)</strong> uses fewer grout lines = fewer places for mildew</li>
  <li><strong>Epoxy grout</strong>: harder to install, but doesn't hold water and doesn't need sealing annually. In humid climates, the upcharge is justified</li>
</ul>

<h2>Paint and trim</h2>
<p>Satin or semi-gloss on walls, not flat. Bathroom-specific paint (Benjamin Moore Aura Bath & Spa, Sherwin-Williams Emerald) has mildewcides and handles repeat wet/dry cycles. Trim: oil-based primer + two coats semi-gloss, or a pre-primed MDF trim product.</p>

<h2>Heated floors</h2>
<p>Marketing says luxury; practical value says dehumidifier. A heated floor (electric mat under tile) warms the room enough to dry faster after showers. In a north-facing Santa Cruz bath that never gets sun, it's the difference between a bath that's always a little damp and one that's comfortably dry.</p>

<p><a href="/services/bathroom-remodels">Learn more about our bath process</a> or <a href="/#contact">reach out for a scoping conversation</a>.</p>`,
  },

  // ------------------------------------------------------------- Oct 19
  {
    slug: 'insurance-remodeling-santa-cruz-carrier-questions',
    title: 'Insurance and Remodeling: What Your Carrier Wants to Know Before You Start',
    excerpt: 'Homeowner insurance in Santa Cruz has gotten strict fast. Here is how to remodel without triggering a non-renewal — and how to use the remodel to improve your coverage.',
    body: `<p>The California homeowner insurance market has been rough. After CZU, major carriers stopped writing new policies in Santa Cruz County; some stopped renewing existing ones. If you're insured and you're planning a remodel, the moves you make now affect whether you stay insured.</p>

<p>Disclaimer: we're contractors, not insurance brokers. Anything below is what we've seen work with our clients — run specifics past your carrier or broker.</p>

<h2>Call your carrier before you start</h2>
<p>Seriously. The most common way homeowners mess this up: they start a $200k remodel, get a surprise inspection, and find out their coverage limit is $140k because they haven't updated since 2015. The remodel pushes replacement cost up; coverage needs to follow.</p>

<p>Ask three questions:</p>
<ol>
  <li>Do I need a "vacant property" or "renovation" rider during construction? (Yes, usually, if you move out.)</li>
  <li>Will this remodel trigger a re-inspection? (Often yes if scope is &gt; $50k.)</li>
  <li>Will the replacement-cost coverage adjust automatically when it completes?</li>
</ol>

<h2>Things that help with insurability</h2>
<ul>
  <li><strong>Roof replacement</strong> — a new Class A roof is often the single biggest insurability lever. Some carriers won't renew houses with roofs over 25 years old</li>
  <li><strong>Electrical panel upgrade</strong> — old Federal Pacific or Zinsco panels are an automatic flag. Upgrading to a modern 200A panel resolves it</li>
  <li><strong>Ignition-resistant vents</strong>, <strong>ember-resistant eaves</strong>, <strong>dual-pane tempered windows</strong> — all help, especially in Very High Fire Hazard Severity Zones</li>
  <li><strong>Seismic retrofit</strong> — earthquake bracing (cripple walls, anchor bolts) helps with some carriers, matters more for earthquake-specific coverage</li>
  <li><strong>Plumbing repipe (PEX or copper, no galvanized/polybutylene)</strong> — reduces water-damage risk claims</li>
</ul>

<h2>Things that hurt</h2>
<ul>
  <li><strong>Any unpermitted work surfaced during inspection</strong> — can trigger non-renewal on its own</li>
  <li><strong>Knob-and-tube or aluminum branch wiring left in place</strong> — some carriers explicitly exclude this</li>
  <li><strong>Asbestos siding</strong> that gets disturbed without proper abatement — disclosure issue later</li>
  <li><strong>Wood shake roof left in place on a hill-district house</strong></li>
  <li><strong>New swimming pool without updated fencing</strong></li>
</ul>

<h2>The CLUE report</h2>
<p>The CLUE report (Comprehensive Loss Underwriting Exchange) is the credit-report equivalent for homeowner insurance. Claims in the last 7 years show up here. If you're between carriers or shopping, pull your CLUE report first — it's free. Unresolved water-damage claims in particular hurt.</p>

<h2>Documentation: save everything</h2>
<p>During your remodel, save:</p>
<ul>
  <li>All permits (with inspection cards)</li>
  <li>Before and after photos</li>
  <li>Receipts for major systems (roof, HVAC, electrical, plumbing)</li>
  <li>Product specs (window U-factors, roofing class, etc.)</li>
</ul>

<p>When coverage comes up for renewal, this packet is what makes a conversation productive rather than an argument. "Here's everything we did and here's the documentation" is a much better position than "we remodeled, trust us."</p>

<h2>If you've already been non-renewed</h2>
<p>Structural hardening work, properly permitted and documented, is sometimes enough to get a new carrier or re-engage your old one. The California FAIR Plan is the backstop if nothing else works — expensive and bare-bones, but always available.</p>

<p><a href="/#contact">Reach out</a> if you want to fold insurability-driven upgrades into a remodel we're already scoping — it's usually cheaper than a separate project later.</p>`,
  },

  // ------------------------------------------------------------- Nov 2
  {
    slug: 'holiday-ready-kitchen-projects-thanksgiving-santa-cruz',
    title: 'Holiday-Ready Kitchen: 6 Projects You Can Finish by Thanksgiving (and 2 You Can\'t)',
    excerpt: 'Three weeks to Thanksgiving. Here is what\'s still realistic to pull off, and what has to wait until January.',
    body: `<p>It's early November. You host Thanksgiving in three weeks. The kitchen isn't where you want it to be. What can actually happen?</p>

<h2>Yes, before Thanksgiving</h2>

<h3>1. Cabinet refresh (paint or reface)</h3>
<p>Repainting existing cabinets in-place: 5–7 days including dry time. Refacing (new doors + drawer fronts, existing boxes): 2 weeks from order to install. Both transform the kitchen at 10–20% the cost of full replacement.</p>

<h3>2. New lighting</h3>
<p>Replacing fixtures (pendants over island, under-cabinet LED strips, dimmer switches) is a 1–2 day electrician job. Biggest visual impact per dollar of any kitchen project.</p>

<h3>3. Backsplash replacement</h3>
<p>3–5 days start to finish. No plumbing, no electrical, no permits. Tile selection needs to happen this week if install is in two weeks.</p>

<h3>4. Counter replacement (stock quartz, no sink relocation)</h3>
<p>Templating week 1, install week 2–3. Only works if you're keeping existing cabinets and not moving the sink. Stock-slab quartz in neutral colors (Silestone Lagoon, Caesarstone White Attica) has 1-week fabrication times right now.</p>

<h3>5. New hardware + faucet</h3>
<p>A weekend of work. $400 of hardware on $200 of labor transforms the perceived age of a kitchen.</p>

<h3>6. Deep declutter + paint</h3>
<p>Not construction, but the highest-ROI weekend you'll have. Empty every cabinet, clean, paint the walls, put back only what you use. Host Thanksgiving with clear counters and it looks like you remodeled.</p>

<h2>No, not before Thanksgiving</h2>

<h3>Full cabinet replacement</h3>
<p>Even stock cabinets are 4–6 weeks lead time. Custom is 10–14. An order placed today arrives in mid-December at the earliest. Counters behind that (need cabinets set to template) push completion to late December or January.</p>

<h3>Any layout change</h3>
<p>Moving a wall, relocating sink or range, adding a pantry, expanding the footprint — all involve permits, plumbing, electrical, and multi-week coordination. Start now, finish February.</p>

<h2>The Thanksgiving host's pragmatic path</h2>
<p>If you're hosting 20 people on November 27, these are your choices:</p>
<ul>
  <li><strong>Do nothing construction-related between now and Thanksgiving.</strong> Book a pre-holiday deep-clean instead. Real remodels are a disaster to host through.</li>
  <li><strong>Book cabinet painters or a backsplash installer to finish 10 days before Thanksgiving</strong> — gives buffer for the inevitable 2-day slip</li>
  <li><strong>Plan the real remodel for January</strong> — permit timelines are faster, subs have availability, and you'll enjoy the finished kitchen for the rest of the year</li>
</ul>

<h2>If you want to go for Christmas instead</h2>
<p>Christmas hosting gives you two more usable weeks — still tight, but meaningful. An order placed this week for stock cabinets installed December 5, counters templated the 8th, installed the 15th, final details December 20 is realistic if every decision is made on day one and nothing slips.</p>

<p><a href="/#contact">Reach out</a> if you want a fast scoping call on what's realistic. We'll be honest if the answer is "January" — rushing a kitchen into a holiday rarely ends well for anyone.</p>`,
  },

  // ------------------------------------------------------------- Nov 16
  {
    slug: 'year-end-contractor-planning-2027-pricing-santa-cruz',
    title: 'Year-End Contractor Planning: Locking in 2027 Pricing Before Material Increases Hit',
    excerpt: 'Most material suppliers push prices in January. Signing a contract in November typically locks you into 2026 pricing for a project that builds in 2027.',
    body: `<p>By mid-November every year, suppliers start telegraphing January price increases. Cabinet manufacturers announce them 60–90 days out. Lumber, steel, and windows are less predictable but usually follow. If you're planning a 2027 project, November and December are the contract-signing window that matters.</p>

<h2>How material pricing actually locks</h2>
<p>When you sign a construction contract, your GC typically quotes using current supplier prices plus a contingency. Some contractors hold prices; others pass increases through. Ask yours directly — the answer tells you a lot.</p>

<p>For cabinets specifically: most manufacturers honor quoted pricing for 90 days. A contract signed November 15 with cabinets ordered through the GC's supplier locks pricing through mid-February. That covers you through the annual January bump.</p>

<h2>Typical January increases</h2>
<ul>
  <li><strong>Cabinets:</strong> 3–8% most years, 10–15% in supply-stressed years</li>
  <li><strong>Appliances:</strong> 4–8% — and they typically skip the sales cycle in January</li>
  <li><strong>Lumber:</strong> volatile; might go up, might not</li>
  <li><strong>Windows:</strong> 5–10% typical</li>
  <li><strong>Tile and stone:</strong> 3–6%, but international tariffs can spike European tile suddenly</li>
  <li><strong>Labor:</strong> 4–8% typical — union-rate adjustments hit in spring</li>
</ul>

<p>On a $250k remodel, a blanket 5% increase is $12,500. That's not trivial.</p>

<h2>What a November contract looks like</h2>
<p>For a 2027 build:</p>
<ol>
  <li>November–December 2026: design finalization, specification, contract</li>
  <li>December–January: permit submittal</li>
  <li>January–March: plan check (corrections, approval)</li>
  <li>March–April: mobilization, cabinet ordering, material staging</li>
  <li>Spring–summer 2027: construction</li>
</ol>

<p>Cabinet deposit typically happens at contract or shortly after. That deposit is what locks pricing — not the verbal quote.</p>

<h2>Design-build vs. design-bid-build</h2>
<p>If you're not working with a design-build firm, the timeline is trickier. You need finished design drawings before a GC can price accurately, and designers are 4–8 weeks out in most of Santa Cruz. If you're starting the designer conversation in December, you're realistically contracting with a GC in February, which is past the price-lock window.</p>

<p>Design-build firms (our model) can quote accurately off schematic drawings because we're pricing our own work. That compresses the timeline from idea to contract to 4–6 weeks.</p>

<h2>What about permits?</h2>
<p>Permit fees in Santa Cruz City and County are reset January 1 most years. They're small compared to materials — typically 1–2% of project cost — but if you're tight, early-submittal is modestly cheaper.</p>

<h2>When to wait</h2>
<ul>
  <li>If your project includes custom cabinets or architectural millwork, you need finalized design before anyone can quote, and rushing that is worse than absorbing a 5% price increase</li>
  <li>If you haven't decided on major scope decisions — kitchen layout, addition size, finish level — a rushed November contract gets expensive through change orders</li>
  <li>If you're in the coastal zone and need CDP review, add 3–6 months to any timeline anyway</li>
</ul>

<h2>The honest version</h2>
<p>A 5% material price lock is real money, but it's not the most important thing. A well-designed project with a contractor you trust, started in March, finishes better than a rushed project signed in November just to lock pricing. Use the end-of-year deadline as a forcing function for decisions, not as a reason to skip good design.</p>

<p><a href="/#contact">Reach out</a> if you want to scope a 2027 project — we can usually tell you in one conversation whether a November contract is realistic or whether a spring start is actually your better option.</p>`,
  },

  // ------------------------------------------------------------- Nov 30
  {
    slug: 'prop-13-remodeling-santa-cruz-reassessment-triggers',
    title: 'Prop 13 and Remodeling in Santa Cruz: What Triggers Reassessment (and What Doesn\'t)',
    excerpt: 'Santa Cruz homeowners with long-held Prop 13 basis sometimes panic about remodels triggering reassessment. Here is the actual rule.',
    body: `<p>Prop 13 caps property-tax increases on existing assessments at 2% per year. When you remodel, the concern is always: will this trigger reassessment, and does my tax bill jump from $4,000 to $18,000?</p>

<p>Disclaimer: this is general information, not tax advice. Every situation has nuances; run yours past your county assessor or a property-tax attorney before a major decision.</p>

<h2>The core rule</h2>
<p>Remodeling does NOT trigger a full reassessment of your property. Only the NEW construction value gets added to your existing assessed value. Your existing Prop 13 basis stays intact.</p>

<p>Example: a home assessed at $400,000 with a current tax of $4,800/year. You add a $200,000 ADU. The county assesses the ADU at market value and adds it to your existing basis. New assessment: $600,000. New tax: roughly $7,200 ($4,800 on the existing + $2,400 on the $200k addition). The 1965 purchase basis is not disturbed.</p>

<h2>What counts as "new construction" (reassessable)</h2>
<ul>
  <li>Additions that add square footage (bedrooms, bathrooms, family rooms)</li>
  <li>ADUs — but often at a reduced assessment (ADU specifically qualifies for the state's ADU exemption that values them at construction cost, not market comps, in many cases)</li>
  <li>Swimming pools, permanent decks, and outbuildings</li>
  <li>Major utility additions (new HVAC system, solar)</li>
  <li>Conversion of non-living space to living space (garage → ADU, basement → bedroom)</li>
</ul>

<h2>What does NOT trigger reassessment</h2>
<ul>
  <li><strong>Repair and maintenance:</strong> roof replacement, repainting, repiping, rewiring — even extensive work — is maintenance, not new construction</li>
  <li><strong>Like-for-like replacement:</strong> replacing a kitchen, bathroom, flooring, or windows within the existing footprint</li>
  <li><strong>Seismic retrofitting</strong> — specifically exempt by Prop 13</li>
  <li><strong>Fire, flood, or earthquake reconstruction</strong> — if you're rebuilding what was there, typically not reassessed</li>
  <li><strong>Solar panels</strong> — specifically exempt until 2027 under SB 871</li>
  <li><strong>Accessibility improvements</strong> for disabled residents — Section 74.6 exemption</li>
</ul>

<h2>The gray area</h2>
<p>"Substantially equivalent to new" is the test the assessor uses. A full gut remodel that removes all walls, replaces all systems, and creates what's effectively a new home can be treated as new construction even if the footprint is identical. This is rare but worth knowing about for extreme renovations.</p>

<p>Signs a remodel might cross into "substantially equivalent":</p>
<ul>
  <li>Removed all interior walls and created a completely new floor plan</li>
  <li>Replaced all major systems (electrical, plumbing, HVAC) completely</li>
  <li>Stripped to studs throughout</li>
  <li>Added significant square footage as part of the work</li>
</ul>

<p>Our experience: the assessor visits, compares before and after, and makes a judgment call. Good documentation (showing what was repair vs. new) helps.</p>

<h2>ADUs specifically</h2>
<p>California law now provides some protection for ADUs. The primary property's assessment doesn't change; only the ADU is added. Many counties (Santa Cruz included) assess ADUs at construction cost rather than market value in the first year. The annual 2% cap applies after.</p>

<h2>The permit connection</h2>
<p>The county finds out about your remodel through the permit system. Permits trigger automatic notification to the assessor. Unpermitted work isn't "invisible" — it eventually surfaces at sale or refinance, and then the reassessment is retroactive with penalties. Permit your work. Pay the taxes on what you built. Keep your Prop 13 basis intact.</p>

<h2>Before/after documentation</h2>
<p>Photograph everything before demolition. Save permits and inspection reports. When the assessor's field inspector visits (they do, for additions), you want to show: this was existing, we maintained/updated it; this part is the new square footage. That distinction is what drives the assessment.</p>

<p><a href="/#contact">Reach out</a> if you're weighing a remodel and want to talk through what's in scope vs. out. We'll coordinate with your tax advisor as needed.</p>`,
  },

  // ------------------------------------------------------------- Dec 14
  {
    slug: 'winter-inspections-coastal-storms-santa-cruz',
    title: 'Winter Inspections: What Coastal Storms Reveal About Your Home\'s Envelope',
    excerpt: 'The storms tell you things a summer inspection never will. What to check during and after an atmospheric river.',
    body: `<p>Santa Cruz's atmospheric rivers are the most honest inspector you'll ever hire. Every weak spot in your building envelope shows itself under 4 inches of horizontal rain. If you walk the house during and after a major storm, you'll find problems in 20 minutes that would take a paid inspector a full day.</p>

<h2>During the storm</h2>
<p>Put on boots and a jacket and walk slowly.</p>

<h3>Outside</h3>
<ul>
  <li><strong>Gutters overflowing?</strong> Either clogged or undersized for the roof area.</li>
  <li><strong>Downspouts puddling at the foundation?</strong> Extenders got kicked aside or were never long enough.</li>
  <li><strong>Water running against siding?</strong> Dripline failure — gutter is pulled away from fascia or missing a seam.</li>
  <li><strong>Roof valleys carrying visible debris?</strong> Not draining fast enough. Either clogged valley or undersized flashing.</li>
  <li><strong>Ponding on flat sections of roof?</strong> Slope or drain problem. Will fail eventually.</li>
  <li><strong>Water coming out of unexpected places</strong> (midway down a wall, at the edge of a window) — that's siding or flashing letting water behind the finish surface.</li>
</ul>

<h3>Inside, during the storm</h3>
<ul>
  <li><strong>Damp spots on ceilings</strong> — tells you exactly where a roof leak is landing</li>
  <li><strong>Windows weeping at the base</strong> — failed glazing or sill seal</li>
  <li><strong>Cold drafts</strong> — air infiltration at outlets, switch plates, recessed lights. These are also where water vapor leaves your house; in winter it condenses in wall cavities</li>
  <li><strong>Unusual humidity spike</strong> in a specific room — check for leaks before assuming it's just shower moisture</li>
</ul>

<h3>In the crawl space and attic</h3>
<ul>
  <li><strong>Pooling water</strong> in crawl space — drainage failure</li>
  <li><strong>Wet vapor barrier</strong> — either from below (groundwater) or above (plumbing leak during pressure use, or leaks from drain lines)</li>
  <li><strong>Light in the attic from outside</strong> during daytime storms — roof penetrations letting light in are letting water in too</li>
  <li><strong>Discolored insulation</strong> — historical leaks showing where the water ran</li>
</ul>

<h2>The day after</h2>
<p>Walk again. Things to look for that only show up after the water drains away:</p>
<ul>
  <li><strong>Sediment or leaf debris trails on hardscape</strong> — shows you where runoff actually flows (not always where you'd expect)</li>
  <li><strong>Bubbling paint</strong> on exterior trim, especially at horizontal surfaces (window sills, door headers)</li>
  <li><strong>Swollen door thresholds</strong> — water got to the door-to-foundation transition</li>
  <li><strong>Mulch or soil carried away</strong> from beds — erosion pattern tells you where to regrade</li>
  <li><strong>New moss growth</strong> on north-side siding — shade plus sustained moisture</li>
</ul>

<h2>Storm-specific vs. chronic</h2>
<p>A single storm that drops 6 inches in 12 hours will overwhelm any system. Chronic problems show up in 1-inch events. If you got water in the crawl space during an atmospheric river, don't panic — that's the storm of the decade. If you got water in a typical 1-inch rain, that's a design problem that needs fixing.</p>

<h2>Documentation</h2>
<p>Take photos. Date them. Save them. Even if you don't act immediately, the before/after documentation next year helps you prioritize and helps your contractor quote accurately without guessing.</p>

<h2>What to act on this winter vs. wait</h2>
<p><strong>Act now:</strong> active roof leaks, gutter failures dumping against foundations, crawl-space flooding.</p>
<p><strong>Can wait until spring:</strong> siding refresh, exterior paint, drainage regrading, deck repairs, defensible-space replanting.</p>

<p><a href="/#contact">Reach out</a> if you observed something during this winter's storms that's worth addressing. Winter is slow for us, which is good for you — we have attention for the diagnostic work that fast-paced summer crews skip past.</p>`,
  },

  // ------------------------------------------------------------- Dec 28
  {
    slug: 'planning-2027-remodel-santa-cruz-month-by-month-timeline',
    title: 'Planning a 2027 Remodel: The Santa Cruz Contractor Timeline, Month by Month',
    excerpt: 'If 2027 is the year you finally do the remodel, here is the honest month-by-month plan — what to do in January, who to call in March, when to stop adding scope.',
    body: `<p>End of December is when a lot of Santa Cruz homeowners make the "this year, for real" decision. Here's what the next 12 months look like if you're serious.</p>

<h2>January — define scope</h2>
<p>Not design yet. Just: what problem are you solving, and what's your ceiling on cost and disruption? Walk the house with a notepad. Talk with your partner until you have the same picture. The number one cause of remodel grief is unaligned expectations between co-decision-makers.</p>

<p>Write down: must-haves (non-negotiable), wants (would be nice), skips (explicitly not this project). This document is gold later when you're making tradeoffs.</p>

<p><strong>Don't hire anyone yet.</strong> The pre-design clarity comes from you, not from a designer trying to sell you something.</p>

<h2>February — shortlist contractors and/or designers</h2>
<p>If your project is small/medium and straightforward (kitchen, bath, deck): shortlist 2–3 design-build general contractors. If it's complex (addition, ADU, whole-home), you'll need a licensed designer or architect in addition to a GC.</p>

<p>What to ask:</p>
<ul>
  <li>CSLB license status (<a href="https://www.cslb.ca.gov/OnlineServices/CheckLicenseII/CheckLicense.aspx">cslb.ca.gov</a>)</li>
  <li>Active workers' comp and general liability insurance</li>
  <li>References from projects in your scope range, completed within 2 years</li>
  <li>Typical project timeline for your scope size</li>
  <li>Whether they're taking on 2027 projects (most are, but capacity varies)</li>
</ul>

<h2>March — initial design conversations</h2>
<p>First meetings. Walk the space, talk through goals, get a rough budget. At this stage, any professional who gives you a precise number is bluffing — expect a range. $150k–220k is honest; $187k is theater.</p>

<p>Get a design contract (if going that path) or a preliminary contract for design-build.</p>

<h2>April — design development</h2>
<p>Schematic drawings. Material selections starting. Appliance picks. Cabinet style decisions. This is also when you should be getting a realistic construction-cost estimate, which is the moment most clients panic — costs are always higher than the Instagram version suggests. Work through it.</p>

<p>If scope is too expensive, this is when to cut, not after permits are paid for.</p>

<h2>May — permit submittal</h2>
<p>Final drawings, signed contract with GC, permit application to the city or county. Kitchen/bath permits are 4–8 weeks in plan check. Additions are 8–16. ADUs are 8–12 for ministerial review.</p>

<p>If you're in the coastal zone, add 2–4 months for Coastal Development Permit review.</p>

<h2>June — corrections, lead-time ordering</h2>
<p>Plan check usually comes back with corrections. Your designer handles those. Meanwhile, long-lead items (cabinets, windows, specialty tile) get ordered against the permit-pending timeline. Deposits paid.</p>

<h2>July — permit issuance, pre-construction</h2>
<p>Permits issue. GC schedules sub-trades. Materials start arriving. Final walkthrough to confirm the drawings still match your expectations (they usually do; sometimes people change their minds when it gets real).</p>

<h2>August–October — construction</h2>
<p>Demo, framing, systems rough-in, inspections, insulation, drywall, finishes. Somewhere in this window you'll have an "I hate this, we should have moved" week. Everyone does. It passes.</p>

<p>Weekly progress meetings with your GC. Daily site photos. Decisions within 24 hours when asked.</p>

<h2>November — punch list, final inspection</h2>
<p>Final inspections. Punch list walkthrough. Warranty paperwork. Final payment (minus retention if that's how your contract is structured). Certificate of Occupancy or final building sign-off.</p>

<h2>December — holidays in the new space</h2>
<p>Host the holidays. Find the 3 things that bug you and haven't been resolved. Send a punch-list addendum in January when everyone is back from break.</p>

<h2>What kills this timeline</h2>
<ul>
  <li><strong>Scope creep after contracting.</strong> Change orders during construction cost 1.5–3× what the same thing would have cost in design phase</li>
  <li><strong>Slow decisions.</strong> "We can't decide on tile" cascades into delayed delivery, delayed install, delayed inspection, delayed handoff</li>
  <li><strong>Surprise conditions.</strong> Opening a wall and finding old knob-and-tube, or digging a foundation and hitting rock. Build 10% contingency into your budget</li>
  <li><strong>Permit delays.</strong> Out of your control; plan for the slow end of the range</li>
</ul>

<h2>One last piece of honest advice</h2>
<p>Don't start in October aiming for Thanksgiving. Don't start in April aiming for July 4. The tighter the deadline, the more expensive the work and the more compromises you make. A 2027 remodel planned calmly through 2026 finishes better than a 2026 remodel squeezed into six months.</p>

<p>Happy New Year. <a href="/#contact">Reach out</a> when you're ready to start the conversation — we're taking on 2027 projects and would love to be part of yours.</p>`,
  },
];

// ---------- Insert ----------
if (posts.length !== schedule.length) {
  console.error(`Mismatch: ${posts.length} posts vs ${schedule.length} schedule slots`);
  process.exit(1);
}

const insertStmt = db.prepare(`
  INSERT OR IGNORE INTO posts (title, slug, excerpt, body, hero_image, author_id, published, published_at)
  VALUES (@title, @slug, @excerpt, @body, @hero_image, @author_id, @published, @published_at)
`);

// Author: attach to the first admin user if one exists
const admin = db.prepare(`SELECT id FROM users ORDER BY id ASC LIMIT 1`).get();
const authorId = admin ? admin.id : null;

let inserted = 0, skipped = 0;
for (let i = 0; i < posts.length; i++) {
  const p = posts[i];
  const info = insertStmt.run({
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt,
    body: p.body,
    hero_image: null,            // add later via update-post-heroes pattern if desired
    author_id: authorId,
    published: 0,                // starts unpublished
    published_at: when(i),       // future date — scheduler flips on that day
  });
  if (info.changes === 1) {
    inserted++;
    console.log(`  + queued: ${schedule[i]}  ${p.slug}`);
  } else {
    skipped++;
    console.log(`  = exists: ${p.slug}`);
  }
}
console.log(`\nDone. Inserted ${inserted}, skipped ${skipped}.`);
console.log('Posts are scheduled (published=0 with future published_at).');
console.log('server/scheduler.js will auto-publish each one on its release date.');
console.log('To publish all immediately (preview), run: node scripts/publish-scheduled.js --force');
