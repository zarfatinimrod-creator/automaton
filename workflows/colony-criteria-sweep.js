// GENERATED FILE - do not edit by hand.
// Source of truth: src/revenue/criteria.ts (the criteria) and
// src/revenue/sweep-workflow.ts (the prompts and schemas).
// Regenerate: pnpm exec tsx scripts/gen-sweep-workflow.ts
//
// The revenue colony's chain of command, run as one workflow:
//   112 scouts (one per criterion) -> 14 supervisors (one per group)
//   -> 14 auditors (one per supervisor) -> chief auditor -> board.

export const meta = {
  name: 'colony-criteria-sweep',
  description: '112 scout agents search one income criterion each; a supervisor per criterion group, an auditor per supervisor, then chief auditor and board',
  phases: [
    { title: 'Scouts', detail: '112 workers, one per criterion, across 14 groups' },
    { title: 'Supervisors', detail: 'one supervisor per criterion group: dedupe, score, reject' },
    { title: 'Auditors', detail: 'one auditor per group, adversarially refuting the supervisor' },
    { title: 'Board', detail: 'chief auditor then board: portfolio decisions' },
  ],
}

const MISSION = [
  "MISSION (repo /home/user/automaton, MISSION.md is binding):",
  "- The owner does NOTHING. He does not talk to people, does not appear on camera, does not sell, does not do manual ops. Everything must be built and run by software agents.",
  "- Unavoidable exceptions are ONLY one-time identity/KYC/payout steps that a platform legally requires of a human. Catalogue those precisely as ownerBlockers; never invent extra ones; never assume they are done.",
  "- Target: 20,000 ILS/month, then 50,000 ILS/month, recorded in a ledger with real platform transaction ids. Projections are not revenue.",
  "- The owner is an Israeli resident. Payability to Israel is a hard gate: a line that cannot pay an Israeli is worth zero however good the idea.",
  "- Constitution: honest value only. No spam, no scams, no fake reviews, no engagement farming, no ToS violations, no deceiving a buyer. This outranks the revenue target.",
  "- Already shipped: products/il-biz-tools (free Hebrew calculators plus a small Pro tier via Paddle), products/telegram-il-tools-bot (Telegram Stars), products/apify-il-open-data (Apify pay-per-event), products/x402-il-api (paid API over x402)."
].join('\n')

const SCOUT_RULES = [
  "RULES:",
  "1. Load web tools first: ToolSearch with query \"select:WebSearch,WebFetch\". The container has no outbound network, but those tools work. curl will fail; do not use it.",
  "2. Every finding needs at least one real URL you actually fetched or a search result you actually saw, with a date. Never invent a number, a price, a user count or a revenue figure. \"unknown\" is a valid, useful answer.",
  "3. Judge payability to Israel explicitly (YES / NO / UNKNOWN) with evidence. A NO is a first-class finding, not a failure.",
  "4. Judge ToS/legal risk: GREEN (clearly permitted), AMBER (unclear or restricted), RED (violates terms, law, or our constitution). Never recommend AMBER or RED as a build.",
  "5. Prefer things a software-only operation can ship in under 40 hours and that a specific, nameable buyer pays for. Say who the buyer is. \"Everyone\" means you have not found the buyer.",
  "6. Report dead ends. A criterion that is genuinely empty is worth knowing and saves the colony from re-searching it.",
  "7. Aim for at least 5 findings; if the criterion honestly yields fewer, say so in deadEnds rather than padding."
].join('\n')

const SCOUT_SCHEMA = {
  "type": "object",
  "properties": {
    "criterion": {
      "type": "string"
    },
    "searchesRun": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "findings": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string"
          },
          "whatItIs": {
            "type": "string"
          },
          "buyer": {
            "type": "string",
            "description": "the specific person or company that pays"
          },
          "demandEvidence": {
            "type": "string"
          },
          "evidenceUrls": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "moneyModel": {
            "type": "string"
          },
          "pricePointIls": {
            "type": "string"
          },
          "monthlyCeilingIls": {
            "type": "number",
            "description": "honest ceiling for a no-brand new entrant"
          },
          "buildHours": {
            "type": "number"
          },
          "ownerBlockers": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "israelPayable": {
            "type": "string",
            "enum": [
              "YES",
              "NO",
              "UNKNOWN"
            ]
          },
          "tosRisk": {
            "type": "string",
            "enum": [
              "GREEN",
              "AMBER",
              "RED"
            ]
          },
          "competition": {
            "type": "string"
          },
          "killCriteria": {
            "type": "string"
          },
          "confidence": {
            "type": "string",
            "enum": [
              "high",
              "medium",
              "low"
            ]
          }
        },
        "required": [
          "name",
          "whatItIs",
          "buyer",
          "demandEvidence",
          "evidenceUrls",
          "moneyModel",
          "monthlyCeilingIls",
          "buildHours",
          "israelPayable",
          "tosRisk",
          "confidence"
        ]
      }
    },
    "deadEnds": {
      "type": "array",
      "items": {
        "type": "string"
      }
    }
  },
  "required": [
    "criterion",
    "findings",
    "deadEnds"
  ]
}

