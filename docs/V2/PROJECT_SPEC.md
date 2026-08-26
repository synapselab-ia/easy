# Easy V2 — Project Spec

**Status:** canonical V2 product reference  
**Repository:** `synapselab-ia/easy`  
**Integration branch:** `develop`  
**Updated:** 2026-08-26

## 1. Purpose

Easy is a web application for reseller orders, payments/signals, balances, statements, operational analytics and portable recovery.

Easy V2 evolves the existing application rather than rewriting it. It must preserve accepted financial/audit behavior while becoming safer, recoverable, durable and maintainable.

## 2. Final architecture objective

D-029 remains the final architecture direction:

- React + TypeScript + Vite;
- Vercel frontend hosting;
- Supabase/Postgres canonical business persistence;
- Supabase Auth + RLS + approved-operator authorization;
- no privileged/service credential in browser code;
- Dexie/IndexedDB as transition/cache, not hosted source of truth;
- atomic database/server boundaries for financial create/reverse/correct operations;
- independent logical Easy JSON backup for portability and contingency.

## 3. Current sequencing — D-031

The operator authorized runtime-first controlled early use before the D-030 unattended off-site backup proof is completed.

Current state:

- P10-S3-I2-I2 trusted-PC/off-site/retention/restore acceptance is `ON_HOLD`;
- the Supabase/Auth runtime and candidate onboarding are accepted;
- controlled clean-start early use is active;
- `main` remains stable and untouched;
- Vercel publication remains manual/candidate;
- definitive cutover remains unauthorized.

D-030 is not declared passed or cancelled.

## 4. Early-use recovery posture — D-032

Hosted cloud early use uses a store-global manual logical-backup boundary:

1. Supabase/Postgres holds canonical business data.
2. Approved operators access it through Auth/RLS/allow-list controls.
3. Backup v2 export reads the canonical cloud dataset.
4. The operator stores the JSON outside Easy and explicitly confirms that action.
5. That confirmed checkpoint is shared by all approved devices.
6. Normal writes are permitted only while the checkpoint age is strictly `< 24h`.
7. At `>= 24h`, the database blocks business writes; clients also fail closed when health cannot be verified.
8. Cloud restore remains checkpointed, server-atomic and post-restore verified.

A fresh real global checkpoint has been exported/stored/confirmed on the updated candidate, so D-032 is operationally initialized.

This temporary mode is not D-030 durability acceptance.

## 5. Product objectives

The V2 must be:

1. **Correct** — balances/history remain internally consistent.
2. **Recoverable** — export/restore paths are validated and tested.
3. **Auditable** — financial corrections preserve history.
4. **Consistent** — dashboard, reseller detail, PDF, search and analytics tell the same story.
5. **Secure** — cloud data requires authenticated approved-operator access.
6. **Usable** — routine operations remain efficient on desktop/mobile.
7. **Testable** — D-019 catches critical regressions before integration/publication.
8. **Maintainable** — canonical docs reconstruct current state without chat history.
9. **Portable** — cloud persistence never removes independent logical export.

## 6. Critical business invariants

The hosted runtime must preserve:

- reversible reseller/item/category/subcategory lifecycle where applicable;
- strict active references for new operations while historical rows remain preserved;
- audited reversal rather than destructive financial-history deletion;
- atomic linked replacement correction;
- `occurredAt` distinct from registration/audit time;
- accepted statement and FIFO debt-aging semantics;
- immutable transaction-time item/category/subcategory snapshots;
- non-inventive legacy classification semantics;
- D-026 full-field correction rules;
- exact logical-backup validation and recovery freshness enforcement.

## 7. Catalog classification — D-033

The accepted catalog model is intentionally shallow:

```text
Category -> optional Subcategory -> Item
```

Rules:

- there is exactly one optional subcategory level; recursive trees are out of scope;
- every subcategory belongs to one category;
- an item's subcategory, when present, must belong to the item's selected category;
- active items cannot use inactive classification;
- active references protect category/subcategory archival;
- legacy unclassified data stays unclassified rather than receiving guessed values;
- order history captures transaction-time category/subcategory snapshots;
- later catalog edits do not rewrite prior transactions;
- Backup v2 schema 6 contains subcategories and related references/snapshots;
- supported schema 4/5 backups normalize to schema 6 without inventing classification.

## 8. Cloud security requirements

- exposed application tables use RLS;
- anonymous business-data access is forbidden;
- browser configuration contains only project URL + publishable key;
- service-role/database/admin secrets never enter browser bundles/Git/public Vercel variables;
- authorization is based on server-managed `easy_operators`;
- financial multi-row operations cross one transactional PostgreSQL/server boundary;
- schema/policies remain reproducible from committed migrations.

Intentional `SECURITY DEFINER` transaction/restore RPCs are executable by `authenticated` only and internally assert the active operator. `anon` and `public` execute privileges are explicitly absent.

## 9. Data-migration posture

The private stable-v1 staging/import path remains available synthetically if later needed, but clean-start early use does not require or authorize real legacy import.

## 10. Repository governance

Branch roles:

- `main` — stable historical reference;
- `develop` — V2 integration;
- isolated branches derive from `develop`.

Integration pattern:

`defined work -> isolated branch -> implementation/docs -> D-019 (+ cloud evidence when relevant) -> PR -> develop`

## 11. Sources of truth

Precedence:

1. `docs/V2/STATUS.md` — current state and `NEXT_ACTION`;
2. `docs/V2/PROJECT_SPEC.md` — product intent;
3. `docs/V2/ARCHITECTURE.md` — technical architecture;
4. `docs/V2/BACKLOG.md` — ordered work;
5. `docs/V2/DECISIONS.md` — accepted decisions;
6. `docs/V2/QA_LEDGER.md` — validation evidence/gaps;
7. `docs/V2/CHANGELOG.md` — material state changes.

Historical `tasks/` checkboxes are not canonical status.

## 12. Current bounded goal

Close D-033 / PR #82 only:

- one optional subcategory level;
- database/UI/cache/backup/transaction snapshot parity;
- live synthetic integrity proof with rollback;
- final exact-tree D-019 after canonical documentation;
- integration to `develop` only if every objective gate passes;
- post-integration canonical closure and tree-equivalence proof.

The separately requested downloadable financial PDF/report is explicitly **not part of D-033** and must begin only after this classification change is fully closed.

This goal does not include automatic Vercel publication, D-030 trusted-PC proof, legacy real-store migration, `main` publication, canonical URL switch or definitive cutover.