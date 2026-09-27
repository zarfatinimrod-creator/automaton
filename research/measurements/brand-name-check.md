# The brand name — "Bediyuk" is taken; the colony still owes the owner a name

**Status: MEASURED 27.9.2026 from a GitHub runner. The 3.9 recommendation is withdrawn.**

## Why this matters
Every owner step that makes something public carries the brand, not the owner's name (MISSION.md, anonymity):
- the Gumroad store name (step 3: *"בשם החנות תכתוב את שם המותג שאני אתן לך"*);
- the Apify username (step 6);
- the domain (step 5);
- the GitHub organisation and its machine account (step 7);
- the YouTube Brand Account, if the experiment ever reaches Stage A.

The owner steps promise the name will be given. On 3.9.2026 the checkpoint recommended **בדיוק / Bediyuk**. It was marked *"not approved yet, waiting for the owner's domain and trademark check"* (`logs/CHECKPOINT.md`, 3.9 section). That check never ran. A runner can do the availability half of it, and did.

## What the registries answered (render-watch, dispatched 27.9.2026 09:56 UTC)

| Lookup | Where the URL comes from | Answer | Meaning |
|---|---|---|---|
| `https://rdap.verisign.com/com/v1/domain/bediyuk.com` | IANA's RDAP bootstrap lists `https://rdap.verisign.com/com/v1/` for `com` (`research/rendered/iana-rdap-dns.json`) | **200**: `BEDIYUK.COM`, registered 2026-05-27, expires 2027-05-27, registrar Gname 408 Inc, status `client transfer prohibited` (`research/rendered/rdap-bediyuk-com.json`) | **Taken.** The colony has never bought a domain, so it is not ours. |
| `https://api.github.com/users/bediyuk` | GitHub's REST API | **404** (`github-user-bediyuk.meta.json`) | Free on GitHub. |
| `https://www.youtube.com/@bediyuk` | the handle URL form | **200**: an existing channel, `canonicalBaseUrl` `/@bediyuk`, whose title describes **an Israeli marketing and branding business named Bediyuk** (`youtube-handle-bediyuk.meta.json`; page body removed, because it is a private person's page) | **Taken, and by a business in the same country and a neighbouring trade.** |

## Verdict
**Do not use Bediyuk.** Someone else holds the `.com`. More importantly, an Israeli marketing and branding business already trades under the name on YouTube. The colony would be selling Israeli business tools under that name, into the same market, and that invites confusion and a trademark dispute nobody needs. Nothing depends on the name yet:
- `@bediyuk/mcp-il-tools` was never published, and npm returns 404 for it;
- `server.json`'s `com.bediyuk/il-tools` and `bediyuk.co.il` were never registered or listed.

## What follows
1. **Candidates, checked the same way.** Every candidate is looked up from a runner:
   - `.com` via RDAP: 404 = unregistered;
   - GitHub user or org: 404 = free;
   - YouTube `@handle`: a missing page;
   - one web search for an existing business under the name.
2. **The choice goes to Fable.** It is long-lived and public, the model rule's class. The owner can veto it; the owner is not asked to research it.
3. **Then one sweep renames the placeholders:**
   - `products/mcp-il-tools/{package.json,package-lock.json,server.json,README.md}`;
   - the `@bediyuk` mention in `src/revenue/portfolio.ts`;
   - the owner steps get the name they promise.
4. **Trademark.** A registry search (ILPO, USPTO) is not reachable from here, and was the owner-facing half of the 3.9 check. It stays on the owner's side as a veto, not a task: a name with a web-visible business behind it is rejected before it reaches the owner.
