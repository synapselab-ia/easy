# P10 early-use — reseller statement PDF issue date

**Date:** 2026-09-03  
**Scope:** bounded client-facing reseller-statement presentation refinement during `P10-S3-I2-I3-D` controlled early use.

## Observed evidence

The operator reported that the reseller statement PDF used for collection did not identify when that account/statement had been generated. The document could already show a selected financial `Período`, but that interval describes which financial occurrences are included and is not the document-emission date.

## Accepted behavior

PR #137 adds a separate header line:

`Emitido em: dd/mm/aaaa`

The date is the operator/browser local calendar date at the instant `generateResellerExtract(...)` creates the PDF.

When a financial range is selected, the PDF keeps both concepts explicitly separate:

- `Emitido em` = when this particular statement/PDF was generated;
- `Período` = the financial occurrence interval included in the statement.

The change only adjusts header/table vertical spacing. It does not change transaction selection, D-014 occurrence semantics, opening balance, order/payment totals, closing balance, correction/reversal behavior, filename semantics, Supabase persistence, Auth/RLS, Backup v2, recovery enforcement or deployment behavior.

## Acceptance evidence

- branch: `fix/reseller-pdf-issued-date`;
- final feature head: `e3876c713e93356170a72d58b0ea51188f9730d2`;
- exact GitHub-generated PR merge ref validated by Actions: `92b8793f6a258afab4459fc609258efcc8f3eebb`;
- validated/integrated tree: `a2d34910ae6ad3cee847a63c558b6ebcfbd5b35f`;
- D-019 PR run/job: `33760682855` / `100665933092`;
- ESLint: **0 errors / 108 warnings**;
- Vitest: **76 files / 319 tests PASS**;
- Playwright: **21/21 PASS**;
- TypeScript + production Vite build: **PASS**;
- PR #137 squash-integrated `develop`: `9b3bb2f560787f099345c618c9dcd1f269ec772e`;
- exact tree equivalence between validated merge ref and integrated squash commit: **PASS**;
- post-integration `develop` Critical QA run/job: `33761058376` / `100667188524` — **PASS**.

The first PR #137 D-019 attempt exposed one stale test-only expectation: the canonical statement test still expected the item table to begin at y=74, while the new independent `Emitido em` + `Período` header correctly moves it to y=82. The production implementation and the new issue-date tests passed; the old expectation was updated and the full D-019 gate was rerun. No failed gate was waived.

## Boundaries after closure

This refinement is observed early-use evidence only. It does not create early-use change #16, D-035 `DR-10`, a new reporting model or any recovery/cutover authorization.

`NEXT_ACTION` remains controlled early-use observation under D-031/D-032. No automatic Vercel publication occurred and `main` remains untouched at `9574e3a4097ddd78ab1f75a13b9ea065287946e9`.
