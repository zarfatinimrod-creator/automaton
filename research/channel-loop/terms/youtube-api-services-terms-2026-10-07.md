> **Pinned reference to a GitHub-hosted text (github grade): the YouTube API Services Terms of Service (the Americas version) and the YouTube API Services Developer Policies, with the three pages Open Terms Archive bundles beside them.**
>
> - Source repo: https://github.com/OpenTermsArchive/vlopses-us-versions (published by Open Terms Archive)
> - Path: `YouTube/Developer Terms.md`, one Markdown file holding five documents, which by Open Terms Archive's account are YouTube's pages under developers.google.com/youtube/terms/ (the attribution is Open Terms Archive's; nothing here fetched those pages, developers.google.com being terms-barred): the Terms of Service (original lines 1-283, its heading repeated at :13), the Developer Policies (:286-803, IV Definitions at :776-803), the Required Minimum Functionality (:807-1029), the Subject API Services (:1032-1115) and the Terms' Revision History (:1118-1270, latest entry June 1, 2026, :1133)
> - Which Terms of Service: the Americas version. Its link at original line 4 is the URL with no regional suffix, which the Revision History labels "(Americas)" (:1123); the APAC, EMEA and Russia versions (:1124-1126) are not in this file and are unread
> - Commit SHA: `80db0630dc36c1f2aa8006a11ea58033a8f67227` (the repository's main branch tip when fetched, by `git ls-remote`, as recorded for the reader; the commit's own date was not read)
> - Raw file at that commit: https://raw.githubusercontent.com/OpenTermsArchive/vlopses-us-versions/80db0630dc36c1f2aa8006a11ea58033a8f67227/YouTube/Developer%20Terms.md
> - Fetched: 2026-10-07, about 07:40 UTC, from raw.githubusercontent.com, by the main thread (tick 61), into its scratch folder and never committed; the reader, the verifier and the builder of this file each re-checked the sha256 below
> - Original file: 1270 lines, 166101 bytes, sha256 `c7a393695817433568d36d7383702e546549b273a7d292e44d5d712eb32c01b1`
> - Line count: 1,270 lines under `cat -n`; the last (original line 1270) has no final newline, so `wc -l` counts 1,269
> - Licence: the Terms bar copying for whoever accepts them ("copying": "barred" in `research/channel-loop/terms-verdicts.json`, on original line 661 with line 799 (ii); see "Verdict" below). Open Terms Archive's own repository licence was not read (no network in this tick)
> - **The body is not copied here.** Only the clauses the googleapis.com verdict in `research/channel-loop/terms-verdicts.json` and the six answers below cite are quoted, each as the exact original lines: 68 of the 1,270 original lines are quoted below, in 68 ranges, each range one clause (a numbered item, a definition, or one paragraph of the text), none longer than 12 lines, as quotation for the record. Every other line is cited by its number only. Original line 16 is never quoted: it carries the company's postal address; its binding sentence is matched by :46 and :57, and its definitions recur without the address at :799. Whether more may be quoted is the main thread's call. Each excerpt states its original line numbers twice, in its heading and in its marker, with the sha256 of those lines in the marker; a re-fetch at the commit above checks every quote byte for byte: `curl -s <Raw file at that commit> | sed -n A,Bp | sha256sum`. The test `src/__tests__/revenue/terms-saved-copies.test.ts` recomputes each block's sha256 against its marker and checks that its heading states the same range, and, run with `YT_TERMS_SOURCE=<the pinned download>`, compares every quoted line with the original's
> - Read in full on 2026-10-07 (tick 61) by one Opus reader and one adversarial Opus verifier, who agreed (the reader stopped at :1269; the verifier read :1270, the removal of the Monetization Guidelines, which bears on nothing here). The verdict is the main thread's
> - Not edited: inside each fenced block, every line is the original line, byte for byte (the blank lines between list items keep their spaces). Below, `OTA:N` is original line N; this file's own line numbers are its own

## The bundle's first title, the Terms of Service (original lines 1-1)

<!-- excerpt: original lines 1-1, sha256 79958fa0feafb24b66f4f4d71484e29ff7192e352f212ed2619bc5450e562b04; the fenced block below is those lines, byte for byte -->
```md
YouTube API Services Terms of Service Stay organized with collections Save and categorize content based on your preferences.
```

## The Terms of Service's heading (original lines 13-13)

<!-- excerpt: original lines 13-13, sha256 99086b35396e4368ca614c4e4879f298ae65fadae1dad90671cf3b916e3654a5; the fenced block below is those lines, byte for byte -->
```md
YouTube API Services Terms of Service
```

## ToS 2.2, Condition of Use (original lines 46-46)

<!-- excerpt: original lines 46-46, sha256 288b5a51ce97da346cbc0f638de97702ba5c6875cef79f960d260912eec587e4; the fenced block below is those lines, byte for byte -->
```md
    2.2 **Condition of Use.** Before you access or use the YouTube API Services, please read the documents comprising the Agreement carefully and make sure you understand them. If you disagree with any aspect of the Agreement, you do not have our permission to, and you must not, access or use any of the YouTube API Services.
```

## ToS 2.3, Modification of the Agreement (original lines 48-48)

<!-- excerpt: original lines 48-48, sha256 95395a7332159d2ef36fdb9b9c2d374afa0c98b9bd66e28a448dac552686d3bf; the fenced block below is those lines, byte for byte -->
```md
    2.3 **Modification of the Agreement.** YouTube may modify the Terms of Service or any of the other documents comprising the Agreement at any time. YouTube will provide notice of changes to the Terms of Service by posting the changes at [https://developers.google.com/youtube/terms/revision-history](http://developers.google.com/youtube/terms/revision-history) (or any successor URL), emailing the email address associated with the credentials assigned to you or your API Client(s) by YouTube or Google, or otherwise notifying you. The changes will not apply retroactively, and will become effective no sooner than 30 calendar days after posting. However, changes specific to new functionality or changes made for legal reasons may be effective immediately upon notice. You or your API Client(s)’ continued access to, or use of, the YouTube API Services, including your continued development activities in connection with any YouTube API Services and your API Client(s)’ interaction with any YouTube API Services after the changes to the Agreement takes effect, will be deemed your agreement to and acceptance of such changes. If you do not agree to any changes to the Agreement, you must terminate the Agreement.
```

## ToS 3.1, Compliance with the Agreement (original lines 57-57)

<!-- excerpt: original lines 57-57, sha256 4eb818b314a03fb8df608b9e95977f8800e5a1245e0f7a9616ffbbc82d03ae9b; the fenced block below is those lines, byte for byte -->
```md
    3.1 **Compliance with the Agreement.** You and your API Client(s) will (i) comply with the Agreement at all times when accessing or using the YouTube API Services; (ii) only access (or attempt to access) the YouTube API Services to develop and operate your API Client(s) by the means described in the Agreement, including in accordance with the documentation for the specific YouTube API Services you access; and (iii) if your API Client is a software application, you and your API Client will also comply with the Google Software Principles. YouTube may suspend or terminate your access to, or use of, any aspect of the YouTube API Services (including any credentials assigned to you or your API Client(s)), impose additional requirements and restrictions, or terminate the Agreement between you and YouTube, for any violation of the Agreement by you, your API Client(s) or those acting on your behalf.
```

## ToS 3.2, Unauthorized Persons (original lines 59-59)

<!-- excerpt: original lines 59-59, sha256 ac5f1bcc8a1d6eed9ac6f6ff2907939db81ae9f48f601d1c200506cf2e26d652; the fenced block below is those lines, byte for byte -->
```md
    3.2 **Unauthorized Persons.** You must not accept the Agreement, or access or use the YouTube API Services, if (i) you are not of legal age to form a binding contract with us, or (ii) you are a person barred from using or receiving the YouTube API Services under the applicable laws of the United States, the country in which you reside, or the countries from which you or your API Client(s) access or use the YouTube API Services.
```

## ToS 6, API Clients and Monitoring (original lines 76-76)

<!-- excerpt: original lines 76-76, sha256 9fd76b69faed6df935fb2069a6d2b34d45bdf1b4cb6ba7818557e8ae452b9228; the fenced block below is those lines, byte for byte -->
```md
    **API Clients and Monitoring.** YouTube may monitor, review and inspect your API Client(s), and monitor and audit your access to and use of the YouTube API Services, at any time and without further notice to you, to ensure quality, improve our products and services, and verify your compliance with the Agreement.
```

## ToS 7, User Privacy and API Clients (original lines 81-81)

<!-- excerpt: original lines 81-81, sha256 bd4fad53c1be74830e65ab112a5fb160e3be7c286fe5399e28aed7206609429a; the fenced block below is those lines, byte for byte -->
```md
    **User Privacy and API Clients.** Without limiting Section 5 (Compliance with Laws), you will comply with all applicable privacy laws and regulations, including those applying to personal data ("**Personal Data**"). Each API Client will provide and adhere to a published privacy policy that clearly and accurately describes to its users what user information you and your API Client access, collect and store, and how and why you and your API Client use, process, and share such information (including for advertising) with us and other third parties.
```

## ToS 8, Security (original lines 86-86)

<!-- excerpt: original lines 86-86, sha256 7457d14aa84aea833a236521a7704d9dcc0c26bdd516876c513549bd0f956d52; the fenced block below is those lines, byte for byte -->
```md
    **Security.** To the extent you and your API Client(s) are permitted to access or use data, you and your API Client(s) will, and will require those acting on your behalf to, maintain reasonable and appropriate administrative, organizational, technical and physical controls designed to ensure the privacy, security, and confidentiality of YouTube data (including API Data), YouTube Confidential Information and user data collected by your API Client(s) (including Personal Data) to protect from accidental or unauthorized destruction, access or use.
```

## ToS 13, Publicity (original lines 134-134)

<!-- excerpt: original lines 134-134, sha256 e19ed5ef2f0ecb94a29db0acb5eff9fbedd54a2bd2e40d87c686289a045a4382; the fenced block below is those lines, byte for byte -->
```md
     **Publicity.** YouTube may use your company or organization name (or personal name if an individual), product names or logos in presentations, marketing materials, customer lists, financial reports, website listings of customers, research and marketing case studies, and other marketing-related activities, including producing and distributing incidental depictions such as screenshots, video, or other content from your API Client(s). You grant to YouTube and its Affiliates a non-exclusive, irrevocable, royalty-free, worldwide license to display your company or organization name (or personal name if an individual), product name or logos for the above purposes. You must not make any public statements regarding your access to, or use of, the YouTube API Services that suggests partnership with, or sponsorship or endorsement by, YouTube without YouTube’s prior review and written approval.
```

## ToS 15, Usage and Quotas (original lines 156-156)

<!-- excerpt: original lines 156-156, sha256 0d7e578b90efd3d4a1c7a607105e5ceecfa6af49939d2eea904bf7de138aead3; the fenced block below is those lines, byte for byte -->
```md
     **Usage and Quotas.** YouTube may set a quota on usage of any YouTube API Services at any time as applied to any specific YouTube API Services user or API Client, category of users or API Clients, or all users or API Clients. You and your API Client(s) will not, and will not attempt to, exceed or circumvent use or quota restrictions. YouTube may specify additional requirements relating to use or quotas including in the Developer Policies.
```

## ToS 16.1, Ownership, and the definition of YouTube Property (original lines 163-163)

<!-- excerpt: original lines 163-163, sha256 e2e195629ea715e72adc1ce0cf12710dc18288df1694892c73aa0045a70d3736; the fenced block below is those lines, byte for byte -->
```md
     16.1 **Ownership.** As between you and YouTube, YouTube, its Affiliates, and its and their licensors and suppliers, retain all rights in, title to, interest in, and ownership of (including all intellectual property rights (e.g., all patent, trademark, copyright, trade secret, and other proprietary rights) in and to) all YouTube API Services (including all API Data), YouTube Brand Features, the YouTube Developer Site, the Agreement, YouTube Confidential Information, all YouTube websites, applications, products and services, all underlying technology and computer programming, and all derivative works of any of the foregoing ("**YouTube Property**"). As between you and YouTube, you retain all rights in, title to, interest in and ownership of your API Client(s), excluding any YouTube Property.
```

## ToS 16.2, No Other Rights (original lines 165-165)

<!-- excerpt: original lines 165-165, sha256 720f26202ce429a5cf445d2ca78f0d5f9e084eaf5d85f35abe7ea65aacc46e52; the fenced block below is those lines, byte for byte -->
```md
     16.2 **No Other Rights.** Except for the express rights contained in the Agreement, YouTube grants you no other rights or licenses (whether express, implied, by virtue of estoppel or exhaustion, or otherwise) to the YouTube Property or any of YouTube’s or its Affiliates’ intellectual property rights.
```

## ToS 24.1, Termination by You (original lines 241-241)

<!-- excerpt: original lines 241-241, sha256 f850ece4fdff8e9bd3f542ef8a160b9796a617450160c9a4b3430a581e0f2486; the fenced block below is those lines, byte for byte -->
```md
     24.1 **Termination by You.** You may terminate your legal agreement with YouTube by terminating your access to and use of the YouTube API Services (including discontinuing access to and use by your API Client(s) and those acting on your behalf) at any time. You do not need to specifically inform YouTube when you stop using and accessing the YouTube API Services unless otherwise required by YouTube.
```

## ToS 24.3, Effect of Termination (original lines 245-245)

<!-- excerpt: original lines 245-245, sha256 16932ebe72324b29e4c77ff3317b20c9119a2cd4df4728f9cbae576280661f61; the fenced block below is those lines, byte for byte -->
```md
     24.3 **Effect of Termination.** Upon any suspension, notice of any discontinuance, or termination (whether by you or YouTube), you will immediately stop accessing and using all YouTube Property and delete all YouTube API Services (including all API Data) and YouTube Confidential Information in your possession or control, including from your servers. At YouTube’s request, you will certify your deletion of all YouTube API Services (including all API Data) and YouTube Confidential Information in your possession or control in writing that is signed by your authorized representative who has the authority to bind you. YouTube may independently communicate with any account owner whose account(s) are associated with credentials assigned to you or your API Client(s) to provide notice of both the suspension or termination of your access to, or use of, the YouTube API Services and the display of any advertisements associated with your API Client(s) (where applicable).
```

## The Developer Policies' title (original lines 286-286)

<!-- excerpt: original lines 286-286, sha256 66c47133c0c5902ed5624c8b1f5fe86ba415d205a8262e52b9e59181b960a6d5; the fenced block below is those lines, byte for byte -->
```md
YouTube API Services - Developer Policies Stay organized with collections Save and categorize content based on your preferences.
```

## The Policies are a component of the Agreement (original lines 295-295)

<!-- excerpt: original lines 295-295, sha256 ba16399731de0abfbf628b53364bf8130f09b50225400c8da9734a394e76b9d3; the fenced block below is those lines, byte for byte -->
```md
Please note that this is a legal document and that these Policies are a component of the [Agreement](#definition-agreement), so you must comply with them. YouTube reserves the right to change these Policies, and your continued access to, or use of, [YouTube API Services](#definition-youtube-api-services) constitutes your agreement to and acceptance of any such changes. Policy changes, like changes to the YouTube API Services [Terms of Service](#definition-terms-of-service), will be documented in the [Terms of Service Revision History](https://developers.google.com/youtube/terms/revision-history), and you can subscribe to the [RSS feed](https://developers.google.com/static/youtube/terms/feeds/api-services-terms-of-service-revision-history.xml) for that revision history to be notified of any such changes.
```

## I, Terminology: must (original lines 302-302)

<!-- excerpt: original lines 302-302, sha256 2eead443be698b896772da3e30aea0775e38650b7c01960df71c3a3a614e2ff5; the fenced block below is those lines, byte for byte -->
```md
1.  The terms **must** and required refer to absolute requirements.
```

## I, Terminology: must not (original lines 303-303)

<!-- excerpt: original lines 303-303, sha256 0a0a5bd272ac2ffbb79613e0408dbfbab83cfce95fcfa7427bf0c498a3cc7538; the fenced block below is those lines, byte for byte -->
```md
2.  The term **must not** refers to an absolute prohibition.
```

## II.3, Give users control: a privacy policy for each API Client (original lines 324-324)

<!-- excerpt: original lines 324-324, sha256 058a2a1ecff5c03be4491ce792b4ae5bf879756fc23ba331a4c91cfdfdbf9a8c; the fenced block below is those lines, byte for byte -->
```md
    Building on the importance of transparency, this principle dictates that users must be aware of and have actively consented to the actions that an [API Client](#definition-api-client) takes on their behalf. It means that users know about and have final authority over any actions the [API Client](#definition-api-client) takes to insert, share, update, or delete their data. It also means that each [API Client](#definition-api-client) must provide a privacy policy that clearly informs users about the information that the [API Client](#definition-api-client) accesses, collects, stores, shares, and otherwise uses.
```

## III.A.1, YouTube's Terms of Service linked and the client's own terms of use (original lines 340-340)

<!-- excerpt: original lines 340-340, sha256 3f435d21b99288cd50ad3c501f101c5feb60d169bda1c23761b926342a4e8e51; the fenced block below is those lines, byte for byte -->
```md
1.  [API Clients](#definition-api-client) must display a link to YouTube's Terms of Service ([https://www.youtube.com/t/terms](https://www.youtube.com/t/terms)), and they must also state in their own terms of use that, by using those [API Clients](#definition-api-client), users are agreeing to be bound by the YouTube Terms of Service.
```

## III.A.2, a privacy policy users agree to (original lines 342-342)

<!-- excerpt: original lines 342-342, sha256 61e856c2da60a20081fe7ae50c73273e4ecd978cbc5b2d3fa26d6658025b2248; the fenced block below is those lines, byte for byte -->
```md
2.  Each [API Client](#definition-api-client) must require users to agree to a privacy policy before users can access the [API Client's](#definition-api-client) features and functionality. The privacy policy must:
```

## III.A.2.b, the client says it uses YouTube API Services (original lines 346-346)

<!-- excerpt: original lines 346-346, sha256 a856a5e1414d8b251a2c59f6f514db3677ea516eba609fbbc460862332c80cd2; the fenced block below is those lines, byte for byte -->
```md
    2.  notify users that the [API Client](#definition-api-client) uses [YouTube API Services](#definition-youtube-api-services),
```

## III.A.2.c, the Google Privacy Policy linked (original lines 348-348)

<!-- excerpt: original lines 348-348, sha256 e4dbe84f51f0043ca4f59832831dfdf0d36f9c2b109dcb00e29ec7d1189825d6; the fenced block below is those lines, byte for byte -->
```md
    3.  reference and link to the Google Privacy Policy at http://www.google.com/policies/privacy,
```

## III.A.2.h, with Authorized Data, revocation through Google's security settings page (original lines 358-358)

<!-- excerpt: original lines 358-358, sha256 473d5ed73c2f2ef0b6f231ba3dffe99a4d5f240240d25141abdeaaa764b014ab; the fenced block below is those lines, byte for byte -->
```md
    8.  if the [API Client](#definition-api-client) accesses or uses [Authorized Data](#definition-authorized-data), explain that, in addition to the [API Client's](#definition-api-client) normal procedure for deleting stored data, users can revoke that [API Client's](#definition-api-client) access to their data via the Google security settings page at [https://security.google.com/settings/security/permissions](https://security.google.com/settings/security/permissions), and
```

## III.A.2.i, with Authorized Data, a contact (original lines 360-360)

<!-- excerpt: original lines 360-360, sha256 38cd216ad3852ba9b333d0a21936d6a679e2b18dfc83972b273147b15c9767af; the fenced block below is those lines, byte for byte -->
```md
    9.  if the [API Client](#definition-api-client) uses [Authorized Data](#definition-authorized-data), explain how users can contact the [API Client](#definition-api-client) owner or developer with questions or complaints about the [Client's](#definition-api-client) privacy practices.
```

## III.D.1, the Console may ask for identification or contact details (original lines 433-433)

<!-- excerpt: original lines 433-433, sha256 122e5f1c9c39f34e7940aff2ea124b5292b44fdd0e6d6c5532933296bb2a5105; the fenced block below is those lines, byte for byte -->
```md
    In addition to creating [API Credentials](#definition-api-credentials), the Developers Console might require you to provide certain other information, such as identification or contact details, before you can access or use the [YouTube API Services](#definition-youtube-api-services) associated with those credentials. YouTube reserves the right to require you to provide additional information to continue to access or use [YouTube API Services](#definition-youtube-api-services).
```

## III.D.1, authorized and non-authorized requests (original lines 437-437)

<!-- excerpt: original lines 437-437, sha256 2fdfe782b6c78f93e1481a2cc0a42e047feb8f24638b5fcd7fddb7a6378764e9; the fenced block below is those lines, byte for byte -->
```md
    *   Some services only support authorized API requests, while others support authorized and non-authorized requests.
```

## III.D.1.c, exactly one API Project per API Client (original lines 448-448)

<!-- excerpt: original lines 448-448, sha256 de189912e5eb4860d5aba8d46d97483f835192d1064454d8ca0d2559288ccb51; the fenced block below is those lines, byte for byte -->
```md
    3.  If your [API Client](#definition-api-client) needs to create [API Credentials](#definition-api-credentials) to access or use [YouTube API Services](#definition-youtube-api-services), you must create exactly one (1) [API Project](#definition-api-project) for that [API Client](#definition-api-client). Those [API Credentials](#definition-api-credentials) are intended to be used exclusively by the associated API Client, which means that you must not use that one (1) [API Project](#definition-api-project) for multiple [API Clients](#definition-api-client).
```

## III.D.1.d, sharing API Credentials (original lines 450-450)

<!-- excerpt: original lines 450-450, sha256 c357d1db1da9f794569c2d2133ac233aa7b1dea462c55382200e7d2ab82d8a82; the fenced block below is those lines, byte for byte -->
```md
    4.  You may share your [API Credentials](#definition-api-credentials) with agents operating solely on your behalf and under a written duty of confidentiality. However, you must not share or disclose your [API Credentials](#definition-api-credentials) to any other third party, allow access to or use of your [API Credentials](#definition-api-credentials) by any other third party, or embed your [API Credentials](#definition-api-credentials) in open source projects.
```

## III.D.2, the Data API example (original lines 457-457)

<!-- excerpt: original lines 457-457, sha256 cc97f1aa947111ba47cd31bb9aba2cf99c67377cc4aeb9727e2fa5cd341b5312; the fenced block below is those lines, byte for byte -->
```md
    *   The YouTube Data API service requires authorization for some actions. For example, an [API Client](#definition-api-client) can search for public videos but does not need user authorization to do so. However, an [API Client](#definition-api-client) does need user authorization to upload a video to the user's YouTube channel.
```

## III.D.2, Revocation, item 2: the security settings link in every API Client's privacy policy (original lines 490-490)

<!-- excerpt: original lines 490-490, sha256 a94fb363ebce73c7aec2fad1256f5f4af4d79b2b54b56df781c1f27c6232691e; the fenced block below is those lines, byte for byte -->
```md
        2.  As noted in section (III.A.2.i), every [API Client](#definition-api-client) must include in its Privacy Policy a link to Google's security settings page ([https://security.google.com/settings/security/permissions](https://security.google.com/settings/security/permissions)). When a user revokes consent through that page, you and your [API Clients](#definition-api-client) must also delete all [API Data](#definition-api-data) related to that user that was accessed or stored pursuant to such consent. To comply with this policy, your [API Clients](#definition-api-client) will need to periodically reconfirm that its authorization tokens are still valid and delete [API Data](#definition-api-data) associated with users whose authorization tokens cannot be refreshed.
```

## III.D.3, the API Compliance Audit as the route to more quota (original lines 498-498)

<!-- excerpt: original lines 498-498, sha256 1a5037fde0bfee402c544d461f9d0bec03f02c368c0a7dc7b8da3c287983fb07; the fenced block below is those lines, byte for byte -->
```md
    If your [API Client](#definition-api-client) reaches the quota limit for a service, you can apply for a quota extension by completing an [API Compliance Audit](https://support.google.com/youtube/contact/yt_api_form) where you must specify the use case for which you need the extension. If you have been audited in the past 12 months and have been marked compliant by YouTube API Services team, you can apply for an [additional quota extension](https://support.google.com/youtube/contact/yt_api_form).
```

## III.D.5, contact by the Console account's email, and compliance mail (original lines 510-510)

<!-- excerpt: original lines 510-510, sha256 dac0c89fca05e9a581754e98a86d25ed4c786fc8db9176914d150a45d6195113; the fenced block below is those lines, byte for byte -->
```md
    YouTube's primary means of contacting you about your [API Project](#definition-api-project) or [API Client](#definition-api-client) is the email address that is associated with the Google Account that you use to log in to the Google Developers Console. You must comply to any communication that YouTube sends you regarding compliance issues relating to your [API Clients](#definition-api-client).
```

## III.D.6, Prohibited Access (original lines 516-516)

<!-- excerpt: original lines 516-516, sha256 c750644567e51c06b30c6b9579dc2bfb762de867db104aa940737aae98c5e1d2; the fenced block below is those lines, byte for byte -->
```md
    You are prohibited from accessing or attempting to access [YouTube API Services](#definition-youtube-api-services) via any means if your [API Credentials](#definition-api-credentials) are suspended, revoked, or terminated, or if the Google Account you used to create those credentials is suspended or terminated, for any reason. In that case, you must not access or attempt to access [YouTube API Services](#definition-youtube-api-services) via any means, including by creating or using a proxy to create new Google Accounts, [API Credentials](#definition-api-credentials) or [API Projects](#definition-api-project).
```

## III.E.2.a, aggregation (original lines 538-538)

<!-- excerpt: original lines 538-538, sha256 3196fb9ffc89dacc4a282793d9b3b7bdb6ae40ccc12bf1680cb64eaab0ad2563; the fenced block below is those lines, byte for byte -->
```md
    1.  Do not aggregate [API Data](#definition-api-data) except that you may only aggregate [API Data](#definition-api-data) relating to YouTube channels that are under the same content owner as recognized by YouTube pursuant to content licensing agreement(s) between YouTube and such content owner. Such aggregated [API Data](#definition-api-data) must only be viewable by that content owner.
```

## III.E.3.b, Authorized Data shown only to the authorizing user (original lines 550-550)

<!-- excerpt: original lines 550-550, sha256 32002946d712d4abf52391796e77d37e554e943b1d45f356ada683d2a42ba1fc; the fenced block below is those lines, byte for byte -->
```md
    2.  [API Clients](#definition-api-client) must not display or allow access to [Authorized Data](#definition-authorized-data) to anyone other than the authorizing user or agents expressly approved by that user.
```

## III.E.4.b, the 30-day re-check of authorization (original lines 576-576)

<!-- excerpt: original lines 576-576, sha256 55e749dee2fddda9e76abf97a50598dc727a1676d222efff6d56bde65af94e57; the fenced block below is those lines, byte for byte -->
```md
        Note that even though an [API Client](#definition-api-client) may store this data for more than 30 days, the [Client](#definition-api-client) must still ensure every 30 days that it is still authorized by the user to access that data.
```

## III.E.4.b, the 30-day check that the video still exists (original lines 578-578)

<!-- excerpt: original lines 578-578, sha256 85fd41075fa83b4e46c689326f169dffd4e6ec43370365eb77e6b2c6e8f0af9d; the fenced block below is those lines, byte for byte -->
```md
        For example, an [API Client](#definition-api-client) may store view counts for a video for more than 30 days, but it must still verify every 30 days that its authorization to access the video uploader's data has not been revoked. The [API Client](#definition-api-client) must also verify, every 30 days, that the video has not been deleted.
```

## III.E.4.c, other Authorized Data, 30 calendar days (original lines 582-582)

<!-- excerpt: original lines 582-582, sha256 30c21901aca59e79282f282d1f935e681c5f865100c13678120592b887b2fd88; the fenced block below is those lines, byte for byte -->
```md
    3.  [API Clients](#definition-api-client) may store all other types of [Authorized Data](#definition-authorized-data) not identified in section (III.E.4.b) for as long as is necessary for the purposes of the specific consent granted by an active user and for no longer than 30 calendar days. After 30 calendar days, the [API Client](#definition-api-client) must either delete or refresh the stored data.
```

## III.E.4.d, Non-Authorized Data, 30 calendar days, then delete or refresh (original lines 584-584)

<!-- excerpt: original lines 584-584, sha256 0167137eab8bbf9fb999953646b0523d74799d75d730c6bd8d03ef7075ba6568; the fenced block below is those lines, byte for byte -->
```md
    4.  [API Clients](#definition-api-client) may temporarily store limited amounts of [Non-Authorized Data](#definition-non-authorized-data) for as long as is necessary for the purposes of the [API Client](#definition-api-client) but not longer than 30 calendar days. As in section (III.E.4.c) immediately above, this means that after 30 calendar days, the [API Client](#definition-api-client) must either delete or refresh the stored data.
```

## III.E.4.h, no new or derived data or metrics (original lines 596-596)

<!-- excerpt: original lines 596-596, sha256 34fca03b6648de30f50de51bf2e692b77ccc53973c4f74a79805db578a6904d8; the fenced block below is those lines, byte for byte -->
```md
    8.  Your [API Clients](#definition-api-client) must not (i) replace [API Data](#definition-api-data) with similar, independently calculated data, or (ii) access or use [API Data](#definition-api-data) to create new or derived data or metrics.  To the extent your [API Clients](#definition-api-client) display any information, data or metrics not based on [API Data](#definition-api-data) alongside [API Data](#definition-api-data), your [API Clients](#definition-api-client) must include a clear and prominent disclosure there that such information, data and metrics are not from YouTube and are part of your own product.
```

## III.E.4.h, the example (original lines 598-598)

<!-- excerpt: original lines 598-598, sha256 74d05dcbb41253d06059f8d4ce19b9f13496c78d6de13869d916a220c7cb2587; the fenced block below is those lines, byte for byte -->
```md
        For example, when displaying the number of likes for a video, your [API Client](#definition-api-client) must use the number returned in the [API Data](#definition-api-data). You must not substitute a different number to represent likes, such as the number of users of your [API Client](#definition-api-client) that liked the video. Similarly, you are not permitted to use the number of likes returned in the [API Data](#definition-api-data) to calculate other metrics, such as the percentage of total likes that were made through your [API Client](#definition-api-client) or a score that factors in likes, total views, or any other [API Data](#definition-api-data). However, you are permitted, for example, to display the number of likes that were made through your [API Client](#definition-api-client) as long as that number is displayed alongside the total likes returned in the [API Data](#definition-api-data) and as long as your [API Client](#definition-api-client) clearly communicates that the [API Client](#definition-api-client) calculates the additional metric independently of YouTube [API Data](#definition-api-data).
```

## III.E.4.j, the Made For Kids lookup when embedding (original lines 602-602)

<!-- excerpt: original lines 602-602, sha256 16390e1d03ed93db2583092745883e27f511e44ffb2efef550169658e6c793e9; the fenced block below is those lines, byte for byte -->
```md
    10.  [API Clients](#definition-api-client) must look up the Made For Kids status of each YouTube video that it embeds on its site or app by following the instructions in [this guide](https://developers.google.com/youtube/v3/guides/made_for_kids_status). For each video that is designated Made For Kids, [API Clients](#definition-api-client) must turn off tracking and make sure that all data collection with respect to that player is compliant with applicable law(s) including the U.S. Children's Online Privacy (COPPA) and E.U. General Data Protection Regulation (GDPR)). See the [YouTube Help Center](https://support.google.com/youtube/answer/9528076) for more information on determining content as Made for Kids.
```

## III.E.5, Security: the opening words (original lines 606-606)

<!-- excerpt: original lines 606-606, sha256 05d45da3a85889e04513c3f9b7c0a44902c3acec46d8fea77f9e440250dda9b3; the fenced block below is those lines, byte for byte -->
```md
    You and your [API Client](#definition-api-client) must:
```

## III.E.5, Security, item 1 (original lines 608-608)

<!-- excerpt: original lines 608-608, sha256 372b34bc842ab371d5b0a296dd2d18122f2498220605c027612df56d701d21ba; the fenced block below is those lines, byte for byte -->
```md
    1.  maintain appropriate administrative, organisational, technical, and physical controls to ensure the privacy, security, and confidentiality of user data and [API Data](#definition-api-data);
```

## III.E.5, Security, item 3 (original lines 610-610)

<!-- excerpt: original lines 610-610, sha256 eb55d179476a9c5e8ab098ebcdbe04b46aabe08fb7fdc3d3d0992eb6555ac1be; the fenced block below is those lines, byte for byte -->
```md
    3.  protect [API Data](#definition-api-data) and any other data used in your [API Client](#definition-api-client) from unauthorized access, use, or disclosure.
```

## III.E.6, Scraping (original lines 613-613)

<!-- excerpt: original lines 613-613, sha256 83448d08391fdf067611e54d629f7737d08c12578b4e0e09337f694f5ef1998a; the fenced block below is those lines, byte for byte -->
```md
    You and your [API Clients](#definition-api-client) must not, and must not encourage, enable, or require others to, directly or indirectly, scrape [YouTube Applications](#definition-youtube-applications) or [Google Applications](#definition-google-applications), or obtain scraped YouTube data or content. Public search engines may scrape data only in accordance with YouTube's robots.txt file or with YouTube's prior written permission.
```

## III.G.1, Prohibited Actions: the opening words (original lines 659-659)

<!-- excerpt: original lines 659-659, sha256 9b4f29bb2c3a6149fb475e1a424d4d42e773a14ee09a0a090c274a849fb5c4d9; the fenced block below is those lines, byte for byte -->
```md
    You and your [API Clients](#definition-api-client) must not, and must not encourage, enable, or require others to:
```

## III.G.1.a, no redistribution of any portion of YouTube API Services (original lines 661-661)

<!-- excerpt: original lines 661-661, sha256 1f87c571ebe9c89d3d78066a1d4cbbe93aea1cb4af552ad9c596288ca20c1345; the fenced block below is those lines, byte for byte -->
```md
    1.  sell, purchase, lease, lend, convey, redistribute, or sublicense all or any portion of [YouTube API Services](#definition-youtube-api-services), including YouTube audiovisual content;
```

## III.H, accounts on request (original lines 692-692)

<!-- excerpt: original lines 692-692, sha256 e2e0fa648df9e28777cb37ab6c9e023629a4d684e15ce37e8ec87c5bea95ae72; the fenced block below is those lines, byte for byte -->
```md
3.  upon request, and within the timeframe stated in that request, provide YouTube with account(s) necessary to access all features or functions of the current, in-production version(s) of your [API Clients](#definition-api-client), so that YouTube may review those [API Clients](#definition-api-client) for compliance with the [Agreement](#definition-agreement).
```

## III.H, technical means against non-compliance (original lines 694-694)

<!-- excerpt: original lines 694-694, sha256 a895995889295bd8338058f6a927758fecce5aeccdc1a812e915a4de1b989318; the fenced block below is those lines, byte for byte -->
```md
YouTube may use any technical means to overcome non-compliance with these provisions.
```

## III.J, the Upload Project exception (original lines 757-757)

<!-- excerpt: original lines 757-757, sha256 811f5e397fd69519ca405dceb4edc546015159116f315088a9d4cd8a0d441ed1; the fenced block below is those lines, byte for byte -->
```md
    2.  Notwithstanding Section III.D.1.c (API Credentials) above which requires exactly one (1) [API Project](#definition-api-project) for each [API Client](#definition-api-client), you can upload your own videos to your own official YouTube channel(s) via the YouTube Data API Service (not via your Child-Directed API Client or anyone else's API Client) by creating a new API Project ("**Upload Project**").
```

## III.L, additional derived metrics and storage only for audited developers who applied (original lines 774-774)

<!-- excerpt: original lines 774-774, sha256 3448d96f2efa3cc1cb612e8b04f2872fff7eced15479ea0e51ad59a78ee4befc; the fenced block below is those lines, byte for byte -->
```md
These policies are only applicable to audited developers with analytics use cases that have explicitly applied for permission to create additional metrics and/or store statistical data through the [standard quota extension request](https://support.google.com/youtube/contact/yt_api_form) from (starting June 01, 2026). The specific additional metrics and data storage allowances under these policies can be viewed in [Additional policies for derived metrics and data storage](https://developers.google.com/youtube/terms/derived-metrics-policy).
```

## IV, API Client (original lines 781-781)

<!-- excerpt: original lines 781-781, sha256 402701883ed67c979deeabce61178c76f97f994ee2178441146dde59f7c26e92; the fenced block below is those lines, byte for byte -->
```md
"**API Client**" means a website or software application (including a mobile application) developed by you that accesses or uses the [YouTube API Services](#definition-youtube-api-services).
```

## IV, API Credentials (original lines 783-783)

<!-- excerpt: original lines 783-783, sha256 e2352a59741a9f5e236711de97960942cf55b5701d25077c8dad2a3f76bc1e4a; the fenced block below is those lines, byte for byte -->
```md
"**API Credentials**" means the credentials assigned by YouTube or Google via the Google Developer Console that each [API Project](#definition-api-project) authenticates with to access and use the [YouTube API Services](#definition-youtube-api-services).
```

## IV, API Project (original lines 787-787)

<!-- excerpt: original lines 787-787, sha256 04efe245d028407d1fdf240e8651d055e903917065193f6c3de062df0ddb2b2a; the fenced block below is those lines, byte for byte -->
```md
"**API Project**" means the project created in the Google Developer Console that is required for API Client(s) to access and use the [YouTube API Services](#definition-youtube-api-services).
```

## IV, Authorized Data (original lines 789-789)

<!-- excerpt: original lines 789-789, sha256 3a451b0aea0ecf40c5eaa504f339b90a0c5c683bda6a6cbd532d27ac35a40a08; the fenced block below is those lines, byte for byte -->
```md
"**Authorized Data**" means [API Data](#definition-api-data) that an active user expressly authorizes an [API Client](#definition-api-client) to access or otherwise use via [User Credentials](#definition-user-credentials).
```

## IV, Non-Authorized Data (original lines 793-793)

<!-- excerpt: original lines 793-793, sha256 0b3d2cfd172d54bc753f68305a5cd8efce67c7e6e736056db48496a3dd95bb15; the fenced block below is those lines, byte for byte -->
```md
"**Non-Authorized Data**" means [API Data](#definition-api-data) accessible by an [API Client](#definition-api-client) without [User Credentials](#definition-user-credentials).
```

## IV, Terms of Service, and where they are located (original lines 795-795)

<!-- excerpt: original lines 795-795, sha256 63613be15a537494d2ea66de9e81dd18505810b1339bdfa8d0f7a94393d7f07b; the fenced block below is those lines, byte for byte -->
```md
"**Terms of Service**" means the YouTube API Services Terms of Service currently located at [https://developers.google.com/youtube/terms/api-services-terms-of-service](https://developers.google.com/youtube/terms/api-services-terms-of-service).
```

## IV, User Credentials (original lines 797-797)

<!-- excerpt: original lines 797-797, sha256 7d159d3618ea234f16cbd53c6596b6de1f27b26dd3ae545ededc95607613bf7a; the fenced block below is those lines, byte for byte -->
```md
"**User Credentials**" means the credentials issued to users that users can authenticate with to permit API Client(s) to perform operations on their behalf that require authorization.
```

## IV, YouTube API Services, and API Data (original lines 799-799)

<!-- excerpt: original lines 799-799, sha256 1d3d18a8dd46a1b91ae3994099705f8f5ab87b10bae5bd7663630f6291c2bf71; the fenced block below is those lines, byte for byte -->
```md
"**YouTube API Services**" means (i) the YouTube API services (e.g., YouTube Data API service and YouTube Reporting API service) made available by YouTube including those YouTube API services made available on the YouTube Developer Site (as defined below), (ii) documentation, information, materials, sample code and software (including any human-readable programming instructions) relating to YouTube API services that are made available on [https://developers.google.com/youtube](https://developers.google.com/youtube) or by YouTube, (iii) data, content (including audiovisual content) and information provided to [API Clients](#definition-api-client) (as defined above) through the YouTube API services (the "[API Data](#definition-api-data)"), and (iv) the credentials assigned to you and your API Client(s) by YouTube or Google.
```

## IV, YouTube Applications (original lines 801-801)

<!-- excerpt: original lines 801-801, sha256 6942666f23b6346acdbd70a51f42cb970705c5380bd435f244df49d812fdcfeb; the fenced block below is those lines, byte for byte -->
```md
"**YouTube Applications**" means YouTube websites, applications, services, products, pages, and other properties, including **https://www.youtube.com**, **m.youtube.com**, mobile applications like the YouTube Gaming application, and so forth, but excluding [YouTube API Services](#definition-youtube-api-services).
```

## Revision History: the Americas version (original lines 1123-1123)

<!-- excerpt: original lines 1123-1123, sha256 5fe2abaa8d13161afd94e1d819836b664ef082adc5f0f3e2a6cfa9445a75e541; the fenced block below is those lines, byte for byte -->
```md
*   [YouTube API Services Terms of Service (Americas)](https://developers.google.com/youtube/terms/api-services-terms-of-service)
```

## Revision History: the EMEA version (original lines 1125-1125)

<!-- excerpt: original lines 1125-1125, sha256 9a770d24d58523293de9dcd747f3dc9dbf74b7ba20b35b41fc5966ebb209d336; the fenced block below is those lines, byte for byte -->
```md
*   [YouTube API Services Terms of Service (EMEA)](https://developers.google.com/youtube/terms/api-services-terms-of-service-emea)
```

## Revision History: the legal documents are the authoritative source (original lines 1131-1131)

<!-- excerpt: original lines 1131-1131, sha256 b53403c0188a825a5a34718caeddcd429a5111456326e62492c282f9d969241f; the fenced block below is those lines, byte for byte -->
```md
Note that, in all cases, the legal documents themselves are the authoritative source of information.
```

## Revision History, July 1, 2021: the default quota allocation (original lines 1159-1159)

<!-- excerpt: original lines 1159-1159, sha256 ad27710b945a4789f192f26c35e3f5c0db1052406bb25fd774545e1199e08992; the fenced block below is those lines, byte for byte -->
```md
All developers using YouTube's API Services must complete an API Compliance Audit in order to be granted more than the default quota allocation of 10,000 units. To date, both the compliance audit process and requests for additional quota unit allocations have been conducted by developers filling out and submitting the [YouTube API Services - Audit and Quota Extension Form](https://support.google.com/youtube/contact/yt_api_form).
```

## Revision History: Made for Kids status checked through the Data API before embedding (original lines 1176-1176)

<!-- excerpt: original lines 1176-1176, sha256 f34cf5ee3d5ad4a1f77f5730df785edea3ee65f01c2168d3bdfb529d60b99012; the fenced block below is those lines, byte for byte -->
```md
*   The new [Section III.E.4.j](https://developers.google.com/youtube/terms/developer-policies#III-E-4-j) relates to checking the Made for Kids (MFK) status of content before embedding it on your sites and apps. You are responsible for knowing when videos that you embed on your API Client are made for kids and treating data collected from the embedded player accordingly. As such, you must check the status of content using YouTube Data API Service before embedding it on your API Client via any YouTube embedded players.
```

## The six answers (ruling 7.10 row 24 §2 decision 2 (i)-(vi))

The reader's answers as the adversarial verifier corrected them: every correction of the verifier's record is applied, and every point the text does not state in its own words is marked [inference]. The scope they rest on: the Terms bind anyone "accessing or using the YouTube API Services" (OTA:16, cited by pointer; the same words at :57); nobody may access before agreeing (OTA:46); the Agreement is the Terms of Service, the Developer Policies, the Guidelines, the credentials, the Google Software Principles and the YouTube Terms (OTA:37-44), the Policies are "a component of the Agreement" (OTA:295), and the Terms of Service win on a conflict (OTA:50). "Must" is an absolute requirement and "must not" an absolute prohibition (OTA:302, :303). Code pointers are to this repository at 4795dee, where amendment 1's fold of ruling 7.10 row 24 (6db0827) has moved `src/revenue/youtube-madeforkids.ts`'s lines from c1df0c8, at which this file was first built; where fold 1008e81 changed what the reader read at c5ee52e, the answer says so.

**(i) Does an API Client with no users that reads only its own channel's video status owe the user-facing duties (a ToS link, a privacy policy, the identity the Console may ask for)?**

Yes, on the words, and the "no users" premise does not hold. Under the one-client ruling of (ii), the owner who gives the analytics consent holds User Credentials (OTA:797), so the combined client has a user and III.A.2 applies in full (OTA:342-360, the Authorized Data items at :358 and :360 included); (i) is decided by (ii). The duties: "Each API Client will provide and adhere to a published privacy policy" (OTA:81), repeated as a principle (OTA:324); a link to YouTube's Terms of Service and a statement in the client's "own terms of use" that users agree to them (OTA:340); a privacy policy users agree to before access (OTA:342) that says the client uses YouTube API Services (OTA:346), links the Google Privacy Policy (OTA:348), says what it reads, keeps and shares (OTA:350, :352, by pointer), and, because the client uses Authorized Data, explains revocation through Google's security settings page (OTA:358) and gives a contact (OTA:360). The security settings link is owed by "every API Client" (OTA:490), with no Authorized Data condition; if the policy gives no contact, YouTube may share the Console account's primary email address with users (OTA:512, by pointer). The page must not suggest partnership with, or sponsorship or endorsement by, YouTube (OTA:134). Had the read-back been ruled a separate key-only client, the duties that hold on their words alone would be the published privacy policy (OTA:81, :324) and the security settings link (OTA:490); OTA:340 would be owed on its words while presupposing users and a display, and OTA:342 would not be triggered. Identity: the Console "might require" identification or contact details (OTA:433; ToS §4, OTA:66, by pointer), and nobody may mask or misrepresent an identity when creating the project or the credentials (OTA:444, by pointer); with the acceptance conditions (OTA:46, :59), those are the owner's at Stage A, and ruling 7.10 row 24 §2 3(vi) stops Stage A if a document, a card or billing is asked. None of it is met today: no privacy policy or terms page for this client exists in the repository (the reader's search: the tracked files outside research/rendered/ that name "YouTube API Services" are notes, rulings, logs and a test fixture). **Bearing:** a condition unmet today and meetable at ₪0 with one published page carrying III.A.2's contents (:346, :348, :350, :352, :358, :360 and :490), the ToS link and the own-terms statement (:340), and no suggestion of partnership (:134); identity and acceptance are the owner's at Stage A.

