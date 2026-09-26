export const meta = {
  name: 'fable-license-choice',
  description: 'Fable queue item 3: choose how il-biz-tools Pro licences are issued (options A-E) so the owner has no per-sale step; the build that follows runs on Opus',
  phases: [
    { title: 'Probe', detail: 'one-word Fable call; stop here if the quota is still out' },
    { title: 'Decide', detail: 'one Fable agent chooses among options A-E and writes the acceptance tests the Opus build must pass' },
  ],
}

// The research is done and the one live measurement it asked for came back (api.gumroad.com answers a
// foreign-origin browser request with access-control-allow-origin: *, measured from a GitHub runner on
// 25.9). What is left is a decision with long-lived consequences for buyers' privacy and for whether
// the owner has a recurring task, which the model rule gives to Fable. One agent, reduced input.

const ROOT = '/home/user/automaton'

const SCHEMA = {
  type: 'object',
  properties: {
    option: { type: 'string', enum: ['A', 'B', 'C', 'D', 'E', 'NONE'] },
    why: { type: 'string' },
    rejectedBecause: { type: 'array', items: { type: 'object', properties: { option: { type: 'string' }, reason: { type: 'string' } }, required: ['option', 'reason'] } },
    ownerStepChanges: { type: 'array', items: { type: 'string' }, description: 'exact changes to docs/OWNER_STEPS.he.md and src/revenue/owner-steps.ts, or empty' },
    acceptanceTests: { type: 'array', items: { type: 'string' }, description: 'the tests the Opus build must pass before any page calls Pro working' },
    buyerFacingDisclosure: { type: 'string', description: 'what the product page must tell a buyer about what is sent where, in plain words' },
    openRisks: { type: 'array', items: { type: 'string' } },
    decisionPath: { type: 'string' },
  },
  required: ['option', 'why', 'rejectedBecause', 'ownerStepChanges', 'acceptanceTests', 'buyerFacingDisclosure', 'openRisks', 'decisionPath'],
}

phase('Probe')
const probe = await agent('Reply with the single word OK and nothing else.', { label: 'probe', phase: 'Probe', model: 'fable' })
if (!probe) {
  log('Fable did not answer the probe; nothing else ran. Re-run this script when the quota renews.')
  return { blocked: 'fable-quota' }
}

phase('Decide')
const decision = await agent([
  'You decide how the paid tier ("Pro") of il-biz-tools is licensed, in the revenue colony at ' + ROOT + '. Today the owner would have to run a command and deliver a key by hand after every sale, which the mandate forbids (the owner does nothing recurring) and which cannot work as specified.',
  'Read, in this order: ' + ROOT + '/MISSION.md in full; ' + ROOT + '/research/measurements/gumroad-native-licenses.md in full (Q1-Q5, options A-E, the live CORS measurement and the independent check); then only as needed: products/il-biz-tools/README.md (the Pro section), the licence code it names, .github/workflows/gumroad-cors-probe.yml, and docs/OWNER_STEPS.he.md step 3.',
  'Decide one option, or NONE with the reason. Weigh: a recurring owner step is disqualifying; honest value to the buyer (what is sent to Gumroad, when, and whether Pro keeps working offline); refunds and chargebacks; what happens on a network error or a 429 (a paying buyer must never lose Pro to a transient failure); what the site promises today ("static", "nothing leaves the browser") and whether the choice makes any sentence on the page untrue; and what is still only CODE-grade rather than measured.',
  'Then write the acceptance tests the build must pass (the build itself runs on Opus afterwards; be specific enough that a builder cannot pass them with a stub), any change to the owner steps, and the exact disclosure the buyer must see.',
  'You may use at most 2 WebSearch calls (ToolSearch "select:WebSearch" first). Write the decision to ' + ROOT + '/research/measurements/gumroad-license-decision.md (English, with a two-line Hebrew summary for the owner at the top), then return the structured result. Edit no other file; never run git.',
].join('\n'), { label: 'decide', phase: 'Decide', schema: SCHEMA, model: 'fable' })

return { decision }
