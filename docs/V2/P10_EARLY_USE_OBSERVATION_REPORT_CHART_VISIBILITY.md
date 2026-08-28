# P10 early-use observation — Reports chart visibility

**Observed:** 2026-08-28  
**Status:** `CLOSED / FIXED / INTEGRATED`  
**Executable PR:** #129  
**Scope:** presentation-only Recharts/theme compatibility

## Observed evidence

During controlled clean-start early-use observation, the operator reported that `Relatórios > Vendas e recebimentos` exposed the expected values on hover but showed no visible graphical line representation.

Inspection confirmed the report timeline data was present. The defect was in presentation: legacy Recharts SVG attributes wrapped complete Easy theme tokens as `hsl(var(--token))`, while the current theme variables are complete `oklch(...)` colors. The resulting wrapped color value is invalid, so Recharts retained data/tooltip interaction while the line marks were visually absent.

The same legacy color-wrapper pattern was also present on the Reports Pareto chart marks, so the bounded compatibility correction covers those affected Recharts presentation attributes as well.

## Accepted correction

PR #129:

- keeps `Vendas e recebimentos` as the existing two-series line chart;
- resolves affected legacy Recharts stroke/fill presentation attributes to the canonical Easy OKLCH theme tokens;
- normalizes the Recharts tooltip surface to the same canonical theme tokens;
- adds browser regression coverage that creates a real receipt, opens `/reports`, requires both financial-timeline curves to exist and verifies their computed `stroke` is visible;
- changes no `FinancialReport`, `DashboardSnapshot`, financial occurrence/reversal/FIFO semantics, immutable historical snapshots, PDF accounting projection, database/schema, Supabase/RPC/Auth/RLS, recovery or deployment behavior.

## D-019 and integration evidence

- feature head: `9c457d12a2292ea49ee5105dce3a45315e0e2b55`;
- exact GitHub-generated merge ref checked out by Actions: `50770e2266fe43cd3930bcb62e4db3a5864a9877`;
- validated tree: `a5729051d01482977f27d7bfae47500f1024e82f`;
- D-019 run/job: `33174899150` / `98860862191`;
- ESLint: **0 errors / 108 warnings**;
- Vitest: **73 files / 310 tests PASS**;
- Playwright: **20/20 PASS**, including the new Reports chart-visibility browser regression;
- TypeScript + production Vite build: **PASS**;
- PR #129 squash-integrated `develop`: `fe64ec80704bda33882623ef8bd33aac2d57db60`;
- integrated tree: `a5729051d01482977f27d7bfae47500f1024e82f` — exact tree equivalence **PASS**;
- post-integration `develop` Critical QA run `33175222098`: **PASS**.

No failed objective gate was waived. No automatic Vercel publication occurred and `main` was not modified.

## Canonical state after closure

This observed defect does **not** create early-use change #16 and does **not** reopen D-035 or create DR-10. It changes no phase, decision, backlog item or accounting contract.

The canonical `STATUS.md` / `NEXT_ACTION` remains semantically unchanged: continue P10-S3-I2-I3-D controlled clean-start early-use observation under D-031/D-032, acting only on new observed evidence or explicit operator instruction. Manual Vercel publication remains separate from this closure.
