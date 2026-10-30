# Market quote comparability checks

**Project ID:** `REPO-bazar-tulona-bd` (stage-2 idea ID not assigned). **Input:** stage-2 Bangladesh Project Repository Register v1, stage-1 Research Idea Bank v1 (neither maps a specific grocery idea), and repository `main` at `be3bfe1ceb9fd99764456c58344836609b6f04c3`. This branch changes only the visitor-entered quote comparison, its styles, model and tests; it does not edit stage-5's separate `fix/checked-static-build` branch or any upstream stage-4 branch.

## Small task and result

A visitor opens `quote-compare.html`, enters dates and prices for the same quantity of a named product in two markets, selects whether **each** seller quoted retail or wholesale prices, and explicitly checks that the grade, unit and pack size match for every selected product. The calculator returns an unverified, basis-labelled comparison only when both dates are the same, not future-dated, at most seven days old according to the device clock, the market bases match, and every selected product is confirmed comparable.

Unknown or missing bases, mixed retail/wholesale quotes, unconfirmed product matches, empty baskets, invalid quantities/prices, mismatched dates, stale dates and future dates must **not** show a lower market. A checkbox is a visitor's confirmation, not independent verification. The application has no source of live market prices, and the device clock is not a trusted time authority. The government report is a navigation link, not the source of these numbers. No prices, user questions, market details or identifiers are sent to a server, stored or tracked.

The correction link opens a public GitHub issue page; it does not send feedback. Users are warned not to share receipts, identity information or private shopping details. No backend, analytics, external dependencies or lockfile are required.

## Reproduce and review

Run `npm test`, `node --check quote-compare.js` and `node --check quote-compare-model.js`. Serve the repository with `python3 -m http.server 8000` and open `http://localhost:8000/quote-compare.html`. Verify 320/390/1280px, 200% zoom, Bangla glyphs, keyboard tab order, checkbox label targets, validation and error focus, no-JS official link, reduced motion and print warnings. Test matching retail, matching wholesale, mixed bases, unchecked grade/unit, stale/future/mismatched dates and clear/reset. The target is WCAG 2.2 AA, not a certification. Performance budget: keep this dependency-free page's HTML/CSS/JS/model under 40 KB uncompressed; measure before release.

## Data and release limitations

The [Department of Agricultural Marketing](https://market.dam.gov.bd/market_daily_price_report?L=E) is the official report navigation route; its data is **not** imported, licensed, copied or claimed as current here. All quote amounts are visitor-entered and unverified. Review seller/market identity, product packaging and delivery/travel costs before a real purchase. No hosted preview, user study, verified savings or production deployment is implied by a successful test run. Stage 5 should review this PR and its own build PR for conflicts before any merge or release.