const SUPERVISOR_SCHEMA = {
  "type": "object",
  "properties": {
    "group": {
      "type": "string"
    },
    "headline": {
      "type": "string",
      "description": "one honest sentence: is there money in this group at all?"
    },
    "ranked": {
      "type": "array",
      "description": "at most 6, best first",
      "items": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string"
          },
          "pitch": {
            "type": "string"
          },
          "buyer": {
            "type": "string"
          },
          "moneyModel": {
            "type": "string"
          },
          "monthlyCeilingIls": {
            "type": "number"
          },
          "buildHours": {
            "type": "number"
          },
          "ownerBlockers": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "israelPayable": {
            "type": "string",
            "enum": [
              "YES",
              "NO",
              "UNKNOWN"
            ]
          },
          "tosRisk": {
            "type": "string",
            "enum": [
              "GREEN",
              "AMBER",
              "RED"
            ]
          },
          "evidenceUrls": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "score": {
            "type": "number",
            "description": "0-100: evidence x payability x feasibility x margin"
          },
          "whyThisRank": {
            "type": "string"
          },
          "firstStep": {
            "type": "string",
            "description": "the single next action a software agent takes"
          },
          "killCriteria": {
            "type": "string"
          }
        },
        "required": [
          "name",
          "pitch",
          "buyer",
          "moneyModel",
          "monthlyCeilingIls",
          "buildHours",
          "israelPayable",
          "tosRisk",
          "score",
          "firstStep",
          "killCriteria"
        ]
      }
    },
    "rejected": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string"
          },
          "reason": {
            "type": "string"
          }
        },
        "required": [
          "name",
          "reason"
        ]
      }
    },
    "ownerBlockersFound": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "scoutsWeak": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "criteria whose scout returned thin or unsourced work"
    }
  },
  "required": [
    "group",
    "headline",
    "ranked",
    "rejected",
    "ownerBlockersFound"
  ]
}

const AUDIT_SCHEMA = {
  "type": "object",
  "properties": {
    "group": {
      "type": "string"
    },
    "verdicts": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string"
          },
          "verdict": {
            "type": "string",
            "enum": [
              "CONFIRMED",
              "DOWNGRADED",
              "REFUTED"
            ]
          },
          "why": {
            "type": "string"
          },
          "correctedCeilingIls": {
            "type": "number"
          },
          "correctedIsraelPayable": {
            "type": "string",
            "enum": [
              "YES",
              "NO",
              "UNKNOWN"
            ]
          },
          "unsupportedClaims": {
            "type": "array",
            "items": {
              "type": "string"
            }
          }
        },
        "required": [
          "name",
          "verdict",
          "why"
        ]
      }
    },
    "supervisorErrors": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "missedAngles": {
      "type": "array",
      "items": {
        "type": "string"
      }
    }
  },
  "required": [
    "group",
    "verdicts",
    "supervisorErrors",
    "missedAngles"
  ]
}

const CHIEF_SCHEMA = {
  "type": "object",
  "properties": {
    "auditorsWhoRubberStamped": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "survivingCandidates": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string"
          },
          "group": {
            "type": "string"
          },
          "correctedCeilingIls": {
            "type": "number"
          },
          "israelPayable": {
            "type": "string",
            "enum": [
              "YES",
              "NO",
              "UNKNOWN"
            ]
          },
          "tosRisk": {
            "type": "string",
            "enum": [
              "GREEN",
              "AMBER",
              "RED"
            ]
          },
          "evidenceQuality": {
            "type": "string",
            "enum": [
              "strong",
              "adequate",
              "thin"
            ]
          },
          "why": {
            "type": "string"
          }
        },
        "required": [
          "name",
          "group",
          "correctedCeilingIls",
          "israelPayable",
          "tosRisk",
          "evidenceQuality",
          "why"
        ]
      }
    },
    "systemicProblems": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "ownerBlockerCatalogue": {
      "type": "array",
      "items": {
        "type": "string"
      }
    }
  },
  "required": [
    "survivingCandidates",
    "systemicProblems",
    "ownerBlockerCatalogue"
  ]
}

const BOARD_SCHEMA = {
  "type": "object",
  "properties": {
    "verdict": {
      "type": "string",
      "description": "the honest one-paragraph answer to: can this portfolio reach 20,000 ILS/month, and by when?"
    },
    "buildNow": {
      "type": "array",
      "description": "at most 8 lines to build immediately, in order",
      "items": {
        "type": "object",
        "properties": {
          "lineId": {
            "type": "string",
            "description": "kebab-case id suitable for src/revenue/portfolio.ts"
          },
          "nameHe": {
            "type": "string"
          },
          "nameEn": {
            "type": "string"
          },
          "thesis": {
            "type": "string"
          },
          "buyer": {
            "type": "string"
          },
          "moneyModel": {
            "type": "string"
          },
          "targetMonthlyIls": {
            "type": "number"
          },
          "firstStep": {
            "type": "string"
          },
          "buildHours": {
            "type": "number"
          },
          "ownerSetup": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "killCriteria": {
            "type": "string"
          },
          "scaleCriteria": {
            "type": "string"
          },
          "evidenceUrls": {
            "type": "array",
            "items": {
              "type": "string"
            }
          }
        },
        "required": [
          "lineId",
          "nameHe",
          "nameEn",
          "thesis",
          "buyer",
          "moneyModel",
          "targetMonthlyIls",
          "firstStep",
          "buildHours",
          "ownerSetup",
          "killCriteria",
          "scaleCriteria"
        ]
      }
    },
    "changeExisting": {
      "type": "array",
      "description": "changes to the lines already in src/revenue/portfolio.ts",
      "items": {
        "type": "object",
        "properties": {
          "lineId": {
            "type": "string"
          },
          "action": {
            "type": "string",
            "enum": [
              "keep",
              "retarget",
              "pivot",
              "kill"
            ]
          },
          "newTargetIls": {
            "type": "number"
          },
          "why": {
            "type": "string"
          }
        },
        "required": [
          "lineId",
          "action",
          "why"
        ]
      }
    },
    "rejectedWithReasons": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string"
          },
          "reason": {
            "type": "string"
          }
        },
        "required": [
          "name",
          "reason"
        ]
      }
    },
    "ownerChecklist": {
      "type": "array",
      "description": "the complete ordered list of one-time human steps, shortest possible",
      "items": {
        "type": "object",
        "properties": {
          "step": {
            "type": "string"
          },
          "platform": {
            "type": "string"
          },
          "unlocksIls": {
            "type": "number"
          },
          "minutes": {
            "type": "number"
          }
        },
        "required": [
          "step",
          "platform",
          "unlocksIls"
        ]
      }
    },
    "repoAdditions": {
      "type": "array",
      "description": "concrete things to add to this repo: skills, agents, tests, watchdogs, tools",
      "items": {
        "type": "object",
        "properties": {
          "path": {
            "type": "string"
          },
          "what": {
            "type": "string"
          },
          "why": {
            "type": "string"
          },
          "priority": {
            "type": "string",
            "enum": [
              "P0",
              "P1",
              "P2"
            ]
          }
        },
        "required": [
          "path",
          "what",
          "why",
          "priority"
        ]
      }
    },
    "pathTo20k": {
      "type": "string",
      "description": "the arithmetic: which lines, what each contributes, over what period"
    }
  },
  "required": [
    "verdict",
    "buildNow",
    "changeExisting",
    "rejectedWithReasons",
    "ownerChecklist",
    "repoAdditions",
    "pathTo20k"
  ]
}

