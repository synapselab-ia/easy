# P10 early-use — continuous transaction entry

**Date:** 2026-09-03  
**Scope:** bounded transaction-entry usability refinement during `P10-S3-I2-I3-D` controlled early use.

## Observed evidence

The operator reported a repetitive-entry bottleneck in the canonical `Lançamentos` flow: after each save, the transaction form reset every field. In real batch work this forced repeated selection of the same reseller and, depending on the batch, the same type, date, item, price/value or observation across many consecutive launches.

The operator explicitly authorized a bounded usability refinement and requested that the result remain visually clean. This work is not early-use change #16, D-035 `DR-10`, D-030 resumption, a new batch-persistence subsystem or a second transaction form.

## Accepted behavior

PR #139 keeps the existing `TransactionForm` and the existing transaction mutation/persistence path, while adding an explicit continuous-entry mode:

- `Salvar e concluir` performs the normal save and returns the form to its safe initial state;
- `Salvar e adicionar outro` performs the same transaction save and prepares the existing form for the next launch;
- a compact `Manter no próximo lançamento` control group lets the operator choose which values survive only that continuation;
- `Revendedor`, `Tipo` and `Data` are enabled by default because they are common batch anchors;
- for `Pedido`, `Item`, `Quantidade` and `Preço` can be retained explicitly;
- for `Pagamento`/`Sinal`, `Valor` can be retained explicitly;
- `Observação` can be retained explicitly for either flow;
- unchecked values return to their normal safe defaults for the next launch;
- `Cancelar` and `Salvar e concluir` clear the continuation choices and restore the standard defaults;
- an existing reseller context supplied to the form remains supported and is restored correctly when the sequence is concluded/cancelled.

The retention controls are visually compact pill-like controls and expose checkbox semantics through `role="checkbox"` / `aria-checked`, with an explicit selected state. They are separate controls rather than labels around hidden/native form inputs, preventing their names from colliding with the real transaction fields in accessible queries.

The form does not create a second write path, does not bypass validation and does not relax catalog eligibility. In particular, new orders still require the existing valid active classification required by the transaction persistence layer.

## Boundaries preserved

No database/schema migration, Supabase RPC, Auth/RLS rule, active-operator authorization, actor-attribution rule, Backup v2 contract, recovery guard, D-014 occurrence semantics, reversal-zero-effect behavior, D-015 FIFO aging, correction/reversal rule, financial-report calculation, PDF calculation or deployment workflow changed.

The canonical CI workflow was temporarily instrumented only to identify failing subphases while GitHub job logs were difficult to retrieve. It was restored exactly to the repository's normal `npm run qa:critical` workflow before final acceptance; there is no net workflow change in PR #139.

## QA diagnosis — failed gates corrected, not waived

The initial D-019 failure was investigated rather than bypassed.

The diagnosis established:

1. installation, Node setup and Playwright browser setup were healthy;
2. lint passed while the unit suite failed;
3. the new retention controls initially introduced accessible names such as `Manter quantidade`, `Manter observação` and `Manter revendedor`, exposing stale broad Testing Library selectors that matched both the actual field and the new control;
4. the controls were refined to explicit accessible checkbox-role pills and affected tests were made precise for the actual fields/actions;
5. one new continuous-order test used a legacy unclassified item as a persistence fixture, while the real application correctly rejects a new order without active classification; the fixture was made valid without weakening that rule;
6. after the full Vitest suite reached 322/322 PASS, the canonical gate exposed one stale pre-existing Reports chart E2E still clicking the removed `Lançar Movimentação` action; that test was aligned to `Salvar e concluir` without changing what the E2E verifies;
7. the complete canonical D-019 gate was then rerun and passed.

No failed executable gate was waived.

## Acceptance evidence

- implementation branch: `feat/transaction-continuous-entry`;
- final feature head: `207a04cbb1095b07dc35e26d3c4521727b9ee012`;
- exact GitHub-generated PR merge ref validated by Actions: `940b13eb570e430733f5e045fb7af32a6a76e362`;
- validated tree: `51af140eccafcbdee226ebc21ada544a6fd49e2c`;
- D-019 PR run/job: `33779270951` / `100728639904`;
- ESLint: **0 errors / 108 warnings**;
- Vitest: **76 files / 322 tests PASS**;
- Playwright: **21/21 PASS**;
- TypeScript + production Vite build: **PASS**;
- PR #139 squash-integrated `develop`: `51a99cce00535bd40f6ed24a0373e58cc01b494c`;
- integrated tree: `51af140eccafcbdee226ebc21ada544a6fd49e2c`;
- exact tree equivalence between validated PR merge ref and integrated squash commit: **PASS**;
- post-integration `develop` Critical QA run/job: `33779689002` / `100730023526` — **PASS**.

## Boundaries after closure

PR #139 is a user-authorized bounded early-use usability refinement. It does not reopen D-035, create `DR-10`, create early-use change #16 or authorize a broader batch-entry subsystem.

`NEXT_ACTION` remains controlled early-use observation under D-031/D-032. No automatic Vercel publication occurred and `main` remains untouched at `9574e3a4097ddd78ab1f75a13b9ea065287946e9`.
