# Easy V2 — Canonical Status

**Updated:** 2026-09-09  
**Repository:** `synapselab-ia/easy`  
**Stable baseline:** `main`  
**Integration branch:** `develop`

> Historical note: the complete canonical status immediately before the bounded transaction-history/operator-attribution refinement is preserved verbatim at `docs/V2/archive/STATUS_pre_transaction_history_audit_20260828.md`. Detailed closure evidence for later bounded refinements remains in the focused documents named below. This file is the current operational summary and has precedence when older documents still mention Backup v2 schema 6.

## Current phase

**P10 — Controlled migration and cutover: `IN_PROGRESS`.**  
**P10-S3 — Supabase canonical-persistence transition: `IN_PROGRESS`.**  
**P10-S3-I2-I3-D — controlled clean-start early-use observation: `CURRENT`.**

Current P10-S3 state:

- P10-S3-I1 — Supabase foundation: `DONE / ACCEPTED — SYNTHETIC FOUNDATION`.
- P10-S3-I2 — migration/reconciliation + durability contract: `DONE / ACCEPTED CONTRACT` — D-030.
- P10-S3-I2-I1 — legacy stable-v1 staging/import compatibility: `DONE / ACCEPTED — SYNTHETIC ONLY`.
- P10-S3-I2-I2 — zero-cost unattended backup/recovery proof: `ON_HOLD / IMPLEMENTATION READY — OPERATOR-LOCAL PROOF DEFERRED`.
- P10-S3-I2-I3 — Supabase-backed Auth/runtime candidate: `DONE / ACCEPTED — AUTHORIZED FOR CONTROLLED EARLY USE` — D-031.
- P10-S3-I2-I3-C — manual Vercel candidate + operator onboarding: `DONE / ACCEPTED`.
- P10-S3-I2-I3-D — controlled clean-start early-use observation: `CURRENT`.
- P10-S3-I2-I4 — legacy real-data migration: `ON_HOLD / NOT REQUIRED FOR CLEAN-START EARLY USE`.

## Integrated early-use state

The previously authorized usability/data-quality queue through change #15 is closed. D-035 Dashboard + Reports is complete through `DR-09`; **no change #16 and no DR-10 are authorized**. Later bounded work may be authorized only by new observed evidence or explicit operator instruction.

Important integrated milestones:

- D-032 / PR #80 — store-global manual Backup v2 checkpoint;
- D-033 / PR #82 — optional subcategories and immutable category/subcategory snapshots;
- D-034 / PR #85 — canonical financial Reports workspace + PDF;
- D-035 / PRs #114, #116, #118, #120, #122, #124, #125, #126 — Dashboard/Reports redesign through final acceptance;
- PR #129 — Reports chart-visibility defect fixed during early use;
- PR #131 — transaction history + server-derived operator attribution;
- PR #133 — transaction-history table containment;
- PR #135 — transaction-history readability;
- PR #137 — reseller-statement PDF issue date;
- PR #139 — continuous/repeated transaction entry;
- **PR #142 — operator-scoped visual personalization: `DONE / ACCEPTED / INTEGRATED`.**

Focused historical/closure documents retain the full evidence for PRs #131–#142; this current status intentionally does not duplicate every historical run and implementation detail.

## PR #142 closure — operator-scoped visual personalization

The 2026-09-09 explicit operator instruction authorized one bounded decorative-image personalization item. It is now complete and does **not** create early-use change #16, reopen D-035 or create `DR-10`.

Accepted product behavior:

- preference is genuinely scoped to the authenticated operator and persists cross-session in the existing `public.easy_operators` row;
- the preference is opt-in and disabled by default;
- initial eligibility is assigned from database state to the sole active operator, with no person name, e-mail or UUID hardcoded into presentation logic;
- only two presentation modes exist: `Canto` and `Marca d'água`;
- only bounded `Bem discreta` / `Suave` intensity presets exist;
- the implementation reuses the already-versioned `src/assets/hero.png`; no arbitrary upload, Supabase Storage, gallery or general theme-builder was introduced;
- the control is available in the authenticated shell on desktop/mobile only when the current operator is eligible;
- decorative rendering is `aria-hidden`, `pointer-events-none` and `print:hidden`, remains behind business content, and does not enter PDFs, reseller statements, backups, exports or print-oriented output;
- ineligible operators and the eligible operator while disabled receive the normal existing Easy interface.

Persistence/security acceptance:

- production migration `20260909135441_operator_visual_personalization` is applied to `easy-v2`;
- `authenticated` has column-level `UPDATE` only for `visual_personalization_enabled`, `visual_personalization_mode` and `visual_personalization_intensity`;
- `authenticated` cannot update `visual_personalization_allowed`, `is_active` or `user_id`;
- RLS policy `easy_operators_update_visual_preferences` restricts update to the authenticated user's own active, eligible operator row and uses both `USING` and `WITH CHECK`;
- live verification after integration found exactly 1 active operator, 1 eligible operator and 0 enabled operators, so the production preference remains off until explicitly enabled;
- the existing Supabase security advisors show no new finding attributable to this feature. The pre-existing intentional `SECURITY DEFINER` RPC advisory and leaked-password-protection warning remain outside this bounded task.

Repository acceptance evidence:

- final feature head: `7462a8a5f235691a8381587429715c22cc2f7242`;
- exact GitHub-generated merge ref validated by Actions: `c8aa4482eee0364a155d213cac5252dccfedec3c`;
- validated tree: `eeab347c5f701fe7ef6e2a6bd1400bc07f9bdcbd`;
- final PR D-019 run/job: `34360454611` / `102495778094`;
- ESLint: **0 errors / 108 warnings**;
- Vitest: **78 files / 329 tests PASS**;
- Playwright: **21/21 PASS**;
- TypeScript + production Vite build: **PASS**;
- feature-focused coverage includes `OperatorVisualPersonalization` 4/4 and operator-personalization service 3/3 PASS;
- PR #142 squash-integrated into `develop` as `3b3ba1f3eb280a552a806dda0f0752f21900c263`;
- integrated tree: `eeab347c5f701fe7ef6e2a6bd1400bc07f9bdcbd` — exact tree equivalence **PASS**;
- post-integration `develop` Critical QA run/job: `34364762432` / `102510503835` — **PASS**.

No failed gate was waived. No automatic Vercel publication occurred. `main` was not targeted.

Detailed authorization and closure: `docs/V2/P10_EARLY_USE_OPERATOR_VISUAL_PERSONALIZATION.md`.

## Governing decisions and invariants

D-031 continues to authorize runtime-first controlled early use before D-030 operator-local durability proof. D-032 defines the temporary store-global manual JSON checkpoint. D-033 defines the shallow category/subcategory model. D-034 defines one canonical read-only financial-report model shared by screen and PDF. D-035 defines Dashboard and Reports as one core decision system with separate operational and analytical roles; `DR-01…DR-09` is complete.

Current invariants:

