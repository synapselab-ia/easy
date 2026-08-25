# P10-S3-I2-I3-D — Store-global manual recovery checkpoint

**Date:** 2026-08-25  
**Status:** `DONE / ACCEPTED TARGET STATE — PR #80 FINAL D-019 REQUIRED BEFORE INTEGRATION`  
**Decision:** D-032

## 1. Trigger

During controlled clean-start early use, the operator explicitly identified that the temporary 24-hour manual recovery rule should protect the shared store database, not each browser independently.

Because Supabase/Postgres is canonical business persistence, requiring the operator and another approved user/device to maintain separate clocks for the same manual store backup creates false operational friction and inconsistent write availability.

The accepted correction is to make hosted cloud manual recovery health store-global while retaining the explicit human confirmation that the downloaded JSON was actually stored outside the Easy.

## 2. Scope

This bounded I3-D change does only the following:

- store cloud manual export/confirmation events in Supabase;
- share the latest confirmed checkpoint across approved operators/devices;
- enforce the exact 24-hour boundary at the database business-write layer;
- keep cloud clients synchronized to that state and fail closed when it cannot be verified;
- preserve the historical local/no-cloud D-024 behavior;
- preserve D-030 as the stronger final durability contract.

It does not authorize legacy import, `main` publication, final URL switching, definitive cutover or D-030 acceptance.

## 3. Database implementation

Production migration:

`20260825191150_global_manual_recovery_checkpoint`

### `public.manual_recovery_events`

Append-only event ledger with two event types:

- `export` — records a generated/downloaded Backup v2 filename;
- `confirm` — links to the current operator's latest unconfirmed export after the operator states that the file was stored outside the Easy.

Database controls:

- RLS enabled;
- `anon`: no access;
- `authenticated`: SELECT + INSERT only;
- UPDATE/DELETE not granted to browser role;
- policies require `public.is_easy_operator()`;
- actor identity is forced to `auth.uid()`;
- timestamp is forced to `clock_timestamp()`;
- confirmation with no current-operator pending export raises an error;
- duplicate confirmation of the same export is prevented.

### Global health RPC

`public.get_manual_recovery_health()` returns:

- latest store-global confirmed export timestamp;
- latest confirmed filename;
- confirmation timestamp;
- current operator's latest pending export timestamp/filename.

The function rejects a caller that is not an active approved Easy operator.

### Write guard

The existing `private.assert_recovery_backup_fresh()` now resolves recovery enforcement in this order:

1. direct trusted database maintenance bypass;
2. authorized atomic logical restore bypass;
3. D-030 automated guard, when enabled;
4. otherwise D-032 manual global mode once initialized.

The D-032 predicate is fresh only while:

`now < latest_confirmed_export + interval '24 hours'`

Therefore exact age `>= 24h` fails closed.

## 4. Safe rollout compatibility

The production database migration was applied before the updated frontend was published.

To avoid involuntarily locking the still-deployed old D-031 browser client before it can create a global event, an empty `manual_recovery_events` table means the new manual-global mode is not yet initialized.

Once the first global event exists, the mode is permanently initialized and missing/unconfirmed/stale health blocks normal business writes.

The old browser-local checkpoint is **not** imported into this table. The first global checkpoint must be a fresh real export + explicit confirmation from the updated candidate.

## 5. Frontend/runtime implementation

Cloud mode now:

- loads recovery health from Supabase after approved-operator authorization;
- periodically refreshes shared global health;
- records a global export event after the cloud Backup v2 export succeeds;
- records explicit global confirmation only when the operator clicks the confirmation action;
- reflects the same confirmed timestamp/filename on every approved device;
- fails closed for writes if global health cannot be verified after cloud mode is initialized.

Local/no-cloud mode continues to use the existing D-024 local recovery metadata and tests.

## 6. Security proof

Transactional synthetic proof against the live Supabase schema showed:

### Non-approved user denial

An authenticated Auth identity outside `easy_operators` was unable to register a manual recovery event.

### Confirmation sequencing

An approved operator attempting `confirm` without a pending export was rejected.

### Approved global flow

Inside one transaction:

1. approved operator inserted synthetic `export`;
2. approved operator inserted `confirm`;
3. global health returned the synthetic confirmed checkpoint;
4. transaction was rolled back.

### Exact 24-hour enforcement

Inside one transaction:

1. a synthetic approved confirmed checkpoint was created;
2. a business write while fresh was allowed;
3. checkpoint event time was moved to the exact accepted 24-hour boundary through the trusted maintenance proof path;
4. business write was rejected with SQLSTATE `55000`;
5. transaction was rolled back.

Final post-proof counts:

- manual recovery events: 0;
- categories: 0;
- items: 0;
- resellers: 0;
- transactions: 0.

No synthetic business payload or recovery event remained.

## 7. Advisor proof

After the DDL change:

- Supabase Security Advisor introduced no new D-032 schema/RLS finding;
- existing `auth_leaked_password_protection` WARN remains a known Supabase Free-plan residual early-use risk;
- Performance Advisor produced INFO-only unused-index notices expected on the empty/tiny database, including the new recovery table index.

## 8. Repository QA

### Implementation-tree D-019 — PASS

Before canonical-document updates:

- feature head: `246947c673ec13b840cb073e8b1b9e5c5d0efb3a`;
- exact PR merge ref: `06ecd1e6bde178486d38464d8277075cf866121c`;
- run/job: `32889131712` / `97936610378`;
- ESLint: 0 errors / 82 warnings;
- Vitest: 59 files / 251 tests PASS;
- Playwright: 17/17 PASS;
- production build: PASS.

### Final exact-tree gate

Canonical documents necessarily changed the PR tree after that run. PR #80 therefore requires one fresh exact-tree D-019. The final successful run/merge-ref identifiers are recorded in PR metadata and no repository commit may occur afterward before integration.

## 9. Rollout acceptance still requiring real operator action

Repository/database acceptance does not fabricate a real filesystem backup.

After PR #80 integration and manual Vercel publication, an approved operator must:

1. open the updated candidate;
2. click `Exportar Backup v2`;
3. verify the JSON is actually stored outside the Easy;
4. click `Confirmar que guardei a cópia`;
5. optionally verify another approved device/session sees the same current checkpoint.

Only that fresh real confirmation initializes the operational global checkpoint.

## 10. Preserved boundaries

- D-030 I2-I2 proof remains ON HOLD and not passed.
- D-032 is manual/operator-attested, not an automated durability proof.
- no legacy real-store data is imported.
- `main` remains untouched.
- Vercel remains manual candidate publication.
- no canonical final URL switch occurs.
- no definitive cutover is claimed.

## 11. Next bounded action

Final exact-tree D-019 -> integrate PR #80 into `develop` -> manually publish accepted `develop` to Vercel -> create and confirm the first fresh real global Backup v2 checkpoint -> resume ordinary I3-D early-use observation.