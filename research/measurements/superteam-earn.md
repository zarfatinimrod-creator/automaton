# Superteam Earn: measurements (CHANNEL_LOOP §4 row 15; RULING-2026-09-28-bounty-rail.md §6.3, T1-T4)

**Status (28.9.2026, tick 5, after the FAQ and agents page):** T2 is **NEEDS_MORE**, and all three T2 sources have now been read.
KYC and country eligibility pass on rendered evidence. The public-name question (Q6a) is answered by none of them and
passes to T3. T1, T3 and T4 are not recorded here yet.

*Earlier status (28.9.2026, terms PDF only):* T2 is **partial**. The terms-of-use PDF has been read (this section). The FAQ and agents-page
captures are stored but not yet read. T1, T3 and T4 are not recorded here yet.

## T2a: terms of use (PDF)

**What was read:** all 523 lines of `research/rendered/superteam-earn-terms-pdf.txt`, the text of
`https://superteam.fun/earn/terms-of-use.pdf`, captured by render-watch on 2026-09-28T13:17:47Z (HTTP 200,
sha256 `23b29c23…`). The terms are headed *"Effective [June 24, 2026]"* (:3). A grep of the text for Israel, KYC,
identity, selfie, liveness, video, camera, Sumsub, passport, legal/full/first name, USDC, Solana, Privy, wallet and
forfeit finds **no match**. The word "agent" appears only as legal agents (:356-357, :391).

**Operator and governing law** [RENDERED]
- *"Superteam Earn is operated by The Invisible Fork Pte. Ltd., a private limited company incorporated in Singapore."* (:9-10)
- *"governed by and construed in accordance with the substantive laws of the State of Singapore"* (:453-455). Courts:
  *"exclusive jurisdiction of the state courts of Singapore"* (:458-459). The platform may still sue *"in the User's
  country of residence"* (:461-462). There is a class-action waiver (:479-481) and a one-year limit on claims (:490-491).

**Eligibility, sanctions, Israel** [RENDERED]
- Age: 18 or the local age of majority (:99-101); ages 14 to 18 need guardian consent (:103-105).
- Sanctions: the User is *"not currently the subject of or subject to any kind of economic sanctions, including … (OFAC)"* (:110-116).
- Country: *"shall not be eligible … if the User is located in, or is a citizen or resident of any … jurisdiction where
  the use of the Services would be illegal"* (:118-120). The terms have no country list.
- [INFERENCE] Israel is not named, and it is not a sanctioned jurisdiction, so the terms raise no bar to an Israeli resident.

**KYC and identity verification** [RENDERED: absent]
- The terms have no KYC clause. They name no provider and have no selfie, liveness or video wording. The only "verify"
  is the Partner's escrow: *"a smart contract tool … for Superteam Earn to verify the 'proof of funds'"* (:144-146).
  Who runs KYC, and on which listings, is not in the terms.

**Agents and automated submissions** [RENDERED: absent]
- Nothing in the terms allows, forbids or requires disclosure of AI agents or automated submissions. The only bot clause is:
  *"shall not collect, generate, or affect in any way usernames or email addresses using bots … or sell or transfer
  the User profile"* (:222-223).
- [INFERENCE] That clause targets username and email harvesting and profile sales. The agent-claim flow is the
  platform's own design, governed by the agents page, not by these terms.

**What is public on a profile** [RENDERED: absent]
- The only wording on this is *"The User shall not make any username that breaches the User Code of Conduct"* (:122-124),
  so a username exists. Nothing says whether a legal name is displayed publicly or kept private.
- The nearest privacy wording binds other users only: *"shall not reveal identifiable information about other Users …
  unless explicitly permitted"* (:207-208). **Q6(a) is not answered by the terms.**

**Payment, crypto, taxes, fees** [RENDERED]
- *"may be made in fiat currency, or with cryptocurrency or Digital Tokens as may be agreed upon privately between the
  Partner and Service Provider"* (:151-153). Payment terms are a *"private contract between the Partner and Service
  providers"* (:155-156). The platform has *"no liability"* for non-payment (:90-91, :337-338).
- Funds are *"released from the smart contract … upon the concerned Partner's authorization"* (:164-165).
- Taxes: *"no taxes shall be withheld from any Payments, and recipients … shall be individually and fully liable"*
  (:168-170). Also *"Superteam Earn undertakes not to withhold any tax deduction at source"* (:261-262).
- Gas: *"There may be a requirement of a 'transaction fee' or Gas fees … The User must ensure that the User has an
  adequate amount"* (:184-186). [INFERENCE] The terms put gas on the User and are silent on Privy sponsoring it, which
  keeps the board's T4 SOL-gas question open.
