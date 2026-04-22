// Seed six evergreen Santa Cruz construction blog posts.
// Idempotent: uses INSERT OR IGNORE on unique slug. Run:  node scripts/seed-posts.js

require('dotenv').config();
const db = require('../db');

const posts = [
  {
    slug: 'how-much-does-kitchen-remodel-cost-santa-cruz-2026',
    title: 'How Much Does a Kitchen Remodel Cost in Santa Cruz in 2026?',
    excerpt: 'Honest 2026 price ranges for kitchen remodels in Santa Cruz County — what you actually pay for cabinets, counters, appliances, labor, and the things nobody talks about.',
    hero_image: null,
    published_at: '2026-01-18',
    body: `<p>Every Santa Cruz homeowner asks us the same first question, and they deserve a straight answer: a mid-range kitchen remodel in Santa Cruz County in 2026 runs <strong>$65,000 to $120,000</strong>. A higher-end remodel — custom cabinetry, stone slab counters, premium appliances, structural changes — lands between <strong>$140,000 and $250,000</strong>. Below is where the money actually goes.</p>

<h2>What's in a $90,000 kitchen remodel in Santa Cruz</h2>
<p>Here's a typical breakdown we see on a 180 sq ft kitchen project — say, a Westside bungalow getting a mid-range update:</p>
<ul>
  <li><strong>Cabinets:</strong> $18,000–$28,000 (semi-custom, painted, soft-close)</li>
  <li><strong>Countertops:</strong> $5,000–$9,000 (quartz or mid-tier quartzite, 40 sq ft)</li>
  <li><strong>Appliances:</strong> $8,000–$14,000 (induction range, counter-depth fridge, dishwasher, microwave drawer, vent hood)</li>
  <li><strong>Plumbing:</strong> $3,500–$6,000 (fixtures, rough-in changes, disposal, ice maker line)</li>
  <li><strong>Electrical:</strong> $4,000–$7,500 (new circuits, under-cab lighting, recessed, usually a subpanel or panel upgrade)</li>
  <li><strong>Flooring:</strong> $3,000–$6,500 (engineered hardwood or luxury vinyl plank)</li>
  <li><strong>Tile / backsplash:</strong> $1,800–$3,500</li>
  <li><strong>Demo, framing, drywall, paint, hardware, trim:</strong> $8,000–$14,000</li>
  <li><strong>Permits and fees:</strong> $1,500–$3,500</li>
  <li><strong>General contractor overhead + profit:</strong> 15–20% on top</li>
</ul>

<h2>Why Santa Cruz runs 15–25% higher than the national average</h2>
<p>Three reasons. First, our labor market — skilled trades in Santa Cruz County are in demand and the cost reflects it. Second, material delivery — everything coming to us comes over Highway 17 or up Highway 1, and delivery fees on custom cabinets and slab counters add up. Third, surprises — Santa Cruz homes are old. Opening a wall on a 1950s Westside kitchen regularly reveals knob-and-tube wiring, galvanized supply lines, or unpermitted work from 1978 that needs to come up to code before we can close the wall back up.</p>

<h2>What adds cost that people don't expect</h2>
<ul>
  <li><strong>Panel upgrade.</strong> Most pre-1995 Santa Cruz homes have 100-amp panels that are already at capacity. Induction ranges, heat pumps, and EV chargers push them over. A panel upgrade runs $4,000–$8,000 including the utility coordination.</li>
  <li><strong>Structural changes.</strong> Removing a wall between the kitchen and dining room to open the layout means a beam, posts, and engineering. Budget $6,000–$15,000 depending on span and whether the wall is load-bearing.</li>
  <li><strong>Asbestos and lead testing.</strong> Homes built before 1978 need testing before demo. Usually $400–$800 for the tests; abatement, if needed, is another $2,000–$8,000.</li>
  <li><strong>Title 24 compliance.</strong> California's energy code. Triggers can include insulation upgrades ($1,500–$4,000) and mandatory ventilation.</li>
</ul>

<h2>Ways to save without regretting it later</h2>
<p>Keep the plumbing where it is. Moving a sink or dishwasher across the room adds $2,000–$5,000. Keep the footprint — removing a wall is dramatic but expensive. Choose stock cabinets for the perimeter and custom only for the island. Skip the pot-filler. Pick a single-source tile rather than a mix of three.</p>

<p>Ways to <em>not</em> save: don't cheap out on the cabinets (they're the one thing you touch every day), don't skimp on the panel upgrade, and don't skip the range hood CFM you actually need. Those are the three places where buyer's remorse is universal.</p>

<h2>The timeline</h2>
<p>From signed contract to finished kitchen, plan on <strong>5–7 months</strong>: 6–8 weeks of design and selections, 4–6 weeks of permit and cabinet lead time in parallel, then 8–12 weeks on site. We schedule demolition on a Monday and target the Friday you host friends for dinner.</p>

<h2>Ready to price your project?</h2>
<p>We do a free walk-through and follow up with a written budget range within a week. <a href="/#contact">Get in touch</a> or call <a href="tel:+18312344669">(831) 234-4669</a>.</p>`,
  },
  {
    slug: 'adu-santa-cruz-county-2026-rules-cost-timeline',
    title: 'Building an ADU in Santa Cruz County: 2026 Rules, Cost, and Timeline',
    excerpt: 'Detached ADU, attached ADU, Junior ADU — what the state and county allow in 2026, what it costs to build, and the realistic timeline from contract to move-in.',
    hero_image: null,
    published_at: '2026-02-10',
    body: `<p>California rewrote its ADU laws three times in the last five years. If you looked into building an ADU on your Santa Cruz property in 2020 and gave up, it's worth looking again — the rules in 2026 are dramatically more permissive, and both the City of Santa Cruz and Santa Cruz County have responded with faster ministerial approval processes.</p>

<h2>What you can build in 2026</h2>
<p>On most single-family parcels in Santa Cruz County you can build:</p>
<ul>
  <li><strong>One detached ADU</strong> up to 1,200 sq ft (850 sq ft for one bedroom, 1,000 sq ft for two+)</li>
  <li><strong>Plus one Junior ADU</strong> (up to 500 sq ft, shares the main house's kitchen or has a modest one of its own)</li>
  <li><strong>Or an attached ADU</strong> (converted garage, basement, or addition) up to 50% of the main house's floor area, capped at 1,200 sq ft</li>
</ul>
<p>Setbacks are as tight as 4 feet from side and rear property lines. Off-street parking is generally not required if your lot is within ½ mile of transit — which covers most of the city, most of the 41st Avenue corridor, and the Soquel Drive corridor.</p>

<h2>What does an ADU cost in Santa Cruz in 2026?</h2>
<ul>
  <li><strong>Garage conversion ADU (500–600 sq ft):</strong> $180,000–$275,000</li>
  <li><strong>Attached addition ADU (700–900 sq ft):</strong> $280,000–$420,000</li>
  <li><strong>Detached ADU, new build (800–1,200 sq ft):</strong> $350,000–$600,000</li>
  <li><strong>Junior ADU within existing footprint (400–500 sq ft):</strong> $85,000–$160,000</li>
</ul>
<p>These are all-in numbers — foundation to final inspection, including permits, engineering, Title 24, utility hookups, and interior finishes at a mid-range spec. The variation comes from site conditions: hillside grading, utility runs over 50 feet, and whether the sewer line needs upsizing all push the number up.</p>

<h2>The timeline</h2>
<p>Start-to-finish for a detached ADU in Santa Cruz in 2026 is typically <strong>10–14 months</strong>:</p>
<ul>
  <li>Design and engineering: 6–10 weeks</li>
  <li>Permit submittal and ministerial review: 8–12 weeks (the state mandates 60 days, but clock-stops for missing info are common)</li>
  <li>Construction: 5–7 months for a straightforward detached unit</li>
</ul>
<p>The gating item early is usually <strong>septic</strong> (if you're on septic) or <strong>sewer capacity</strong> (if you're in the city). Neither is fatal, but both need to be worked before committing to a design.</p>

<h2>City vs. county — the permit experience differs</h2>
<p>The City of Santa Cruz runs ADU permits through a ministerial track that's generally fast and predictable. County permits take a touch longer and require coordination with Environmental Health when there's a septic system. The City is slightly more particular about design review in the Coastal Zone; the County is slightly more particular about drainage and geotech.</p>

<h2>Financing</h2>
<p>Most of our ADU clients use a cash-out refi, a HELOC, or a construction loan that rolls into a permanent mortgage at completion. A few use the California Housing Finance Agency (CalHFA) ADU grant when funding is open. We're happy to talk you through the pros and cons of each — we've worked with every major local lender.</p>

<h2>Rental income</h2>
<p>Typical Santa Cruz ADU rents in 2026 range from $2,200 (small conversion, no view) to $3,800 (new detached 2-bedroom near transit). That pays back the build cost in 10–15 years on financed money, or in 7–10 years on cash. Many owners build instead for adult kids, aging parents, or to downsize into the ADU and rent out the main house.</p>

<h2>Next step</h2>
<p>We'll do a free feasibility walk of your property — check setbacks, utilities, access, and the hard constraints — and follow up with a written scope and budget range. <a href="/#contact">Reach out</a> or call <a href="tel:+18312344669">(831) 234-4669</a>.</p>`,
  },
  {
    slug: 'santa-cruz-permit-timeline-what-to-expect',
    title: 'Santa Cruz Building Permits: What Actually Happens and How Long It Takes',
    excerpt: 'A plain-English guide to the Santa Cruz City and Santa Cruz County permit process — what gets reviewed, how long each stage takes, and where projects get stuck.',
    hero_image: null,
    published_at: '2026-02-25',
    body: `<p>Permits are where remodel timelines die. Not because the process is inherently broken — it's not — but because homeowners are rarely briefed on what's actually happening between "we submitted" and "we got approved." Here's the inside view from a contractor who submits 20+ Santa Cruz County permits a year.</p>

<h2>The big picture</h2>
<p>Every remodel, addition, and new build in Santa Cruz County needs a building permit. Most also need some combination of mechanical, electrical, and plumbing permits, which are typically bundled with the building permit. ADUs in 2026 get a streamlined ministerial track with a 60-day clock the city or county must honor once the application is complete.</p>

<h2>Stage 1: Pre-submittal (1–4 weeks)</h2>
<p>Before we submit, we gather: architectural drawings, structural engineering (if required), a Title 24 energy compliance report, a site plan with property boundaries, and any specialty documents the project triggers — geotech report for hillside work, arborist report if we're affecting protected trees, historic review package if you're in a historic district. This is the stage homeowners underestimate; getting all of it right before submittal saves months.</p>

<h2>Stage 2: Plan check (4–10 weeks)</h2>
<p>The jurisdiction assigns the application to a plan checker who reviews for code compliance, zoning, and completeness. They come back with "corrections" — a numbered list of things to fix. Typical corrections include: missing dimensions, unclear detail callouts, structural calculations that don't match drawings, energy compliance shortfalls. We respond to corrections, resubmit, and wait for the next round. Two rounds is typical; three means something's wrong.</p>

<h2>Stage 3: Other agencies (parallel, 4–16 weeks)</h2>
<p>Depending on your project, other agencies review in parallel:</p>
<ul>
  <li><strong>Coastal Commission</strong> — if you're in the Coastal Zone and your project triggers a Coastal Development Permit. Add 2–4 months.</li>
  <li><strong>Planning/Design Review</strong> — for exterior changes in certain zones or historic districts. 4–10 weeks.</li>
  <li><strong>Environmental Health</strong> — for septic work or well impacts. 2–6 weeks.</li>
  <li><strong>Public Works</strong> — for driveway changes, encroachments, or sewer/water connections. 3–8 weeks.</li>
  <li><strong>Fire Department</strong> — for anything triggering Chapter 7A (WUI) or sprinkler requirements. 2–4 weeks.</li>
</ul>

<h2>Stage 4: Permit issuance (1–2 weeks)</h2>
<p>Once plan check approves, there's a final fee calculation and issuance step. Fees are typically 1.5–3% of construction value. Pay, pick up the card, and you're ready to pull inspections.</p>

<h2>Stage 5: Construction inspections (spread over build)</h2>
<p>Inspections happen at defined stages — foundation rebar, underground plumbing, rough framing, rough electrical, rough plumbing, insulation, drywall nailing, final. Each is scheduled a business day in advance. Most Santa Cruz County inspectors are responsive and arrive in their window; the system works.</p>

<h2>Where projects actually get stuck</h2>
<ul>
  <li><strong>Incomplete submittals.</strong> The #1 cause of delay. We've seen projects sit for a month waiting for a single missing page.</li>
  <li><strong>Coastal Zone review.</strong> Even "exempt" projects in the Coastal Zone need the exemption determination filed, which takes weeks.</li>
  <li><strong>Septic.</strong> If your project adds bedrooms and your septic is undersized, you're looking at a new leach field — add 2–4 months and $25,000+.</li>
  <li><strong>Geotech.</strong> Hillside work that didn't anticipate geotechnical review adds 2–6 weeks and $3,000–$8,000.</li>
  <li><strong>Historic review.</strong> If you're in a historic-overlay zone and proposed something the board doesn't love, expect a redesign.</li>
</ul>

<h2>How to help your own timeline</h2>
<p>Hire a contractor who has submitted in your jurisdiction many times. Make selections early so drawings are final. Don't change your mind after submittal — every revision resets the clock. And if plan check asks a question, respond within a few days, not weeks.</p>

<h2>We handle all of this for you</h2>
<p>You don't need to know any of this, really. You hire us, we handle the submittal, corrections, coordination, and inspections. You sign the drawings and we carry it from there. <a href="/#contact">Get in touch</a>.</p>`,
  },
  {
    slug: 'coastal-moisture-what-it-does-to-santa-cruz-homes',
    title: 'Coastal Moisture: What It Quietly Does to Santa Cruz Homes (And How to Fight Back)',
    excerpt: 'Salt, fog, and humidity are slowly eating your Santa Cruz house. Here are the specific failures we see and the construction choices that prevent them.',
    hero_image: null,
    published_at: '2026-03-08',
    body: `<p>Santa Cruz's coastal climate is the single most under-appreciated factor in local remodel decisions. It's not about hurricanes or wind loads — it's about the slow, steady damage that salt-laden fog does to building materials over decades. Every Santa Cruz contractor has seen what happens when the wrong spec meets the wrong coast-facing wall. Here's what we've learned.</p>

<h2>The three enemies: salt, humidity, and thermal cycling</h2>
<p>Santa Cruz air, especially within a mile of the coast, carries measurable salt. It deposits on every exterior surface, gets into every crack, and accelerates corrosion on any metal that's not specifically rated for marine environments. Relative humidity runs 75–90% much of the year, which keeps wood at a moisture content that mold and fungus love. And the diurnal temperature swings (60°F in the fog at 6 AM, 75°F in the sun at 2 PM) cause expansion and contraction that tire out caulking, flashing, and cheap sealants.</p>

<h2>What we see fail — and why</h2>
<ul>
  <li><strong>Galvanized nails in cedar siding.</strong> Within 5–7 years they bleed rust, streaking the siding. Fix: stainless 304 minimum, 316 within ½ mile of the water.</li>
  <li><strong>Painted steel door hardware on exterior doors.</strong> Pits and streaks within 2 years. Fix: solid brass or marine-grade stainless.</li>
  <li><strong>Standard aluminum window frames.</strong> Coastal pitting within 10 years. Fix: thermally-broken fiberglass or marine-grade anodized aluminum.</li>
  <li><strong>Interior-grade plywood used anywhere exposed.</strong> Delaminates within 3 years. Fix: marine-grade or ACX exterior for any exposure.</li>
  <li><strong>HVAC condensers without coil coatings.</strong> Fins corrode in 5–8 years, cutting efficiency 30% before you notice. Fix: factory e-coat or aftermarket HeresItePro.</li>
  <li><strong>Cheap bath fans.</strong> Rust-out in 3–5 years, drip water on the ceiling. Fix: Panasonic WhisperGreen or equivalent with anodized housing.</li>
  <li><strong>Standard interior paint in poorly ventilated baths.</strong> Mildew at the ceiling within 2 years. Fix: mildew-resistant primer, adequate CFM exhaust, and a bath fan on a timer or humidistat.</li>
</ul>

<h2>The coastal-spec premium</h2>
<p>Upgrading to coastal-grade materials and hardware typically adds <strong>5–10% to the finish budget</strong> of a Santa Cruz remodel. On a $90,000 kitchen, that's $4,500–$9,000 of extra spend. On a $300,000 ADU, it's $15,000–$30,000. Clients who've been through one round of corroded hardware and mildewed drywall universally agree it's the best money in the project.</p>

<h2>Priorities if the budget is tight</h2>
<p>If you can only spring for coastal-grade spec on three things, pick: (1) exterior fasteners, (2) window and door hardware, (3) exterior paint system. Those are the three that fail visibly and are the most expensive to redo later.</p>

<h2>Ventilation is the silent hero</h2>
<p>Modern Santa Cruz builds with tight envelopes can trap humidity to levels that damage framing over decades. We spec mechanical ventilation on every new build and most remodels — either a balanced ERV system on larger projects, or strategically placed timer-controlled bath fans and range hoods on smaller ones. California's Title 24 already mandates some of this; we go beyond the minimum.</p>

<h2>What to look for when buying</h2>
<p>If you're house-shopping in Santa Cruz, coastal moisture damage is often hidden: inside wall cavities, under flooring, behind old baseboards. A moisture meter check on a pre-purchase inspection is worth insisting on for any coast-facing home older than 20 years.</p>

<h2>Planning a coastal-wise remodel?</h2>
<p>We've been building in Santa Cruz County long enough to know every failure mode. Call <a href="tel:+18312344669">(831) 234-4669</a> and we'll walk your house.</p>`,
  },
  {
    slug: 'choosing-right-contractor-santa-cruz-8-questions',
    title: '8 Questions That Separate a Good Santa Cruz Contractor From a Bad One',
    excerpt: 'Before you sign with anyone — us included — make them answer these. The answers tell you more than any website, brochure, or estimate sheet.',
    hero_image: null,
    published_at: '2026-03-22',
    body: `<p>Hiring a contractor is one of the highest-stakes decisions most homeowners make all decade. You're about to put hundreds of thousands of dollars and months of your life into someone else's hands. Here's how to interview them — these are the questions we wish every client asked, because the right answers expose quickly who'll do a good job and who won't.</p>

<h2>1. "What's your CSLB license number, and can I see your certificate of insurance?"</h2>
<p>In California, any project over $500 in labor and materials must be done by a CSLB-licensed contractor. Look up the number at <a href="https://www.cslb.ca.gov/" target="_blank" rel="noopener">cslb.ca.gov</a> — it takes 30 seconds. Check it's active, check the classification matches your project (B for general building, others are specialty trades), and check for complaints. Then ask for a certificate of insurance (COI) naming you as an additional insured; they should provide this willingly.</p>

<p>For the record, Gravity Construction is CSLB #1075110, General Building (B), fully insured, and our COI is on request.</p>

<h2>2. "Who will be on-site every day?"</h2>
<p>Ask specifically whether there's a project manager or lead carpenter who shows up to the site each day, or whether the owner "swings by." On jobs under $250K, an owner-operator model usually works. On bigger jobs, you want a dedicated lead who lives the project every day. Either answer is fine — but the answer should be specific.</p>

<h2>3. "Can I see three past projects that match the scope of mine?"</h2>
<p>Not just photos — addresses and references you can call. If you're doing a kitchen, see their kitchens. If you're doing an ADU, see their ADUs. If they've never done your scope, they'll learn on your dime. Ask the references: "Did the project finish on time? Were change orders handled fairly? Would you hire them again?"</p>

<h2>4. "How do you handle change orders?"</h2>
<p>Every remodel has change orders. The question is whether they're priced fairly, documented in writing, and signed before the work happens. Bad contractors sneak changes into the final invoice. Good contractors hand you a one-page change order to sign before touching anything outside the original scope. If the answer to this question is vague, walk.</p>

<h2>5. "What's your payment schedule?"</h2>
<p>California law caps the down payment at <strong>$1,000 or 10% of the contract price, whichever is less</strong>. Anyone asking for more than that up-front is breaking the law. A normal schedule ties payments to milestones: contract signing, permit issuance, rough-in complete, drywall in, trim complete, substantial completion, final. The last payment should be 10% or more and released only at final walk-through.</p>

<h2>6. "Who pulls the permit?"</h2>
<p>The contractor should pull the permit in their name. If they ask you to pull it as an "owner-builder," that's a red flag — they may be uninsured, unlicensed, or trying to dodge responsibility for the work. There are legitimate reasons for owner-builder permits, but on a full remodel with a licensed GC, this should not be the answer.</p>

<h2>7. "What's your warranty?"</h2>
<p>California's statutory warranty for new construction is 10 years for latent defects, 4 years for other construction, and 1 year for workmanship. Good contractors offer a written warranty that matches or exceeds those — plus a stated return-call policy for fit-and-finish items in the first year. Ask for it in writing. Ours is a year of craftsmanship warranty with a 30-day post-move-in walk-through.</p>

<h2>8. "Who's your structural engineer, plumber, and electrician, and how long have you worked together?"</h2>
<p>Remodels live and die on the strength of the subcontractors. A contractor who's worked with the same structural engineer for a decade can tell you, before drawing starts, whether a wall can come out. A contractor who shops for the cheapest sub every week has no leverage, no consistency, and no reputation to protect. Stable subcontractor relationships are one of the best proxies for a quality contractor.</p>

<h2>Bonus: what <em>not</em> to ask</h2>
<p>"What's your lowest price?" The lowest-price contractor has already compromised somewhere — usually on materials, insurance, or their own livelihood. You want fair pricing, not rock-bottom pricing. Pick the contractor whose references check out, whose communication you like, and whose numbers are in the middle of the pack.</p>

<h2>We're happy to answer all of these</h2>
<p>Call <a href="tel:+18312344669">(831) 234-4669</a> — we'll tell you our license, our insurance, our subcontractor bench, and why we charge what we charge.</p>`,
  },
  {
    slug: 'whole-home-remodel-vs-moving-santa-cruz-math',
    title: "Whole-Home Remodel vs. Moving in Santa Cruz: The 2026 Math",
    excerpt: 'Should you fix up the house you own or buy the house you want? We ran the numbers on a typical Santa Cruz trade-up scenario. The answer surprises most people.',
    hero_image: null,
    published_at: '2026-04-05',
    body: `<p>Every few months a long-time Santa Cruz client asks us the same question: "We love the neighborhood, but the house isn't working anymore. Should we remodel or move?" It's a real question with a real answer — but the math is rarely what people expect. Here's a worked example using 2026 numbers.</p>

<h2>The scenario</h2>
<p>You own a 1,450 sq ft three-bedroom ranch in Aptos, bought for $720K in 2012, now worth $1.45M. Your current mortgage is $280K at 3.25%, payment $1,850/month including taxes and insurance. You want more space — ideally a primary suite, a real office, and a better kitchen. Two paths:</p>
<ul>
  <li><strong>Path A: Remodel.</strong> Whole-home remodel plus 400 sq ft addition, landing at ~1,850 sq ft finished. Budget $550K.</li>
  <li><strong>Path B: Move.</strong> Sell the current home, buy a 2,200 sq ft four-bedroom in the same school district for $2.1M.</li>
</ul>

<h2>Path A: The remodel math</h2>
<ul>
  <li>Construction cost: $550,000</li>
  <li>Financed via HELOC at 7.75% over 15 years: payment ~$5,200/month</li>
  <li>Current mortgage continues: $1,850/month</li>
  <li><strong>New total monthly: ~$7,050</strong></li>
  <li>Sales tax and transfer costs: $0 (you're not moving)</li>
  <li>Property tax impact: reassessed on ADDED value only under Prop 13. Added value ~$400K × 1.1% = ~$4,400/year more ($370/month).</li>
  <li><strong>Realistic monthly after property tax adjustment: ~$7,420</strong></li>
  <li>You stay in the neighborhood you love, keep the Meyer lemon tree, get exactly the house you wanted, and the property is now worth ~$1.75M (added equity after build).</li>
</ul>

<h2>Path B: The move math</h2>
<ul>
  <li>Sell current for $1.45M. Agent commission (5%) + closing + staging: $82,000. Net: $1.368M</li>
  <li>Payoff existing mortgage: $280K. Cash to next purchase: $1.088M</li>
  <li>Buy at $2.1M. Down payment from proceeds: $1.088M. New mortgage: $1.012M at 6.75% (2026 conventional) = payment $6,560/month P&I</li>
  <li>Property tax on $2.1M at 1.1%: $23,100/year = $1,925/month</li>
  <li>Insurance: $250/month</li>
  <li>Transfer tax + closing + moving: $30,000 one-time</li>
  <li><strong>New total monthly: ~$8,735</strong></li>
  <li>You get a bigger, newer house. You lose your neighbors, your commute, the lemon tree.</li>
</ul>

<h2>The annualized difference</h2>
<p>Remodel path: $89,040/year in housing. Move path: $104,820/year in housing — plus $30,000 one-time in transaction costs. The move is about <strong>$16,000/year more expensive</strong>, forever, for a house that's 350 sq ft larger than what you'd have remodeled into.</p>

<h2>Why Prop 13 is the secret of this math</h2>
<p>The real killer in the move scenario is the property tax reset. Your Aptos home's assessed value is probably still in the $850K range. A new $2.1M purchase is assessed at $2.1M. That tax delta alone costs you $13,000+ per year that remodelling doesn't trigger. Prop 13 makes it roughly 15–25% cheaper to stay put and improve than to trade up, for any long-term Santa Cruz homeowner.</p>

<h2>When moving still wins</h2>
<ul>
  <li>Your lot is fundamentally broken (steep hillside, flood-prone, no room for an addition).</li>
  <li>You want a different neighborhood, not a better house in your current one.</li>
  <li>Your family situation is changing (retirement, empty nest) and you want to downsize rather than upgrade.</li>
  <li>The remodel is so extensive it's essentially a tear-down. At that point buying existing can be cheaper.</li>
</ul>

<h2>When remodeling wins</h2>
<ul>
  <li>You love the neighborhood.</li>
  <li>Your lot can accommodate the footprint you need.</li>
  <li>You plan to stay 7+ years (remodel ROI improves dramatically at that mark).</li>
  <li>Your current mortgage rate is substantially below current market (anything under 4% is gold).</li>
</ul>

<h2>How we help you decide</h2>
<p>We'll do a free property walk and give you an honest range for what a remodel would cost on your specific house. We're not going to tell you to remodel if the answer is "move" — it wastes everyone's time. But we'll give you real numbers so you can make the decision with information. <a href="/#contact">Get in touch</a>.</p>`,
  },
];

const insertStmt = db.prepare(`
  INSERT OR IGNORE INTO posts (title, slug, excerpt, body, hero_image, published, published_at)
  VALUES (@title, @slug, @excerpt, @body, @hero_image, 1, @published_at)
`);

let inserted = 0;
let skipped = 0;
for (const p of posts) {
  const info = insertStmt.run(p);
  if (info.changes === 1) {
    inserted++;
    console.log('  + inserted:', p.slug);
  } else {
    skipped++;
    console.log('  = skipped (already exists):', p.slug);
  }
}
console.log(`\nDone. Inserted ${inserted}, skipped ${skipped}.`);
