export const meta = {
  name: 'replenish-queue-2',
  description: 'Continuous loop, second refill: verify the second-tier venue groups the first pass left (print-on-demand, WordPress/Freemius, MCP marketplaces, ebook aggregators and teacher stores), GitHub-first, 2 WebSearch max each; one Opus synthesizer writes the note.',
  phases: [
    { title: 'Verify', detail: 'four Opus verifiers, one per group', model: 'opus' },
    { title: 'Synthesize', detail: 'one Opus agent writes research/breadth/REPLENISH-2026-09-28-2.md', model: 'opus' },
  ],
}

const RULES = `Work in /home/user/automaton (read-only except where told). Never run git (no stash, commit, checkout). Do not edit logs/CHECKPOINT.md, logs/CHANNEL_LOOP.md, logs/FABLE_QUEUE.md, MISSION.md, CLAUDE.md. No personal names. Evidence: WebFetch works for github.com and raw.githubusercontent.com; most other hosts are blocked; WebSearch is a SHARED scarce budget — at most 2 WebSearch calls for your whole task. The Israel CrUX monthly top-origin lists at github.com/zakird/crux-top-lists (data/country/il/YYYYMM.csv.gz) are a github-grade traffic source the first pass used. Read the repo first (research/breadth/REPLENISH-2026-09-28.md — the first refill pass, its method and its kills; research/breadth/BREADTH-SWEEP.md §2.4 and §6; research/breadth/scouts/*.json; research/breadth/verify/verdicts.json; research/breadth/BOARD.md; docs/REJECTED.md) and never re-open a venue a standing verdict killed unless you have new evidence. Grade every claim: github / snippet / repo / none.

The gates (MISSION.md; research/breadth/BOARD.md): G1 ₪0 up front (a cut of each sale is fine); G2 an Israeli individual can be paid with no camera/selfie step (PayPal Israel passed the camera gate at rendered grade on 28.9, research/measurements/paypal-israel.md, so a PayPal payout counts as a plausible route pending the board); G3 the colony can list without a per-item owner click (API, CLI, bulk feed) and the terms do not bar agents; G4 honest value — the item is not already free everywhere, and AI use is declared where asked; G5 the venue brings its own buyers; G6 one owner step unlocks many listings; G7 the brand is the only public name. A venue is QUEUE-WORTHY only if no gate is FAIL at github or snippet grade and G3 or G5 is PASS. The colony's existing products are listed in products/README.md; say which one each venue would carry, or what new honest item.`

const SCHEMA = {
  type: 'object',
  properties: {
    group: { type: 'string' },
    venues: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          venue: { type: 'string' },
          gates: { type: 'string' },
          verdict: { type: 'string', enum: ['QUEUE', 'DEAD', 'UNSETTLED'] },
          reason: { type: 'string' },
          render_urls: { type: 'array', items: { type: 'string' } },
          what_we_would_list: { type: 'string' },
        },
        required: ['venue', 'gates', 'verdict', 'reason', 'render_urls', 'what_we_would_list'],
      },
    },
    searches_used: { type: 'number' },
  },
  required: ['group', 'venues', 'searches_used'],
}

const GROUPS = [
  { key: 'print-on-demand', v: 'Zazzle, TeePublic, Society6, Threadless, Displate (read research/breadth/scouts/print-on-demand-single-account.json and research/measurements/spreadshirt.md for the Spreadshirt precedent: automation rules and AI rules decide these)' },
  { key: 'wordpress-freemius', v: 'a free WordPress.org plugin with a paid add-on sold through Freemius (or a similar merchant of record) — the wordpress.org plugin guidelines on AI, upsells and trialware, Freemius payouts to Israel (PayPal?), identity, fees (read research/breadth/scouts/app-plugin-marketplaces.json)' },
  { key: 'mcp-marketplaces', v: 'MCPize, AgenticMarket and any paid MCP-server marketplace the scouts named — the colony has a publish-ready free MCP server (products/mcp-il-tools, registry name io.github.mehudak/il-tools); what would a paid tier or listing earn, and do these venues pay an Israeli individual (read research/breadth/scouts/automation-marketplaces.json, storefront-rails.json and BREADTH-SWEEP.md Batch C)' },
  { key: 'ebook-and-teacher-stores', v: 'StreetLib (an ebook aggregator that may reach Apple Books without a subscription; Apple direct died on G7 and PublishDrive on its $9.99/month), Teach Simple (an English teacher-materials marketplace seen in a TPT source), and any other commission-only ebook or teacher store named in research/breadth/scouts/publishing.json or education.json that the first pass did not check' },
]

phase('Verify')
const results = await pipeline(
  GROUPS,
  g => agent(`${RULES}
TASK: verify the second-tier venue group "${g.key}": ${g.v}.
For each venue: fill the gate line (G1..G7 each PASS/FAIL/UNKNOWN with grade), a verdict (QUEUE if queue-worthy per the rule above; DEAD if a gate FAILS at github or snippet grade — quote the evidence; UNSETTLED otherwise), the reason in 1-3 sentences, what the colony would list there, and the primary URLs a GitHub runner should render next (only URLs you actually saw, never guessed; terms and payout pages first). Return 1-6 venues.`,
    { label: `verify:${g.key}`, phase: 'Verify', schema: SCHEMA, model: 'opus' }),
)

phase('Synthesize')
const note = await agent(`${RULES}
You may write ONE file: /home/user/automaton/research/breadth/REPLENISH-2026-09-28-2.md (create it).
Context: after ticks 5-8 of the channel loop, most queued venues are dead or parked on owner step 8 (the brand mailbox) or a board ruling (read logs/CHANNEL_LOOP.md §4 and §7, and research/breadth/REPLENISH-2026-09-28.md for the first refill). The owner ordered the loop never to stop (MISSION.md, 28.9 "תמיד תמשיך"), so the queue is refilled honestly.
Write the note in the first refill's format: (1) why this pass ran; (2) a table of every venue verified with its gate line, verdict and reason; (3) venues recommended to ENTER the §4 queue for ₪0 tests (QUEUE only), each with its test (render URLs) and proposed kill clauses for the sitting to adopt — entry buys a free render, admission stays one per Fable sitting; (4) venues DEAD with the evidence and a reopen trigger each, for docs/REJECTED.md (the main thread records them); (5) the render URL list for the next dispatch, one per line with the venue. Re-check any load-bearing github claim yourself. Do not overstate: an UNKNOWN payout is not a pass; CrUX measures traffic, not buyers.
Reply with a 10-line summary: venues to queue, venues dead, the render URLs.
RESULTS (JSON): ${JSON.stringify(results.filter(Boolean))}`,
  { label: 'synthesize', phase: 'Synthesize', model: 'opus' })

return { results, note }