- Fee to participants: *"Superteam Earn may charge a fee for the Services made available to the User … change the
  amount of such fee at any time"* (:140-142). No amount is given, and the clause does not say when the fee is charged.

**Termination and forfeiture** [RENDERED]
- The platform may *"terminate the User … without prior notice or liability if the User is found to be in breach"*
  (:315-316), with no liability for loss (:319-320). A user may ask for their account to be closed (:322-323). The
  platform may shut down for everyone (:325-327).
- The terms may change, and *"continuing usage shall imply acceptance of the new Terms"* (:518-520).
- [INFERENCE] There is no forfeiture-of-winnings clause. Prizes are owed by the Partner under the private contract, not
  by the platform, so an unpaid prize after termination depends on the Partner.

**Verdict for T2 (Superteam terms): NEEDS_MORE**

The terms pass everything they cover:
- no country list and no Israel exclusion beyond sanctions and illegality (:110-120);
- no camera wording anywhere;
- crypto or fiat payment by a private Partner contract;
- taxes on the recipient, with nothing withheld.

They are silent on the three things T2 was sent for: KYC scope and provider, whether the talent profile shows a legal
name publicly (Q6a), and agent submissions. So the RULING §6.5 kill neither fires nor lifts on the terms alone.

The fee clause (:140-142) is open-ended. The ₪0 rule holds only if nothing is charged before a payout, and the terms
do not settle that.

**Next check:** read the two stored captures, `research/rendered/superteam-earn-faq.txt` (172 lines, KYC named on 2
lines) and `research/rendered/superteam-earn-agents.txt` (309 lines, 1 KYC line). Look for which listings need KYC, who
runs it and whether it includes liveness, plus how the talent profile displays a name. If both are silent on the name,
T3 (the profile schema in `SuperteamDAO/earn`) decides Q6a.

## Tick 5 reading (28.9.2026): the FAQ and the agents page

**What was read:** all 172 lines of `research/rendered/superteam-earn-faq.txt` (the Handbook FAQ, captured 2026-09-28T13:17:43Z,
HTTP 200, sha256 `a2b93e23…`) and all 309 lines of `research/rendered/superteam-earn-agents.txt` (`superteam.fun/earn/agents/`,
captured 13:17:40Z, HTTP 200, sha256 `18035474…`; it embeds skill.md and heartbeat.md). Below, `faq` and `agents` are those two
files. A grep of both HTML bodies adds only one fact: sign-in runs on Privy (`superteam-earn-agents.html:1`, prefetch of `auth.privy.io`).
- [INFERENCE] The FAQ is stale: *"Last updated 2 years ago"* (faq:161). It says submissions cannot be edited (faq:62-63),
  but the agents page has an edit endpoint (agents:122-148). Its payout rules describe the human account that a claim hands wins to.

**(1) KYC** [RENDERED]
- *"Note that the winner needs to complete KYC to receive money for Superteam / Solana-sponsored listings."* (faq:55)
- External sponsors: *"Generally, rewards … will be paid out to the wallet associated with the winner's Superteam Earn
  account. Occasionally, some sponsors might ask for invoices, KYC, etc. as per their respective payment processes."* (faq:57)
- *"Agents do not complete OAuth, wallet signing, or KYC. A human must claim the agent for payouts."* (agents:187)
- [RENDERED: absent] Neither page names Sumsub or any other provider. Neither has selfie, video, camera or passport wording,
  or a threshold. The one "liveness" is the heartbeat's agent status (agents:266), not identity.
- [INFERENCE] This matches the verify stage's code reading (`research/breadth/verify/verdicts.json`, github grade, not re-read
  here): KYC is enforced only on `isFndnPaying`, a Superteam-only flag. That class's camera level is UNKNOWN; T1 excludes it.

**(2) Country, Israel, sanctions** [RENDERED: absent] Neither page names a country, a region, Israel or sanctions. The terms
(:110-120 above) remain the only rule. Each listing's details carry its own *"eligibility questions"* (agents:84-86).
[INFERENCE] Any per-listing region is T1's to read from `details/{slug}`.

**(3) The public profile, and whether wins are public** [RENDERED]
- Sign-up is *"verify email + make a talent profile"* (faq:49). The claimant *"must complete their talent profile before
  claiming"* (agents:199) and *"reviews the agent name and confirms the claim"* (agents:201).
- Wins are public: *"once announced, the winners will be shown on the specific listings too"* (faq:99).
- The agent has its own public face. Registration takes only `{"name":"my-agent-name"}` (agents:52) and returns a *"username
  (agent talent profile slug)"* (agents:62). *"Agent profile pages continue to show submissions created by that agent"* (agents:203).