const ALL_GROUPS = [
  {
    "id": "storefronts",
    "title": "Storefronts and marketplaces that pay an Israeli software-only seller",
    "criteria": [
      [
        "gumroad",
        "Gumroad in 2026: fee structure, payout countries and rails for Israel, which digital product categories actually sell and at what price, evidence of real seller earnings, and what Gumroad forbids."
      ],
      [
        "lemonsqueezy-payhip",
        "Lemon Squeezy (post Stripe acquisition) and Payhip: merchant-of-record status, whether an Israeli seller can onboard today, VAT/tax handling, fees, payout rails, and current status of new signups."
      ],
      [
        "paddle",
        "Paddle as merchant of record: exact onboarding and approval bar for a new Israeli seller, documents demanded, review time, product types accepted and refused, payout to an Israeli bank, and reports of rejections."
      ],
      [
        "etsy-digital",
        "Etsy digital downloads: Israeli seller eligibility and the Payoneer path, fees, which digital goods sell (templates, planners, printables), saturation, and Etsy policy on AI-generated goods."
      ],
      [
        "asset-marketplaces",
        "Creative Market, Envato/ThemeForest/CodeCanyon, TemplateMonster: acceptance bar, review time, exclusivity, revenue share, realistic per-item earnings, and payouts to Israel."
      ],
      [
        "creator-storefronts",
        "Ko-fi, Buy Me a Coffee, Stan Store, Beacons, Sellfy: digital-product support, fees, payout rails available to Israel, and whether any of them work without an audience."
      ],
      [
        "theme-app-stores",
        "Shopify Theme Store, Squarespace/Wix marketplaces, Webflow templates: approval bar, revenue share, demand signals, and payout countries."
      ],
      [
        "game-3d-assets",
        "itch.io, Unity Asset Store, Unreal Marketplace/Fab, Roblox: payouts to Israel, what a software-only shop can produce, review bars, and realistic earnings evidence."
      ]
    ]
  },
  {
    "id": "plugin-ecosystems",
    "title": "Plugin, extension and template ecosystems",
    "criteria": [
      [
        "chrome-extensions",
        "Chrome Web Store after in-app payments shut down: how paid extensions are monetized now (ExtensionPay, own licensing), top-earning niches with evidence, review/permission bars, and manifest v3 constraints."
      ],
      [
        "figma",
        "Figma plugins and widgets: the paid-plugin mechanism, Community payouts and eligible countries, what sells, and unserved gaps."
      ],
      [
        "notion-templates",
        "Notion template economy: where they are sold, real price points, top-seller evidence, saturation, and whether an agent can produce genuinely useful templates at scale."
      ],
      [
        "obsidian-raycast",
        "Obsidian plugins, Raycast extensions, Alfred workflows: monetization reality, licensing patterns, and audience size."
      ],
      [
        "ide-plugins",
        "VS Code Marketplace and JetBrains Marketplace: paid plugin mechanics, JetBrains revenue share and payout countries, which paid plugins actually earn, and the review bar."
      ],
      [
        "shopify-apps",
        "Shopify App Store: developer requirements, revenue share, review bar, app categories with demand and weak incumbents, and payouts to Israel."
      ],
      [
        "wordpress",
        "WordPress plugin economy and Freemius: market size in 2026, freemium conversion norms, competition, and payout rails."
      ],
      [
        "chat-app-directories",
        "Slack app directory, Discord App Directory, Telegram bot ecosystem: monetization paths, the App Directory review bar, and what a bot can charge for."
      ]
    ]
  },
  {
    "id": "agent-markets",
    "title": "Agent-native and AI marketplaces",
    "criteria": [
      [
        "mcp-registries",
        "MCP server registries and directories in 2026: how many are listed, whether anyone pays for MCP servers, hosted-MCP business models, and whether distribution there converts to money or only to attention."
      ],
      [
        "gpt-poe-stores",
        "OpenAI GPT Store, Poe creator monetization, and similar AI app stores: payout status, eligible countries (Israel specifically), amounts creators report, and eligibility rules."
      ],
      [
        "inference-hosting",
        "Hugging Face Spaces and Replicate: monetizable endpoints, pricing mechanics, what earns, payout rails, and the cost floor of serving a model."
      ],
      [
        "apify",
        "Apify Store deeper: pay-per-event economics, evidence of actual actor revenue, rent-an-actor model, which categories are saturated and which are unserved, and payout to Israel."
      ],
      [
        "rapidapi",
        "RapidAPI and alternative API marketplaces (APILayer, Zyla): seller payouts to Israel, categories with genuine paying buyers, pricing norms, and how much traffic a new listing gets."
      ],
      [
        "x402-economy",
        "x402 in 2026: which services actually accept x402 payments, measurable transaction volume, who the machine buyers are, the CDP facilitator economics, and whether a paid API there earns anything real yet."
      ],
      [
        "agent-registries",
        "ERC-8004, Virtuals, Olas, Fetch.ai and agent registries: distinguish real recurring revenue from token speculation, and say plainly whether any of it pays rent."
      ],
      [
        "skill-marketplaces",
        "Claude skills/plugin marketplaces, awesome-lists, and agent-tool directories as distribution: do they convert to money, to users, or to nothing?"
      ]
    ]
  },
  {
    "id": "data-apis",
    "title": "Data and API products",
    "criteria": [
      [
        "israeli-open-data",
        "Israeli open data: data.gov.il, Central Bureau of Statistics, Bank of Israel, municipal portals. Licence terms for commercial reuse, freshness, and which datasets a business would pay to have cleaned and served."
      ],
      [
        "company-registries",
        "Company and business registry data (Israel and worldwide): what is legally redistributable, who buys it, existing sellers and their pricing."
      ],
      [
        "financial-data",
        "Financial and market data APIs: the cheap end of the market, licensing constraints on redistribution, and where a small clean API still wins buyers."
      ],
      [
        "geo-address",
        "Geo, address and postal data: Israeli address normalization and geocoding gaps, licence terms of the available sources, and buyers."
      ],
      [
        "transport-weather",
        "Public transport (GTFS), weather, aviation and maritime feeds: commercial reuse terms, existing free competition, and whether any buyer pays."
      ],
      [
        "tax-rate-apis",
        "Tax and regulatory reference data as an API (VAT rates, thresholds, filing dates, currency and interest rates): existing sellers, pricing, and whether an accurate, well-maintained feed has real buyers."
      ],
      [
        "sports-media-data",
        "Sports, gaming and media metadata: licensing landmines, who sells it, and whether a clean legal slice exists."
      ],
      [
        "ai-training-data",
        "Datasets for AI training: marketplaces, licensing and provenance requirements, buyer types, and whether a small seller can participate legally."
      ]
    ]
  },
  {
    "id": "israel-bureaucracy",
    "title": "Israeli bureaucracy, tax and rights — the colony home turf",
    "criteria": [
      [
        "allocation-numbers",
        "Israel Invoices / allocation numbers (חשבוניות ישראל, מספר הקצאה): the 2026 threshold timeline, who is affected, which tools exist today, what is missing, and whether anyone would pay for tooling around it."
      ],
      [
        "vat-reporting",
        "Israeli VAT (מע״מ) reporting: online filing, deadlines, penalties, what small businesses get wrong, existing software, and the gap a free tool plus a small Pro tier could fill."
      ],
      [
        "bituach-leumi",
        "National Insurance (ביטוח לאומי) for the self-employed: 2026 rates and ceilings, advance payments, benefits and grants, and which calculators people search for."
      ],
      [
        "income-tax-refunds",
        "Israeli income tax: 2026 brackets, credit points (נקודות זיכוי), and the tax-refund (החזרי מס) industry — who charges what, what is automatable, and what legally requires a licensed representative."
      ],
      [
        "worker-rights",
        "Israeli employment rights calculators: severance (פיצויי פיטורים), notice, recuperation pay (דמי הבראה), vacation, sick pay, minimum wage. Search demand and existing tools."
      ],
      [
        "business-registration",
        "Opening and running a business in Israel: עוסק פטור/מורשה registration, Companies Registrar, business licensing, forms and fees — and which steps a software tool can genuinely simplify."
      ],
      [
        "fees-and-benefits",
        "Municipal tax (ארנונה) discounts, customs and personal imports, government fees, and benefit entitlements: calculators, eligibility checkers, and search demand."
      ],
      [
        "israeli-smb-software",
        "The Israeli SMB software landscape: Green Invoice, iCount, Rivhit, Morning, Hashavshevet. Pricing, APIs, affiliate or partner programmes, and the unserved gaps a free tool could occupy."
      ]
    ]
  },
  {
    "id": "vertical-niches",
    "title": "Vertical SMB niches worldwide",
    "criteria": [
      [
        "ecommerce-sellers",
        "Tools that Amazon, Shopify and Etsy sellers pay for: repeatedly requested gaps, price points, and how new tools get discovered."
      ],
      [
        "accountants",
        "Tools bookkeepers and accountants pay for: reconciliation, document intake, client portals, deadline tracking. What is missing at the small end."
      ],
      [
        "real-estate",
        "Real-estate agent tooling: listing generation, comparables, client follow-up. What is bought at under $50/month."
      ],
      [
        "hospitality",
        "Restaurants, cafes and hotels: menu, ordering, reservation, review and compliance tooling at the small end."
      ],
      [
        "fitness-wellness",
        "Gyms, studios, trainers, therapists: scheduling, intake, forms and payments — where incumbents overcharge."
      ],
      [
        "trades-contractors",
        "Contractors and trades: quoting, invoicing, scheduling, permits. What is genuinely bought by one-person operations."
      ],
      [
        "recruiting-hr",
        "Recruiters and small HR teams: sourcing, screening, scheduling, compliance documents. Note the legal risk of automated candidate screening."
      ],
      [
        "legal-admin",
        "Law firms and paralegal admin: document assembly, deadline calculators, court-form automation. Be explicit about where this becomes unauthorized practice of law."
      ]
    ]
  },
  {
    "id": "content-seo",
    "title": "Content and SEO assets that earn without a human",
    "criteria": [
      [
        "programmatic-calculators",
        "Calculator and tool sites as a business: real traffic and revenue evidence, how they monetize, how long they take to rank, and the survivors versus the casualties of recent Google updates."
      ],
      [
        "converter-utility-sites",
        "Converter and utility sites: monetization, ad rates, competition from incumbents, and whether a new entrant can still rank."
      ],
      [
        "directories-comparison",
        "Directory and comparison sites: affiliate economics, build cost, maintenance burden, and evidence of ones that actually earn."
      ],
      [
        "ad-networks",
        "AdSense, Ezoic, Mediavine, Raptive: entry thresholds in 2026, RPM for Hebrew/Israeli traffic versus English, payout to Israel, and policy risk for AI-assisted content."
      ],
      [
        "affiliate-networks",
        "Affiliate networks and programmes that accept Israeli publishers and content sites: approval bars, payout rails, and which verticals pay enough to matter."
      ],
      [
        "hebrew-seo",
        "Hebrew SEO opportunity: keyword volumes for Israeli business and tax queries, the incumbents (Kol Zchut, Green Invoice magazine, accountants blogs), and where a small site can actually win."
      ],
      [
        "ai-content-policy",
        "Google policy and observed treatment of AI-generated content through 2026, AI Overviews impact on tool-site traffic, and what survives versus what gets deindexed."
      ],
      [
        "newsletters-communities",
        "Newsletters and paid communities: can they run without a human voice, what sponsors pay, platform payout rails, and honest assessment of whether this fits an operator who does not talk to people."
      ]
    ]
  },
  {
    "id": "bounties-grants",
    "title": "Bounties, grants, prizes and creator funds",
    "criteria": [
      [
        "oss-bounties",
        "Algora, Gitcoin, Polar, BOSS and OSS bounty platforms: actual payout volume, typical bounty sizes, how work is claimed and reviewed, and payout rails for Israel."
      ],
      [
        "bug-bounty",
        "Bug bounty via authorized programmes only (HackerOne, Bugcrowd, Intigriti): eligibility, KYC, payout to Israel, realistic earnings for automated analysis, and the rules that forbid unauthorized testing."
      ],
      [
        "ml-competitions",
        "Kaggle and other ML competitions: prize money, eligibility rules, compute costs, and whether prizes pay to Israel."
      ],
      [
        "hackathons",
        "Online hackathons with cash prizes that accept solo and AI-assisted entries: real prize pools, judging, and how payouts are made."
      ],
      [
        "protocol-grants",
        "Protocol and ecosystem grants (Optimism RetroPGF, Arbitrum, Base, Solana, Filecoin, Ethereum Foundation): what is funded, application burden, whether an autonomous project qualifies, and KYC requirements."
      ],
      [
        "ai-credits-programs",
        "AI and cloud credit programmes, accelerators and agent grants: what is available to a solo builder, what they demand in return, and whether credits reduce our real costs."
      ],
      [
        "data-challenges",
        "Academic, civic and corporate data challenges with prize money: eligibility for a non-institutional entrant and payout mechanics."
      ],
      [
        "creator-funds",
        "Creator funds and payouts beyond TikTok — YouTube Partner, Reddit, Medium, Substack, X, Pinterest, Snapchat: eligibility for Israel, payout rails, and whether faceless or AI-assisted content qualifies."
      ]
    ]
  },
  {
    "id": "crypto-native",
    "title": "Crypto-native income, judged sceptically",
    "criteria": [
      [
        "paid-agent-services",
        "Selling agent or API services for stablecoins: who actually pays, settlement costs, and honest current volume rather than promise."
      ],
      [
        "infra-services",
        "Running paid infrastructure (RPC, indexing, data availability, oracles): capital and ops cost, competition, and whether it can run unattended."
      ],
      [
        "onchain-analytics",
        "On-chain analytics products (Dune dashboards, alert bots, portfolio tools): who pays and how much."
      ],
      [
        "trading-strategies",
        "Automated trading, MEV and yield strategies: assess honestly and expect to REJECT — the colony must not gamble the owner money. State the risk in numbers."
      ],
      [
        "digital-collectibles",
        "NFTs and digital collectibles in 2026: market reality, and whether anything here is honest value rather than hype."
      ],
      [
        "israel-offramp",
        "Crypto to ILS in practice: exchanges serving Israel, bank acceptance of crypto proceeds, reporting duties, and the friction that would block us receiving stablecoin revenue."
      ],
      [
        "agent-payment-networks",
        "Agent-to-agent payment networks and machine commerce: measured volume, real buyers, and time horizon."
      ],
      [
        "crypto-tooling-grants",
        "Grants and bounties specifically for crypto tooling and open-source infrastructure, and their KYC demands."
      ]
    ]
  },
  {
    "id": "licensing-ip",
    "title": "Licensable assets and intellectual property",
    "criteria": [
      [
        "stock-media",
        "Stock photo, video and illustration platforms: which accept AI-generated work and under what labelling, contributor earnings evidence, and payouts to Israel."
      ],
      [
        "music-sfx",
        "Music and sound-effect libraries: AI-generated audio acceptance, licensing terms, earnings evidence, and payout rails."
      ],
      [
        "fonts-icons",
        "Fonts and icon sets, including Hebrew typefaces: marketplaces, licensing models, the production cost, and whether Hebrew fonts are an underserved niche."
      ],
      [
        "datasets",
        "Selling datasets: marketplaces, provenance and licensing requirements, buyers, and the legal line between collecting and redistributing."
      ],
      [
        "dual-licensing",
        "Dual-licensing open-source libraries (AGPL plus commercial): who succeeds at it, the revenue shape, and whether it needs a sales human."
      ],
      [
        "3d-print-on-demand",
        "3D models and print-on-demand digital goods: platforms, payouts to Israel, and whether the work is genuinely software-only."
      ],
      [
        "white-label",
        "White-labelling and reselling our own tools to accountants, bookkeepers and Israeli SaaS vendors: how such deals are normally structured and whether any can close without a human conversation."
      ],
      [
        "ai-output-rights",
        "Who owns AI-generated output, and what each marketplace requires you to disclose: the legal picture in 2026 for selling AI-made assets commercially."
      ]
    ]
  },
  {
    "id": "productized-services",
    "title": "Productized services that need no human in the loop",
    "criteria": [
      [
        "automated-audits",
        "Automated audit reports as a product (SEO, Lighthouse, accessibility, security headers, Core Web Vitals): who buys them, at what price, and which incumbents already give them away free."
      ],
      [
        "monitoring-alerting",
        "Monitoring and alerting as a product: uptime, price changes, regulatory changes, competitor changes, domain and certificate expiry. Pricing and buyers."
      ],
      [
        "document-generation",
        "Document and form generation (contracts, invoices, letters, official forms): demand, and the precise line where this becomes regulated legal or tax advice in Israel."
      ],
      [
        "data-enrichment",
        "Data cleaning, enrichment and deduplication as a service: buyers, pricing, and the privacy law that constrains it."
      ],
      [
        "compliance-scanners",
        "Compliance scanning: cookie/GDPR, accessibility (EN 301 549, WCAG, Israeli standard 5568), and the Israeli accessibility regulations for websites. Who is legally obliged to comply and who sells to them."
      ],
      [
        "localization",
        "Translation and localization pipelines, especially English-to-Hebrew and Hebrew-to-English: quality bar, existing tools, and buyers who pay for RTL-correct output."
      ],
      [
        "pdf-ocr",
        "PDF, OCR and document-extraction pipelines including Hebrew OCR: accuracy reality, existing services, and paying buyers."
      ],
      [
        "api-middleware",
        "Selling API wrappers, middleware and integration glue on marketplaces: what sells, and how quickly official APIs make it obsolete."
      ]
    ]
  },
  {
    "id": "distribution",
    "title": "Distribution and discovery without a human",
    "criteria": [
      [
        "launch-platforms",
        "Product Hunt, Hacker News, Indie Hackers, Reddit: the actual rules on self-promotion and automation, what a launch delivers in traffic, and what gets an account banned."
      ],
      [
        "directories",
        "Tool and startup directories: which ones drive measurable traffic in 2026, submission rules, and whether automated submission is permitted."
      ],
      [
        "seo-2026",
        "SEO for small tool sites in 2026: what still ranks under AI Overviews, how long a new domain takes, and the honest expected traffic curve."
      ],
      [
        "app-store-aso",
        "Discovery inside app and bot stores: Chrome, Telegram, Slack, Shopify, Apify. What drives installs and what the listing quality bar is."
      ],
      [
        "israeli-channels",
        "Reaching Israeli small businesses: WhatsApp channels, Telegram channels, Facebook groups for עצמאים, and forums. Group rules on promotion, and whether an automated poster is allowed at all — assume not unless proven."
      ],
      [
        "email-acquisition",
        "Building an email list without a human: what is legal under Israeli spam law (חוק הספאם) and GDPR, and what actually converts."
      ],
      [
        "short-video",
        "Short-video top of funnel (TikTok, Reels, Shorts) for a business audience: reach, conversion to a website visit, and whether faceless machine-made content performs."
      ],
      [
        "partnerships-integrations",
        "Being listed inside someone else`s product (integration directories, partner pages, API marketplaces): how listings are obtained and whether any require a human conversation."
      ]
    ]
  },
  {
    "id": "payment-rails",
    "title": "Payment and payout rails for an Israeli operator — the feasibility gate",
    "criteria": [
      [
        "paddle-onboarding",
        "Paddle for an Israeli seller: exact onboarding steps, documents, timelines, rejection reasons, payout mechanics, and fees. This gates our existing Pro tier."
      ],
      [
        "stripe-alternatives",
        "Card processing for a site selling to Israelis: Tranzila, Cardcom, Meshulam, PayPlus, Grow, Isracard gateways. Requirements for a small seller, fees, and whether a legal entity is required."
      ],
      [
        "paypal-israel",
        "PayPal for an Israeli business: account requirements, withdrawal to an Israeli bank, fees, and known freezing problems."
      ],
      [
        "payoneer-wise",
        "Payoneer and Wise for receiving marketplace payouts in Israel: account requirements, fees, currency conversion, and which marketplaces pay through them."
      ],
      [
        "telegram-stars",
        "Telegram Stars end to end: pricing, the app-store cut, the Fragment withdrawal path to TON, minimums, hold periods, and converting to shekels."
      ],
      [
        "app-store-payouts",
        "Google Play, Apple App Store and Chrome Web Store payouts to Israeli developers: registration fees, tax forms, and thresholds."
      ],
      [
        "israeli-tax-registration",
        "When an Israeli individual must register as עוסק פטור or עוסק מורשה, VAT treatment of digital exports, income reporting duties, and what happens if revenue arrives before registration. This is the single most likely blocker to real money."
      ],
      [
        "invoicing-obligations",
        "Invoicing obligations for an Israeli seller of digital products to Israeli and foreign buyers, and how a merchant of record changes who must invoice whom."
      ]
    ]
  },
  {
    "id": "risk-governance",
    "title": "Risk, compliance and the governance the colony itself needs",
    "criteria": [
      [
        "automation-tos",
        "Platform terms on automation, bots and multi-account operation across the platforms we touch: GitHub, Apify, Telegram, Netlify, Google, Cloudflare, marketplaces. Quote the actual clauses."
      ],
      [
        "ai-disclosure",
        "Where AI-generated content and AI-operated accounts must be disclosed: platform rules and emerging law (EU AI Act transparency duties) through 2026."
      ],
      [
        "owner-kyc-catalogue",
        "Build the exhaustive catalogue of steps that unavoidably require the human owner: identity verification, bank details, tax forms, phone verification, app-store enrolment. For each: which platform, why it is unavoidable, how long it takes, and what it unlocks."
      ],
      [
        "selling-as-individual",
        "Israeli law on an individual selling digital products: registration thresholds, occasional versus regular income, and the practical enforcement picture."
      ],
      [
        "privacy-exposure",
        "Privacy exposure for tools that touch personal data: Israeli Privacy Protection Law and its 2025 amendment, GDPR, and how to design tools that hold no personal data at all."
      ],
      [
        "consumer-protection",
        "Refund and consumer-protection duties for digital goods: Israeli consumer law, EU distance selling, and what marketplaces enforce on sellers."
      ],
      [
        "agent-failure-modes",
        "Documented failure modes of autonomous agent systems in production: runaway spend, hallucinated progress or revenue, prompt injection, silent stalls, infinite loops, credential leaks. For each, name the concrete guardrail, test or watchdog we should add to this repo."
      ],
      [
        "audit-trail",
        "What an accountant and a tax authority will later demand as evidence of income: records, invoices, platform statements, and how our ledger should be structured now so it satisfies them later."
      ]
    ]
  }
]

