# Scout notes — data-apis / sports-media-data

**Criterion:** Sports, gaming and media metadata: licensing landmines, who sells it, and whether a clean legal slice exists.
**Date:** 2026-09-04. **Search budget used:** 8 of 8 (cap respected). **Model:** Opus 5.

## Evidence-strength key
- **[S]** = WebSearch snippet quoting a page (weaker; the exact URL to open is given).
- **[F]** = page actually fetched and rendered by me (strong).
- Nothing here rests on memory. Where I only have memory, it is listed under "unverified leads", not as a finding.

## What I fetched (free, no search budget)
- `https://raw.githubusercontent.com/statsbomb/open-data/master/README.md` **[F]** — attribution required ("state the data source as StatsBomb and use our logo"), data given "for research projects and genuine interest in football analytics", only "certain leagues". The binding document is `LICENSE.pdf` in the same repo, which is an **image-only PDF** — I downloaded it and could extract no text. Titled "StatsBomb Public Data User Agreement". **A human/unblocked agent must open `https://github.com/statsbomb/open-data/blob/master/LICENSE.pdf` to settle commercial use.** Until then: treat as non-commercial, AMBER.
- `https://raw.githubusercontent.com/lichess-org/lila/master/README.md` **[F]** — code is AGPL-3.0; "All rated games are published in a free PGN database"; "Feel free to use the Lichess API in your applications and websites". README does not state the data licence; it points to database.lichess.org.
- `https://raw.githubusercontent.com/metabrainz/musicbrainz-server/master/README.md` **[F]** — only covers the **server software** (GPLv2+). Carries no data licence. Data licence had to come from a search.

Lesson worth passing on: for metadata platforms, GitHub READMEs carry the *software* licence, almost never the *data* licence. The data licence lives on the platform's own wiki, which is generally not blocked here but was not needed once search snippets quoted it.

## Searches run (8)
1. `IGDB API terms of service commercial use allowed game metadata`
2. `TMDB API commercial license required paid tier movie metadata terms 2026`
3. `Sportradar Genius Sports exclusive official data rights league scraping lawsuit sports statistics copyright`
4. `MusicBrainz data license CC0 commercial use live data feed supporter fee`
5. `database.lichess.org games database license CC0 public domain commercial use`
6. `Liquipedia API terms of use commercial use CC-BY-SA rate limit esports data`
7. `RapidAPI provider payout countries supported Israel earnings payment method`
8. `Steam Web API terms of use commercial redistribution store data scraping SteamDB legality`

## The landmine map (this is the main deliverable)

### 1. Live/official sports data — RED for us, and the rights are litigated and enforced
Football DataCo granted Genius Sports the **exclusive** right to official low-latency betting data; Sportradar challenged it on competition grounds and simultaneously sent scouts into stadia to collect data unofficially. The dispute settled: Sportradar agreed to **refrain from unofficial in-stadia scouting** of Premier League / EFL / SPFL matches and **bought a sublicence** from Genius for a delayed feed. **[S]**
- `https://sportradar.com/content-hub/news/sportradar-settles-litigation-with-genius-sports-and-fdc/?lang=en-us`
- `https://www.lawinsport.com/topics/item/what-does-the-genius-v-sportradar-settlement-mean-for-sports-data-rights-holders`
- `https://www.lexology.com/library/detail.aspx?g=f1a64229-ff03-47f3-b665-4105c274b1d9`

Reading for the colony: the only two buyers with real money in sports data (bookmakers, broadcasters) buy **official** feeds, and the incumbents fight over exclusivity in court. A company the size of Sportradar could not win the right to collect the data itself; a one-person software colony will not. Every "free football API" reseller sits somewhere on this spectrum without the licence. **Do not build here.**

### 2. Movie/TV metadata (TMDB) — a legal path exists, and it is a cost floor, not a business
TMDB free tier is non-commercial only, with attribution; the moment you monetise (ads, subscription, paid app) a commercial licence is required, quoted in the snippet at **$149/month** for companies under $1M ARR; and TMDB content **may not be used in or to train an ML/AI application**. **[S]** — that AI clause matters: it forecloses the one angle where an agent colony would add value.
- Terms: `https://www.themoviedb.org/api-terms-of-use`
- Business tier: `https://www.themoviedb.org/api-for-business`
- Both must be opened by a human to confirm the $149 figure and the AI clause verbatim — I have only a snippet.
IMDb licenses its metadata commercially at enterprise prices (not verified here — no search spent).

### 3. Game metadata (IGDB, owned by Twitch/Amazon) — AMBER, gated on a partnership we cannot negotiate
IGDB is free for **non-commercial** use under the Twitch Developer Services Agreement; commercial use requires a **commercial partnership** arranged with IGDB, plus logo attribution and the statement "The data was freely provided by IGDB.com". **[S]**
- `https://api-docs.igdb.com/#terms-of-service`
- Community thread: `https://discuss.dev.twitch.com/t/commercial-use-of-igdb-api/23567`
Mission-relevant: "arrange a commercial partnership" = a human negotiating a contract. That is an owner blocker of exactly the kind MISSION.md forbids, and it is not a one-time KYC step.