- But the claim *"links the agent to the human and transfers submissions to the human for payout eligibility"* (agents:212).
- [RENDERED: absent] Neither page lists the profile's fields, says whether a first or last name is public, or offers a
  display name, a handle-only mode or a privacy setting.
- [INFERENCE] After a claim, the win belongs to the human's account, so the winner line may show the human, not the agent.
  The verify stage's code reading agrees: the talent schema requires `firstName` and `lastName`, and `claim.ts:98-103` moves
  the agent's submissions to the claimant (`verdicts.json`). What the public profile or winner line *renders* is unread.

**(4) The agents page** [RENDERED]
- Register: *"Create an agent identity, receive an API key, and generate a claim code."* (agents:13). The response returns
  `apiKey`, `claimCode`, `agentId` and `username` (agents:56-62).
- Access: *"Only listings with agentAccess = AGENT_ALLOWED or AGENT_ONLY accept agent submissions."* (agents:183). AGENT_ONLY
  listings are *"hidden from normal listing feeds"* (agents:185). The refusal messages are at agents:242-244.
- Claim: *"A human operator verifies output and claims the reward with the claim code."* (agents:22). The human signs in at
  `/earn/claim/<claimCode>` (agents:195-197). The API claim takes a *"human-privy-token"* (agents:209).
- Rate limits (agents:216-222): per hour, 60 registrations per IP, 60 submissions and 120 comments per agent; 20 claims per user per 10 min.
- *"For project listings, telegram is required"* (agents:112) and *"For non-project listings, telegram is optional"* (agents:118).
  Also *"Avoid submitting X links unless you control the account"* (agents:234). Plagiarism means disqualification (agents:236).
- [INFERENCE] No disclosure text is asked for. Disclosure is by construction: only agent-eligible listings take agent
  entries, and the agent's profile keeps showing them (agents:183, :203).
- The human's part is a sign-in and a completed profile (agents:195-199), plus a Telegram URL for projects only (agents:114).
  This page names no wallet or KYC step and no separate payout rule for agent wins. [INFERENCE] Once a claim transfers the
  submissions (agents:212), an agent's win pays like the human's own win, under faq:55 and faq:57.

**(5) Rails and currencies** [RENDERED] The page promises *"their first crypto"* (agents:6). External sponsors pay *"the
wallet associated with the winner's Superteam Earn account"* (faq:57); a team is paid to one member's *"wallet address"*
(faq:94); the Superteam class pays *"within 7 days of submitting the form"* (faq:55). [RENDERED: absent] USDC, SOL, a chain,
gas, and whether the wallet is self-custodied or created by Privy. [INFERENCE] Sign-in is Privy (agents:209, html:1), and the
verify stage read in code that completing the profile creates a Privy Solana wallet (`complete-profile/route.ts:178-183`).
Gas stays on the User (terms :184-186).

**(6) Fees** [RENDERED: absent] Neither page names a fee. The HTML's "fee" hits are other words (feel free, feed, feedback).
The terms' open fee clause (:140-142) still has no amount, and the verify stage found no solver-side fee in the payment code.

**Q6 applied literally**
- Does a legal name show publicly? **No rendered source says** which name the profile or winner line displays (section 3
  above), and none offers a brand display option.
- So the §6.5 name kill **stays UNKNOWN**. It has not fired, because no page renders a legal-name byline. It has not lifted,
  because no page shows a display option. Q6a lifts it only on a positive showing, so admission stays barred until then.
- [INFERENCE] The terms have no real-name clause (T2a grep). Whether the brand may fill the name fields is therefore an honesty
  call for the board, not a bar in the terms.
- The KYC leg cannot fire §6.5. KYC is confirmed only for the Superteam/Solana class (faq:55), which T1 excludes. The external
  class "generally" pays the wallet with no KYC (faq:57). Its per-sponsor exception is a listing to skip when stated.

**Verdict for T2 (Superteam Earn): NEEDS_MORE**

All three T2 sources are now read. KYC and country pass. KYC binds only the Superteam/Solana-sponsored class, which T1 already
filters out, and nothing bars an Israeli resident beyond sanctions and illegality. The brand question does not pass. Wins are
public (faq:99) and move to the claimant (agents:212), yet no page says whether the talent profile or winner line shows the
claimant's first and last name. That leaves the §6.5 kill UNKNOWN under Q6a, and T2 has nothing further to render.

**Next check (T3, ZERO-TESTS row 31):** attach `SuperteamDAO/earn` read-only. Read the public talent-profile page and the
listing winners component: does each render `firstName`/`lastName` or only a username for a claimed agent's win, and does any
display-name or privacy field exist? A code read, not a render of anyone's profile, so no third party's name is captured.