// Waves. A full fan-out of 142 agents does not fit inside one usage
// window - the first full run died on the session limit with 123 of 128 agents
// unstarted. So the sweep is resumable by design:
//   args = { groups: ['storefronts', 'payment-rails'] }  sweep those groups only
//   args = { board: true }                               judge what is already on disk
//   args omitted                                          the full run
// In wave mode the board is skipped: it decides across ALL groups, not a slice.
const WAVE = Array.isArray(args) ? { groups: args } : (args || {})
const BOARD_ONLY = WAVE.board === true
const GROUPS = BOARD_ONLY ? [] : (WAVE.groups && WAVE.groups.length
  ? ALL_GROUPS.filter((g) => WAVE.groups.indexOf(g.id) !== -1)
  : ALL_GROUPS)
if (!BOARD_ONLY && GROUPS.length === 0) throw new Error('no criterion group matched args.groups')

const scoutPrompt = (g, c) => [
  'You are WORKER-SCOUT "' + c[0] + '" reporting to the supervisor of the "' + g.id + '" group in the revenue colony chain of command.',
  '',
  MISSION,
  '',
  'YOUR GROUP: ' + g.title,
  'YOUR CRITERION - search this and only this, exhaustively:',
  c[1],
  '',
  SCOUT_RULES,
  '',
  'OUTPUT: also write your full notes, with every URL you used, to /home/user/automaton/research/colony-sweep/scouts/' + g.id + '--' + c[0] + '.md (create the directory first with mkdir -p). Then return the structured result. Do not edit any other file in the repo.',
].join('\n')

