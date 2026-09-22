# The awesome route — curated lists as a research source the proxy does not block

## Why this file exists

The criteria sweep's binding constraint has never been agents. It is the shared WebSearch budget:
roughly 200 calls for the whole session, divided among every agent running at once. 54 criteria are
still unswept, and at 8 searches each that is 432 calls — more than twice what exists.

`sindresorhus/awesome` (added at the owner's request, 3.9.2026) is an index of about 620 curated
lists, and **every one of them lives on GitHub**. GitHub and `raw.githubusercontent.com` are among
the very few hosts this container's egress proxy does not block, and `WebFetch` against them costs
**zero** of the search budget. That makes a curated list the cheapest map of a market a scout can
get here.

## What a curated list is, and what it is not

**It is** a map of what exists: which platforms, tools, marketplaces and datasets a domain contains,
maintained by someone with a reason to keep it current.

**It is not** evidence of demand, of revenue, or of payability to Israel. A list of forty
marketplaces says forty marketplaces exist. It says nothing about whether any of them pays an
Israeli software-only seller, and nothing about whether a buyer is there. A scout that returns "I
found 40 platforms" has found a directory, not a market.

So the route is a first step, never a finding:

1. Read the list to enumerate the field — free, no search budget.
2. Pick the two or three entries that could plausibly clear the mission's gates.
3. Spend the scarce searches, and the GitHub fetches, on **those** — terms, payout countries,
   pricing, ranking mechanics.

A finding sourced only to "it appears in awesome-X" is `low` confidence by construction and must say
so.

## The map — unswept criterion groups to the lists worth opening first

Every URL below is a GitHub repo, so `WebFetch` on
`https://raw.githubusercontent.com/<owner>/<repo>/master/readme.md` (or `main`, or `README.md`)
renders it without touching the search budget.

### `distribution` (0/8) — the group MISSION constraint 7 depends on

Constraint 7 says a line may not be built before its acquisition channel is named. This group is
where those channels are supposed to come from, and it is unswept. These two lists are the most
directly useful entries in the whole index for us:

| List | What it should answer |
|---|---|
| [mmccaff/PlacesToPostYourStartup](https://github.com/mmccaff/PlacesToPostYourStartup) | A maintained enumeration of launch and directory channels. Read it against `docs/REJECTED.md` constraint 3 first: anything that amounts to posting in a community is closed to us, so the value here is the subset that is a **submission**, not a post. |
| [tramcar/awesome-job-boards](https://github.com/tramcar/awesome-job-boards) | Niche job boards, which double as the clearest public evidence of which verticals have money and a concentrated audience. Feeds `vertical-niches` as much as `distribution`. |
| [mezod/awesome-indie](https://github.com/mezod/awesome-indie) | Independent developer businesses — the closest thing in the index to our own operating model, and a source of income shapes rather than platforms. |

### `plugin-ecosystems` (0/8)

| List | What it should answer |
|---|---|
| [fregante/Awesome-WebExtensions](https://github.com/fregante/Awesome-WebExtensions) | The extension ecosystem's tooling. Note the Chrome Web Store is already rejected twice in `docs/REJECTED.md` — read this for Firefox and Edge, and for what a paid extension actually needs. |
| [zenitysec/awesome-low-code](https://github.com/zenitysec/awesome-low-code) | Low-code platforms, most of which have plugin or template marketplaces, and whose users buy rather than build. |
| [stn1slv/awesome-integration](https://github.com/stn1slv/awesome-integration) | Integration platforms — the shape of `productized-services/api-middleware` too. |
| [naimo84/awesome-nodered](https://github.com/naimo84/awesome-nodered), [frenck/awesome-home-assistant](https://github.com/frenck/awesome-home-assistant) | Two ecosystems with large plugin catalogues and no store cut. Check whether either has a paid tier at all before spending a search. |
| [shopify/awesome-hydrogen](https://github.com/shopify/awesome-hydrogen) | Shopify's own list. Remember the open payability gate: Shopify Partner payouts to Israel are UNKNOWN and block every Shopify-billed proposal. |

### `data-apis` (0/8)

| List | What it should answer |
|---|---|
| [awesomedata/awesome-public-datasets](https://github.com/awesomedata/awesome-public-datasets) | The field of public datasets. Our angle is not "another dataset index" — it is a dataset that is public but **unusable without work**, which is what `products/apify-il-open-data` already sells. |
| [MobilityData/awesome-transit](https://github.com/MobilityData/awesome-transit) | Transit data standards and APIs, directly matching `data-apis/transport-weather`. |
| [osmlab/awesome-openstreetmap](https://github.com/osmlab/awesome-openstreetmap) | Geo and address data — `data-apis/geo-address` — and the licensing terms that decide whether a derived product is sellable. |
| [shi-rudo/awesome-stock-trading](https://github.com/shi-rudo/awesome-stock-trading) | Financial data sources for `data-apis/financial-data`. Treat trading strategy content as out of scope; the criterion is the data, not the trade. |

### `licensing-ip` (0/8)

| List | What it should answer |
|---|---|
| [brabadu/awesome-fonts](https://github.com/brabadu/awesome-fonts), [chrissimpkins/codeface](https://github.com/chrissimpkins/codeface) | `licensing-ip/fonts-icons` — and specifically how font licences are actually sold, which is the only part with money in it. |
| [notlmn/awesome-icons](https://github.com/notlmn/awesome-icons) | Icon sets, their licences, and which are commercial. |
| [neutraltone/awesome-stock-resources](https://github.com/neutraltone/awesome-stock-resources) | `licensing-ip/stock-media`. The list is mostly free sources, which is itself the finding: it maps the price floor. |
| [ciconia/awesome-music](https://github.com/ciconia/awesome-music) | `licensing-ip/music-sfx`. |

### `crypto-native` (5/8)

| List | What it should answer |
|---|---|
| [golemfactory/awesome-golem](https://github.com/golemfactory/awesome-golem) | A peer-to-peer marketplace for compute — the closest public analogue to selling the colony's own spare capacity, for `crypto-native/infra-services`. |
| The Decentralized Systems section of `awesome` | Seventeen chains with their own grant programmes, feeding `crypto-native/crypto-tooling-grants`. Read the section, not each chain. |

### `content-seo` (0/8) — where this route is weakest, said plainly

`awesome` has almost nothing on SEO, affiliate networks or ad networks. The one relevant entry is
[zudochkin/awesome-newsletters](https://github.com/zudochkin/awesome-newsletters) for
`content-seo/newsletters-communities`. **This group will not be answered from GitHub** and needs the
scarce searches more than any other. Plan the budget around that rather than discovering it
mid-wave.

### Cross-cutting, for groups already swept

[kdeldycke/awesome-billing](https://github.com/kdeldycke/awesome-billing) — payments, invoicing,
pricing, accounting, marketplace and fraud. It is the single richest entry in the index for this
project, and it is worth reading against `payment-rails` even though that group is closed: its
audit found all six ceilings at ₪0 and four cited URLs that did not support their claims, so the
group is finished, not confident.

## The rule for scouts

Rule 9 of the scout brief now carries this route. In short:

> Before spending a search, ask whether a curated list already maps this field. If it does, read the
> list first, then spend the searches on the two or three entries that could actually clear the
> mission's gates. Cite the list as a directory, never as evidence of demand.
