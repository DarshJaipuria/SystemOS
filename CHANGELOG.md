# Changelog

All notable changes to this project will be documented in this file.

---

## [1.1.0] - 2026-06-27
### Added
* **API Versioning**: Migrated all controllers under `/api/v1/*` path structures.
* **Repository Tier**: Decoupled database operations from routes, encapsulating user, habit, completions, and rewards repositories.
* **Domain Service Tier**: Isolated business calculations into single-responsibility services (`streakService`, `rewardService`, `analyticsService`, `reflectionService`, `subscriptionService`, `storageService`).
* **Input Validation**: Added Zod schema verification middleware for all POST body payloads, URL search parameters, and route parameters.
* **Structured Logging**: Built a structured console logger with sensitive field scrubbers and request-tracing ID headers.
* **Security Headers**: Added Content Security Policy (CSP), X-Frame-Options, and X-Content-Type-Options inside `next.config.mjs`.
* **Automated Tests**: Custom unit test suite script in `scripts/test-business-logic.mjs` checking streaks and reward claims unlocked limits.

---

## [1.0.0] - 2026-06-27
### Added
* Initial release of the Japandi-styled Month Habit Planner dashboard.
* Daily checklist grid calendar with streaks counting.
* Weekly checklists column blocks, monthly objective goals list, polaroid reflections journal.
* Gamified daily rewards unlocking system and database cloner selectors.
