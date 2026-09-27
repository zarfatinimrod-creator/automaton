/**
 * Revenue Colony — Algora OSS bounties, build #2.
 *
 * Four pure modules and nothing wired: `policy.ts` reads a repository's own
 * contribution policy, `intake.ts` decides which funded bounties the colony may
 * attempt, `disclosure.ts` writes the pull request body every attempt carries,
 * and `supply.ts` counts the claimable bounties the payer has posted (BOARD-2
 * §2.2). Its GitHub half, `supply-github.ts`, is a CI tool run weekly by
 * `algora-supply.yml` through `scripts/algora-supply.ts`, and is not re-exported;
 * its reading reaches the colony only as a measurement file (`measurements.ts`).
 *
 * **Nothing here runs on the heartbeat, deliberately.** The line is blocked on
 * owner step 7 (the brand machine account, whose token is `BRAND_GITHUB_TOKEN`)
 * and owner step 4 (Stripe Connect Express through Algora, done signed in as that
 * account). A loop that attempted a bounty before those exist would open a pull
 * request under the owner's GitHub handle — the single correction BOARD.md §5
 * made to this line, and a byline the mandate forbids. Money still counts only
 * when an Algora payout lands in `revenue_ledger` with its transaction id.
 */

export * from "./policy.js";
export * from "./intake.js";
export * from "./disclosure.js";
export * from "./supply.js";
