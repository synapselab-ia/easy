# Easy V2 — P10-S3-I2 Real-data migration / zero-cost durability gate

**Status:** `ACCEPTED CONTRACT / EXECUTION NOT AUTHORIZED`  
**Date:** 2026-08-20  
**Decision:** D-030  
**Scope:** define the exact stable-v1 → Supabase migration/reconciliation and zero-cost production-durability contract before any real store export/import

## 1. Result of this gate

P10-S3-I2 accepts a **contract**, not a real-data migration.

The contract closes the ambiguity left after P10-S3-I1 in four areas:

1. exact stable-v1 source snapshot identity and freeze behavior;
2. deterministic legacy-v1 staging/normalization/promotion into the current Supabase schema;
3. a zero-paid-infrastructure durability path that does not pretend Supabase Free has managed backups;
4. the exact evidence required before real data or a production URL may move.

The result is **GO only to synthetic implementation of the prerequisites defined below**. Real store export/import, real operator cutover, canonical URL switch and production publication remain unauthorized.

## 2. Verified starting boundary

Repository/integration baseline at contract definition:

- `develop`: `5e2decd337b7912f118801cd75cbb27e4e03cfc2`;
- stable `main`: `9574e3a4097ddd78ab1f75a13b9ea065287946e9`;
- stable remains the only production-authoritative application;
- stable export format is backup version 1 with `items`, `resellers`, `transactions`;
- current V2 user-facing hooks/pages still use Dexie/IndexedDB;
- dedicated Supabase project: `easy-v2` / `hrmkkhqfyfoqucwbcszq` / `sa-east-1`;
- live project was `ACTIVE_HEALTHY` during this gate;
- live project row counts at contract definition: 0 `easy_operators`, 0 categories, 0 items, 0 resellers, 0 transactions, 0 Auth users;
- live Security Advisor: 0 lints;
- no real store data has entered Supabase.

The current paid-infrastructure budget is **US$ 0**.

## 3. Supabase Free durability facts accepted by this gate

Current Supabase guidance verified on 2026-08-20 establishes:

- automatic daily database backups are provided on paid Pro/Team/Enterprise plans, not Free;
- Supabase explicitly recommends that Free-plan projects regularly use `supabase db dump` and keep **off-site backups**;
- Free projects can be paused after low activity; a paused project can be resumed and retains its data/configuration within the platform restore window;
- `supabase db dump` uses `pg_dump` with Supabase-specific filtering and excludes managed schemas such as `auth` and `storage` by default;
- data-only dumps are supported;
- a direct/session-pooler Postgres connection can be used for backup/restore tooling.

Authoritative provider references:

- https://supabase.com/docs/guides/platform/backups
- https://supabase.com/docs/guides/platform/free-project-pausing
- https://supabase.com/docs/guides/database/connecting-to-postgres
- https://supabase.com/docs/reference/cli/supabase-db-dump
- https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore

No claim is made that Free itself provides the managed-backup guarantee originally preferred by D-029.

## 4. D-030 zero-cost production durability decision

With paid infrastructure fixed at US$ 0, D-029 item 22 is satisfied **only conditionally** by a combined posture:

1. Supabase/Postgres remains the remote canonical business datastore;
2. an **unattended off-site logical database dump** becomes mandatory before production eligibility;
3. the dump must run on a trusted operator machine without requiring the operator to remember to export;
4. the destination must be outside the Supabase project and outside GitHub/GitHub Actions/Vercel/chat/docs;
5. the existing operator-approved synchronized recovery folder may be reused only after its local + remote/synchronized behavior is objectively proven;
6. successful backup freshness must be machine-verifiable and must fail production writes closed when stale beyond the accepted window;
7. independent manual `easy-backup` export remains an additional portability/contingency layer, not the primary automated layer;
8. at least one full restore drill from the automated artifact must pass before real production cutover.

Therefore **Supabase Free alone is still NO-GO**. Supabase Free + proven unattended off-site dumps + freshness enforcement + restore proof may become GO without paid infrastructure.

If the operator-local environment cannot objectively prove the synchronized/off-site copy and automated recovery health, production cutover remains blocked. The contract does not weaken that requirement.

## 5. Zero-cost backup automation contract

The future implementation must use a pinned Supabase CLI/tooling version and discover/verify the exact command flags at implementation time.

Minimum backup behavior:

