> **Pinned reference to a GitHub-hosted text (github grade): PostHog Terms of Service ("Terms, PostHog style", "Last Updated: June 29, 2026").**
>
> - Source repo: https://github.com/PostHog/posthog.com (published by PostHog)
> - Path: `src/pages/terms.tsx`, a Gatsby page written in TSX: the legal text sits inside React markup (`<p>`, `<b>`, `<Link>`, `<SectionLink>` and similar components), and the excerpts below keep that markup as it is
> - Served at: https://posthog.com/terms (Gatsby builds `src/pages/terms.tsx` as that route; the site's legal menu links `url: '/terms'`, PostHog/posthog.com@d373dba7a55e55426d08a8edbfe3763881021c0a `src/navs/index.js:2301-2311`)
> - Commit SHA: `35fc817dfc2b7ed21d59504e349d1f47616edb10` (2026-06-29, "Update ToS and Privacy Policy to add model training opt-out section"), the file's latest commit on `master` when fetched (the repo's commit feed for this path); the file is byte-identical at master HEAD `4c27ff7578f24c75b40d1024e4e0cbd40c9922ba` (2026-10-03), fetched 2026-10-04T09:42:11Z
> - Fetched from: https://raw.githubusercontent.com/PostHog/posthog.com/35fc817dfc2b7ed21d59504e349d1f47616edb10/src/pages/terms.tsx (HTTP 200)
> - Fetched at (UTC): 2026-10-04T09:40:18Z
> - Original file: 1390 lines, 100246 bytes, sha256 `cc34fd5bed10c4ad1c74dff6bc2c7a5625ebc760b4e60b94854d9fdeba807bca`
> - Licence of the repo: its root `LICENSE` at this commit (34 lines, sha256 `5391d207b47157cc27002385e33373240d5a9824bfc194832f41b0a7c24b7715`, unchanged at HEAD) has two parts. Content in `/contents/` is under the MIT licence (LICENSE:12-32). For everything else (LICENSE:1) it says: "Please do not duplicate, copy, or use our website for commercial or non-commercial use." (LICENSE:5-6). This file is outside `/contents/`.
> - **The body is not copied here.** A verbatim copy of this page's source in our repository is what that licence line asks us not to make, so this file departs from the Apify copies' form (`apify-general-terms-2026-10-04.md`, Apache-2.0). Only the passages the posthog.com verdict in `research/channel-loop/terms-verdicts.json` relies on are quoted below, each as the exact original lines, with their original line numbers and the sha256 of those lines in the marker above the block. A re-fetch at the commit above checks every quote byte for byte: `curl -s <Fetched from> | sed -n A,Bp | sha256sum`. The test `src/__tests__/revenue/terms-saved-copies.test.ts` recomputes each block's sha256 against its marker.
> - Read in full on 2026-10-04, all 1,390 lines. A search for scrap, crawl, robot, automat, spider and bot finds no clause on automated access to the website; "automatically" occurs only at original :1040 and :1053, both about renewal (quoted under 6.4).
> - Not edited: inside each fenced block, every line is the original line, byte for byte. Cite this file's own line numbers, or the original's (`src/pages/terms.tsx:N` at the commit above).

## The plain-English column is not binding (original lines 272-286)

<!-- excerpt: original lines 272-286, sha256 c25a536d37ee39cf27477c85054149870c22bacb57e487e283d41904ef94f9c2; the fenced block below is those lines, byte for byte -->
```tsx
                    <p className="">
                        You probably realize this, but the summaries{' '}
                        <span className="md:hidden">
                            below each section in blockquotes (under the <em>"What it means</em> subheaders)
                        </span>
                        <span className="hidden md:inline-block">in the right-hand column</span> exist solely to aid
                        your comprehension and alleviate boredom. They're not legally binding.
                    </p>
                    <p className="">
                        Should you wish to be legally bound to us, please stick with the <em>actual</em> terms{' '}
                        <span className="md:hidden">
                            which is everything <em>not in blockquotes</em>
                        </span>
                        <span className="hidden md:inline-block">in the left column</span>.
                    </p>
```

## Scope and acceptance (original lines 327-355)