**(ii) What does "exactly one API Project per API Client" mean for one Cloud project holding both the analytics consent and the Data API key?**

III.D.1.c (OTA:448) runs both ways: "exactly one (1) API Project" for an API Client, and "you must not use that one (1) API Project for multiple API Clients". An API Client is "a website or software application ... developed by you that accesses or uses the YouTube API Services" (OTA:781; the ToS's own definition at OTA:24, by pointer), and the API Project is the Console project "required for API Client(s)" (OTA:787). The text gives no test for where one client ends. Its only stated exception, the Upload Project (OTA:757), is for uploading one's own videos to one's own channel through the Data API, not through a Child-Directed API Client; it is not this case, since the uploads go through the publisher's own client (ruling 7.10 row 24 §2 3(v)). Of the two readings, the colony as one API Client (one repository, one owner, one purpose, its analytics reader `scripts/youtube-analytics.ts` and its read-back `scripts/youtube-madeforkids-readback.ts` two parts of it) is the natural one [inference], and the main thread has now ruled it (verdict condition 6 below): one client, the two readers sharing the one analytics-only project, no second project. Its consequences: the privacy policy of (i) covers both readers, with the owner as the user of the analytics consent; one suspension of the project's credentials stops both readers at once (OTA:57, "including any credentials assigned to you or your API Client(s)"); and the analytics reader's Authorized Data duties bind the same client, namely no display of, or access to, Authorized Data for anyone but "the authorizing user or agents expressly approved by that user" (OTA:550), a check every 30 days that the authorization stands (OTA:576) and that each video still exists (OTA:578), and the 30-day cap on Authorized Data not listed in III.E.4.b (OTA:582). The analytics reader writes `state/colony/measurements/youtube-analytics.json` (its header, `scripts/youtube-analytics.ts:1-3`), and the colony workflow force-adds `state/colony` to the public repository (`.github/workflows/colony.yml:87`): once wired, that output would be shown to anyone [inference: a public repository is display], breaking OTA:550, and a suspension of the shared project (OTA:57) would stop the read-back with it. **Bearing:** met by the main thread's ruling of tick 61 (not by any declaration before it), on the condition that the analytics output stays out of the public tree; that build is queued with condition 2's.

**(iii) Is a status read of the client's own upload without user credentials Non-Authorized Data under the 30-day rule, and if so, what may the state file keep past 30 days?**

Yes. Non-Authorized Data is "API Data accessible by an API Client without User Credentials" (OTA:793); User Credentials are those issued to users so a client can act on their behalf (OTA:797); Authorized Data needs "an active user" who "expressly authorizes" through User Credentials (OTA:789), which being the uploader does not supply. An API key is an API Credential [inference: the document never uses the words "API key"; OTA:783 defines API Credentials as what "each API Project authenticates with"]. privacyStatus and madeForKids are not "statistics", whose examples are view, subscriber and playlist counts (OTA:574, by pointer), so the rule is III.E.4.d (OTA:584), not OTA:580: Non-Authorized Data may be stored "temporarily", in "limited amounts", "for as long as is necessary for the purposes of the API Client but not longer than 30 calendar days", then deleted or refreshed; stored data must be kept consistent with the current data (OTA:586, by pointer), and outside the section the client has no further rights in API Data (OTA:527, by pointer). What the state file may keep past 30 days: (1) Raw field values. Refreshing them every run satisfies "refresh" in the working tree, but the colony commits `state/colony` every run (`.github/workflows/colony.yml:87`), so every earlier value stays in git history and in every clone, stored past 30 days whatever the refresh [inference: git history is storage]; raw values should not be committed at all. Today's code also keeps three things that are never refreshed: the first read, designated or not (`firstRead`, `src/revenue/youtube-madeforkids.ts:163`, "Written once and never changed", `:68-69`, added by amendment 1's fold 6db0827 after this file was first built), the first read that carried a designation (`:164`), and the entries of uploads that left the list, "kept as it was" (`:141`, `:171`); after 30 days they break OTA:584 even outside git, and a purge must run even when the reads stop, or "latest" goes stale after 30 days. (2) The colony's own timestamps (readAt, contradictedAt, leftPublicAt) and verdicts are not API Data on the definition, which covers what is "provided to API Clients ... through the YouTube API services" (OTA:799 (iii)), but a field that only restates a returned value is that value in another form, and the safe reading keeps it under the same 30-day limit [inference]. contradictedAt is "Never cleared" by design (`src/revenue/youtube-madeforkids.ts:79-83`, `:166`), and P-2's kill-at-two needs an override record that can outlive 30 days: the 72-hour checks (P2, K-T1k) fit inside 30 days, P-2 does not. (3) Derived data. III.E.4.h(ii) says clients "must not ... access or use API Data to create new or derived data or metrics" (OTA:596), an absolute prohibition (OTA:303), and its example bars using returned numbers "to calculate other metrics, such as ... a score that factors in likes, total views, or any other API Data" (OTA:598). The per-channel override count (`src/revenue/experiments.ts:289`, at `:285` when the reader read it) fits that example on its literal words, and is arguably an aggregate (OTA:538). III.L leaves additional derived metrics to audited analytics developers who have applied (OTA:774); the separate page it points to, added by the Revision History's May 4, 2026 entry (OTA:1137-1139, by pointer) and widened on June 1, 2026 (OTA:1133-1135, by pointer), is unread. The per-video lookup-and-act checks (P1, K-mfk-designation) have the better argument, from OTA:602 and :1176: the Terms expect a client to read a video's Made for Kids status through the Data API and act on it. (4) Reading the status through the owner's OAuth instead of the key would not help: Authorized Data of this kind is capped at 30 days too (OTA:582), and OTA:550 is added. So only the colony's own facts that encode no API value are safely kept past 30 days; raw values, and verdicts that restate them, are not. **Bearing:** unmet in today's code (verdict condition 2). A stated code change meets the storage part: raw values stay in the run's memory and are never committed, and anything stored is purged at 30 days by a purge that runs even when the reads stop. Whether the derived verdicts, times and override count may be made and kept at all (OTA:596 (ii), :598) is not decided here: a Fable sitting rules before Stage A, and until then the literal reading stands.

