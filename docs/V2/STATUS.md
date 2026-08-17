# Easy V2 — Canonical Status

**Updated:** 2026-08-17  
**Repository:** `synapselab-ia/easy`  
**Stable baseline:** `main`  
**Integration branch:** `develop`

## Current phase

**P3 — Dates, balances and financial statements**  
**State:** `NOT_STARTED`

**P1 — Referential integrity and safe entity lifecycle:** `DONE`.  
**P2 — Correction, reversal and audit trail:** `DONE`.

- **P2-S1 — Audited transaction reversal:** `DONE`, integrated into `develop`.
- **P2-S2 — Linked/guided correction replacement:** `DONE` on `feature/p2-s2-linked-correction`, with targeted automated validation and build passing before integration into `develop`.

P2 now provides non-destructive cancellation and guided replacement for the canonical correction cases while preserving the original financial record and a visible audit trail.

## Startup protocol for a new conversation

Read these files in order:

1. `docs/V2/STATUS.md`
2. `docs/V2/PROJECT_SPEC.md`
3. `docs/V2/ARCHITECTURE.md`
4. `docs/V2/BACKLOG.md`
5. `docs/V2/DECISIONS.md`
6. `docs/V2/QA_LEDGER.md`
7. `docs/V2/CHANGELOG.md`

Then inspect only the source files needed for the active `NEXT_ACTION`.

## Reconstructed baseline

Easy remains a browser-only reseller/order/payment management SPA with:

- React + TypeScript + Vite;
- Dexie/IndexedDB local persistence;
- items, resellers and order/payment/signal transactions;
- reseller balances, dashboard and analytics;
- PDF statements;
- JSON backup/restore;
- global search;
- responsive UI and theme support;
- automated-test infrastructure;
- GitHub Pages deployment from `main`.

## P1 completed behavior

- reseller and item lifecycle uses reversible active/inactive state;
- hard deletion of referenced resellers/items is guarded;
- new transaction references are validated below the UI;
- new orders derive their item snapshot from the referenced current item;
- the complete Dexie V1 → V2 → V3 path preserves valid lifecycle/history data;
- historical transaction snapshots are not destructively repaired.

## P2 completed behavior

### P2-S1 — cancellation/reversal

- `Transaction.reversal` preserves mandatory reason and ISO reversal timestamp;
- original transaction values/snapshots/`createdAt` remain unchanged;
- reversed transactions stay visible but have zero financial effect;
- reseller history exposes explicit `Estornar` with reason required;
- history/PDF show `Válido`/`Estornado`, reason and timestamp;
- reseller balance, dashboard, search and PDF balance inputs share reversal-aware semantics;
- pure cancellation remains valid for cases such as duplicate payment and old-order reversal.

### P2-S2 — linked/guided replacement

A correction that requires a replacement is now atomic and bidirectionally linked:

- original reversal may carry `replacementTransactionId`;
- replacement carries `correction.replacesTransactionId`;
- reversal + replacement creation occur inside one Dexie transaction;
- if replacement validation fails, neither reversal nor replacement is persisted;
- the original type, item identity and observation remain preserved;
- guided correction permits changing the target active reseller and the financial value fields;
- order corrections recalculate total from corrected quantity × unit price;
- order replacement preserves the original item and still obeys P1 active-item rules;
- normal transaction creation strips correction/reversal metadata so callers cannot forge audit linkage;
- linked rows remain independently visible in history and PDF with both directions of the relationship;
- the original is financially neutral and only the replacement contributes to balances/dashboard/search.

### Persistence

- Dexie schema remains **V3**;
- P2 audit/linkage metadata is optional and non-indexed, so no V4 migration is required;
- P2 does not modify P1 migration semantics.

### Future actor-attribution strategy

P2 closes without inventing a user identity before P4.

Accepted strategy:

- future correction audit metadata may add an optional opaque `actorRef`;
- `actorRef` is provider-neutral and must not encode assumptions about Supabase/authentication;
- if P4 keeps a local/single-user architecture, the ref may resolve to a stable local operator/installation identity;
- if P4 approves authenticated multi-user persistence, the ref may resolve to the stable application-user identifier;
- display names are resolved separately from the stored audit reference;
- existing P2 audit records without actor attribution remain valid;
- until P4 provides an identity source, Easy records no fabricated actor.

## Verified high-priority risks after P2

1. `createdAt` still conflates financial occurrence and registration semantics — P3.
2. Period statements still use net movement in the selected window rather than formal opening → movements → closing balance semantics — P3.
3. Aging remains based on current last-effective-movement behavior rather than a decided debt-aging model — P3.
4. Backup restore validation remains shallow — P5.
5. Repository-wide lint/test debt and deployment gating remain P6.
6. Item-result navigation/global UX limitations remain P7.

## P2-S2 completion evidence

- [x] wrong-value correction performs one atomic reversal + replacement operation;
- [x] wrong-reseller correction moves financial effect to the intended active reseller;
- [x] both original and replacement remain stored and independently inspectable;
- [x] linkage is persisted in both directions;
- [x] replacement creation remains subject to P1 active-reference validation;
- [x] guided order correction preserves original item/type/observation and derives corrected total from quantity × unit price;
- [x] invalid replacement rolls the whole correction operation back;
- [x] normal creation cannot forge reversal/correction audit metadata;
- [x] history and PDF expose original/replacement linkage;
- [x] domain balance, dashboard and search count only the effective replacement after correction;
- [x] P2-S1 pure cancellation/double-reversal behavior remains green;
- [x] P1 migration/lifecycle/reference regressions remain green;
- [x] GitHub Actions P2-S2 targeted gate passed on run `32042373332`;
- [x] `npm run build` passed on the same run;
- [x] future actor-attribution strategy defined without introducing auth/backend;
- [x] P2 acceptance gates reconciled and P2 closed.

## Active constraints entering P3

- do not work directly on `main`;
- do not modify the original `viniciuscasarin/easy` repository;
- do not introduce backend/authentication before P4;
- preserve P1 lifecycle/reference guarantees and P2 reversal/correction audit metadata;
- do not mutate historical financial rows destructively during date migration;
- distinguish transaction occurrence from audit timestamps such as `reversal.reversedAt`;
- do not expand P3-S1 into full statement redesign before occurrence-date semantics are established;
- do not expand into backup hardening (P5) or global CI cleanup (P6);
- add targeted tests for every date/migration behavior change.

## NEXT_ACTION

**P3-S1 — Occurrence-date model and backward-safe migration. Create a new feature branch from `develop`, inventory every current `createdAt` consumer across transaction creation, reseller history/filtering/PDF, dashboard/aging/performance, search, backup and tests; define exact `occurredAt` vs `createdAt` semantics and backward-read/migration rules; then implement only the occurrence-date slice with migration and targeted cross-surface tests. Preserve P2 audit timestamps and do not yet redesign opening/closing statement semantics.**

## P3 completion direction

P3 must eventually establish one coherent financial time/balance model, including:

- explicit occurrence date distinct from record/audit creation time;
- backward-safe historical migration;
- consistent date filtering across history, dashboard/analytics and PDF;
- formal opening balance → period movements → closing balance statement semantics;
- an explicit decision on whether current last-effective-movement aging is sufficient or true debt aging is required.