const supervisorPrompt = (g, scouts) => [
  'You are the SUPERVISOR of the "' + g.id + '" criterion group in the revenue colony chain of command. ' + g.criteria.length + ' scouts reported to you.',
  '',
  MISSION,
  '',
  'GROUP: ' + g.title,
  '',
  'SCOUT REPORTS (JSON):',
  JSON.stringify(scouts.filter(Boolean), null, 1).slice(0, 120000),
  '',
  'YOUR JOB:',
  '1. Merge and deduplicate across your scouts. The same opportunity often appears under several criteria; keep the best-evidenced version.',
  '2. Verify before you promote: spot-check the strongest claims with WebSearch/WebFetch (load them via ToolSearch "select:WebSearch,WebFetch"). A finding with no real URL, or a number no source supports, must be demoted or rejected - say so.',
  '3. Reject ruthlessly: anything not payable to Israel, anything AMBER or RED on terms, anything needing the owner to talk to a human, anything that cannot be built by software alone, and anything whose honest ceiling is under 300 ILS/month.',
  '4. Score the survivors 0-100 on evidence strength x Israel payability x build feasibility x margin, and rank them. At most 6 survive.',
  '5. For each survivor give the single concrete first step a software agent would take - not a plan, one action.',
  '6. Name the scouts whose work was thin or unsourced. Your auditor will check whether you were honest about this.',
  '',
  'Write your group report to /home/user/automaton/research/colony-sweep/groups/' + g.id + '.md (mkdir -p first), including the rejected list and why. Then return the structured result. Do not edit any other file.',
].join('\n')

