# ₪0 tests dispatched by the channel loop

Each channel candidate has one cheapest test that must return before anything is built (the board's gate BUILD-1,
`BOARD-LOOP.md`). These are the pages a GitHub runner renders for those tests (`research/rendered/urls.txt` §12),
because this container's proxy blocks them. The list does not change on each tick, so `urls.txt` cites this file and
not `logs/CHANNEL_LOOP.md`, which each tick rewrites.

| # | Candidate (BOARD-LOOP rank) | Page | What the reading must settle |
|---|---|---|---|
| 1 | CrazyGames Basic Launch (6) | https://docs.crazygames.com/faq/ | automated or API submission, payout countries and forms, account requirements, content rules |
| 2 | Paid Astro themes (7) | https://portal.astro.build/api/themes?price[]=paid | how the catalogue orders paid themes (recency or popularity), and how many exist |
| 3 | Polar / Stripe cross-border (9) | https://stripe.com/global | whether Israel is a Stripe account country |
| 4 | Polar / Stripe cross-border (9) | https://docs.stripe.com/connect/cross-border-payouts | whether a Connect Express account in Israel can receive cross-border payouts |
| 5 | Wix App Market (11) | https://dev.wix.com/docs/build-apps/launch-your-app/pricing-and-billing/payments-and-billing-faqs | whether it pays Israel, and whether the $200 floor rolls over or is forfeited |
| 6 | Topcoder (12) | https://api.topcoder.com/v6/challenges?status=ACTIVE | how many active challenges are auto-scored and carry prizes |
| 7 | Step 2 cost under the ₪0 rule (MISSION.md, 27.9) | https://www.btl.gov.il/Insurance/National%20Insurance/type_list/Self_Employed/Pages/rates.aspx | Bituach Leumi rates for the self-employed |
| 8 | Step 2 cost under the ₪0 rule | https://www.btl.gov.il/Insurance/Rates/Pages/%D7%9E%D7%99%20%D7%A9%D7%90%D7%99%D7%A0%D7%9D%20%D7%A2%D7%95%D7%91%D7%93%D7%99%D7%9D%20%D7%95%D7%91%D7%A2%D7%9C%D7%99%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%D7%A9%D7%9C%D7%90%20%D7%9E%D7%A2%D7%91%D7%95%D7%93%D7%94.aspx | the minimum that someone who is not working pays anyway, so the cost the step itself adds can be told apart |
| 9 | Step 2 cost under the ₪0 rule | https://www.kolzchut.org.il/he/%D7%93%D7%9E%D7%99_%D7%91%D7%99%D7%98%D7%95%D7%97_%D7%9C%D7%90%D7%95%D7%9E%D7%99_%D7%9C%D7%A9%D7%9B%D7%99%D7%A8_%D7%A2%D7%9D_%D7%9E%D7%A7%D7%95%D7%A8%D7%95%D7%AA_%D7%94%D7%9B%D7%A0%D7%A1%D7%94_%D7%A0%D7%95%D7%A1%D7%A4%D7%99%D7%9D | contributions for a salaried employee who also has self-employment income |
| 10 | Step 2 cost, salaried case | https://www.btl.gov.il/Insurance/National%20Insurance/type_list/%D7%A2%D7%95%D7%91%D7%93%20%D7%A9%D7%9B%D7%99%D7%A8%20%D7%95%D7%92%D7%9D%20%D7%A2%D7%95%D7%91%D7%93%20%D7%A2%D7%A6%D7%9E%D7%90%D7%99/Pages/default.aspx | whether the ₪3,442 floor income applies to someone who is also salaried (`research/measurements/step2-cost.md`) |
| 11 | CrazyGames (6), after row 1 | https://files.crazygames.com/documents/developer_terms_20250818.pdf | automated submission, payout countries, identity and tax forms — named by the FAQ as the governing terms (`research/measurements/crazygames.md`) |
| 12 | CrazyGames (6), after row 1 | https://docs.crazygames.com/payouts/ | payout methods, countries, threshold, NET terms |
| 13 | Wix App Market (11), after row 5 | https://dev.wix.com/docs/build-apps/launch-your-app/pricing-and-billing/set-up-your-payout-account | whether an Israeli payee can set up a payout account, and how (`research/measurements/wix-app-market.md`) |
| 14 | Stripe rail (9) and oss-bounties step 4, after rows 3-4 | https://docs.stripe.com/global-payouts/recipient-requirements | whether Global Payouts can reach a recipient in Israel — the one route `research/measurements/stripe-israel.md` leaves open |

Rows 7-9 came from one WebSearch on 27.9.2026, whose snippets said a person with no work and no income pays a
minimum of about ₪266 a month (₪143 national insurance and ₪123 health) whatever they do. That figure is
**snippet grade**: nothing is told to the owner as fact until the rendered pages are read.