1. run automatically at least once every 24 hours on the trusted store PC;
2. export a **data-only** logical dump of the canonical application data after Supabase becomes authoritative;
3. schema/RLS/functions are recovered from committed repository migrations rather than treating a mutable schema dump as canonical;
4. `auth` is not treated as business-backup payload; the production operator is re-onboardable from the documented Auth procedure;
5. authorization-only rows such as `easy_operators` may be excluded from the business-data dump and recreated after Auth onboarding;
6. write first to a temporary filename, require a successful dump exit, calculate SHA-256 and byte size, then atomically promote the artifact to its final timestamped filename;
7. never overwrite the only prior good artifact;
8. retain at least the latest **7 successful daily generations** while storage capacity permits; failure to maintain the mandatory minimum is a recovery-health failure;
9. only after the local artifact is proven present, hashed and objectively confirmed as synchronized/off-site may the job mark the backup as successful;
10. backup credentials must live only in an OS-protected operator-local secret boundary and must never be committed, embedded in browser code, printed in logs, stored in GitHub Actions, or copied into canonical docs/chat.

The exact synchronized-provider verification mechanism is an implementation detail, but **“the file was written into a folder that is probably synced” is not sufficient evidence**.

## 6. Cloud recovery-health enforcement

P10-S3-I2-I2 must introduce a server-visible recovery-health state controlled by the backup automation, not by browser-local user input.

Minimum semantics:

- record the timestamp of the last objectively successful off-site backup;
- record only non-sensitive evidence required to distinguish the successful generation, such as digest/size metadata;
- business mutations fail closed when the last successful off-site generation is older than 24 hours;
- transaction create/reverse/correct functions enforce this guard inside the database/server transaction boundary;
- category/item/reseller writes must enforce the same freshness requirement;
- browser code may read a sanitized health status but may not mark a backup successful;
- recovery-health metadata is not included in the business-data restore artifact and is re-established after a restore.

This is the cloud successor to D-024's safety intent, but the backup creation itself is automatic rather than dependent on the operator remembering to export.

## 7. Free-plan pause / availability boundary

The zero-cost posture accepts a lower **availability** guarantee, not lower data-integrity standards.

- if Supabase pauses or is unreachable, writes fail closed;
- no silent Dexie/offline write queue becomes authoritative;
- the operator may need to resume a paused Free project manually;
- a pause is treated as an operational outage, not permission to write locally and reconcile later;
- no uptime SLA is claimed under the US$ 0 posture;
- if future business requirements demand guaranteed always-on availability, that is a new budget/hosting decision.

## 8. Exact stable-v1 source identity contract

When a later real-data migration is explicitly authorized, the source must be identified by all of:

1. stable application commit `9574e3a4097ddd78ab1f75a13b9ea065287946e9`;
2. browser database `ResellerManagerDB`, Dexie V1;
3. backup envelope `version: 1`;
4. the backup's own `exportedAt` value;
5. local export filename;
6. exact file size in bytes;
7. SHA-256 digest calculated on the trusted store PC;
8. explicit operator acknowledgement that the file came from the current authoritative stable browser context.

Only sanitized metadata (`exportedAt`, size, digest, counts) may enter canonical evidence. The backup JSON itself and identifiable business rows remain inside the approved operator/recovery boundary.

## 9. Source-freeze behavior

A real migration must occur inside an explicitly opened maintenance window.

Before export:

1. current stable remains authoritative;
2. D-024 must be current;
3. all other stable tabs/windows are closed or made read-only operationally;
4. the operator acknowledges that no new stable transaction/item/reseller mutation may occur after the migration snapshot is created;
5. the point-in-time v1 backup is exported and immediately protected inside the approved recovery boundary.

After export, stable writes remain frozen until one of two outcomes:

- **GO:** exact cloud reconciliation passes and the later production-cutover gate proceeds in the same controlled window; or
- **NO-GO:** cloud imported/staging data is disposed/rolled back, stable remains authoritative, and stable writes may resume.

The project must not import a real snapshot merely for a long-lived beta while stable continues changing, because that would require an unplanned second migration/delta protocol later.

## 10. Legacy-v1 compatibility issue found by this gate

Stable v1 has no categories. Accepted P10-S1 normalization therefore produces:

- legacy items with missing lifecycle -> `isActive = true`;
- no fabricated category assignments;
- historical orders with no category snapshot;
- missing transaction `occurredAt` -> original `createdAt`.