const auditorPrompt = (g, sup) => [
  'You are the AUDITOR assigned to the "' + g.id + '" group. You do not report to its supervisor; you check it. Your job is to REFUTE, not to agree.',
  '',
  MISSION,
  '',
  'THE SUPERVISOR REPORT (JSON):',
  JSON.stringify(sup, null, 1).slice(0, 100000),
  '',
  'FOR EACH RANKED CANDIDATE:',
  '- Open the cited evidence yourself (ToolSearch "select:WebSearch,WebFetch"). If a URL does not support the claim, or does not exist, say so explicitly.',
  '- Attack the Israel payability claim hardest. This is where optimism kills a line: a marketplace that serves Israeli buyers may not pay Israeli sellers.',
  '- Attack the monthly ceiling. Ask what a brand-new entrant with no audience, no reviews and no backlinks earns in month one, not what the market leader earns.',
  '- Attack the build estimate and the claim that no human is needed.',
  '- Verdict CONFIRMED only if the evidence genuinely holds. DOWNGRADED if real but overstated - give the corrected numbers. REFUTED if it does not survive.',
  '- Default to scepticism: if you cannot verify it, it is not CONFIRMED.',
  '',
  'Also list the supervisor own errors, and the angles the group missed entirely.',
  '',
  'Write your audit to /home/user/automaton/research/colony-sweep/audits/' + g.id + '.md (mkdir -p first). Then return the structured result. Do not edit any other file.',
].join('\n')

