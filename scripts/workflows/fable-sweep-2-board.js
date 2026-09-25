export const meta = {
  name: 'fable-sweep-2-board',
  description: 'Fable queue item 4: the board for sweep 2 - audits the Opus screeners and rules on each of the nine candidates (admit / test first / kill)',
  phases: [
    { title: 'Probe', detail: 'one-word Fable call; stop here if the quota is still out' },
    { title: 'Board', detail: 'one Fable agent: spot-checks each screener, then rules per candidate' },
  ],
}

// The deciding tier of sweep 2. The checking tier ran on Opus (scripts/workflows/sweep-2-screen.js,
// reports in research/colony-sweep/screen-2/), per the fleet rule in CLAUDE.md: scouts, supervisors and
// auditors on Opus, only the chief auditor and the board on Fable. One agent plays both deciding
// roles here because there are nine candidates, not a hundred, and every Fable call is quota.

const ROOT = '/home/user/automaton'

const SCHEMA = {
  type: 'object',
  properties: {
    rulings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          ruling: { type: 'string', enum: ['ADMIT', 'TEST_FIRST', 'KILL'] },
          screenerHeld: { type: 'boolean', description: 'did the screener\'s decisive fact survive your spot-check' },
          why: { type: 'string' },
          test: { type: 'string', description: 'TEST_FIRST: the zero-cost test, who runs it (a CI job, an agent), and the pass/kill thresholds' },
          targetIls: { type: 'string', description: 'ADMIT only: a monthly target with its arithmetic, never above the evidence' },
          ownerSteps: { type: 'array', items: { type: 'string' } },
          rejectedEntry: { type: 'string', description: 'KILL only: the docs/REJECTED.md row (what, the decisive fact with its source, what would reopen it)' },
        },
        required: ['id', 'ruling', 'screenerHeld', 'why', 'test', 'targetIls', 'ownerSteps', 'rejectedEntry'],
      },
    },
    portfolioEffect: { type: 'string', description: 'what changes in the ₪20,000 arithmetic, honestly' },
    boardPath: { type: 'string' },
  },
  required: ['rulings', 'portfolioEffect', 'boardPath'],
}

phase('Probe')
const probe = await agent('Reply with the single word OK and nothing else.', { label: 'probe', phase: 'Probe', model: 'fable' })
if (!probe) {
  log('Fable did not answer the probe; nothing else ran. Re-run this script when the quota renews.')
  return { blocked: 'fable-quota' }
}

phase('Board')
const board = await agent([
  'You are the BOARD for sweep 2 of the revenue colony (repo ' + ROOT + '): the deciding tier of the chain of command. Nine candidate income lines were proposed by scouts and then attacked by one Opus screener each. You decide which enter the portfolio, which get a zero-cost test first, and which die.',
  'Read, in this order: ' + ROOT + '/MISSION.md in full (it binds you); ' + ROOT + '/research/colony-sweep/SWEEP-2.md lines 1-34 (the four shapes and why); every report in ' + ROOT + '/research/colony-sweep/screen-2/ (one per candidate, with its verdict and decisive fact); then, per candidate, its section in SWEEP-2.md. Open research/rendered/*.txt, docs/REJECTED.md, research/colony-sweep/BOARD.md or source files only to check a specific point.',
  'First act as chief auditor: for each screener, re-check the one decisive fact it rests on (open the file or run the command it cites). A screener whose decisive fact does not hold is overruled, and you say so.',
  'Then rule. ADMIT only if the load-bearing facts are CONFIRMED, the first paying stranger has a named path that does not need a platform rank earned by prior success, the owner does nothing beyond the existing seven one-time steps (or a new one-time step you name exactly), and the ceiling clears ₪300/month on evidence. TEST_FIRST when one zero-cost test run by a CI job or an agent settles it — give the thresholds. KILL otherwise, with the REJECTED.md row. A kill cannot overstate income; an admission can. The standing sweep-1 rulings in BOARD.md bind you unless you show they are wrong.',
  'You may use at most 3 WebSearch calls (ToolSearch "select:WebSearch" first). Write ' + ROOT + '/research/colony-sweep/BOARD-2.md (English, with a short Hebrew summary for the owner at the top), then return the structured result. Edit no other file; never run git — the main thread folds kills into REJECTED.md and admissions into src/revenue/portfolio.ts.',
].join('\n'), { label: 'board', phase: 'Board', schema: SCHEMA, model: 'fable' })

return { board }