The current Supabase public schema contains `items_active_requires_category`, which rejects an active item with `category_id IS NULL`.

Therefore **directly inserting normalized stable-v1 items into `public.items` is NO-GO**. Removing the historical no-invention rule is also NO-GO.

The accepted solution is **private staging before canonical promotion**, not fabricated history and not weakening the public new-operation rule.

## 11. Deterministic private staging contract

P10-S3-I2-I1 must add a non-Data-API staging/import boundary capable of storing the normalized stable-v1 snapshot before promotion.

Required properties:

- staging is in a non-exposed/private schema or equivalently inaccessible boundary;
- no `anon`/ordinary browser mutation access;
- source item/reseller/transaction IDs are retained exactly;
- source timestamps are retained as instants;
- legacy items can remain active + unclassified **inside staging only**;
- historical orders keep null category snapshots;
- staging validation rejects duplicate IDs, missing references, invalid transaction shapes, invalid dates and unexplained source values;
- source rows are not rewritten in-place merely to satisfy final public-table constraints;
- staging can be disposed atomically on NO-GO.

The staging design must be reproducible through repository migrations and proven with synthetic stable-v1 fixtures before real data is allowed.

## 12. Deterministic v1 normalization contract

The importer must reuse the accepted P10-S1 semantics rather than invent a second migration definition.

### Items

For each stable v1 item:

- preserve `id`, `name`, `basePrice`, `createdAt`, `updatedAt`;
- missing lifecycle normalizes to active;
- category remains absent in the raw normalized staging row;
- no category is inferred from item name, transaction history or any heuristic.

### Resellers

For each stable v1 reseller:

- preserve `id`, `name`, `phone`, `email`, `notes`, `createdAt`, `updatedAt`;
- missing lifecycle normalizes to active.

### Transactions

For each stable v1 transaction:

- preserve `id`, `resellerId`, type, item fields, quantity, unit price, total, observation and `createdAt`;
- `occurredAt` normalizes to the exact original `createdAt` instant;
- reversal/correction fields remain null because stable v1 does not provide those accepted V2 audit structures;
- order category snapshot remains null/null;
- payment/signal order/category fields remain null;
- references must exist in the normalized source set.

Any source row that cannot satisfy the accepted target shape after only these known normalizations is NO-GO and requires a new bounded decision rather than silent repair.

## 13. Current-item classification before promotion

Because the public cloud schema correctly requires an active current item to have an active category, promotion from staging requires explicit **current-state classification** of every active legacy item.

Rules:

1. category names/identities are new V2 current operational state and are not stable-v1 historical facts;
2. the operator must explicitly choose/confirm the current category mapping for every active legacy item before promotion;
3. inactive legacy items, if ever present in a later supported source, may remain unclassified only if the accepted public lifecycle rules permit it;
4. historical stable-v1 order rows remain without category snapshots even after the current item is classified;
5. current item classification must never backfill historical transaction category fields;
6. after classification/promotion, new orders follow normal D-025 current active-category requirements.

This preserves the distinction between **current classification** and **historical snapshot**.

## 14. Canonical promotion transaction

Promotion from validated staging to public canonical tables must occur in one controlled database transaction or an equivalently atomic server-side boundary.

Required order:

1. create the operator-confirmed categories;
2. insert items with preserved stable item IDs and confirmed current category IDs;
3. insert resellers with preserved stable reseller IDs;
4. insert transactions with preserved stable transaction IDs and accepted legacy normalization;
5. verify correction/reversal audit fields remain null for stable-v1 rows;
6. repair identity sequences;
7. execute structural/reference/financial reconciliation inside or immediately after the same blocked maintenance boundary;
8. mark migration promotion successful only if every acceptance query passes.

No public business rows from a failed partial promotion may survive.

## 15. Identity / sequence repair

Existing stable IDs are business-history identity and must be preserved for items, resellers and transactions.

Categories have no stable-v1 IDs and therefore receive target-only canonical IDs during the classified promotion.

After promotion, each generated identity sequence (`categories`, `items`, `resellers`, `transactions`) must be moved to a state where the next generated ID is strictly greater than the table's current maximum.

The implementation must use PostgreSQL's actual identity sequence discovered through database metadata (for example `pg_get_serial_sequence`) rather than hard-coding a guessed future sequence name.

Sequence repair is part of reconciliation; a successful import with a stale sequence is NO-GO.

## 16. Monetary normalization / parity

The migration may not silently change displayed financial value.

