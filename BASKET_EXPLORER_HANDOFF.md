# Basket explorer: stage 4 handoff

**Queue ID:** `REPO-bazar-tulona-bd` (stage-2 ID not assigned). **Base:** `2143fb21dc5d31ff82c96c9c361ddb0561809801` (`main`, merged foundation PR #1). Stage 3 had no Bazar branch or open PR at this check. Do not assume stage 3 is finished; review with it before landing. Stage-4 branch: `stage4/sample-basket-explorer`.

## What it does

The linked basket explorer keeps the same quantities, units and illustrative grade across two fictional retail markets. It shows line-item totals, a small CSS comparison bar, a numeric table and a Bangla/English rule-based question guide. The user can ask which fictional basket is lower, why units matter or where to verify real market reports. Questions about current prices and unrelated requests explicitly abstain. There is no AI provider connection, no data feed, account, browser storage, tracker, upload or network submission. Questions are handled only in browser memory and the clear button resets the answer. The original basket page works independently.

## Data and evidence

All prices come from the existing `model.js` fixture. `observedAt` and `verifiedAt` are deliberately `null`. The source link is **navigation**, not evidence for the fictional numbers. Users must match market, date, grade, unit and retail/wholesale basis themselves on the [Department of Agricultural Marketing report](https://market.dam.gov.bd/market_daily_price_report?L=E), checked as a navigable official source on 2026-10-30. Do not scrape or reproduce official prices without verifying access rights, permitted rate, accuracy and dates.

Browser and accessibility reference: [MDN Intl.NumberFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat) (widely supported; not required by this simple fixed-decimal demo); [MDN live regions](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions). No graphics API or paid dependency is needed. Text table remains the primary comparison if CSS bars do not render. `prefers-reduced-motion` disables optional effects. No lockfile because no external packages are installed.

## Verify before release

Run `npm test`, `node --check basket-explorer.js`, then `python3 -m http.server 8000`. Inspect `basket-explorer.html` at 320px/390px/desktop, 200% zoom, keyboard-only, screen-reader announcements, no-JS official link, reduced motion and low-bandwidth conditions. Check Bangla glyph support on target devices. Confirm the two base links still work after stage-3 edits. Automated tests do not prove WCAG 2.2 AA compliance, real-user understanding or field performance. No production deploy is authorised.

## AI activation decision

This is a transparent **rule-based FAQ, not live AI**. No provider credentials or authorised budget exist. If a later owner-approved server model is considered, implement server-side secret storage, editorially reviewed source retrieval, hard request/token/spend/rate limits, abuse handling, user disclosure and retention controls. Never send user questions to a paid provider without separate budget approval. No live-price claims or automated purchases are permitted.
