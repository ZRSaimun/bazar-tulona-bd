# User-entered grocery quote comparison

**Project ID:** `REPO-bazar-tulona-bd` (stage-2 ID pending). **Stage-4 dependency:** draft PR #2 `stage4/sample-basket-explorer` at `4bddb0673059a48922ed244cdfe98c02749ef3bb`. This increment is a distinct stacked branch. Do not merge or deploy until the earlier PR and stage-3 coordination have been reviewed.

## What is working

`quote-compare.html` lets visitors enter two market price quotes for the same three named products, grade, unit and quantity. It compares only when both observation dates match, are not future-dated, and are no more than seven days old according to the visitor's device. The result states **visitor-entered, unverified**, displays each line and total, and never claims live or official prices. Dates older than seven days, mismatched dates, missing prices, invalid decimals and empty baskets do not produce a winner. The original demo explorer works without this optional page. There is no remote API, AI model, storage, cookie, analytics, share, alert or payment. No model credentials or budget are required.

The browser date picker is progressively enhanced; `YYYY-MM-DD` validation also runs in the pure JS model. JS-disabled visitors can open the official Department of Agricultural Marketing report. Nothing is uploaded or automatically shared. A device with an incorrect clock can make the freshness check inaccurate; a local calculation is not independent source verification. No actual real market quotes were used or tested.

## Validation and release review

Run `node --test quote-compare-model.test.js`, `node --check quote-compare.js`, and the repository's `npm test`. Serve the repository with `python3 -m http.server 8000`, open `quote-compare.html`, and test 320px/390px/desktop, zoom 200%, keyboard, Bangla fonts, focus/status announcements, invalid date/price, reduced motion, JavaScript disabled and printing. Do not claim WCAG 2.2 AA from unit tests. Check whether any stage-3 changes conflict before merging the stacked PR.

## References and next steps

Official price report (navigation, not source of entered prices): https://market.dam.gov.bd/market_daily_price_report?L=E . MDN native date input: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/date . MDN form validation: https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/reportValidity . No scraping, API fees, third-party packages or licence-restricted assets. Stage 5 should inspect the served page and verify the warning stays prominent in print and mobile; later editorial work can add guidance for receipts and market naming without implying official verification.