- reconciliation is performed in integer cents or an equivalent exact decimal representation;
- source values that would require a cent-changing normalization are NO-GO;
- order total must remain consistent with quantity × unit price under the accepted cent semantics;
- target PostgreSQL numeric values must reproduce the same displayed BRL cents as the stable source;
- zero-cent tolerance means **R$ 0,00 difference**, not “approximately equal”.

## 17. Exact structural reconciliation

Before a real migration can be accepted, sanitized evidence must prove:

- item count parity;
- reseller count parity;
- transaction total count parity;
- order/payment/signal count parity;
- exact item ID set parity;
- exact reseller ID set parity;
- exact transaction ID set parity;
- no orphan transaction reseller/item references;
- exact source/target parity for stable business fields after only the accepted lifecycle/`occurredAt` normalizations;
- every active target item has the explicit operator-confirmed current category;
- every historical stable-v1 order still has no fabricated category snapshot;
- all identity sequences are safely ahead of current maxima.

Category count/IDs are target-only current classification state and therefore are reconciled against the explicit operator classification map, not against stable-v1 history.

## 18. Exact financial reconciliation

Using effective financial semantics, require exact cent parity for:

1. gross order value;
2. payment value;
3. signal value;
4. net movement;
5. every reseller closing balance;
6. aggregate positive reseller debt;
7. any accepted statement/aging aggregate used as a cutover smoke check.

Any unexplained difference of R$ 0,01 is NO-GO.

Raw reseller names/transactions are not copied into GitHub/CI/chat/docs as evidence. Evidence records only sanitized aggregate results and mismatch status.

## 19. Real operator Auth onboarding contract

No real Auth user exists yet.

Before a real cloud candidate may read/write real business data:

1. provision the actual operator through normal Supabase Auth/admin tooling; never insert `auth.users` manually;
2. the operator email/credentials remain outside repository/chat/docs;
3. obtain the resulting Auth UUID through trusted admin tooling;
4. add exactly that user to `public.easy_operators` through trusted admin/database tooling;
5. canonical evidence records only sanitized facts such as Auth user count, active operator count and authorization PASS/FAIL — not the email or full UUID;
6. prove the authorized operator can access required business rows;
7. prove an authenticated but non-allow-listed synthetic user cannot access business rows or financial mutations;
8. no service-role/secret key enters the Vite client or public Vercel variables.

If a disaster restore creates a replacement Supabase project, the operator may receive a new Auth UUID; business data remains recoverable independently and the new UUID is re-allow-listed after onboarding.

## 20. Candidate application identity

No real-data import may target an unidentified mutable candidate.

Immediately before a later real migration window, record:

- exact Git commit SHA;
- exact Git tree SHA;
- passing D-019 run/job on that exact PR merge ref/tree;
- exact Supabase migration history/schema state;
- Security Advisor result;
- exact Vercel deployment ID;
- deployment-reported Git SHA;
- current alias -> deployment mapping if a mutable alias is used for access;
- environment proof that client configuration contains only project URL + publishable key.

The current `easy-v2` Supabase/Vercel environment may continue to be modified directly as the homologation environment **while it contains no real store data**, per the current project operating choice. Once real production data enters the project, direct experimental changes without local/synthetic migration validation are prohibited even if a second cloud environment has not yet been introduced.

## 21. Rollback / abort contract

### Before canonical promotion

Any staging mismatch:

- aborts promotion;
- disposes staging rows;
- leaves stable production untouched;
- records only sanitized NO-GO evidence.

### During failed promotion

The database transaction must roll back completely. Partial public target state is unacceptable.

### After promotion but before canonical URL switch

If application/Auth/reconciliation acceptance fails:

- do not allow business writes against the cloud candidate;
- dispose/reset imported cloud business rows through the approved recovery procedure;
- stable remains authoritative;
- stable write freeze may be lifted after the operator explicitly records the rollback result.

### After first cloud production write

Rollback becomes a different problem because stable is stale. That later post-cutover policy is **not** authorized by this contract and must be defined before canonical production switch.

## 22. Real-data handling boundary

Real store payloads must never enter:

- Git or GitHub repository contents;
- GitHub Actions logs/artifacts;
- chat messages;
- canonical documentation;
- public Vercel logs/environment variables;
- synthetic fixtures committed to the repository.

Allowed real-data locations during a later authorized migration are limited to:

- the authoritative stable browser/store PC;
- the operator-approved recovery/off-site boundary;
- the dedicated Easy Supabase project during the explicitly authorized migration window;
- a disposable local recovery instance on the trusted operator machine when required for restore proof.

Only non-identifying counts/digests/status evidence may leave that boundary.

## 23. Recovery drill contract

Before production cutover, prove both:

### A. Synthetic drill before any real data

- build schema from repository migrations in a disposable local Supabase/Postgres instance;
- populate synthetic canonical business rows;
- run the exact automated data-only dump path;
- restore that dump into another clean disposable local instance built from migrations;
- repair identity sequences;
- prove structural/financial equality;
- prove Auth/allow-list can be re-established independently.

### B. Real post-migration pre-cutover drill

After a later explicitly authorized real migration has passed reconciliation but before canonical traffic switches:

- produce the first automated off-site real data-only dump;
- verify its digest/off-site status without exposing the artifact;
- restore it on the trusted store PC into a disposable local environment;
- run the same sanitized structural/financial reconciliation;
- only then can the zero-cost durability posture be considered production-ready.

Failure in either drill is NO-GO.

## 24. Execution decomposition after this contract

This contract deliberately prevents jumping directly from I1 foundation to real data.

### P10-S3-I2-I1 — legacy staging/import compatibility, synthetic only

Implement only:

- private stable-v1 staging/import boundary;
- deterministic accepted v1 normalization;
- synthetic current-item classification mapping;
- atomic promotion into current public schema;
- explicit ID preservation + sequence repair;
- exact structural/reference/financial reconciliation helpers/tests;
- full synthetic cleanup;
- migrations/types/advisors/D-019.

No real data, real Auth user, backup automation or runtime cutover in I2-I1.

### P10-S3-I2-I2 — zero-cost unattended backup/recovery proof, synthetic only

Implement/prove only:

- trusted-PC scheduled `db dump` automation;
- operator-local protected credential boundary;
- objectively verified off-site/synchronized destination;
- >=7-generation retention;
- server-visible 24-hour recovery-health guard;
- synthetic dump/restore drill;
- no GitHub/CI real-data path.

No real store data or production cutover.

### P10-S3-I2-I3 — Supabase-backed Auth/runtime candidate, synthetic only

Implement/prove only:

- operator login/session UI needed for the one-operator model;
- business reads/writes through the accepted Supabase/RPC boundary;
- Dexie no longer authoritative for candidate writes;
- fail-closed connectivity behavior;
- synthetic app-level parity across dashboard/detail/search/PDF/category/correction paths;
- exact D-019 + Vercel candidate identity.

No real store data.

### P10-S3-I2-I4 — real migration/reconciliation execution

Only after I2-I1/I2-I2/I2-I3 are accepted may a real migration maintenance window be proposed. It must execute the source freeze, snapshot/digest, real Auth onboarding, staging/promotion, exact reconciliation and first real backup/restore proof defined here.

Even I2-I4 does not itself authorize canonical URL switch unless the canonical documents explicitly make that the next gate.

## 25. Acceptance / NO-GO criteria for this contract

This contract is accepted because it:

- keeps all real data out;
- resolves the active-unclassified stable-v1 vs public-schema mismatch without fabricated history;
- preserves stable IDs and accepted D-025/D-026 semantics;
- defines exact zero-cent structural/financial parity;
- makes real Auth identity private/sanitized in evidence;
- defines a zero-cost durability route based on provider-recommended off-site logical dumps while refusing to treat Free alone as backed up;
- requires unattended backup + 24-hour fail-closed freshness + restore proof;
- accepts Free-tier pause as availability risk, not as permission for offline writes;
- preserves `main` and stable production;
- decomposes execution so the next step is synthetic-only.

NO-GO remains mandatory if any later implementation:

- requires fabricated legacy category history;
- cannot preserve stable IDs;
- cannot reconcile to R$ 0,00 difference;
- cannot objectively verify off-site backup success;
- exposes privileged credentials or real business payloads outside the allowed boundary;
- weakens RLS/authorization or D-013/D-026 atomicity;
- requires paid infrastructure without a new explicit budget decision.

## 26. Next bounded action

**P10-S3-I2-I1 — implement and prove the private stable-v1 staging/import compatibility path with synthetic data only.**

Do not implement backup automation, real Auth onboarding, cloud business-runtime cutover, real store export/import, `main` publication, canonical URL switch or production cutover in that slice.
