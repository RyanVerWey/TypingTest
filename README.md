# Typing Force

A calm typing practice app with real-time measurement and focused improvement plans.

Production: https://typingspeed.ryanverwey.dev

## Practice

- Adaptive journeys progress at completed-passage checkpoints, easing back when accuracy falls. One upcoming passage stays queued and readable; difficulty decisions affect newly queued text, so visible words never change. Fixed benchmarks remain available for comparable scores.
- Four open levels: Foundation, Flow, Precision, and Code.
- 60 original lessons with four level-specific versions (240 passages), covering typing technique, practice habits, and everyday life lessons. Foundation uses lowercase sentences with periods; later levels add capitals, punctuation, numbers, and code.
- 15, 30, 60, and 120 second sessions, starting on the first character.
- Live correct WPM, attempt accuracy, countdown, and character feedback.
- Optional speed and accuracy challenges, with no account or leaderboard.
- Detailed results: correct/raw/peak WPM, five-second intervals, efficiency, correction and error-removal rates, timing quantiles, pause durations, streaks, substitutions, per-key timing, character categories, and adaptive round history.
- A five-minute improvement plan and varied full-sentence drills selected for missed keys.
- Psychology and learning insights are open by default: each ties observed behavior to a cautious interpretation and a next-session experiment. Research links support the conceptual framework, not diagnostic claims.
- Light/dark themes, responsive layouts, keyboard controls, and reduced motion.
- Up to 50 summary results stored locally. JSON export contains aggregate results, not raw keystroke timestamps.

## Run and verify

Use Node 24. `npm ci`, then `npm run dev`.

Run `npm test`, `npm run lint`, and `npm run build`. Preview with `npm run preview`.

## Measurements

Correct WPM is retained correct characters / 5 / elapsed minutes. Raw WPM includes every character attempt, including retyping. Attempt accuracy is correct attempts / all attempts. Deleting an error does not erase the error from attempt accuracy. Final text accuracy measures only retained text.

The timer uses a monotonic clock, includes pauses and tab-away time, and rejects input after the deadline. Restart discards an unfinished session. Paste, replacement, and bulk input are rejected. The English ASCII passages work best with a physical English keyboard; touch keyboards and input methods can behave differently and should not be compared directly.

Rhythm is a descriptive coefficient-of-variation score, requiring at least 20 intervals. Pauses over one second remain in the calculation. Repeated pairs require three correct transitions. A session-style interpretation requires 50 attempts and 15 seconds. These thresholds and challenge targets are product choices, not validated psychological or population norms.

## Passage variety

`src/lib/lessons.js` holds authored material and shared lesson IDs across all four levels. `src/lib/content.js` uses shuffled decks with all three themes mixed in. Adaptive rounds cannot immediately repeat a lesson, even when the level changes. Each fixed benchmark and drill contains 60 distinct lessons instead of a repeated block. Drills bring passages covering the selected problem keys near the beginning, choosing a harder variant when necessary to include a missed symbol or capital.

The last eight opening lessons are excluded when starting another session. A small local storage record remembers the rotation across reloads; it contains lesson IDs only. Storage failure falls back to an in-memory rotation. Clearing local practice history also clears this record. Visible queued text remains immutable; content is appended without rewriting what the reader can already see.

## Architecture

React 19 + Vite, deployed as static assets. `src/PracticeApp.jsx` owns the practice and result views, `src/lib/engine.js` owns independently tested scoring and analytics, and `src/lib/storage.js` validates and bounds local history. The full passage keeps stable character positions; only changed highlights and the caret update. Scroll advances in whole lines. Adaptive content appends after completion without rewriting the visible prefix. Charts use SVG and fonts are self-hosted. There is no API, server runtime, account, analytics service, or external font request.

## Direct deployment

Vercel project: `typing-force`, scope: `ryanverweys-projects`.

After local verification and an authorized merged PR, use `npx vercel --prod --yes --scope ryanverweys-projects`. Git-based Vercel deployments are disconnected and `vercel.json` disables them. Do not add or rely on GitHub Actions.

GoDaddy DNS: `typingspeed` CNAME points to `1b94439d0eb54012.vercel-dns-016.com`. The portfolio remains on its separate Vercel project. Heroku is no longer required by this source. Deleting or cancelling the historical Heroku app is a separate account/billing action.

## Verification notes

The modernization was checked with 31 automated scoring/storage/adaptation/report tests, local production build and lint, real-browser correction/timer/drill/history flows, 300-character layout-stability verification, two adaptive transitions, and responsive light/dark checks. Production dependency audit: no known vulnerabilities at verification. Seven moderate audit findings remain in the development-only ESLint/minimatch dependency chain; npm reports no compatible fix. They are not shipped in the static browser bundle.

## Branding

Original normal-keyboard campaign artwork, vector insignia/wordmark, optimized web artwork, and social cover live in brand/ and public/brand/. See brand/README.md.