// The loop: scouts -> supervisor -> auditor, per group, with no barrier between groups.
phase('Scouts')
log(BOARD_ONLY
  ? 'Board wave: judging the group reports already on disk, no scouts.'
  : 'Chain of command: ' + GROUPS.length + '/' + ALL_GROUPS.length + ' criterion groups, ' +
    GROUPS.reduce((n, g) => n + g.criteria.length, 0) + ' scouts, one supervisor and one auditor per group.')

const groupResults = await pipeline(
  GROUPS,
  (g) => parallel(g.criteria.map((c) => () => agent(scoutPrompt(g, c), {
    label: 'scout:' + g.id + '/' + c[0],
    phase: 'Scouts',
    schema: SCOUT_SCHEMA,
    agentType: 'general-purpose',
    model: 'opus',
    effort: 'medium',
  }))),
  (scouts, g) => agent(supervisorPrompt(g, scouts || []), {
    label: 'supervisor:' + g.id,
    phase: 'Supervisors',
    schema: SUPERVISOR_SCHEMA,
    agentType: 'general-purpose',
    model: 'opus',
    effort: 'high',
  }),
  (sup, g) => (sup
    ? agent(auditorPrompt(g, sup), {
        label: 'auditor:' + g.id,
        phase: 'Auditors',
        schema: AUDIT_SCHEMA,
        agentType: 'general-purpose',
        model: 'opus',
        effort: 'high',
      }).then((audit) => ({ group: g.id, title: g.title, supervisor: sup, audit }))
    : { group: g.id, title: g.title, supervisor: null, audit: null }),
)

