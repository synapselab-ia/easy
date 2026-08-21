# Easy V2 — Project Spec

**Status:** canonical V2 product reference  
**Repository:** `synapselab-ia/easy`  
**Integration branch:** `develop`  
**Updated:** 2026-08-21

## 1. Purpose

Easy is a web application for reseller orders, payments/signals, balances, statements and operational analytics.

Easy V2 evolves the existing application rather than rewriting it. The product must preserve the accepted financial/audit behavior while becoming safer, recoverable, durable and maintainable.

## 2. Final architecture objective

D-029 remains the final architecture direction:

- React + TypeScript + Vite application;
- Vercel frontend hosting;
- Supabase/Postgres canonical business persistence;
- Supabase Auth + RLS;
- approved-operator authorization rather than generic authenticated access;
- no privileged/service credential in browser code;
- Dexie/IndexedDB only as transition/cache, not final source of truth;
- atomic database/server boundaries for financial create/reverse/correct operations;
- independent logical Easy JSON backup for portability and contingency.

## 3. Current sequencing — D-031

On 2026-08-21 the operator explicitly authorized **runtime-first controlled early use** before the D-030 unattended off-site backup proof is completed.

This changes sequencing only:

- P10-S3-I2-I2 automated trusted-PC backup/recovery acceptance is **ON HOLD**;
- P10-S3-I2-I3 Supabase/Auth/runtime candidate is authorized and in progress;
- the current implementation is PR #72;
- early use is clean-start rather than a migration of legacy real-store data;
- `main` remains the stable historical reference;
- Vercel publication remains candidate/manual, not definitive cutover.

D-030 is not declared passed or cancelled. Its durability objective remains a later requirement for definitive production/canonical cutover unless a later accepted decision replaces it.

## 4. Early-use recovery posture

The temporary D-031 early-use mode uses defense in depth appropriate to the explicitly accepted risk:

1. Supabase/Postgres holds canonical business data.
2. Supabase Auth/RLS protects access.
3. The application retains logical JSON export.
4. JSON restore is checkpointed and server-atomic for the Supabase-backed path.
5. Browser normal writes remain fail-closed when the last confirmed manual JSON recovery copy is beyond the accepted 24-hour freshness boundary.
6. Automated D-030 server recovery-health enforcement is pending/disabled for this temporary mode.
7. The existing unattended dump/rclone/retention/restore tooling is retained for later completion; it is not the current action.

This mode is intentionally not described as final durability acceptance.

## 5. Product objectives

The V2 must be:

1. **Correct** — balances/history remain internally consistent.
2. **Recoverable** — export/restore paths are validated and tested.
3. **Auditable** — financial corrections preserve history.
4. **Consistent** — dashboard, reseller detail, PDF, search and analytics tell the same story.
5. **Secure** — cloud data requires authenticated, approved operator access.
6. **Usable** — routine operations remain efficient on desktop/mobile.
7. **Testable** — D-019 catches critical regressions before integration/publication.
8. **Maintainable** — canonical docs reconstruct current state without relying on chat history.
9. **Portable** — cloud persistence never removes independent logical export.

## 6. Critical business invariants

The cloud runtime must preserve:

- reversible reseller/item archival;
- strict active references for new operations while historical rows remain preserved;
- audited reversal rather than destructive financial-history deletion;
- atomic linked replacement correction;
- `occurredAt` distinct from registration/audit time;
- accepted statement and FIFO debt-aging semantics;
- immutable transaction-time item/category snapshots;
- non-inventive legacy category semantics;
- D-026 full-field correction rules;
- exact logical-backup validation.

## 7. Cloud security requirements

- all exposed application tables use RLS;
- anonymous business-data access is forbidden;
- browser configuration contains only project URL + publishable key;
- `service_role`, database passwords and other privileged secrets never enter browser bundles/Git/public Vercel variables;
- authorization is based on the server-managed `easy_operators` allow-list;
- financial multi-row operations cross one transactional PostgreSQL/server boundary;
- schema/policies remain reproducible from committed migrations.

## 8. Data-migration posture

The D-030 private stable-v1 staging/import path remains accepted synthetically and available if later needed.

For the current D-031 early-use plan, however:

- no legacy real-store import is required;
- no historical stable dataset should be moved merely to start testing/using the new runtime;
- the candidate begins clean and accumulates new data directly in Supabase.

A later request to migrate legacy data would require a new explicit gate/re-authorization.

## 9. Repository governance

Branch roles:

- `main` — stable historical reference; do not use for V2 experimentation.
- `develop` — V2 integration.
- isolated code/docs branches derive from `develop`.

Integration pattern:

`defined work -> isolated branch -> implementation/docs -> D-019 (+ cloud evidence when relevant) -> PR -> develop`

## 10. Sources of truth

Precedence:

1. `docs/V2/STATUS.md` — current state and `NEXT_ACTION`;
2. `docs/V2/PROJECT_SPEC.md` — product intent;
3. `docs/V2/ARCHITECTURE.md` — technical architecture;
4. `docs/V2/BACKLOG.md` — ordered work;
5. `docs/V2/DECISIONS.md` — accepted decisions;
6. `docs/V2/QA_LEDGER.md` — validation evidence/gaps;
7. `docs/V2/CHANGELOG.md` — material state changes.

Historical `tasks/` checkboxes are not canonical status.

## 11. Current bounded goal

Finish and integrate the PR #72 Supabase/Auth/runtime candidate into `develop`, then publish/configure a manual Vercel candidate for controlled clean-start early use with an approved operator and an initial manual JSON recovery checkpoint.

This goal does not include `main` publication, legacy data migration or definitive cutover.