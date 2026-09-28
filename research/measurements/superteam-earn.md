# Superteam Earn: measurements (CHANNEL_LOOP §4 row 15; RULING-2026-09-28-bounty-rail.md §6.3, T1-T4)

**Status (28.9.2026):** T2 is **partial**. The terms-of-use PDF has been read (this section). The FAQ and agents-page
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
