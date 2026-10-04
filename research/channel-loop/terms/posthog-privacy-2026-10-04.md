> **Pinned reference to a GitHub-hosted text (github grade): PostHog Privacy Policy ("Privacy policy, PostHog style", "Last Updated: June 29, 2026").**
>
> - Source repo: https://github.com/PostHog/posthog.com (published by PostHog)
> - Path: `src/pages/privacy.tsx`, a Gatsby page written in TSX: the legal text sits inside React markup (`<p>`, `<b>`, `<Link>`, `<SectionLink>` and similar components), and the excerpts below keep that markup as it is
> - Served at: https://posthog.com/privacy (Gatsby builds `src/pages/privacy.tsx` as that route; the site's legal menu links `url: '/privacy'`, PostHog/posthog.com@d373dba7a55e55426d08a8edbfe3763881021c0a `src/navs/index.js:2301-2311`)
> - Commit SHA: `35fc817dfc2b7ed21d59504e349d1f47616edb10` (2026-06-29, "Update ToS and Privacy Policy to add model training opt-out section"), the file's latest commit on `master` when fetched (the repo's commit feed for this path); the file is byte-identical at master HEAD `4c27ff7578f24c75b40d1024e4e0cbd40c9922ba` (2026-10-03), fetched 2026-10-04T09:42:11Z
> - Fetched from: https://raw.githubusercontent.com/PostHog/posthog.com/35fc817dfc2b7ed21d59504e349d1f47616edb10/src/pages/privacy.tsx (HTTP 200)
> - Fetched at (UTC): 2026-10-04T09:40:18Z
> - Original file: 1629 lines, 102937 bytes, sha256 `4d4795166a37daf5ec39e935d10fd63dab1d127ab1db5368f0a687efd5c74abc`
> - Licence of the repo: its root `LICENSE` at this commit (34 lines, sha256 `5391d207b47157cc27002385e33373240d5a9824bfc194832f41b0a7c24b7715`, unchanged at HEAD) has two parts. Content in `/contents/` is under the MIT licence (LICENSE:12-32). For everything else (LICENSE:1) it says: "Please do not duplicate, copy, or use our website for commercial or non-commercial use." (LICENSE:5-6). This file is outside `/contents/`.
> - **The body is not copied here.** Only the passages the posthog.com verdict in `research/channel-loop/terms-verdicts.json` relies on are quoted, each as the exact original lines: 60 of the 1,629 original lines are quoted below. The licence line draws no line between a whole copy and a part, and these excerpts are verbatim copies too, so they do not escape it; they keep what is copied to the clauses the verdict cites, as quotation for the record. That departs from the Apify copies' form (`apify-general-terms-2026-10-04.md`, Apache-2.0) and from the saved copy `logs/CHANNEL_LOOP.md` §9 asked for ("Queued 4.10 (tick 39)" item 1, "a saved copy under `research/channel-loop/terms/` as Apify's"); whether it allows a full evidence copy here is the main thread's ruling, not made here (the full file can be re-fetched at the pinned commit and checked against the sha256 above). Each excerpt states its original line numbers twice, in its heading and in its marker, with the sha256 of those lines in the marker. A re-fetch at the commit above checks every quote byte for byte: `curl -s <Fetched from> | sed -n A,Bp | sha256sum`. The test `src/__tests__/revenue/terms-saved-copies.test.ts` recomputes each block's sha256 against its marker and checks that its heading states the same range.
> - Read on 2026-10-04: lines 1-1200 and 1500-1540 in full, the rest by its section headings and a search for scrap, crawl, robot, automat, bot, website, IP address, retention and cookie. No clause governs automated access to the website; "automated means" (original :1103) is the data-portability right's condition ("processing carried out by automated means"). The policy also prints staff contact addresses, which this file does not copy.
> - Not edited: inside each fenced block, every line is the original line, byte for byte. Cite this file's own line numbers, or the original's (`src/pages/privacy.tsx:N` at the commit above).

