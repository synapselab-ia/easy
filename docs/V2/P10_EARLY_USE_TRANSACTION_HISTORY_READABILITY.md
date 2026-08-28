# P10 early-use observation — transaction-history readability

**Date:** 2026-08-28  
**Scope:** bounded presentation refinement during `P10-S3-I2-I3-D` controlled clean-start early-use observation  
**Product PR:** #135 — `fix: improve transaction history readability`

## Observed evidence

After PR #133 correctly stopped long desktop history text from painting over neighboring cells, real operator inspection showed that `Detalhe` could still be effectively unreadable because the rendered row remained visually constrained to a single clipped line. The same readability risk applied to long reseller names and long operator identities.

This was new early-use evidence and did not authorize a new phase, D-035 `DR-10`, early-use change #16 or a general audit expansion.

## Root cause

The shared `TableCell` component supplies the Tailwind utility `whitespace-nowrap`. PR #133 added scoped containment/wrapping rules in the base CSS layer, which successfully prevented cross-cell painting, but the real component utility could still win the white-space cascade. The PR #133 browser regression used a synthetic table fixture and therefore did not reproduce the actual `TableCell` utility-class merge.

The correction was consequently moved to the actual `TransactionHistory` component, where `className="whitespace-normal"` is merged through the project's `cn()`/`twMerge` path and removes the base `whitespace-nowrap` utility for the variable-text cells.

## Accepted behavior

Desktop `Histórico de Lançamentos` now keeps the PR #133 containment contract and adds bounded readability:

- `Detalhe` renders up to two lines using `line-clamp-2` and safe word breaking;
- the complete `Detalhe` remains available on hover through the native `title` value;
- `Revendedor` renders up to two lines and exposes the complete name on hover;
- `Usuário` keeps separate operational lines (`Registrado` and, when applicable, `Corrigido`/`Estornado`), truncating each line safely and exposing its complete value on hover;
- `Valor` remains non-wrapping/tabular and `Situação` remains stable;
- no variable text can again paint across a neighboring cell;
- mobile cards remain full-content and unchanged.

No persistence, Supabase/Auth/RLS, Backup v2, recovery guard, transaction semantics, financial/reporting semantics or deployment behavior changed.

## Regression coverage

`src/components/transactions/TransactionHistory.test.tsx` now includes a long-content case using an intentionally long reseller name, item/detail/observation and operator email. It verifies on the real component that:

- reseller and detail use `line-clamp-2`;
- their actual `td` elements use `whitespace-normal`;
- the operator line uses bounded truncation in a `whitespace-normal` cell;
- the complete detail is retained in the hover `title`.

The existing browser-level containment regression from PR #133 remains in the suite.

## D-019 acceptance evidence

PR #135 final feature head:

`ece16ffc94b2b383c97ccdd9c0ae8699a7a3c13f`

Exact GitHub-generated merge ref checked out by Actions:

`d06f4108cfae6ef82d4d366d362cf13f6e5cd894`

Validated tree:

`b92e86e942c94b3dbb2c339ebdf1cda7abede066`

Critical QA:

- run: `33186980363`
- job: `98902403708`
- ESLint: **0 errors / 108 warnings**
- Vitest: **75 files / 317 tests PASS**
- Playwright: **21/21 PASS on first attempt**
- TypeScript + production Vite build: **PASS**

No failed gate was waived. In this run the pre-existing Reports chart-visibility E2E also passed on its first attempt.

## Integration evidence

PR #135 was squash-integrated into `develop` as:

`eec8c9363195aa7bd38ce28f0549585d5e50e5d9`

Integrated tree:

`b92e86e942c94b3dbb2c339ebdf1cda7abede066`

Therefore the tested merge-ref tree and integrated product tree are exactly equal.

Post-integration `develop` Critical QA:

- run: `33187306207`
- job: `98903523909`
- result: **PASS**

`main` remained `9574e3a4097ddd78ab1f75a13b9ea065287946e9`. No automatic Vercel publication occurred.

## Operational effect

This observation is closed. The project remains in `P10-S3-I2-I3-D` controlled clean-start early-use observation. The canonical recovery boundary is unchanged: before any normal hosted business write, the operator must have a confirmed real Backup v2 checkpoint strictly younger than 24 hours and stored outside Easy.

No new bounded implementation item follows automatically from this correction.
