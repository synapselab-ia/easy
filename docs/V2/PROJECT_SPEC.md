# Easy V2 — Project Spec

**Status:** canonical V2 product reference  
**Repository:** `synapselab-ia/easy`  
**Integration branch:** `develop`  
**Created:** 2026-08-17  
**Updated:** 2026-08-20

## 1. Purpose

Easy is a web application for managing reseller orders, payments/signals, balances, statements and operational analytics.

Easy V2 is an evolution of the existing application, not a greenfield rewrite. The goal is to preserve useful behavior while making the financial core safer, recoverable, auditable and maintainable before adding new business modules.

D-029 adds an explicit final-production objective: routine durability must not depend primarily on browser-local IndexedDB plus a person remembering to create/synchronize backups. The final V2 therefore targets Vercel hosting with Supabase/Postgres as canonical persistence while retaining an independent logical/manual Easy backup for portability and contingency.

## 2. Product baseline

The application already provides:

- item catalog with base prices;
- reseller registration and reseller detail pages;
- order, payment and signal transactions;
- automatic reseller balance calculation;
- dashboard totals and order volume;
- debt-aging/risk visualization;
- Pareto and debtor-ranking analytics;
- PDF reseller statements with date filtering;
- JSON backup import/export;
- global command/search center;
- responsive desktop/mobile layouts;
- light/dark theme;
- unit/integration tests and Playwright E2E coverage;
- historical GitHub Pages deployment from `main`;
- a separately deployed V2 Vercel candidate used during P10 rehearsal.

The current **user-facing runtime** remains Dexie/IndexedDB. P10-S3-I1 has now established the Supabase/Postgres schema, RLS/authorization, transactional RPC and typed-client foundation, but those cloud primitives are not yet wired as the application source of truth. Dexie remains a transitional implementation state, not the accepted final production topology.

## 3. V2 objectives

The V2 must become:

1. **Correct** — balances and history must remain internally consistent.
2. **Recoverable** — backup and restore must be validated, versioned and tested.
3. **Durable without routine human intervention** — final canonical data must survive browser/device loss without relying on an operator to perform the primary backup action.
4. **Auditable** — common human errors must be correctable without silently destroying history.
5. **Consistent** — dashboard, reseller detail, search, PDF and analytics must tell the same financial story.
6. **Usable** — routine operations should require few steps on desktop and mobile.
7. **Secure** — cloud-backed business data must require explicit authentication/authorization and must not expose privileged credentials to the browser.
8. **Testable** — critical regressions must be caught before publication.
9. **Maintainable** — another conversation/AI instance must be able to reconstruct project state from repository documents.
10. **Adequate to the store** — new modules must be driven by real operational requirements, not speculative feature accumulation.
11. **Portable** — managed cloud durability must not remove the ability to produce an independent logical Easy backup/export.

## 4. Architecture scope after D-029

D-016 originally prevented speculative backend/auth/cloud work. That constraint was valid until an explicit final-production durability requirement was accepted.

D-029 now selects this target:

- React + TypeScript + Vite remains the application stack unless a later decision proves a rewrite necessary;
- Vercel is the target frontend/application host;
- Supabase/Postgres is the target canonical production datastore;
- Supabase Auth and Row Level Security are required before production;
- Dexie/IndexedDB may remain as migration substrate/cache, but not the final authoritative production datastore;
- initial cloud writes are server-authoritative and fail closed when connectivity is unavailable;
- offline multi-master synchronization is not part of the first migration;
- logical `easy-backup` remains an independent portability/recovery contract;
- managed database backup becomes the primary durability layer after cloud cutover.

## 5. Non-goals for the first Supabase transition

Do **not** assume the first cloud migration requires:

- a full rewrite;
- Next.js;
- reseller self-service accounts;
- a broad employee role matrix;
- Realtime subscriptions everywhere;
- Edge Functions for logic that can safely remain in Postgres/RLS/client reads;
- offline queued financial writes or multi-master synchronization;
- inventory control;
- complex ERP behavior;
- broad visual redesign;
- dozens of additional dashboards;
- PITR before an explicit recovery-objective/cost decision.

These may be considered only when justified by later requirements.

## 6. Canonical work sequence

The V2 roadmap is organized into these phases:

- **P0 — State and governance**
- **P1 — Referential integrity and safe deletions**
- **P2 — Correction, reversal and audit trail**
- **P3 — Dates, balances and financial statements**
- **P4 — Persistence architecture decision: local vs cloud**
- **P5 — Backup, restore and migration**
- **P6 — Tests, CI and deployment safety**
- **P7 — Incomplete UX flows and operational refinement**
- **P8 — Store requirements discovery**
- **P9 — Prioritized new modules**
- **P10 — Controlled migration and cutover**
  - P10-S1: local compatibility + synthetic rehearsal — completed;
  - P10-S2: copied-live-data IndexedDB beta contract — accepted historically, execution abandoned before export;
  - **P10-S3: Supabase canonical-persistence transition — I1 foundation accepted; I2 migration/durability contract current.**

