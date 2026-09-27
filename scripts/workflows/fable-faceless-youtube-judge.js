export const meta = {
  name: 'fable-faceless-youtube-judge',
  description: 'Fable queue item 1: the judge and red-team for the faceless-YouTube reassessment, run from repo files alone (DIGEST.md + REGRADE.md)',
  phases: [
    { title: 'Probe', detail: 'one-word Fable call; stop here if the quota is still out' },
    { title: 'Verdict', detail: 'Fable judge: stay rejected / reopen as experiment / reopen as line' },
    { title: 'Red-team', detail: 'Fable skeptic attacks the verdict' },
  ],
}

// Why this file exists. The judge was the last stage of workflow wf_492fcdd8-d40, whose script and
// resume cache live under /root/.claude and die with the container (the 8.9 and 22.9 caches did).
// The 14 Opus scouts and auditors it would have replayed are already committed
// (research/faceless-youtube/{scouts,audits}/, DIGEST.md, REGRADE.md), and the judge reads only
// those files, so this script needs no cache: it is the judge and the red-team, verbatim from the
// original, preceded by a one-word probe so a dead quota costs one call instead of a failed run.

const ROOT = '/home/user/automaton'
const OUT = ROOT + '/research/faceless-youtube'

const CONTEXT = [
  'CONTEXT (repo ' + ROOT + '; MISSION.md there is binding and outranks everything):',
  '- The owner wants real income (target 20,000 ILS/month) and does NOTHING themselves: no camera, no voice, no selling, no talking to people, no manual ops. Only one-time legally-required identity/payout steps are theirs. The owner is an Israeli resident. Nothing published may carry the owner\'s name.',
  '- Constitution: honest value only. No spam, no ToS violations, no deceiving viewers or buyers. This outranks the revenue target.',
  '- MISSION constraint 7: a line may not be built before its acquisition channel is named; the first thing built is the cheapest test that a stranger can find it. Constraint 8: name the input that is not public (accumulated platform history counts). Constraint 3: never an account farm.',
  '- Money counts only in the ledger with a platform transaction id. Use 3.7 ILS per USD (the repo\'s own figure: docs/REJECTED.md says 20,000 ILS ~ $5,400).',
  '- THE OWNER\'S INPUT: ' + OUT + '/00-owner-reel-2026-09-25.md - six ChatGPT prompts from an Instagram carousel (niche finder RPM>$7, viral ideas, script modelled on a competitor, free stock footage + Sora 2, 30-day calendar, monetized-in-30-days map). Read it first.',
  '- WHAT WAS DECIDED BEFORE: docs/REJECTED.md section "Automated faceless-video pipelines, as a revenue line - REJECTED 2026-09-03" (read it; it is ~60 lines starting at the heading) and research/tiktok/06-faceless-video-tooling.md (verdict box, sections 3.2, 3.5, 5, 6, 9). That rejection judged one-click Shorts/TikTok generators for a Hebrew audience at volume. Its reopen trigger: "a platform paying Israel for content this pipeline can legally and honestly produce, plus Hebrew RTL support that works, plus a TTS licence that permits commercial use. All three." The reel is a DIFFERENT variant: English, ONE channel, long-form, high-RPM niche. Your job is to test whether that difference changes anything - not to repeat the old verdict and not to overturn it for convenience.',
  '- PRIMARY SOURCES ALREADY RENDERED FROM A GITHUB RUNNER TODAY (read these before searching; they beat any snippet): research/rendered/youtube-monetization-policies.txt (YPP policies incl. inauthentic content, 29KB), youtube-altered-synthetic-disclosure.txt, youtube-ypp-payout.txt, adsense-payment-3372975.txt, adsense-payment-7164703.txt, youtube-api-quota-cost.txt, youtube-api-compliance-audits.txt. Pexels and Pixabay licence pages returned 403 to the runner too (see the .meta.json files). Cite rendered text as [RENDERED research/rendered/<file>:<line>].',
  '- Other prior research worth reading when relevant: research/colony-sweep/scouts/bounties-grants--creator-funds.md (YPP payout rail), research/colony-sweep/scouts/distribution--short-video.md (upload API routes), research/colony-sweep/scouts/content-seo--ad-networks.md, research/colony-sweep/scouts/content-seo--ai-content-policy.md, research/colony-sweep/audits/content-seo.md ("Angles missed: an English-language property"), research/tiktok/01-monetization-israel.md.',
].join('\n')

const VERDICT_SCHEMA = {
  type: 'object',
  properties: {
    decision: { type: 'string', enum: ['STAY_REJECTED', 'REOPEN_AS_EXPERIMENT', 'REOPEN_AS_LINE'] },
    oneSentenceForOwner: { type: 'string', description: 'plain words, Hebrew' },
    reopenTriggerAssessment: { type: 'string' },
    rejectionReasonsRevisited: { type: 'array', items: { type: 'object', properties: { reason: { type: 'string' }, stillHolds: { type: 'string', enum: ['YES', 'NO', 'PARTLY'] }, why: { type: 'string' } }, required: ['reason', 'stillHolds', 'why'] } },
    ceilingsIls: { type: 'object', properties: { month3: { type: 'string' }, month6: { type: 'string' }, month12: { type: 'string' }, basis: { type: 'string' } }, required: ['month3', 'month6', 'month12', 'basis'] },
    ownerSteps: { type: 'array', items: { type: 'string' } },
    ownerMinutesPerMonthAfterSetup: { type: 'string' },
    acquisitionChannelAndFirstTest: { type: 'string' },
    killCriteria: { type: 'array', items: { type: 'string' } },
    niche: { type: 'object', properties: { recommended: { type: 'string' }, alternatives: { type: 'array', items: { type: 'string' } }, why: { type: 'string' }, evidenceGrade: { type: 'string' } }, required: ['recommended', 'alternatives', 'why', 'evidenceGrade'] },
    productionSpec: { type: 'string', description: 'the stack and the gates, only what survived the audits' },
    honestPrompts: { type: 'array', items: { type: 'object', properties: { step: { type: 'string' }, reelVersionProblem: { type: 'string' }, colonyVersion: { type: 'string' } }, required: ['step', 'reelVersionProblem', 'colonyVersion'] } },
    colonyCanBuildNowWithoutOwner: { type: 'array', items: { type: 'string' } },
    openQuestions: { type: 'array', items: { type: 'string' } },
    verdictPath: { type: 'string' },
  },
  required: ['decision', 'oneSentenceForOwner', 'reopenTriggerAssessment', 'rejectionReasonsRevisited', 'ceilingsIls', 'ownerSteps', 'ownerMinutesPerMonthAfterSetup', 'acquisitionChannelAndFirstTest', 'killCriteria', 'niche', 'productionSpec', 'honestPrompts', 'colonyCanBuildNowWithoutOwner', 'openQuestions', 'verdictPath'],
}