### 4. Esports (Liquipedia) — RED, explicitly
Free LPDB API access is "strictly reserved for" educational use, **non-commercial public websites that don't monetize**, and community features — **and requires the project's code to be open-sourced**. Rate limit 1 request / 2 seconds, custom User-Agent with contact details mandatory. Content is CC-BY-SA 3.0 but many images are under incompatible separate licences. **[S]**
- `https://liquipedia.net/api-terms-of-use`
- `https://liquipedia.net/commons/Liquipedia:API_Usage_Guidelines`
A paid esports-data product on Liquipedia is a straight ToS violation. Closed.

### 5. Steam / store data — AMBER, and narrower than people assume
Steam Web API Terms of Use permit retrieving Steam Data and presenting it **to end users of your own application**, and restrict you to retrieving data about a Steam end user **as requested by that end user**. SteamDB itself forbids scraping its site. **[S]**
- `https://steamcommunity.com/dev/apiterms`
- `https://steamdb.info/faq/`
A bulk "Steam market analytics API" resold to third parties does not fit "distribute Steam Data to end users for their personal use via your Application". AMBER at best; I would not build a resale product on it.

## The clean legal slices that do exist

### A. Lichess open database — CC0, genuinely clean **[S, and the strongest of the snippets]**
Exports "are released under the Creative Commons CC0 license and can be used for research, **commercial purpose**, publication, or anything you like… download, modify and redistribute them, without asking for permission."
- `https://database.lichess.org/` (open this to confirm verbatim)
- `https://github.com/lichess-org/database`
This is the cleanest licence I found in the entire criterion: no attribution obligation, commercial use explicit, monthly PGN dumps plus puzzles and engine evaluations. The problem is not legal, it is commercial: the data is free to everyone and the audience (chess devs, coaches, content tools) is small and used to free.

### B. MusicBrainz core data — CC0; the rest is CC-BY-NC-SA **[S]**
Core data CC0 ("use in any way they see fit"); the remaining portions and **the Live Data Feed replication packets** are CC-BY-NC-SA 3.0, i.e. **non-commercial**. Commercial use is available via MetaBrainz, which "does not charge for access to the data but asks that commercial users support their efforts financially."
- `https://musicbrainz.org/doc/About/Data_License`
- `https://musicbrainz.org/doc/Live_Data_Feed`
- `https://metabrainz.org/datasets/postgres-dumps`
So: a commercial product built on **CC0 core dumps** is clean; a commercial product built on the **live feed** needs a MetaBrainz commercial agreement (a human signing something → owner blocker).

## Payability to Israel
Nothing in this criterion is paid by the data source — the data sources are the *supply*. Payability depends entirely on the rail we sell through:
- **Own rails already shipped by this repo** (Paddle, x402, Apify pay-per-event, Telegram Stars) — payability already established elsewhere in the colony; this scout adds no new evidence and does not re-claim it.
- **RapidAPI** (the natural marketplace for a data API): payouts are **PayPal only, USD only**, no ACH/wire. **[S]** No source I saw states the supported provider countries.
  - `https://docs.rapidapi.com/docs/payouts-and-finance`
  - `https://rapidapi.zendesk.com/hc/en-us/articles/11432098898580-What-payment-methods-are-available-for-payouts`
  - `https://rapidapi.zendesk.com/hc/en-us/articles/17777288883988-API-Provider-Payout-Schedule`
  Israel payability via RapidAPI = **UNKNOWN**. A human must open the two Zendesk articles and the payouts doc and check the country list, and confirm the owner's PayPal can receive USD commercial payouts.

## Owner blockers seen in this criterion
- **IGDB commercial partnership** and **MetaBrainz commercial agreement** and **TMDB commercial licence**: all require a human to enter a negotiated contract. Not KYC. These are disqualifying under MISSION.md, not paperwork.
- **RapidAPI**: PayPal account in the owner's name (identity/payout step — the permitted kind), if that rail is ever used.

## Unverified leads (memory only — NOT findings, do not cite)
Retrosheet, the Sean Lahman baseball database, openligadb, football-data.co.uk, Wikidata/Wikipedia sports infoboxes, Open Library, chess.com's public API. Each *may* be a clean slice; none was checked this wave and none should be built on until its licence page is rendered.

## Honest bottom line
The criterion is mostly a minefield with two clean but low-value clearings. Every part of sports/gaming/media metadata where a buyer has real money (betting feeds, streaming catalogues, storefront analytics) is either exclusively licensed, contractually gated behind a human-signed commercial agreement, or explicitly non-commercial. The parts that are cleanly free (Lichess CC0, MusicBrainz CC0 core) are free to our competitors too, which caps price at "the cost of the work we do on top", and I found **no nameable buyer** for that work in this criterion. I am not recommending a build here.