Large new features should not outrun the persistence/security/cutover foundation.

## 7. Critical invariants

The final cloud migration must preserve previously accepted product behavior, including:

- reversible reseller/item archival;
- strict active references for new operations with preserved historical rows;
- audited reversal rather than destructive financial deletion;
- atomic linked replacement correction;
- `occurredAt` distinct from registration/audit time;
- opening → movements → closing statement semantics and accepted debt-aging logic;
- immutable transaction-time item/category snapshots;
- non-inventive legacy category migration;
- full-field D-026 correction semantics;
- exact stable-v1 normalization already proven synthetically;
- independently exportable logical backup data.

These are migration acceptance constraints, not optional refactors.

## 8. Cloud security requirements

Before any real store dataset is imported into Supabase:

1. every exposed application table must have RLS enabled;
2. anonymous business-data access is forbidden;
3. client configuration may contain only the Supabase project URL and publishable key;
4. `service_role`/secret credentials must never be shipped to browser code or committed to Git;
5. authorization must identify the actual allowed user/store access rather than treating every authenticated user as authorized;
6. user-editable metadata must not control authorization;
7. D-013/D-026 multi-row correction/reversal integrity must execute within one transactional server/database boundary;
8. schema migrations and policy definitions must be reproducible from repository state;
9. synthetic tests plus Supabase security/performance advisors must pass before a real-data migration gate can be proposed.

## 9. Backup/recovery intent

The project keeps defense in depth:

- managed Supabase database backups are the intended primary durability mechanism after cutover;
- logical/manual Easy backup/export remains available as independent contingency and portability;
- optional automated off-site dumps may be added later;
- PITR remains a later RPO/cost choice rather than an assumption.

D-024 remains mandatory for the current browser-local stable production system until cloud cutover. Its synchronized-folder/24-hour manual-export write block is transitional and is not the intended final durability policy after managed cloud backup readiness is proven.

Current paid-infrastructure budget is **US$ 0**. This does not silently weaken D-029: P10-S3-I2 must either demonstrate a zero-cost production/recovery arrangement that actually satisfies the accepted durability objective or keep cloud production cutover blocked.

## 10. Repository governance

### Branch roles

- `main`: stable reference copied from the original Easy; not an experimentation branch.
- `develop`: V2 integration branch.
- isolated implementation/documentation branches derive from `develop`.

### Integration rule

A coherent change should follow:

`defined work -> isolated branch -> implementation/docs -> validation/tests -> PR -> review -> develop`

No V2 development should target the original `viniciuscasarin/easy` repository.

## 11. Sources of truth

For V2 work, use the following precedence:

1. `docs/V2/STATUS.md` — current state and `NEXT_ACTION`;
2. `docs/V2/PROJECT_SPEC.md` — product intent and invariants;
3. `docs/V2/ARCHITECTURE.md` — verified technical baseline and architectural decisions;
4. `docs/V2/BACKLOG.md` — ordered work and phase gates;
5. `docs/V2/DECISIONS.md` — accepted decisions and rationale;
6. `docs/V2/QA_LEDGER.md` — known QA evidence/gaps;
7. `docs/V2/CHANGELOG.md` — material project-state changes.

The historical `tasks/` directory is useful evidence of past intentions, but its checkbox state is **not** canonical project status.

## 12. Change discipline

Every completed phase should leave:

- the code or decision completed;
- corresponding validation/tests;
- documentation updated;
- a single explicit next action.

Do not consider a phase complete solely because the UI appears to work.

## 13. Evidence history for D-016 and D-029

P8 direct-store discovery correctly kept D-016 at that time: no evidence then required concurrent multi-user state, cross-device live sharing or cloud persistence.

P9-S2 therefore implemented D-024 as a bounded local-first durability improvement rather than prematurely adding backend/auth/cloud infrastructure.

P10-S2-I1 later reached the point where using the real dataset would require another browser-local beta and another manual-recovery boundary. Before any real export occurred, an explicit final-product requirement was accepted: remove routine human backup execution as the primary durability dependency while retaining independent manual backup capability.

That new requirement is the direct trigger that reopens D-016. D-029 therefore changes the **future final topology** without claiming that the earlier P4/P8 evidence was wrong.

Authoritative D-029 contract: `docs/V2/P10_SUPABASE_ARCHITECTURE_GATE.md`.