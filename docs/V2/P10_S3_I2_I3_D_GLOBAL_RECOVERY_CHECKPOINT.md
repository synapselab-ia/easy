# P10-S3-I2-I3-D — Store-global manual recovery checkpoint

**Date:** 2026-08-25  
**Status:** `DONE / ACCEPTED / INTEGRATED — OPERATOR-LOCAL ROLLOUT PENDING`  
**Decision:** D-032

## 1. Trigger

During controlled clean-start early use, the operator explicitly identified that the temporary 24-hour manual recovery rule should protect the shared store database, not each browser independently.

Because Supabase/Postgres is canonical business persistence, requiring separate browser clocks for the same manual store backup creates false operational friction and inconsistent write availability.

The accepted correction is to make hosted cloud manual recovery health store-global while retaining explicit human confirmation that the downloaded JSON was actually stored outside the Easy.

## 2. Scope

This bounded I3-D change:

- stores cloud manual export/confirmation events in Supabase;
- shares the latest confirmed checkpoint across approved operators/devices;
- enforces the exact 24-hour boundary at the database business-write layer;
- keeps cloud clients synchronized to that state and fail-closed when it cannot be verified;
- preserves historical local/no-cloud D-024 behavior;
- preserves D-030 as the stronger final durability contract.

It does not authorize legacy import, `main` publication, final URL switching, definitive cutover or D-030 acceptance.

## 3. Database implementation

Production migration: `20260825191150_global_manual_recovery_checkpoint`.

### `public.manual_recovery_events`

Append-only event ledger:

- `export` records a generated/downloaded Backup v2 filename;
- `confirm` links to the current operator's latest unconfirmed export after the operator states that the file was stored outside the Easy.

Controls:

- RLS enabled;
- `anon`: no access;
- `authenticated`: SELECT + INSERT only;
- UPDATE/DELETE not granted to browser role;
- policies require `public.is_easy_operator()`;
- actor identity forced to `auth.uid()`;
- timestamp forced to `clock_timestamp()`;
- confirmation without current-operator pending export rejected;
- duplicate confirmation of the same export prevented.

### Global health RPC

`public.get_manual_recovery_health()` returns the latest store-global confirmed export/filename/confirmation plus the current operator's pending export. Non-approved callers are rejected.

### Write guard

`private.assert_recovery_backup_fresh()` resolves recovery enforcement in this order:

1. direct trusted database maintenance bypass;
2. authorized atomic logical restore bypass;
3. D-030 automated guard, when enabled;
4. otherwise D-032 manual global mode once initialized.

D-032 is fresh only while `now < latest_confirmed_export + interval '24 hours'`; exact age `>= 24h` fails closed.

## 4. Safe rollout compatibility

The production migration was applied before the updated frontend publication.

An empty `manual_recovery_events` ledger leaves manual-global mode uninitialized so the still-deployed older D-031 client is not involuntarily locked before rollout. Once the first global event exists, missing/unconfirmed/stale health fails closed.

The old browser-local checkpoint is **not** imported into this ledger. The first operational global checkpoint must be a fresh real export + explicit confirmation from the updated candidate.

## 5. Frontend/runtime implementation

Cloud mode now:

- loads recovery health from Supabase after approved-operator authorization;
- periodically refreshes shared global health;
- records a global export event after cloud Backup v2 export succeeds;
- records explicit global confirmation only when the operator clicks confirmation;
- reflects the same confirmed timestamp/filename on every approved device;
- fails closed for writes if global health cannot be verified after initialization.

Local/no-cloud mode continues to use D-024 local recovery metadata.

## 6. Security/database proof

Transactional synthetic proof against live Supabase schema:

- authenticated non-allow-listed identity denied;
- approved operator `confirm` without pending export denied;
- approved synthetic export + confirm returned shared global health;
- fresh confirmed checkpoint allowed a synthetic business write;
- exact 24-hour checkpoint blocked business write with SQLSTATE `55000`;
- all proof transactions rolled back.

Final post-proof counts:

- manual recovery events: 0;
- categories: 0;
- items: 0;
- resellers: 0;
- transactions: 0.

## 7. Advisor proof

- Supabase Security Advisor introduced no new D-032 schema/RLS finding;
- existing `auth_leaked_password_protection` WARN remains a known Free-plan residual early-use risk;
- Performance Advisor produced INFO-only unused-index notices expected on the empty/tiny database.

## 8. Repository QA and integration

### Implementation-tree D-019 — PASS

- feature head `246947c673ec13b840cb073e8b1b9e5c5d0efb3a`;
- exact merge ref `06ecd1e6bde178486d38464d8277075cf866121c`;
- run/job `32889131712` / `97936610378`;
- ESLint 0 errors / 82 warnings;
- Vitest 59 files / 251 PASS;
- Playwright 17/17 PASS;
- production build PASS.

### Final exact-tree PR #80 D-019 — PASS

- final feature head `410bafe792233731561ec2d3aa1d2b38f573fea1`;
- exact GitHub-generated merge ref `cc0b740de4c419a73cfc0c1af6f8ab26729be3b2`;
- validated tree `4c1ee6e48af6365b5c96d74f6a5267f1fb3a830e`;
- run/job `32891655554` / `97944738069`;
- ESLint 0 errors / 82 warnings;
- Vitest 59 files / 251 PASS;
- Playwright 17/17 PASS;
- production build PASS.

No repository commit occurred on PR #80 after that successful run. PR #80 was squash-integrated into `develop` as `dbcc2a25394aa09f63d9232e771c9e9278db1fd0`. Integrated tree `4c1ee6e48af6365b5c96d74f6a5267f1fb3a830e` exactly equals the D-019-validated merge-ref tree: PASS.

Stable `main` remained `9574e3a4097ddd78ab1f75a13b9ea065287946e9`, tree `57243d004c5b550d0f27576f0179b0033044088e`.

## 9. Operator-local rollout still pending

Repository/database acceptance does not fabricate a real filesystem backup or deployment.

At repository closure, Vercel was still serving an older manually published `develop@768776e7da52da5051b7a69dec071d0481cd810d`. The connector's generic deployment action could not be safely used because its exposed schema did not permit targeting the exact Git revision while its backend required unpublished file payload arguments. No wrong deployment was created.

The operator-local rollout is therefore:

1. manually publish the current accepted `develop` to Vercel;
2. verify the deployment source contains D-032/current `develop`;
3. open the updated candidate as an approved operator;
4. click `Exportar Backup v2`;
5. verify the JSON is actually stored outside the Easy;
6. click `Confirmar que guardei a cópia`;
7. optionally verify another approved device/session sees the same current checkpoint.

Only that fresh real confirmation initializes the operational global checkpoint.

## 10. Preserved boundaries

- D-030 I2-I2 proof remains ON HOLD and not passed.
- D-032 is manual/operator-attested, not automated durability proof.
- no legacy real-store data is imported.
- `main` remains untouched.
- Vercel remains manual candidate publication.
- no canonical final URL switch occurs.
- no definitive cutover is claimed.

## 11. Next bounded action

Manually publish current accepted `develop` to Vercel -> verify D-032 is serving -> create/store/explicitly confirm the first fresh real global Backup v2 checkpoint -> resume ordinary I3-D early-use observation.