1. Supabase/Postgres is canonical business persistence.
2. Supabase Auth + RLS + active `easy_operators` authorization remain mandatory.
3. Hosted-cloud recovery health is store-global; the latest confirmed real Backup v2 must remain strictly younger than 24 hours for normal writes.
4. The database enforces the recovery boundary and the browser fails closed when cloud recovery health cannot be verified.
5. D-030 remains `ON_HOLD / NOT ACCEPTED`; definitive cutover is not authorized.
6. `main` remains untouched; Vercel publication remains manual while the candidate is in controlled early use.
7. Catalog classification is `category -> optional subcategory -> item`, exactly one optional subcategory level.
8. Financial/classification history uses immutable transaction-time snapshots and D-014 occurrence-time semantics; later catalog edits do not rewrite history.
9. Reversed transactions have zero effective financial/reporting effect while remaining audit-visible.
10. **Backup v2 schema 7 is current; schema 4/5/6 remain supported inputs and missing historical actors are never invented.**
11. Transaction actor attribution is server-derived from the authenticated session; client-selected actor identity is not trusted.
12. The financial report screen and PDF consume the same canonical `FinancialReport` model.
13. Current-position Dashboard metrics are as-of the operator's current local day; later future occurrence dates do not affect current debt/aging before occurrence.
14. Operator visual personalization is ornamental only and may not influence authorization, business calculations, transaction behavior, recovery or exported documents.
15. No general audit, theme-builder, upload/storage subsystem, early-use change #16 or `DR-10` is implicitly authorized by the completed bounded refinements.

## Recovery checkpoint state

D-032 remains operational and was not bypassed by PR #142.

The latest observed real Backup v2 export/confirmation in `manual_recovery_events` is:

- export: `2026-09-04 14:36:06.332805+00`;
- confirmation: `2026-09-04 14:36:14.282849+00`.

As of 2026-09-09 this checkpoint is older than the accepted strict `<24h` window. Therefore normal hosted business writes must continue to fail closed until an approved operator exports a new Backup v2, stores it outside Easy and explicitly confirms it. The personalization migration/verification does not bypass or satisfy this recovery condition.

This remains D-032 early-use recovery evidence only and does not satisfy D-030 unattended off-site automation/retention/restore-drill acceptance.

## Startup protocol for a new conversation

Read in this exact order:

1. `docs/V2/STATUS.md`
2. `docs/V2/PROJECT_SPEC.md`
3. `docs/V2/ARCHITECTURE.md`
4. `docs/V2/BACKLOG.md`
5. `docs/V2/DECISIONS.md`
6. `docs/V2/QA_LEDGER.md`
7. `docs/V2/CHANGELOG.md`
8. `docs/V2/P10_EARLY_USE_TRANSACTION_HISTORY_AUDIT.md`
9. `docs/V2/P10_EARLY_USE_TRANSACTION_HISTORY_LAYOUT.md`
10. `docs/V2/P10_EARLY_USE_TRANSACTION_HISTORY_READABILITY.md`
11. `docs/V2/P10_EARLY_USE_RESELLER_PDF_ISSUE_DATE.md`
12. `docs/V2/P10_EARLY_USE_TRANSACTION_CONTINUOUS_ENTRY.md`
13. `docs/V2/P10_EARLY_USE_OPERATOR_VISUAL_PERSONALIZATION.md`

Read `docs/V2/DASHBOARD_REPORTS_SPEC.md` only when investigating D-035 historical design/acceptance evidence. The complete pre-PR131 status snapshot remains at `docs/V2/archive/STATUS_pre_transaction_history_audit_20260828.md` when deeper historical reconstruction is required.

Precedence when documents conflict:

1. current `STATUS.md` and its `NEXT_ACTION`;
2. newest applicable accepted decision in `DECISIONS.md`;
3. current focused closure/spec documents named by `STATUS.md`;
4. current `BACKLOG.md`;
5. older phase execution/history documents.

## NEXT_ACTION

**Resume only `P10-S3-I2-I3-D` controlled clean-start early-use observation on the accepted `develop` candidate. There is currently no additional authorized executable product change. Before normal hosted business writes, restore the D-032 store-global recovery checkpoint by exporting a fresh Backup v2, storing it outside Easy and explicitly confirming it so the server-visible checkpoint is strictly younger than 24 hours. After that, continue real operator use and collect concrete evidence/defects. Start another product change only from new observed evidence or a new explicit operator instruction, and then authorize it canonically before coding. D-030/I2-I2 remains on hold; do not automatically resume it, import legacy real-store data, create change #16 or `DR-10`, automatically deploy, modify/publish `main` or claim definitive cutover.**