## The plain-English column is not binding (original lines 237-251)

<!-- excerpt: original lines 237-251, sha256 eb87eb9ae5469f2362e14a8ffff36cacea4681ceac586b0e1489fe70cb152cec; the fenced block below is those lines, byte for byte -->
```tsx
                    <p className="">
                        You probably realize this, but the summaries{' '}
                        <span className="md:hidden">
                            below each section in blockquotes (under the <em>"What it means"</em> subheaders)
                        </span>
                        <span className="hidden md:inline-block">in the right-hand column</span> exist solely to aid
                        your comprehension and alleviate boredom. They're not legally binding.
                    </p>
                    <p className="">
                        The <em>actual</em> privacy policy{' '}
                        <span className="md:hidden">
                            is everything <em>not in blockquotes</em>
                        </span>
                        <span className="hidden md:inline-block">is in the left column below</span>.
                    </p>
```

## Introduction: who the policy covers (original lines 292-308)

<!-- excerpt: original lines 292-308, sha256 254bbb805be24943813c7d962893ae356f1e52c3d32e11aa4650dbf2c7af55b8; the fenced block below is those lines, byte for byte -->
```tsx
                    <div>
                        <p>
                            This privacy policy ("<b>Privacy Policy</b>") applies to all visitors, users and customers
                            of the PostHog.com hosted services and websites (collectively, the "<b>Website</b>" or "
                            <b>Websites</b>") and self-managed installations, which are offered by PostHog Inc.
                            (formerly known as Hiberly Inc.) and/or any of its subsidiaries and/or affiliates ("
                            <b>PostHog</b>" or "<b>we</b>" or "<b>us</b>") and describes how we process your personal
                            information in connection with those Websites or self-managed installations, customer events
                            and demos, and how we collect information through the use of cookies and related
                            technologies. It also tells you how you can access and update your personal information and
                            describes the data protection rights that may be available under your country's or state's
                            laws, including (in the European Economic Area ("<b>EEA</b>"), and UK), a right to object to
                            some processing that we carry out or, where we rely on consent, how to withdraw that
                            consent. Please read this Privacy Policy carefully. By accessing or using any part of the
                            Websites or self-managed installations, you acknowledge you have been informed of and
                            consent to our practices with regard to your personal information and data.
                        </p>
```

## Information from website visitors (original lines 360-386)

<!-- excerpt: original lines 360-386, sha256 9d86908522e817bb502042f2d0165ee2a6ddf09ce05549dcdc46d3a97b14e4fa; the fenced block below is those lines, byte for byte -->
```tsx
                    <div>
                        <h2 id="data-collection">
                            <strong>What information PostHog collects and why</strong>
                        </h2>
                        <h3>
                            <strong>Information from website visitors</strong>
                        </h3>
                    </div>
                    <div></div>
                    <div>
                        <p>
                            Like most website operators, PostHog automatically collects (i) technical information about
                            your device including your device's internet protocol (IP) address; and (ii) information
                            about your visit to our Websites (the referral URL, the content viewed and the content
                            interacted with).&nbsp;
                        </p>
                        <p>
                            Some of this information is collected using cookies and related technologies. See below for
                            further information on these technologies. We collect this information to better understand
                            how visitors use our Websites, to improve our Websites and experience for visitors, and to
                            monitor the security of the Websites.
                        </p>
                        <p>
                            For logged-in customers to PostHog deployments, PostHog also collects this information on
                            our application using our own software, to help us understand how to make the deployments
                            more useful for different categories of customer.
                        </p>
```

## Last updated (original lines 1623-1623)

<!-- excerpt: original lines 1623-1623, sha256 420ae10e02db5604fb86141930835042f8fc16f5eb484eb7aef2d034132f71f4; the fenced block below is those lines, byte for byte -->
```tsx
                <p className="text-center text-sm opacity-60 mt-8 pb-12">Last Updated: June 29, 2026</p>
```
