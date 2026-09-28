# Pebble appstore + KiezelPay (candidate 19) — the pre-registered kill, applied

**Status: KILLED 28.9.2026 on the pre-registered kill** (`research/breadth/BOARD.md` Q1 amendment 2; `docs/REJECTED.md`,
28.9 breadth-board paragraph). Read from render-watch commit `815c2e5`; both captures HTTP 200, fetched
2026-09-28T13:17:54Z (FAQ) and 13:17:57Z (faces). Only the "not onboarded in 2026" clause is needed; the fee clause is
reported for the record.

## What was read
- `research/rendered/kiezelpay-faq.txt` (239 lines, full text; the `.html` was grepped for anything the text dropped: it
  adds nothing on dates, Pebble, Israel or identity).
- `research/rendered/repebble-faces.txt` (87 lines). **Not a JS shell:** the Next.js page ships server-rendered cards
  and an `initialData` block — four collections of six faces each, with heart counts. No prices or paid markers appear.

## Findings
**1. Pebble onboarding in 2026 — not shown.** [RENDERED]
- The FAQ carries no date after 2016 and never says "2025", "2026", "rePebble", "Rebble" or "Core Devices" (grep, both files).
- Pebble appears twice, both historical or customer-side: "installed the Fitbit, Connect IQ (Garmin) or Pebble app"
  (`kiezelpay-faq.txt:115`); "then with KiezelPay in 2016 (with the Pebble app Snowy being the first app to be sold with
  our system in December 2016)" (`:221`).
- The developer section names one platform as open to sign-up, and it is Garmin: "Can I use KiezelPay to sell watchfaces
  or apps on Garmin watches? Yes! We also have a Garmin library. Sign up..." (`:229-231`). No Pebble equivalent exists.
- Customer troubleshooting covers Fitbit (`:50-56`, `:83`) and Garmin (`:85`) only. [INFERENCE] Pebble is legacy in
  KiezelPay's own support material; whether its library runs on the 2026 hardware is not stated anywhere read.

**2. Fees to the developer.** [RENDERED]
- Up front: "There is no cost to start using KiezelPay." Per sale: "KiezelPay does, however, take a 27% fee for each
  purchase with a minimum of $0.27 USD." (`:198`)
- Card surcharge: "Merchants can choose to charge the $0.30 extra fee to the customer, or absorb this fee themselves." (`:126`)
- No listing, monthly or subscription fee on the developer side (`:64` "There are no subscriptions" is buyer-side).

**3. Payout.** [RENDERED] "Currently we only do payouts via PayPal. Developers are paid out every last thursday of the
month through a verified PayPal account. We will not send your income via any other source." (`:227`). No country list;
Israel is not mentioned. Income tax is the developer's own (`:223`). No identity or camera step is described by KiezelPay;
the only verification named is PayPal's, whose selfie question is loop row 21's, not this file's.

**4. Buyer supply on the rePebble faces page.** [RENDERED] An active store: "Spring 2026 Pebble App Contest" banner
(`repebble-faces.txt:3`), device "Pebble Time 2" (`:5`). Sections: "Top Picks (changes daily)" (`:9`), "All Watchfaces"
(`:29`, six faces with 3-57 hearts, `:32-47`), "Most Loved" (`:49`, 8.2K-22.5K hearts, `:52-67`), "Rebble Appstore Feed"
(`:69`, links out to `apps.rebble.io`). [INFERENCE] New faces are listed: the Rebble-feed IDs are MongoDB ObjectIds whose
timestamps decode to 23-27.9.2026, and the "All" cards' low heart counts look recent; the sort of "All" is not shown (its
SEE ALL page was not rendered). Ranking is by hearts and a daily pick; "Most Loved" is held by faces whose IDs decode to 2013-2015 [INFERENCE]. Hearts
are not sales, and neither page shows what share of faces is paid.

## The pre-registered kill, applied literally
- **Clause A — "does not show Pebble apps being onboarded in 2026": FIRES.** No 2026 date, no rePebble/Core Devices
  mention, and the one "can I sell on X" answer is Garmin (`kiezelpay-faq.txt:229`); Pebble's latest dated mention is
  December 2016 (`:221`).
- **Clause B — "shows any fee": fires on its literal words, not on its intent.** The FAQ uses the word "fee" for a 27% cut
  (`:198`), but that is a share out of a sale beside "no cost to start"; under the ₪0-up-front gate it would pass. Not
  needed: clause A alone kills.
- Gates the kill does not reach stay UNKNOWN: programmatic listing (the sweep's `pebble publish --non-interactive`, github
  grade, is not re-verified here), AI terms (neither page says), Israel (not named).

**Verdict for candidate 19 (Pebble + KiezelPay): FAILS_TEST**
The pre-registered kill fires on its first clause: KiezelPay's FAQ shows Pebble only as a 2016 origin story and a
customer-side app name, and offers sign-up for Garmin, not Pebble. The fee clause fires only on its literal word (a 27%
per-sale share, $0.27 minimum, with "no cost to start"). The rePebble store is alive in 2026 and does list new faces, but
that is demand without a documented money rail. Per the board, Pebble is dead without another sitting; no next check.
Reopen only on `REJECTED.md`'s trigger: KiezelPay or a successor documents Pebble unlocks with Israel payable and no
camera. Row 21 (PayPal Israel) continues on its own for Spreadshirt and GameMonetize.