phase('Probe')
const probe = await agent('Reply with the single word OK and nothing else.', { label: 'probe', phase: 'Probe', model: 'fable' })
if (!probe) {
  log('Fable did not answer the probe; nothing else ran. Re-run this script when the quota renews.')
  return { blocked: 'fable-quota' }
}

phase('Verdict')
const verdict = await agent([
  'You are the JUDGE for this reassessment - the deciding tier of the chain of command. You decide whether the owner\'s reel method reopens a line the colony rejected on 3.9.2026. Being wrong here is expensive either way: a false GO sends the owner through account setup for a channel that gets demonetized or never found; a false NO throws away the one variant nobody measured.',
  CONTEXT, '',
  'YOUR INPUT IS DELIBERATELY REDUCED (a Fable board once failed twice reading 31 files; on a reduced input it succeeded). Read, in this order: MISSION.md in full; the 3.9 rejection in docs/REJECTED.md; the owner input; ' + OUT + '/DIGEST.md (every auditor verdict and correction on 108 scout claims, generated mechanically from the structured results - the auditor\'s correction is the claim of record); then ' + OUT + '/REGRADE.md (60 re-grades of those claims against 18 primary pages rendered afterwards, every quote machine-checked verbatim - where REGRADE contradicts DIGEST, REGRADE wins). Open a full scout/audit report under ' + OUT + '/scouts/ or /audits/ or a research/rendered/*.txt page ONLY to settle a specific point; do not read them wholesale.',
  'Decide one of: STAY_REJECTED, REOPEN_AS_EXPERIMENT (one channel, a bounded measured test with kill criteria, nothing counted as revenue), REOPEN_AS_LINE (add to the portfolio with a target). Revisit each of the five 3.9 rejection reasons and the reopen trigger (is the Hebrew-RTL condition still meaningful for an English channel the mandate does not forbid?). State ceilings as ranges with their arithmetic, never as hope. List owner steps exactly - never invent one - and the owner minutes per month after setup (the mandate says zero; if the honest number is not zero, say so and what it costs the decision). Name the acquisition channel and the cheapest stranger-finds-it test (MISSION constraint 7). Recommend a niche only from evidence that survived audit. Rewrite each of the six prompts into the colony version.',
  'You may use at most 2 WebSearch calls (ToolSearch "select:WebSearch" first), only to break a tie between a scout and an auditor.',
  'OUTPUT: write VERDICT.md to ' + OUT + '/VERDICT.md in English with a short Hebrew summary for the owner at the top, then return the structured result.',
].join('\n'), { label: 'judge', phase: 'Verdict', schema: VERDICT_SCHEMA, model: 'fable' })

const REDTEAM_SCHEMA = {
  type: 'object',
  properties: {
    objections: { type: 'array', items: { type: 'object', properties: { objection: { type: 'string' }, severity: { type: 'string', enum: ['FATAL', 'MAJOR', 'MINOR'] }, evidence: { type: 'string' }, fix: { type: 'string' } }, required: ['objection', 'severity', 'evidence', 'fix'] } },
    verdictSurvives: { type: 'boolean' },
    whatWouldChangeTheDecision: { type: 'string' },
    redteamPath: { type: 'string' },
  },
  required: ['objections', 'verdictSurvives', 'whatWouldChangeTheDecision', 'redteamPath'],
}

phase('Red-team')
const redteam = verdict ? await agent([
  'You are the RED TEAM. The judge just decided the question below. Attack the decision from whichever side it came down on: if it says go, find what makes the experiment dishonest, unpayable, unfindable, or a hidden ask of the owner; if it says no, find the evidence it ignored and the variant it failed to consider. Default to skepticism of every number. Check the verdict against MISSION.md clause by clause (owner does nothing; honest value; constraints 1-8; the 200 ILS float is never a subscription; anonymity).',
  CONTEXT, '',
  'The verdict is at ' + OUT + '/VERDICT.md. The evidence it rests on is ' + OUT + '/DIGEST.md and ' + OUT + '/REGRADE.md (read those; open full reports under ' + OUT + '/scouts|audits/ or research/rendered/*.txt only to check a specific point). Structured verdict:',
  JSON.stringify(verdict, null, 1).slice(0, 20000), '',
  'You may use at most 3 WebSearch calls (ToolSearch "select:WebSearch" first).',
  'OUTPUT: write ' + OUT + '/RED-TEAM.md, then return the structured result. FATAL means the decision must change; MAJOR means a stated number, step or gate is wrong; MINOR is wording.',
].join('\n'), { label: 'red-team', phase: 'Red-team', schema: REDTEAM_SCHEMA, model: 'fable' }) : null

return { verdict, redteam }
