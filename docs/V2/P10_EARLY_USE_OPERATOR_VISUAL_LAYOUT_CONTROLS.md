# P10 early-use — operator visual layout controls

**Date:** 2026-09-09  
**Scope:** explicit operator follow-up to the accepted PR #142 / PR #144 visual-personalization work during `P10-S3-I2-I3-D` controlled early use.  
**Status:** `DONE / ACCEPTED / INTEGRATED — PR #147`

## Trigger

After accepting operator-scoped visual personalization and custom image selection, the operator explicitly authorized one further bounded presentation refinement so the eligible operator can place the decorative image where it is pleasant rather than distracting during day-to-day work.

This remains optional quality-of-life personalization only. It is not historical early-use change #16, D-035 `DR-10`, a general theme builder, branding redesign, page-layout editor, business-data feature or D-030 resumption.

## Accepted product result

PR #147 extends only the existing `Personalização visual` feature with account-scoped layout controls:

1. **Position:** exactly nine fixed viewport anchors:
   - superior esquerda;
   - superior centro;
   - superior direita;
   - centro esquerda;
   - centro;
   - centro direita;
   - inferior esquerda;
   - inferior centro;
   - inferior direita.
2. **Size:** exactly three bounded presets: `Pequeno`, `Médio` and `Grande`.
3. **Opacity:** compact slider bounded to **5%–50%** in 5-point increments, with the current numeric percentage visible.
4. **Layer:** exactly two choices:
   - `Atrás do conteúdo`;
   - `Sobre o conteúdo`.
5. Position, size, opacity and layer persist on the existing eligible operator account across browser/device sessions.
6. The existing custom-image selection, private Storage object, bundled fallback and enable/disable control remain unchanged.
7. Draft layout changes preview immediately while `Personalização visual` is open; cancelling discards the draft and saving persists it.

## Safety and usability acceptance

The decorative image remains presentation-only regardless of layer:

- always `pointer-events: none`, so it cannot block buttons, fields, navigation or gestures;
- always decorative/ignored by assistive technology through empty alt text plus `aria-hidden`;
- always `print:hidden`, keeping print/PDF/export surfaces unchanged;
- fixed to one of the nine viewport anchors rather than participating in document flow;
- the three stable product sizes map to bounded responsive CSS widths;
- `Atrás do conteúdo` renders below the application-content layer and `Sobre o conteúdo` above it, while both remain non-interactive;
- no free dragging, arbitrary X/Y coordinates, rotation, crop/editor, animation, multiple simultaneous images, per-page layouts or additional theme system was introduced.

## Persistence/security acceptance

The accepted implementation extends the existing `public.easy_operators` row rather than creating another identity/profile system.

Production migration `20260909191739_operator_visual_layout_controls` is applied to `easy-v2` and adds only:

- `visual_personalization_position`, constrained to the nine accepted anchors;
- `visual_personalization_size`, constrained to `small | medium | large`;
- `visual_personalization_opacity`, constrained to 5–50 and multiples of 5;
- `visual_personalization_layer`, constrained to `behind | over`.

The migration backfills the closest representation of the already accepted PR #142 presentation and preserves the prior mode/intensity fields for compatibility with the previously published candidate. The accepted PR #147 UI reads/writes the explicit position/size/opacity/layer contract.

Security inspection after the migration confirmed:

- only the authenticated user's own active and eligible row may be updated;
- browser `UPDATE` remains column-scoped to presentation-preference fields only;
- `user_id`, `is_active` and `visual_personalization_allowed` remain non-updatable by the browser;
- existing RLS `USING` and `WITH CHECK` ownership + active + eligibility predicates remain unchanged;
- no `service_role`, secret key, client-selected identity or hardcoded person identity was introduced;
- no financial, transaction, recovery or Backup v2 schema semantics depend on these fields;
- post-migration Supabase security/performance advisors produced no new finding attributable to PR #147; only previously tracked warnings/debts remain.

## QA and repository acceptance evidence

PR #147 passed the complete D-019 `npm run qa:critical` gate before integration.

Exact acceptance evidence:

- final feature head: `40f23539781fce5a3411f7ad8c65744c86e850d5`;
- exact GitHub-generated merge ref checked out by Actions: `6a6c73b0c968480693f04076a214034436c8ac2d`;
- validated tree: `71ae16e75c037fcf777dfb1861b97039a5c999dc`;
- PR D-019 run/job: `34394791333` / `102611692737` — **PASS**;
- ESLint: **0 errors / 108 warnings**;
- Vitest: **78 files / 338 tests PASS**;
- focused personalization component coverage: **10/10 PASS**;
- focused personalization service coverage: **6/6 PASS**;
- Playwright: **21/21 PASS**;
- TypeScript + production Vite build: **PASS**;
- PR #147 squash-integrated `develop`: `bd3c899abe8566a02a173ef458544b36f33ff3d2`;
- integrated tree: `71ae16e75c037fcf777dfb1861b97039a5c999dc` — exact validated-tree equivalence **PASS**;
- post-integration `develop` Critical QA run/job: `34395296278` / `102613395781` — **PASS** with the same 0-error lint, 338/338 Vitest, 21/21 Playwright and production build gates.

No failed Critical QA gate was waived; the feature gate passed on its first attempt. The migration version in the repository matches the applied Supabase migration history exactly.

## Preserved invariants

All accepted V2 and PR #142 / PR #144 invariants remain in force, including Supabase Auth/RLS/operator authorization, server-derived transaction actor attribution, D-014 occurrence semantics, reversal-zero-effect behavior, D-015 FIFO aging, immutable historical classification, screen/PDF report parity, Backup v2 schema 7, D-032 recovery fail-closed behavior, manual deployment and untouched `main`.

Decorative-image presentation state remains outside Backup v2 and is never canonical business data.

The stale D-032 checkpoint was neither bypassed nor refreshed by PR #147. Before normal hosted business writes, a fresh Backup v2 must still be exported, stored outside Easy and explicitly confirmed. D-030 / I2-I2 remains on hold. No legacy real-store import, early-use change #16, `DR-10`, automatic Vercel publication, `main` modification or definitive cutover occurred.

## Closure

The operator visual layout-controls follow-up is **DONE / ACCEPTED / INTEGRATED** on `develop` through PR #147. No additional implementation is implied by this document.

Canonical `NEXT_ACTION` returns to controlled clean-start early-use observation, subject to the stale D-032 recovery checkpoint before normal hosted business writes and any later explicit operator instruction.