**(iv) Does any clause require an audit for the default quota?**

No. The audit is the route to more quota: "If your API Client reaches the quota limit for a service, you can apply for a quota extension by completing an API Compliance Audit" (OTA:498), and an approved extension is tied to its use case (OTA:500, by pointer). The 10,000-unit default appears only in the Revision History's July 1, 2021 entry (OTA:1159), on a page that says "the legal documents themselves are the authoritative source of information" (OTA:1131). Per-method costs (videos.list at 1 unit) are not in this file; the repository holds them at rendered grade only. Separately, YouTube may monitor and audit at any time without further notice (ToS §6, OTA:76; III.H, OTA:686, by pointer); the client must not interfere (OTA:690, by pointer), must on request, within the stated time, provide accounts that reach all features of the in-production client (OTA:692), and "YouTube may use any technical means to overcome non-compliance" (OTA:694). YouTube may set a quota at any time, and the client "will not, and will not attempt to, exceed or circumvent" it (ToS §15, OTA:156). The read-back's bound is in code per run: ceil(ids/50) one-unit calls, no retry, a refusal ends the run (`scripts/youtube-madeforkids-readback.ts:151-172`). Its daily bound is not in code yet: no workflow runs the script (asserted in `src/__tests__/revenue/youtube-madeforkids.test.ts`), and `.github/workflows/colony.yml:23` is the colony's own hourly cron, which ruling 7.10 row 24 §2 3(ii) would attach it to. An audit YouTube starts would reach the colony through the Console account's mail (III.D.5, OTA:510), which nothing reads today. **Bearing:** no audit is needed at the default quota; the per-run bound is met in code and the daily bound arrives with the wiring; an audit YouTube starts must still be answered, which needs the mail reader of verdict condition 4.

