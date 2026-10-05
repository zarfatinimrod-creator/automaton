> **Pinned reference to a GitHub-hosted text (github grade): ansperformance.eu "Copyright notice and disclaimer" (EUROCONTROL, Performance Review Unit).**
>
> - Source repo: https://github.com/euctrl-pru/aiu-portal (the source repository of the PRU web site, ansperformance.eu: its `README.md:5` at the commit below)
> - Path: `content/about/disclaimer.md`
> - Served at: https://ansperformance.eu/about/disclaimer/ (the footer link, `themes/pru-theme/layouts/partials/footer.html:217`, and `config.toml:432` at the commit below; the PRC Data Challenge 2026 site links the same page from its navbar, euctrl-pru/prc_data_challenge_website_2026@30dac62198145f04ca87fa0d3f50808c8201dcc0 `_quarto.yml:138-139`)
> - Commit SHA: `6a645289e4947d68af532852345efd5f646c5684` (`master`'s tip, 2026-09-19, "september 2026 release", per the tick-45 verifier)
> - Fetched from: https://raw.githubusercontent.com/euctrl-pru/aiu-portal/6a645289e4947d68af532852345efd5f646c5684/content/about/disclaimer.md (HTTP 200)
> - Fetched at (UTC): 2026-10-05T03:17:27Z
> - Original file: 18 lines, 1107 bytes, sha256 `a80515c1a07bd50d62a2f0758f769c4961b91b1b6d70edbd542deae6895123b8`
> - Licence of the repo: none. There is no `LICENSE` at this commit (the tick-45 auditor and verifier found none, and GitHub shows none). The notice itself allows copying "provided that EUROCONTROL is mentioned as the source and it is not used for commercial purposes (i.e. for financial gain)" (original line 7), and whether this repository's use meets the second limb is exactly what ansperformance.eu's CONDITIONAL_UNMET verdict leaves unsettled.
> - **The body is not copied here.** Only the lines ansperformance.eu's verdict in `research/channel-loop/terms-verdicts.json` relies on are quoted, each as the exact original lines, with EUROCONTROL named as their source: 4 of the 18 original lines are quoted below, as quotation for the record. Whether a full evidence copy is allowed here is the main thread's call. Each excerpt states its original line numbers twice, in its heading and in its marker, with the sha256 of those lines in the marker; a re-fetch at the commit above checks every quote byte for byte: `curl -s <Fetched from> | sed -n A,Bp | sha256sum`. The test `src/__tests__/revenue/terms-saved-copies.test.ts` recomputes each block's sha256 against its marker and checks that its heading states the same range.
> - Read in full on 2026-10-05, all 18 lines. It has no access, robots or automation clause; the rest of the notice is a no-warranty statement and a contact line.
> - Not edited: inside each fenced block, every line is the original line, byte for byte (original line 6 ends in a space, kept). Cite this file's own line numbers, or the original's (`content/about/disclaimer.md:N` at the commit above).

## The notice's title and description (original lines 2-3)

<!-- excerpt: original lines 2-3, sha256 4314eea9f36ccf19b656f2875a97de5bcc7111be57576a3c7293cfa577eaa487; the fenced block below is those lines, byte for byte -->
```yaml
title: "Copyright notice and disclaimer"
description: "About the legal use of content and materials published."
```

## Publication and the copying condition (original lines 6-7)

<!-- excerpt: original lines 6-7, sha256 e22685951203acd078cfb164648a2fbeb60b06539e79a1aca1d8671e249a6d10; the fenced block below is those lines, byte for byte -->
```md
This data is published by EUROCONTROL for information purposes. 
It may be copied in whole or in part, provided that EUROCONTROL is mentioned as the source and it is not used for commercial purposes (i.e. for financial gain). The information in this document may not be modified without prior written permission from EUROCONTROL.
```