<!-- excerpt: original lines 327-355, sha256 b0f06baab98c0acb804208ae5629b0f00586ff77b8b0fd59c8c965c711642228; the fenced block below is those lines, byte for byte -->
```tsx
                        <p>
                            These PostHog Terms of Service (the "<b>Terms of Service</b>", "<b>Terms</b>" or "
                            <b>Agreement</b>") apply to any Customer (as defined below) accessing or using PostHog
                            cloud-based software, products or services ("<b>PostHog Cloud</b>"). Separate terms for
                            users of PostHog Free and Open Source Software ("<b>PostHog FOSS</b>") can be found
                            here:&nbsp;
                            <Link href="https://github.com/PostHog/posthog-foss/blob/master/LICENSE" externalNoIcon>
                                https://github.com/PostHog/posthog-foss/blob/master/LICENSE
                            </Link>
                            .
                        </p>
                        <p>
                            By signing up to, creating an account, using or otherwise accessing PostHog Cloud, you and
                            any entity that you represent ("<b>Customer</b>", "<b>you</b>" or "<b>your</b>") are
                            unconditionally consenting to be bound by and are becoming a party to these Terms of Service
                            as of the date of your first signup, account creation, use, download or other acceptance
                            (the "<b>Effective Date</b>") of the Licensed Materials (as defined below) provided by
                            PostHog Inc. or one of its Affiliates (collectively, "<b>PostHog</b>", "<b>us</b>", "
                            <b>we</b>" or "<b>our</b>"), on a free or pay-as-you-go basis, or in accordance with and
                            pursuant to one or more order forms, quotes or other ordering documents referencing these
                            Terms (each an "<b>Order Form</b>").&nbsp;
                        </p>
                        <p>
                            These Terms may be updated from time to time at our discretion. Subject to the terms herein,
                            Customer’s use or continued use of the Licensed Materials also constitutes Customer’s
                            ongoing and continued assent to the terms of this Agreement. If you do not accept this
                            Agreement, and/or any related modifications or new terms as may be updated from time to
                            time, please refrain from accessing or using PostHog Cloud or the Licensed Materials.&nbsp;
                        </p>
```

## 1.1 Licence (original lines 386-406)

<!-- excerpt: original lines 386-406, sha256 238feffbf6c05e8d36b1b1c46a1eb2e498d6a4a6af44d457866e1299c5ce4ac5; the fenced block below is those lines, byte for byte -->
```tsx
                        <p id="section-1-1">
                            1.1 Subject to the terms and conditions of this Agreement (including, any and all payment
                            obligations), PostHog hereby grants to Customer and its Affiliates (as defined below) a
                            limited, non-exclusive, non-transferable, non-sublicensable and revocable (as provided
                            herein) right for Customer, its Affiliates, and their Users (as defined below) to (a)
                            internally (i) use, reproduce, modify, prepare derivative works based upon, and display the
                            code of PostHog Cloud at the plan type and/or tier level selected by Customer (or as
                            specified in an applicable Order Form), in accordance with the specifications and guidance
                            generally promulgated by PostHog from time to time (the "<b>Software</b>"), solely (x) for
                            its internal use in connection with the development of Customer’s and/or its Affiliates’ own
                            software, and (y) at the level of usage for which Customer has paid PostHog; and (ii) use
                            the documentation, training materials or other materials, products or services supplied or
                            provided by PostHog (the "<b>Other PostHog Materials</b>"); and (b) modify the Software and
                            publish patches to the Software, solely at the level of usage for which Customer has paid
                            PostHog. Notwithstanding anything to the contrary, Customer agrees that PostHog and/or its
                            licensors (as applicable) shall retain all right, title and interest in and to all Software
                            incorporated in such modifications and/or patches, and all such Software may only be used,
                            copied, modified, displayed, distributed, or otherwise exploited in full compliance with
                            this Agreement, and with a valid PostHog Cloud subscription for the correct level of
                            usage.&nbsp;
                        </p>
```

## 2.1 Restrictions (original lines 467-511)