**(v) Does a suspension clause reach the brand account's other uses?**

On the literal words only, yes, and further than the brand account; the scope is unknown. ToS §3.1 (OTA:57) and §24.2 (OTA:243, by pointer) let YouTube suspend or terminate access to "any aspect" of the YouTube API Services by you, your API Clients and those acting on your behalf: that much is the API only. §24.3 goes further: "Upon any suspension, notice of any discontinuance, or termination (whether by you or YouTube), you will immediately stop accessing and using all YouTube Property" (OTA:245), and YouTube Property includes "all YouTube websites, applications, products and services" (OTA:163). Read literally, a suspension of the key obliges the party bound to stop using YouTube itself, the channels included. But §24.1 lets you end the Agreement just by stopping your use of the API (OTA:241), and read with §24.3's "whether by you", every developer who stopped using the API would have to stop using youtube.com, which is absurd; §24.3's own deletion object, "delete all YouTube API Services (including all API Data)", is API-scoped too. Both point to a narrower meaning, and §24 survives termination (OTA:251, by pointer). III.D.6 runs both ways (OTA:516): while the credentials, or "the Google Account you used to create those credentials", are suspended or terminated "for any reason", no access to the API Services "via any means", proxies and new accounts, credentials or projects included. One way, it reaches the analytics reader (the same project, OTA:57) and any other API project the owner holds, and on "via any means" arguably the publisher's API uploads made for the owner [inference]; the other way, a suspension of the brand Google account for any reason, such as a channel terminated for a policy strike [inference: the example is ours], bars all API access, so the brand account's other uses reach the API. "You" is the person who accepts the Agreement (accepting for someone else, OTA:61, by pointer), not a Google account: the dedicated brand account isolates a login, not the Agreement's reach [inference]. These clauses do not name AdSense, the YouTube Partner Program or the Google account itself; §24.3's "display of any advertisements associated with your API Client(s)" is about advertising in the client, not on the channel [inference]. On any suspension the colony must at once delete all API Data and certify the deletion on request (OTA:245); that kill path is not built. **Bearing:** a risk stated to the owner inside the Stage A ask (verdict condition 8), not a bar.