const groups = groupResults.filter(Boolean)
log(groups.length + '/' + GROUPS.length + ' groups completed the supervisor and auditor stages.')

phase('Board')

// A wave stops here: partial groups are not a portfolio, and a board that
// decides on a slice would be deciding without the evidence it needs.
if (!BOARD_ONLY && WAVE.groups && WAVE.groups.length) {
  log('Wave complete. Run again with args = { board: true } once every group has been swept.')
  return { wave: WAVE.groups, groupsCompleted: groups.length, groupHeadlines: groups.map((r) => ({ group: r.group, headline: r.supervisor && r.supervisor.headline })) }
}

const chief = await agent([
  'You are the CHIEF AUDITOR of the revenue colony. Each supervisor was checked by an auditor. You check the auditors.',
  '',
  MISSION,
  '',
  (BOARD_ONLY
    ? 'THIS IS A BOARD-ONLY WAVE. The group reports are on disk, not in this prompt. Read every file in /home/user/automaton/research/colony-sweep/groups/ and /home/user/automaton/research/colony-sweep/audits/ before you judge anything, and say which groups are missing entirely - a missing group is an unsearched part of the space, not an empty one.'
    : 'ALL GROUP RESULTS (supervisor rankings and their audits, JSON):'),
  (BOARD_ONLY ? '' : JSON.stringify(groups.map((r) => ({ group: r.group, ranked: r.supervisor && r.supervisor.ranked, headline: r.supervisor && r.supervisor.headline, audit: r.audit })), null, 1).slice(0, 250000)),
  '',
  'YOUR JOB:',
  '1. Find auditors who rubber-stamped: every verdict CONFIRMED, no corrections, no missed angles. Name them.',
  '2. Build the single cross-group list of candidates that survive honest scrutiny, with the AUDITOR-corrected numbers, never the supervisor originals.',
  '3. Drop duplicates that appear in several groups, keeping the best-evidenced framing.',
  '4. Name the systemic problems in this sweep - where the whole fleet was optimistic, where evidence was thin, what nobody searched.',
  '5. Consolidate every owner blocker found anywhere into one deduplicated catalogue. This is the shortest possible list of things the human must do, and it must not grow by invention.',
  '',
  'Write your report to /home/user/automaton/research/colony-sweep/CHIEF-AUDIT.md (mkdir -p first). Then return the structured result.',
].join('\n'), {
  label: 'chief-auditor',
  phase: 'Board',
  schema: CHIEF_SCHEMA,
  agentType: 'general-purpose',
  model: 'fable',
  effort: 'high',
})

const board = await agent([
  'You are the BOARD of the revenue colony. You decide where effort and money go. Everything below has already been searched by 112 scouts, ranked by 14 supervisors, attacked by 14 auditors and re-checked by the chief auditor.',
  '',
  MISSION,
  '',
  'CHIEF AUDITOR REPORT (JSON):',
  JSON.stringify(chief, null, 1).slice(0, 120000),
  '',
  (BOARD_ONLY
    ? 'The group rankings are on disk: read /home/user/automaton/research/colony-sweep/groups/ and /home/user/automaton/research/colony-sweep/audits/.'
    : 'GROUP HEADLINES AND RANKINGS (JSON):'),
  (BOARD_ONLY ? '' : JSON.stringify(groups.map((r) => ({ group: r.group, headline: r.supervisor && r.supervisor.headline, ranked: r.supervisor && r.supervisor.ranked })), null, 1).slice(0, 180000)),
  '',
  'Read src/revenue/portfolio.ts and docs/INCOME_PLAN.he.md before deciding: they hold the lines that already exist.',
  '',
  'YOUR JOB:',
  '1. Decide what gets built now, in order. At most 8. Each must be buildable by software alone and payable to an Israeli.',
  '2. Decide what happens to each existing line: keep, retarget, pivot or kill, with the reason.',
  '3. Write the path to 20,000 ILS/month as arithmetic, not as hope. If the honest answer is that this portfolio cannot get there, say so plainly and say what would be needed instead. The owner has explicitly asked for seriousness over comfort.',
  '4. Produce the shortest possible ordered owner checklist - every one-time human step, what it unlocks in shekels, and how many minutes it takes. Do not invent steps. Do not include anything the software can do itself.',
  '5. List concrete additions to this repo - skills, agents, tests, watchdogs, tools - with paths and priorities.',
  '',
  'Write the full board decision to /home/user/automaton/research/colony-sweep/BOARD.md (mkdir -p first), in English, with a Hebrew executive summary at the top for the owner. Then return the structured result.',
].join('\n'), {
  label: 'board',
  phase: 'Board',
  schema: BOARD_SCHEMA,
  agentType: 'general-purpose',
  model: 'fable',
  effort: 'high',
})

return {
  scoutsRun: GROUPS.reduce((n, g) => n + g.criteria.length, 0),
  groupsCompleted: groups.length,
  groupHeadlines: groups.map((r) => ({ group: r.group, headline: r.supervisor && r.supervisor.headline, top: ((r.supervisor && r.supervisor.ranked) || []).slice(0, 3).map((x) => x.name) })),
  chief,
  board,
}