<!-- excerpt: original lines 467-511, sha256 3ad234bfab75945e687dfa7b24ce047191f0ecbf39f8da82fbc3a241732e1f97; the fenced block below is those lines, byte for byte -->
```tsx
                        <h2 id="restrictions">2. Restrictions and responsibilities</h2>
                        <p id="section-2-1">
                            2.1 Customer and its Affiliates will not, and will not permit any third party to: (a) use
                            the Licensed Materials for any purpose other than as specifically authorized in{' '}
                            <SectionLink section="1.1" /> or in such a manner that would enable any unlicensed entity,
                            individual or person to access the Licensed Materials; (b) use the Licensed Materials or any
                            other PostHog software for timesharing, service bureau, managed service, or similar
                            purposes, or otherwise make the Licensed Materials available to any third party other than
                            Users, including without limitation, by selling, reselling, sublicensing, distributing,
                            leasing or otherwise commercially exploiting the Licensed Materials; (c) remove, obscure, or
                            alter any copyright, trademark, or other proprietary notices contained in or on the Licensed
                            Materials; (d) access or use the Licensed Materials in a manner intended to circumvent or
                            exceed any usage limits, service capacity limits, account limitations, or other restrictions
                            applicable to Customer’s subscription or Order Form; (e) access or use the Licensed
                            Materials to interfere with, disrupt, or attempt to gain unauthorized access to any systems,
                            networks, accounts, or data of PostHog or any third party, including by attempting to
                            circumvent authentication or security mechanisms; (f) use the Licensed Materials to store,
                            transmit, or distribute any content or material that (i) infringes or violates the
                            intellectual property or other rights of any third party, (ii) is unlawful, harmful,
                            fraudulent, deceptive, threatening, abusive, harassing, tortious, defamatory, vulgar,
                            obscene, libelous or otherwise objectionable or (iii) contains any virus, trojan horse,
                            worm, time bomb, unsolicited bulk commercial, or "spam" message, malware, or other harmful
                            code, file or program (including without limitation, password guessing programs, decoders,
                            password gatherers, keystroke loggers, cracking tools, packet sniffers, and/or encryption
                            circumvention programs) designed to interrupt, damage, or limit the functionality of any
                            software, hardware, or telecommunications equipment; (g) use the Licensed Materials in
                            violation of any applicable laws or regulations, including without limitation laws relating
                            to privacy, data protection, export controls, consumer and child protection, obscenity or
                            defamation, intellectual property, or the transmission of technical or personal data; (h)
                            access or use the Licensed Materials from jurisdictions subject to comprehensive U.S. export
                            embargoes or in violation of applicable export control or sanctions laws; (i) use the
                            Licensed Materials for the purpose of monitoring their availability, performance, or
                            functionality for benchmarking or competitive analysis, or publicly disclose the results of
                            any benchmarking or performance testing of the Licensed Materials without PostHog’s prior
                            written consent; (j) impersonate any person or entity, including any employee or
                            representative of PostHog, or misrepresent Customer’s affiliation with any person or entity;
                            or (k) use the Licensed Materials in connection with any high-risk or strict liability
                            activity in which the failure of the Licensed Materials could lead to death, personal
                            injury, or severe environmental damage (including, without limitation, space travel,
                            firefighting, police operations, power plant operation, military operations, air traffic
                            control, rescue operations, emergency medical services, hospitals, life-support systems or
                            similar activities). Customer is responsible for all activity conducted under its accounts
                            and for ensuring that its Affiliates and Users comply with the restrictions set forth in
                            this <SectionLink section="2.1" />.
                        </p>
```

## 4.1-4.2 Intellectual property, and the plain-English column on copying the website (original lines 746-785)

<!-- excerpt: original lines 746-785, sha256 4daadd11b3b23e92221b6de4c6cee08d8570786e6252d3e39210ca69e0569b07; the fenced block below is those lines, byte for byte -->
```tsx
                        <h2 id="ip">4. Intellectual property rights</h2>
                        <p>
                            4.1 Except as expressly set forth herein, PostHog alone (and its licensors, where
                            applicable) will retain all right, title and interest in and to the Licensed Materials,
                            Usage Data (as defined below) and Derived Data (as defined below), and any suggestions,
                            ideas, enhancement requests, feedback, code, or other recommendations provided by Customer,
                            its Affiliates, their Users or any third party relating to the Licensed Materials, which are
                            hereby assigned to PostHog. This Agreement is not a sale and does not convey to Customer,
                            its Affiliates or its Users any rights of ownership or other intellectual property rights in
                            or related to the Licensed Materials, or any other intellectual property rights of PostHog.
                        </p>
                    </div>
                    <div className="md:pt-10">
                        <p>Please do not copy PostHog or any of our stuff, pretty please.&nbsp;</p>
                    </div>
                    <div>
                        <p>
                            4.2 Customer shall not remove, alter or obscure any of PostHog’s (or its licensors’)
                            copyright notices, proprietary legends, trademark or service mark attributions, patent
                            markings or other indicia of PostHog’s (or its licensors’) ownership or contribution from
                            the Licensed Materials. Customer agrees to reproduce and include PostHog’s (and its
                            licensors’) proprietary and copyright notices on any copies of the Licensed Materials, or on
                            any portion thereof, including reproduction of the copyright notice. Notwithstanding
                            anything to the contrary herein, certain components of the Licensed Materials, including
                            without limitation, any component of the Licensed Materials distributed by PostHog as part
                            of PostHog FOSS, are licensed by third parties pursuant to their respective third-party
                            licenses, as described in the applicable source code annotations.
                        </p>
                    </div>
                    <div>
                        <p>Please respect our copyright and brand.&nbsp;</p>
                        <p>
                            Oh, and{' '}
                            <strong className="text-gradient bg-[length:180%_100%]">
                                pleeeeeease don’t copy our website.
                            </strong>{' '}
                            We love that you like it, but it is an important part of our brand. If you need help, get in
                            touch and we’ll happily share some advice. &nbsp;🙏
                        </p>
                    </div>
```

## 6.1 Fees (original lines 948-973)