**(vi) Do the Terms bar anything the read-back does today?**

Not today: the read-back makes no live call. It refuses first when `research/channel-loop/terms-verdicts.json` has no googleapis.com entry whose verdict is active-eligible (`scripts/youtube-madeforkids-readback.ts:117-124`, added by fold 1008e81 after the reader's read; CONDITIONAL_UNMET is not one), then when the key is absent (`:126-130`), and no workflow runs it. What follows is what it would do once wired as ruled. The read itself is not barred. Non-authorized Data API requests exist (OTA:437) and the Data API's example is a search for public videos without user authorization (OTA:457); neither line names videos.list or the status part, and that videos.list with part=id,status returns madeForKids and privacyStatus to a bare key is not in this document [inference until the first live read; the code grades the URL and the envelope so, `src/revenue/youtube-madeforkids.ts:27-29`]. The call uses the project's own credential (OTA:446, by pointer) and a documented method (OTA:520, by pointer; the method's documentation is at rendered grade only). The scraping bar reaches "YouTube Applications" and "Google Applications" (OTA:613), and YouTube Applications exclude the API Services (OTA:801). Quota is bounded per run (OTA:156; (iv)). The key is a secret, never committed and redacted from every log line (`scripts/youtube-madeforkids-readback.ts:7-10`, `:135`, `:166`, `:171`); OTA:450 lets credentials be shared "with agents operating solely on your behalf and under a written duty of confidentiality" and bars any other third party and embedding in open source projects, and GitHub's secret store and the runner are such agents [inference: GitHub's terms on secrets were not read]. Once live it would do three things the Terms bar or put in doubt. (1) It writes the raw privacyStatus and madeForKids into `state/colony/measurements/<line>-madeforkids.json` (`scripts/youtube-madeforkids-readback.ts:176-178`), which the colony workflow commits to the public repository (`.github/workflows/colony.yml:87`): against the 30-day limit (OTA:584), since history keeps every value [inference: git history is storage]; against the confidentiality of API Data (ToS §8, OTA:86; III.E.5, OTA:606, :608, :610); and, on a literal reading, against the bar on redistributing "all or any portion of YouTube API Services" (OTA:659, :661), API Data being part of them (OTA:799 (iii)). (2) It keeps the first read, designated or not, forever (`firstRead`, `src/revenue/youtube-madeforkids.ts:163`, since amendment 1's fold 6db0827), the first designation read too (`:164`), and de-listed uploads' entries as they were (`:171`); none is ever refreshed, so after 30 days they break OTA:584 even outside git. (3) It derives contradictedAt and leftPublicAt (`:166-167`), readbackOf (`:180`) and stayedPublic (`:197`), and `src/revenue/experiments.ts:289` counts YouTube's overrides across a channel's uploads: the count fits OTA:598's example on its literal words and is arguably an aggregate, which OTA:538 allows only for channels "under the same content owner as recognized by YouTube pursuant to content licensing agreement(s)" and only "viewable by that content owner"; the per-video checks have the argument from OTA:602 and :1176. Measuring YouTube's overrides could also be read as using API Data to gain insight into YouTube's business, which OTA:540 bars (by pointer) [inference, weak]. The two points the reader raised as the ruling's, not the Terms', are closed since fold 1008e81: the fetch is made with `redirect: "error"` (`scripts/youtube-madeforkids-readback.ts:156`), and the script reads terms-verdicts.json (`:117-124`). **Bearing:** the call is not barred; storing and publishing what it reads, in today's form, breaks III.E.4.d (OTA:584) and is doubtful under ToS §8, III.E.5 and III.G.1.a; the derived count is barred on the literal words of OTA:596 (ii) and :598 until the sitting rules.

## Verdict

The main thread's verdict memo (tick 61, 7.10.2026, under ruling 7.10 row 24 §2 decision 2, on the reader's and the verifier's agreeing reading), quoted in its words; the bracketed notes after it are this file's.

> googleapis.com → verdict CONDITIONAL_UNMET; copying: barred (OTA:661 "any portion of YouTube API Services", with :799(ii) taking in the documentation; §16.1-16.2 reserve rights and grant no licence — a reservation, not a bar, per the agenthon precedent; the bar rests on :661). checked 2026-10-07.
>
> Why not BARRED: nothing in the five bundled documents bars a keyed status read of one's own uploads; the scraping bar's "YouTube Applications" excludes the API Services (OTA:801); non-authorized Data API requests are contemplated (OTA:437, :457) and Made-for-Kids status reads through the Data API are expected (OTA:602, :1176); the default quota needs no audit (OTA:498; :1159 defers to :1131). That videos.list part=status returns the fields to a bare key is NOT in the document — inference, first live read decides.
>
> Why not active-eligible today — conditions unmet (each with its clause):
> 1. a published privacy policy and terms-of-use page for the API Client, with III.A.2's contents incl. the security-settings link (OTA:81, :324, :340, :342-360, :490) — not met; meetable at ₪0 with one published page (Opus build, queued).
> 2. Non-Authorized Data kept at most 30 calendar days then deleted or refreshed (OTA:584, :793): the read-back's never-refreshed first read and the kept de-listed entries break it; raw field values must never be committed to the public repository [inference: git history is storage] — code change (Opus build, queued); the derived verdicts/times and the per-channel override count (experiments.ts:285) sit under the absolute "must not create new or derived data or metrics" (OTA:596(ii), :598, :303) — NOT decided here: a Fable sitting rules before Stage A (new FABLE_QUEUE row).
> 3. confidentiality of API Data and no redistribution of any portion of the Services, documentation included (OTA:86, :608-610, :661 with :799(ii)): from the day the owner is bound (Stage A), the ten developers.google.com/youtube captures under research/rendered/ and any excerpt of these Terms must be trimmed to cited lines (ruling 6.10 row 21 (d) already does this for copying-barred sites once the entry exists; the captures predate the bar and stay D1(1)) — the trim's next run handles it once the entry lands.
> 4. a reader for YouTube's compliance mail at the Console account's mailbox (OTA:510; :48 notices) — not met; a Stage A line (the dedicated brand Google account's mailbox read through the connector, as the brand mailbox is) — queued for the Stage A re-brief.
> 5. acceptance of the whole Agreement (ToS, Policies, Guidelines, YouTube Terms) by the owner at Stage A (OTA:46, :59), in the version that binds them — the Americas ToS is the one read; the EMEA version (OTA:1125) is unread: Stage A's re-brief says which binds (the owner's region) and if EMEA, a second github-grade read precedes the key.
> 6. exactly one API Project per API Client (OTA:448): ruled here — the colony is ONE API Client (one repository, one owner, one purpose); the analytics reader and the read-back are parts of it and share the one analytics-only project; no second project. Consequence: the analytics reader's Authorized Data duties bind the same client (OTA:550 no display to anyone but the authorizing user; :576/:578 30-day re-checks) — its output must not reach the public repository: queued with condition 2's build.
> 7. credentials: OTA:450 permits sharing with agents operating solely on the owner's behalf under a written duty of confidentiality and bars any other third party and open-source embedding — GitHub's secret store and the runner are such agents [inference]; met by code (secret, never committed, redacted).
> 8. suspension (OTA:245 with :163): on its literal words reaches the owner's whole use of YouTube and the API Services; scope unknown (§24.1 makes the literal reading absurd) — a risk stated to the owner inside the Stage A ask, not a bar.
>
> Consequence (ruling 7.10 row 24 §2 decision 2): the read-back's gate stays closed (no live call); Stage A's key line (T1-PROTOCOL.md:116-120) is re-briefed before Stage A is asked — queued in §9 as a main-thread item with the four builds above.

[Notes of this file, tick 61. (a) The override count the memo cites at `experiments.ts:285` is at `src/revenue/experiments.ts:289` since fold 1008e81. (b) Condition 3's last clause does not hold as the code stands: `scripts/trim-capture.mjs` trims the captures of a copying-barred site by the site of each capture's own URL host (`siteOf`, the terms gate's), and the ten developers.google.com/youtube captures belong to the google.com entry (BARRED, "copying": "unread"), not to googleapis.com; the trim's dry run after this entry landed lists no googleapis.com capture and leaves those ten unreached. Their trim needs google.com's copying field, or the trim's reach, ruled; that is the main thread's. (c) The excerpts above are cut to the cited lines, as condition 3 asks of "any excerpt of these Terms". (d) The memo's §16.1-16.2 are OTA:163 and :165; the Terms of Service are located on the YouTube Developer Site (OTA:795), whose documentation :799 (ii) takes in. (e) Condition 6's "no display to anyone but the authorizing user" is the memo's shorthand: OTA:550 bars display or access for "anyone other than the authorizing user or agents expressly approved by that user"; the consequence, no analytics output in the public repository, is unchanged.]

## What a later read must settle

- **The regional version.** The Americas Terms of Service (OTA:1123) is the one read; the EMEA version (OTA:1125), and the APAC and Russia versions beside it (OTA:1124, :1126), are unread. Stage A's re-brief says which binds the owner (the owner's region), and if it is not the Americas one, a second github-grade read of that version precedes the key (verdict condition 5).
- **The derived-metric question, for a sitting.** Whether the read-back's verdicts and times, and the per-channel override count, are "new or derived data or metrics" that clients "must not ... create" (OTA:596 (ii)), the count fitting the example at OTA:598 on its literal words; with III.L (OTA:774) and the separate derived-metrics page it points to (unread). A Fable sitting rules before Stage A (verdict condition 2).
- **The first live read.** Whether videos.list with part=id,status returns madeForKids and privacyStatus to a bare key (inference until then, (vi)), the response envelope, and the call's quota cost; with what the Console asks for at key creation (OTA:433), which is the owner's to report at Stage A.
- **Also unread:** Open Terms Archive's repository licence; GitHub's terms on secrets, against OTA:450's "written duty of confidentiality"; and later changes to these Terms, which take effect by posting or email no sooner than 30 calendar days after (OTA:48), while no watch of the Open Terms Archive copy exists.
