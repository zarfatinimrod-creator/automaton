# AI-allowed prize events — the rules-page half of BOARD-LOOP §13

<!-- Written by the weekly prize-intake job (scripts/prize-intake.ts, src/revenue/ai-allowed-events.ts). Everything but the last three columns of each table is rewritten on every run. -->

**What this counts.** `research/channel-loop/BOARD-LOOP.md` §13 asks, per calendar quarter, how many prize events **explicitly permit AI-built entries with no human-authorship attestation**, read from each event's own rules page. The mlcontests list has no field that says so, and a machine must not guess it from prose, so the work is split. The weekly job lists every event whose deadline, as the list states it, falls in the current or the next quarter, with the URLs the list gives; a reading session grades each row from a rendered rules page. The job copies a session's cells forward by the event URL (the row's key) and never writes a verdict itself.

**How a reading session fills a row.**

1. Render the URLs in `research/measurements/ai-allowed-events.urls.txt`: paste its lines into render-watch.yml's `urls` input (workflow_dispatch). Never append them to `research/rendered/urls.txt`. Each capture lands at `research/rendered/<slug>.txt`, the slug beside its URL in that file. tiktok.com URLs are never rendered.
2. Read the capture. The list names no rules page as such; if the rules sit on a page the list does not give, its URL now appears in a capture and can be rendered in a later dispatch, cited to that capture. No URL is guessed.
3. Fill the last three cells. **AI clause**: the clause verbatim, with its capture pointer (`research/rendered/<file>`, a line number if you like); for rules that say nothing about AI, say so and still give the pointer. **Grade**: `RENDERED` when the clause was read from a capture; otherwise `SNIPPET` or `BLOCKED`, with Qualifies left empty. **Qualifies**: `yes` only when the rules explicitly permit AI-built or automated entries and require no human-authorship attestation; `no` otherwise, silent rules included.
4. Commit to main. `state/colony/prize-intake.json` and the colony report pick the grades up at the next weekly run (Wednesdays 06:47 UTC) or a manual dispatch of prize-intake.yml.

**What counts as graded.** A row counts only with `yes` or `no`, grade `RENDERED`, and a clause cell naming a file that exists under `research/rendered/`. Anything else a session wrote is *unsettled*: counted neither graded nor awaiting, and listed at the end with the reason. A quarter's qualifying count stays empty (null) until at least one of its rows is graded, and while some rows are ungraded it is a floor, not the count.

**The kill.** §13 stops this instrument after two consecutive quarters under 3 qualifying events. It is computed only from closed quarters whose every row is graded; a quarter with an ungraded row never counts toward it. A closed quarter's rows are kept below as the record of its last reading.

Reading: 2026-09-29T08:14:03.886Z (UTC day 2026-09-29) of <https://raw.githubusercontent.com/mlcontests/mlcontests.github.io/master/competitions.json>, sha256 `49e374691c73417e00c7a7cb18b7d30375b87bab0368b227db8f975667bec389`.

## Summary

| Quarter | Deadlines | Position | Events | Graded | Qualifying | Awaiting | Unsettled |
|---|---|---|---|---|---|---|---|
| 2026-Q3 | 1 Jul – 30 Sep 2026 | current | 39 | 0 | not counted (no row graded) | 39 | 0 |
| 2026-Q4 | 1 Oct – 31 Dec 2026 | next | 27 | 0 | not counted (no row graded) | 27 | 0 |

Kill: not computable yet — no two consecutive closed quarters are fully graded.

URLs awaiting a render: 101 in `research/measurements/ai-allowed-events.urls.txt`.

## 2026-Q3 — deadlines 1 Jul – 30 Sep 2026 (current quarter)

| Event | Deadline | Prize as stated | Event URL (the row's key) | Other URLs the list gives | AI clause (verbatim, with capture pointer) | Grade | Qualifies (yes/no) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Agentic Pay Zone Identification in Well Logs | 2026-07-01 | $15,000 | <https://thinkonward.com/app/c/challenges/no-second-guessing?ref=mlc> | — |  |  |  |
| Identify Gene Pairs Driving Metabolic Diseases (Part 3) | 2026-07-03 | $26,000 | <https://hub.crunchdao.com/competitions/broad-obesity-3?ref=mlcontests> | — |  |  |  |
| Build Open-Source AI Agents on Qwen Cloud | 2026-07-09 | $45,000 | <https://qwencloud-hackathon.devpost.com/?ref=mlcontests> | — |  |  |  |
| Detect next-generation identity document fraud | 2026-07-14 | $6,000 | <https://freuid2026.microblink.com/> | <https://www.kaggle.com/competitions/the-freuid-challenge-2026-ijcai-ecai/overview> |  |  |  |
| Build Tiny Neural Nets to Solve Visual Reasoning Tasks | 2026-07-15 | $50,000 | <https://www.kaggle.com/competitions/neurogolf-2026?ref=mlcontests> | — |  |  |  |
| Generate Diagnostic Reports from Pathology Slides | 2026-07-20 | $1,650 | <https://reg2026.grand-challenge.org/?ref=mlcontests> | — |  |  |  |
| Analyse Mitral Valve Anatomy from Multimodal Imaging | 2026-08-01 | — | <https://www.codabench.org/competitions/15662/?ref=mlcontests> | — |  |  |  |
| Benchmark LLMs on Industrial Automation Reasoning | 2026-08-01 | $500 | <https://sites.google.com/view/ai-industrial-challenge-ijcai/home?ref=mlcontests> | <https://2026.ijcai.org/competitions/><br><https://www.kaggle.com/competitions/industrial-automation-challenge-track-1?ref=mlcontests> |  |  |  |
| Build Smart, Reliable Email Agents | 2026-08-01 | $1,700 | <https://theemailgame.com/?ref=mlcontests> | — |  |  |  |
| Project Omnibus: Optimise School Bus Routes | 2026-08-01 | $1,200 | <https://competition.bcamlc.com?ref=mlcontests> | <https://www.codabench.org/competitions/16945/> |  |  |  |
| Automatic Speech Recognition for African Languages | 2026-08-03 | $10,000 | <https://zindi.africa/competitions/google-waxal-asr-challenge?utm_source=mlcontest&utm_medium=referral&utm_campaign=compupdates> | — |  |  |  |
| Backblaze Generative Media Hackathon | 2026-08-03 | $10,000 | <https://backblaze-generative-media.devpost.com/?ref=mlcontests> | — |  |  |  |
| Precipitation Nowcasting From Space | 2026-08-04 | $12,000 | <https://community.solafune.com/competitions/f87811b8-1964-4f4b-84b3-6fddd67ec4b1?menu=about&tab=overview&ref=mlcontests> | — |  |  |  |
| Predict Geology in Horizontal Subsurface Segments | 2026-08-05 | $50,000 | <https://www.kaggle.com/competitions/rogii-wellbore-geology-prediction?ref=mlcontests> | — |  |  |  |
| DataHub Agent Hackathon | 2026-08-10 | $20,500 | <https://datahub.devpost.com/?ref=mlcontests> | — |  |  |  |
| Fine-Tune Domain-Specific LLMs | 2026-08-10 | $50,000 | <https://adaptionlabs.ai/blog/autoscientist-challenge?ref=mlcontests> | — |  |  |  |
| Showcase AI Systems Optimised for Arm Platforms | 2026-08-14 | $8,000 | <https://arm-ai-optimization-challenge.devpost.com/?ref=mlcontests> | — |  |  |  |
| Identify Aquaculture Ponds in Satellite Imagery | 2026-08-16 | $1,240 | <https://zindi.africa/competitions/geoai-aquaculture-pond-identification-challenge/?utm_source=mlcontest&utm_medium=referral&utm_campaign=compupdates> | — |  |  |  |
| Build Real Products with Google Gemini | 2026-08-17 | $2,000,000 | <https://www.geminixprize.com/?ref=mlcontests> | <https://xprize.devpost.com/> |  |  |  |
| Build Agents With CockroachDB Memory | 2026-08-18 | $8,750 | <https://cockroachdb-ai.devpost.com/?ref=mlcontests> | — |  |  |  |
| Segment and Plan Pelvic Fracture Repair | 2026-08-19 | $1,700 | <https://pengwin2026.grand-challenge.org/?ref=mlcontests> | — |  |  |  |
| Build Foundation Models for Brain MRI Analysis | 2026-08-21 | $2,000 | <https://fomo26.github.io/?ref=mlcontests> | — |  |  |  |
| Build On-Device LLMs for Laptop Hardware | 2026-08-24 | $16,500 | <https://adtc-2026.devpost.com/?ref=mlcontests> | — |  |  |  |
| Predict Student Learning Outcomes from Tutoring Transcripts | 2026-08-27 | $50,000 | <https://platform.k12-ai-infrastructure.org/competitions/3/tutoring-outcomes/?ref=mlcontests> | — |  |  |  |
| Identify Reef Fish Species with Computer Vision Models | 2026-08-29 | $1,500 | <https://zindi.africa/competitions/wishlist-hackathon-2026-marine-vision-challenge?utm_source=mlcontest&utm_medium=referral&utm_campaign=compupdates> | — |  |  |  |
| Automated Speech Recognition Under Diverse Speech Patterns | 2026-08-31 | $10,000 | <https://xiuwenz2.github.io/SAPC2-website/?ref=mlcontests> | — |  |  |  |
| Build Useful End-to-End Differentiable Systems | 2026-08-31 | $20,000 | <https://pasteurlabs.ai/tesseract-hackathon-2026/?ref=mlcontests> | — |  |  |  |
| Find Multi-step AI Agent Attack Paths | 2026-09-01 | $50,000 | <https://www.kaggle.com/competitions/ai-agent-security-multi-step-tool-attacks?ref=mlcontests> | — |  |  |  |
| Segment Lesions in Whole-Body Scans | 2026-09-01 | $6,600 | <https://autopet-v.grand-challenge.org/?ref=mlcontests> | — |  |  |  |
| Classify and Segment Intracranial Aneurysms | 2026-09-05 | — | <https://topaneu-26.grand-challenge.org/?ref=mlcontests> | — |  |  |  |
| Detect Rare Early-Stage Cancers in Endoscopy | 2026-09-07 | $2,200 | <https://rare26.grand-challenge.org/?ref=mlcontests> | — |  |  |  |
| Design LLM Agents to Build Virtual Spacecraft | 2026-09-12 | $3,000 | <https://www.kaggle.com/competitions/build-arena-human-ai-colleberation-engineering-challenge?ref=mlcontests> | <https://build-arena.github.io/ConstructionChallenge/><br><https://github.com/build-arena/BuildArena-2.0><br><https://openreview.net/forum?id=QAQKmIp3SZ> |  |  |  |
| Develop and Explain Pokemon Card Battle Agents | 2026-09-13 | $240,000 | <https://www.kaggle.com/competitions/pokemon-tcg-ai-battle-challenge-strategy?ref=mlcontests> | <https://www.kaggle.com/competitions/pokemon-tcg-ai-battle> |  |  |  |
| Classify DaT Scans for Parkinson's Detection | 2026-09-16 | $27,000 | <https://www.drivendata.org/competitions/311/dat-parkinsons-challenge/?ref=mlcontests> | <https://www.health-data-hub.fr/bibliotheque-ouverte-algorithmes-sante> |  |  |  |
| Detect Structural Breaks in Real-Time Time Series Data | 2026-09-17 | $100,000 | <https://hub.crunchdao.com/competitions/structural-break-real-time?ref=mlcontests> | — |  |  |  |
| Estimate Neural Network Activations from Weights | 2026-09-19 | $100,000 | <https://www.aicrowd.com/challenges/white-box-estimation-challenge-2026?ref=mlcontests> | <https://www.alignmentforum.org/posts/Kben8CzS4awCwNw5c/announcing-the-arc-white-box-estimation-challenge> |  |  |  |
| Track Developing Cells in 3D Microscopy Data | 2026-09-29 | $60,000 | <https://www.kaggle.com/competitions/biohub-cell-tracking-during-development?ref=mlcontests> | — |  |  |  |
| Competitive Farming Strategy Game | 2026-09-30 | $50,000 | <https://www.kaggle.com/competitions/kaggriculture?ref=mlcontests> | — |  |  |  |
| Robust Optical Flow Correspondence Matching | 2026-09-30 | — | <https://roco-spring.github.io/?ref=mlcontests> | — |  |  |  |

## 2026-Q4 — deadlines 1 Oct – 31 Dec 2026 (next quarter)

| Event | Deadline | Prize as stated | Event URL (the row's key) | Other URLs the list gives | AI clause (verbatim, with capture pointer) | Grade | Qualifies (yes/no) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Generative AI for Antimicrobial Peptide Design | 2026-10-01 | — | <https://szczurek-lab.github.io/amp-challenge-website/?ref=mlcontests> | — |  |  |  |
| Transcribe Code-Switched Speech in Underserved Languages | 2026-10-02 | $20,000 | <https://competitions.mozilladatacollective.com/competitions/group/lost-in-transcription/?ref=mlcontests> | <https://competitions.mozilladatacollective.com/competitions/2/lost-in-transcription-sp-en/><br><https://competitions.mozilladatacollective.com/competitions/3/lost-in-transcription-sp-nh/><br><https://competitions.mozilladatacollective.com/competitions/1/lost-in-transcription-in-jv/> |  |  |  |
| Build Models to Transcribe Handwritten Historical Records | 2026-10-05 | $25,000 | <https://zindi.africa/competitions/road-barbados-historic-handwriting-challenge?utm_source=mlcontest&utm_medium=referral&utm_campaign=compupdates> | — |  |  |  |
| Predict Aircraft Taxi-Out Time at European Airports | 2026-10-11 | $5,800 | <https://ansperformance.eu/study/data-challenge/dc2026/> | <https://ansperformance.eu/study/data-challenge/><br><https://ansperformance.eu/study/data-challenge/dc2026/eligibility.html><br><https://ansperformance.eu/study/data-challenge/dc2026/rationale.html><br><https://ansperformance.eu/study/data-challenge/dc2026/data.html><br><https://ansperformance.eu/study/data-challenge/dc2026/ranking.html><br><https://ansperformance.eu/study/data-challenge/dc2026/teams.html><br><https://opensky-network.org/><br><https://www.eurocontrol.int/air-navigation-services-performance-review> |  |  |  |
| Sim2Real Bimanual Robot Manipulation | 2026-10-11 | — | <https://robosyn-bench.net/?ref=mlcontests> | <https://github.com/EDEM-AI/RoboSynChallenge> |  |  |  |
| Weak Lensing Uncertainty under Distribution Shift | 2026-10-11 | $4,000 | <https://www.codabench.org/competitions/10902/?ref=mlcontests> | <https://fair-universe.lbl.gov/?ref=mlcontests> |  |  |  |
| Verifiable AI Agents for Quantitative Finance | 2026-10-12 | $12,000 | <https://www.agenthon.net/?ref=mlcontests> | — |  |  |  |
| Design Physics Experiments for Gravitational Waves | 2026-10-15 | $27,000 | <https://www.learn2design2026.com/?ref=mlcontests> | — |  |  |  |
| Detect Knee Abnormalities in Multimodal Imaging Data | 2026-10-22 | $77,000 | <https://www.kaggle.com/competitions/rsna-knee-abnormality-detection?ref=mlcontests> | — |  |  |  |
| Generative Modeling of Mouse Embryo Development | 2026-10-25 | $54,000 | <https://virtualembryo.ai/challenge?ref=mlcontests> | — |  |  |  |
| Interpretability for AI Mathematical Olympiad Reasoning | 2026-10-25 | $10,000 | <https://aimo-interp.github.io/?ref=mlcontests> | <https://www.codabench.org/competitions/16180/> |  |  |  |
| RealPDE: Scientific ML for Real-World Physical Systems | 2026-10-25 | $21,000 | <https://realpdecompetition.github.io/?ref=mlcontests> | <https://www.codabench.org/competitions/17363/><br><https://www.codabench.org/competitions/17385/> |  |  |  |
| Infer Fusion Reactor Magnetic Geometry | 2026-10-26 | $1,000 | <https://fusion-equilibrium-challenge.sophelio.io/?ref=mlcontests> | — |  |  |  |
| Predict Whether AI Systems Answer Benchmark Items Correctly | 2026-10-30 | — | <https://aimslab.stanford.edu/competition?ref=mlcontests> | <https://www.codabench.org/competitions/17828/> |  |  |  |
| ARC Prize 2026 - ARC-AGI-2 | 2026-11-02 | $700,000 | <https://www.kaggle.com/competitions/arc-prize-2026-arc-agi-2?ref=mlcontests> | — |  |  |  |
| ARC Prize 2026 - ARC-AGI-3 | 2026-11-02 | $850,000 | <https://www.kaggle.com/competitions/arc-prize-2026-arc-agi-3?ref=mlcontests> | — |  |  |  |
| Quantitative Physical Reasoning for VLMs | 2026-11-05 | — | <https://quantiphy.stanford.edu/competition/index.html?ref=mlcontests> | — |  |  |  |
| ARC Prize 2026 - Paper Track | 2026-11-09 | $450,000 | <https://www.kaggle.com/competitions/arc-prize-2026-paper-track?ref=mlcontests> | — |  |  |  |
| Write a Research Paper on Coding Agents | 2026-11-12 | $35,000 | <https://www.kaggle.com/competitions/gemma-4-developer-agent-paper?ref=mlcontests> | — |  |  |  |
| Generate Synthetic Humanitarian Survey Responses | 2026-11-14 | — | <https://situatedevals.org/simulacrabench?ref=mlcontests> | — |  |  |  |
| Optimise LLM Operators & Inference Across AI Chips | 2026-11-15 | $14,925 | <https://flagos.io/race-detail-season2?id=8q4m2x7p&lang=en&ref=mlcontests> | <https://flagos.io/race-detail-season2?id=782kzq4m&lang=en><br><https://flagos.io/race-detail-season2?id=539vlt2p&lang=en> |  |  |  |
| Predict Price Movements from Limit Order Book Data | 2026-11-15 | $13,600 | <https://wundernn.io/connectome?ref=mlcontests> | <https://wundernn.io/connectome/docs/quick_start> |  |  |  |
| Decode Brains Signals in Task-Specific Settings | 2026-11-21 | $20,000 | <https://neural-interfaces26.github.io> | <https://www.codabench.org/competitions/17974/><br><https://www.codabench.org/competitions/17982/><br><https://www.codabench.org/competitions/17983/><br><https://www.codabench.org/competitions/17984/> |  |  |  |
| Build Coding Agents with Gemma 4 | 2026-12-02 | $65,000 | <https://www.kaggle.com/competitions/gemma-4-developer-agent?ref=mlcontests> | — |  |  |  |
| Build Speech Recognition Systems for Caribbean Voices | 2026-12-07 | $7,500 | <https://zindi.africa/competitions/caribbean-voices-hackathon?utm_source=mlcontest&utm_medium=referral&utm_campaign=compupdates> | — |  |  |  |
| Predict 2D Chemical Structures From Mass Spectra | 2026-12-14 | $50,000 | <https://www.kaggle.com/competitions/enveda-CASMI26-molecule-id-mass-spectra?ref=mlcontests> | — |  |  |  |
| Predict Cross-sectional Equity Returns | 2026-12-31 | $52,000 | <https://hub.crunchdao.com/competitions/datacrunch-2?ref=mlcontests> | — |  |  |  |
