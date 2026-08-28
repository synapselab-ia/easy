# P10 early-use observation — transaction history cell containment

**Date:** 2026-08-28  
**Scope:** P10-S3-I2-I3-D controlled clean-start early-use defect correction  
**Executable PR:** #133 — `fix: contain transaction history table columns`  
**Status:** `DONE / ACCEPTED / INTEGRATED`

## Observed evidence

The operator supplied a real early-use screenshot of `Histórico de Lançamentos` showing long `Detalhe` content visually crossing the cell boundary and painting over the adjacent `Valor` column. The same base-table behavior could also affect long reseller names or operator labels.

This is a presentation/layout defect only. It does not authorize a new numbered early-use item, D-035 `DR-10`, a general audit subsystem or any persistence/accounting change.

## Root cause

The shared Base UI table applies `white-space: nowrap` to ordinary table cells. `TransactionHistory` constrained `Detalhe` with a maximum width but did not override nowrap or cell overflow. Therefore long variable text could continue rendering outside its cell even though the data and column structure were correct.

The fix is intentionally scoped to the transaction-history section rather than changing every table in Easy.

## Accepted correction

Within `section[aria-labelledby="transaction-history-title"]` only:

- desktop history uses `table-layout: fixed`;
- the table has a minimum width of `82.5rem` (1320 px) with explicit predictable widths for all eight columns;
- all history cells close visual overflow so content cannot paint over a neighbor;
- the variable `Revendedor`, `Detalhe` and `Usuário` columns override nowrap and allow safe line breaking, including long uninterrupted values;
- `Valor` and the other compact fields retain predictable dedicated space;
- when the available desktop width is narrower than the table minimum, the existing table-container horizontal scrolling is used rather than compressing columns into overlap;
- the existing mobile card presentation remains unchanged.

No transaction data, Supabase, Auth/RLS, Backup v2, recovery guard, accounting semantics, correction/reversal behavior or deployment policy changed.

## Browser regression

`tests/e2e/transaction-history-layout.spec.ts` reproduces long reseller, detail and operator content inside the real history section and checks computed browser layout for:

- fixed table layout;
- minimum table width;
- horizontal scrolling under constrained width;
- closed cell overflow;
- wrapping of reseller/detail/operator content;
- bounded detail/operator column width; and
- the `Valor` cell starting after the `Detalhe` cell rather than being visually overlapped.

The first CI iteration exposed a race in the new regression itself: it could inspect the page before the asynchronously loaded history section mounted. This was not accepted as final evidence. The test was changed to wait explicitly for the history section before probing layout and the full D-019 gate was rerun.

## D-019 acceptance

Final accepted executable head:

- feature head: `8cedd37044b29986b270b413a222d3b34954c534`;
- exact GitHub-generated PR merge ref tested by Actions: `eacf9ea2424509133ac3f9c9d19843121a52fbd2`;
- validated tree: `4a4071a3ef7f347ef54f984a3ed35fab087f2ebf`;
- final D-019 run/job: `33184406848` / `98893556145`.

Final Critical QA:

- ESLint: **0 errors / 108 warnings**;
- Vitest: **75 files / 316 tests PASS**;
- Playwright: **21 scenarios completed successfully**; the new transaction-history layout regression passed on its first attempt, while the pre-existing Reports chart-visibility test again passed on retry and remained the only reported flaky scenario;
- TypeScript + production Vite build: **PASS**.

The unrelated Reports chart retry did not produce a failed Critical QA gate and was not modified in PR #133.

## Integration proof

PR #133 was squash-integrated into `develop` as:

`66b9bdad245337efd7e9e040ee503d0673be22c1`

The integrated commit tree is:

`4a4071a3ef7f347ef54f984a3ed35fab087f2ebf`

This exactly equals the tree of the GitHub-generated merge ref accepted by Critical QA.

Post-integration `develop` Critical QA also completed successfully:

- run/job: `33184663864` / `98894431412`;
- conclusion: **PASS**.

No automatic Vercel deployment was performed. `main` was not targeted.

## Closure

This observed transaction-history layout defect is closed. The canonical continuation remains controlled early-use observation. The D-032 rule still requires a confirmed real Backup v2 checkpoint strictly younger than 24 hours before normal hosted business writes. No broader audit or follow-on transaction-history initiative is implied by this correction.
