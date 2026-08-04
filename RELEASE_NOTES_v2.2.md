# Z-Girl Open v2.2.0 Release Notes

## Z-Girl EDU Institutional Edition

- Adds a public `/edu` experience for schools, districts, youth programs, and funders.
- Defines the facilitated 30-day pilot, staff orientation, family communication, implementation resources, aggregate outcome scorecard, and closeout pathway.
- Establishes the institutional promise: reflection without surveillance.
- Keeps private reflections outside institutional reporting and excludes ads, in-app purchases, student-data monetization, diagnosis, treatment, and individual surveillance scoring.
- Adds the current downloadable Z-Girl EDU institutional overview.

## Protected Native-language Review

- Adds a fail-closed reviewer workspace for Spanish (United States), French (France), Brazilian Portuguese, and German (Germany).
- Requires seven sessions and seven checks per session: meaning, naturalness, pronunciation, tone, pacing, safety, and transcript match.
- Keeps reviewer work in the current browser and exports durable signed JSON and correction CSV records.
- Proxies candidate audio from protected storage; storage addresses and credentials are never exposed to the reviewer.
- Prevents reviewer pages, authorization responses, and candidate audio from entering the PWA cache.
- A reviewer approval never publishes audio. Product-owner validation and promotion authorization remain separate gates.

## Language Alignment

- Aligns the public Spanish journey locale with the approved United States review track (`es-US`).
- Migrates the prior saved `es-ES` journey selection to `es-US` without clearing user progress.

## Release Boundary

- The public multilingual journey continues to use matching device voices.
- Candidate studio audio remains unavailable publicly until its exact language track passes all 49 checks and receives documented product-owner promotion authorization.