<!-- excerpt: original lines 948-973, sha256 07c29448e883df42e1e0a2d72d5275f0334afe38c1b24b1100f9bc52d0c4ef00; the fenced block below is those lines, byte for byte -->
```tsx
                        <h2 id="payment">6. Payment of fees</h2>
                        <p>
                            6.1 Customer will pay PostHog the then-applicable fees for its use of the Licensed Materials
                            (the "<b>Fees</b>") in accordance with PostHog’s then-current pricing and billing policies
                            published at the time of use (the "<b>Pricing Terms</b>"), and, if applicable, as set forth
                            in an Order Form or as otherwise agreed through the services interface. Unless otherwise
                            specified in an Order Form, Fees are based on Customer’s actual usage of the Licensed
                            Materials. Customer may prepay for usage by purchasing credits to be applied against future
                            usage via an Order Form or through the services interface ("<b>Prepaid Credits</b>"), in
                            each case on the terms specified therein. Unless otherwise agreed in writing, Prepaid
                            Credits are non-refundable and expire twelve (12) months from the date of purchase.&nbsp;
                        </p>
                        <p>
                            If Customer’s use of the Licensed Materials exceeds any usage threshold, service capacity,
                            or prepaid credits specified in an Order Form or through the services interface, or
                            otherwise results in additional usage-based Fees, Customer will be billed for such usage and
                            agrees to pay the additional Fees. PostHog may increase Fees or introduce new charges at the
                            end of the Initial Credit Term (as defined below) or any then-current renewal term upon
                            thirty (30) days’ prior notice to Customer, which may be sent via email or through the
                            services interface or otherwise at PostHog's discretion. PostHog may also reduce Fees at any
                            time without notice. If Customer believes that PostHog has billed incorrectly, Customer must
                            notify PostHog no later than sixty (60) days after the closing date on the first billing
                            statement in which the error or problem appeared, in order to receive an adjustment or
                            credit. Billing inquiries should be submitted via an in-app support ticket to PostHog’s
                            customer success team.
                        </p>
```

## 6.4 Term (original lines 1036-1056)

<!-- excerpt: original lines 1036-1056, sha256 057acc3851930adbb5816beff24a0199eed2fb17ec0107be016895f5320063d3; the fenced block below is those lines, byte for byte -->
```tsx
                    <div>
                        <p>
                            6.4 Unless earlier terminated in accordance with this Agreement, this Agreement will
                            continue for the Initial Credit Term specified in the Order Form, or through the services
                            interface ("<b>Initial Credit Term</b>"), and will automatically renew for successive terms
                            of the same duration (collectively, the "<b>Term</b>") unless either party provides at least
                            thirty (30) days’ notice of non-renewal. If no Initial Credit Term is specified in an Order
                            Form, or otherwise through the services interface, the Initial Credit Term will be deemed
                            one (1) month and this Agreement will continue on a month-to-month basis, terminable by
                            either party in accordance with <SectionLink section="7.1" />. During any month-to-month
                            period (whether as the Initial Credit Term or following expiration of a fixed-term Order
                            Form), Customer may continue to access and use the Licensed Materials subject to PostHog’s
                            then-current usage-based Fees.
                        </p>
                    </div>
                    <div>
                        <p>
                            By default, PostHog is month-to-month and renews automatically. Unless you've prepaid for
                            credits or agreed to a fixed term, in which case that term applies instead.
                        </p>
                    </div>
```

## 7.1 Termination (original lines 1058-1070)

<!-- excerpt: original lines 1058-1070, sha256 1c4dd88d7271443ee25b59df76f6cfe5a3233ed4936b67621af5d44d658749e7; the fenced block below is those lines, byte for byte -->
```tsx
                        <h2 id="termination">7. Termination</h2>
                        <p id="section-7-1">
                            7.1 This Agreement shall continue until terminated in accordance with this{' '}
                            <SectionLink section="7" />. Customer may terminate this Agreement at any time upon thirty
                            (30) days’ written notice to PostHog, provided, however, that for the avoidance of doubt,
                            the termination of this Agreement pursuant to this sentence shall not absolve Customer of
                            the obligation to pay to PostHog any Fees for usage already incurred or otherwise due
                            hereunder, or agreed to pursuant to an Order Form or as otherwise specified through the
                            services interface, and any Prepaid Credits shall remain non-refundable. PostHog may
                            terminate this Agreement upon thirty (30) days’ written notice to Customer in the event that
                            Customer does not have, at such time, any existing and usable Prepaid Credits purchased via
                            an Order Form or otherwise.
                        </p>
```

## Last updated (original lines 1384-1384)

<!-- excerpt: original lines 1384-1384, sha256 420ae10e02db5604fb86141930835042f8fc16f5eb484eb7aef2d034132f71f4; the fenced block below is those lines, byte for byte -->
```tsx
                <p className="text-center text-sm opacity-60 mt-8 pb-12">Last Updated: June 29, 2026</p>
```
