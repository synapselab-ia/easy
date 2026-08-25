# Easy V2 — Decision Ledger

**Updated:** 2026-08-25

Only accepted decisions belong here. Newer decisions may refine/supersede older sequencing while preserving historical evidence.

## D-001 — V2 laboratory repository
**Status:** ACCEPTED  
Use `synapselab-ia/easy` for V2 work.

## D-002 — Branch roles
**Status:** ACCEPTED  
`main` is stable reference, `develop` is V2 integration, isolated work branches derive from `develop`.

## D-003 — P0 is governance-only
**Status:** ACCEPTED.

## D-004 — Legacy task checkboxes are historical
**Status:** ACCEPTED.

## D-005 — No full rewrite by default
**Status:** ACCEPTED.

## D-006 — Dexie/IndexedDB baseline
**Status:** ACCEPTED HISTORICALLY / SUPERSEDED BY D-016 THEN D-029 FOR FINAL PRODUCTION.

## D-007 — Preserve financial history over destructive deletion
**Status:** ACCEPTED DIRECTION.

## D-008 — Centralize financial domain rules
**Status:** ACCEPTED DIRECTION.

## D-009 — Reseller lifecycle is reversible archive
**Status:** ACCEPTED.

## D-010 — Item lifecycle is reversible archive
**Status:** ACCEPTED.

## D-011 — New references are strict; historical rows are preserved
**Status:** ACCEPTED.

## D-012 — Financial correction uses audited reversal
**Status:** ACCEPTED  
Original financial rows are preserved; reversal requires reason/timestamp and reversed rows have zero financial effect.

## D-013 — Replacement correction is atomic and linked
**Status:** ACCEPTED  
Correction creates a linked replacement and reverses the original atomically. Cloud persistence must preserve one transactional server/database boundary.

## D-014 — Financial occurrence is distinct from registration/audit time
**Status:** ACCEPTED  
`occurredAt` is business time, `createdAt` registration time and `reversal.reversedAt` audit time.

## D-015 — Statements and FIFO debt aging
**Status:** ACCEPTED.

## D-016 — Local-first/single-user until an explicit cloud trigger
**Status:** ACCEPTED HISTORICALLY / SUPERSEDED FOR FINAL PRODUCTION BY D-029.

## D-017 — Logical Easy backup is the canonical interchange/portable recovery contract
**Status:** ACCEPTED / RETAINED BY D-029, D-031 AND D-032.

## D-018 — Restore requires validation, checkpoint and verified atomic replacement
**Status:** ACCEPTED  
Local Dexie restore remains historical/current-local behavior; cloud restore must provide equivalent atomic/checkpointed safety through its own server boundary.

## D-019 — Critical QA is mandatory
**Status:** ACCEPTED

```text
npm run qa:critical
= lint + Vitest + Playwright + production build
```

Objective failure blocks integration. Supabase-bearing changes additionally require relevant database/policy/advisor evidence.

## D-020 — P7 prioritizes operator-intent/error risks
**Status:** ACCEPTED.

## D-021 — Repository evidence alone does not reopen D-016
**Status:** ACCEPTED HISTORICALLY.

## D-022 — Direct store validation originally kept D-016 and confirmed recovery/category/correction needs
**Status:** ACCEPTED HISTORICALLY.

## D-023 — P9 evidence-backed ordering
**Status:** ACCEPTED  
Recovery durability first, then categories/reporting, correction microflows and occurrence-date usability.

## D-024 — Synchronized recovery-copy folder + exact 24-hour freshness guard
**Status:** ACCEPTED / IMPLEMENTED / TRANSITIONAL  
It protects local/manual recovery workflows and is not the intended final cloud primary durability mechanism. D-032 refines hosted cloud manual-checkpoint state only; D-024 local/no-cloud behavior remains retained.

## D-025 — Category classification uses stable identity + transaction-time snapshots; legacy history is not invented
**Status:** ACCEPTED / IMPLEMENTED.

## D-026 — Effective transaction business fields are correctable through audited linked replacement
**Status:** ACCEPTED / IMPLEMENTED  
Original remains immutable; replacement may change reseller/type/date/observation and valid target fields while preserving/capturing category snapshots under D-025.

## D-027 — P10 is fail-closed
**Status:** ACCEPTED  
No live-data movement or publication is implied merely by prior feature completion.

## D-028 — Copied-live-data IndexedDB beta contract
**Status:** ACCEPTED HISTORICALLY / SUPERSEDED AS FINAL ROUTE BY D-029  
Execution stopped before real-data export.

## D-029 — Final V2 target is Supabase/Postgres canonical persistence + Vercel; manual backup remains independent defense
**Status:** ACCEPTED / REFINED BY D-030, D-031 AND D-032  
**Date:** 2026-08-20

Core rules:

- Supabase/Postgres canonical production datastore;
- Vercel target frontend host;
- Supabase Auth + RLS mandatory;
- approved operator authorization, not generic authenticated access;
- browser uses only URL + publishable key;
- no first-pass offline multi-master writes;
- Dexie transitional/cache only;
- financial correction/reversal remains server/database atomic;
- manual logical Easy backup remains independent portability/recovery;
- no definitive cutover implied by architecture implementation alone.

## D-030 — US$ 0 durability uses private migration staging + objectively proven unattended off-site logical backups
**Status:** ACCEPTED / EXECUTION PARTIALLY IMPLEMENTED; OPERATOR-LOCAL RECOVERY PROOF PENDING  
**Date:** 2026-08-20

Accepted durability contract:

- Supabase Free alone is not final backup evidence;
- unattended trusted-PC logical dumps to verified off-site storage;
- at least seven retained successful daily generations;
- exact-24h server-visible freshness/retention write guard;
- successful restore drills;
- private stable-v1 staging/explicit classification/atomic promotion/exact reconciliation for any later legacy migration.

I2-I1 staging/import compatibility is accepted synthetically. I2-I2 recovery tooling/server guard is implemented and synthetically proven, but actual trusted-PC/off-site/seven-day/restore evidence has not passed.

## D-031 — Operator-authorized runtime-first controlled early use before D-030 operator-local recovery proof
**Status:** ACCEPTED / REFINED FOR HOSTED MANUAL RECOVERY STATE BY D-032  
**Date:** 2026-08-21  
**Authoritative record:** `docs/V2/P10_RUNTIME_FIRST_GOVERNANCE.md`

### Trigger

The D-030 I2-I2 implementation was ready, but its remaining evidence requires the trusted operator PC, real off-site configuration and elapsed retained daily generations. A remote preflight correctly stopped fail-closed because that proof could not be produced remotely. The operator explicitly chose to place those backup-dependent steps on hold and continue toward a usable Supabase-backed candidate first.

### Accepted sequencing exception

1. P10-S3-I2-I2 is `ON_HOLD`, not current; its evidence remains missing and D-030 is not passed.
2. P10-S3-I2-I3 runtime-first early use is authorized.
3. Supabase/Postgres may be canonical business persistence in the early-use candidate.
4. Supabase Auth + RLS + `easy_operators` remain mandatory; no privileged key enters the browser.
5. During early use, logical JSON backup is the active operator recovery mechanism and writes remain fail-closed at the accepted exact 24-hour boundary. D-032 later defines the hosted cloud state for this checkpoint as store-global rather than per-browser.
6. The stronger automated D-030 recovery-health requirement remains implemented/pending and may be disabled temporarily; this is not D-030 acceptance.
7. Cloud JSON restore remains checkpointed, approved-operator-only, database/server atomic and post-restore verified.
8. Clean-start early use is accepted; legacy real-store migration is not required or automatically authorized.
9. `main` remains untouched; Vercel deployment stays manual/candidate; no canonical URL/definitive cutover is implied.
10. Definitive cutover still requires a later explicit gate and D-030 completion or an explicitly accepted replacement durability mechanism.

### Execution outcome

PR #72 implemented and integrated the runtime-first candidate. I3-C then completed manual Vercel publication, real operator onboarding, unauthorized-user denial and the first operator-confirmed manual JSON checkpoint. Controlled clean-start early use is active under the boundaries above.

## D-032 — Hosted manual recovery checkpoint is store-global and server-enforced
**Status:** ACCEPTED  
**Date:** 2026-08-25  
**Execution record:** `docs/V2/P10_S3_I2_I3_D_GLOBAL_RECOVERY_CHECKPOINT.md`

### Trigger

During controlled early use, the operator explicitly required the temporary 24-hour manual recovery checkpoint to apply to all approved devices. Requiring each browser installation to separately maintain/confirm the same store backup was operationally incorrect for a shared Supabase-backed canonical database.

### Accepted contract

1. **Cloud scope only.** In the hosted Supabase candidate, manual recovery freshness is store-global. The historical local/no-cloud D-024 path remains local and unchanged.
2. **Canonical state lives in Supabase.** Browser `localStorage` is not authoritative for cloud recovery health.
3. **Two-step human-attested flow.** An approved operator first exports a canonical Backup v2 JSON. After independently verifying that the file is stored outside the Easy, the operator explicitly confirms that fact.
4. **Append-only audit.** Export and confirmation are separate append-only database events. Browser clients receive no UPDATE/DELETE privilege on that event ledger.
5. **Approved operators only.** RLS/trigger boundaries require an authenticated active `easy_operators` identity. Non-approved authenticated users and anonymous clients cannot establish or read recovery state.
6. **Server identity/time.** Actor identity and event timestamps are established/validated at the database boundary rather than trusted from client-provided timestamps.
7. **Confirmation requires a pending export.** A confirmation may only link to the current operator's latest unconfirmed export; a confirmation with no such export is rejected.
8. **Shared freshness.** The latest confirmed export becomes the store-global checkpoint observed by every approved operator/device.
9. **Exact boundary.** A checkpoint is fresh only while age is strictly `< 24h`; at `>= 24h` normal business writes fail closed.
10. **Database enforcement.** The database business-write guard enforces the global boundary in addition to the browser. Stale/modified clients cannot bypass the accepted age rule.
11. **Client fail-closed.** A cloud client that cannot verify current global recovery state blocks normal writes rather than assuming the checkpoint is healthy.
12. **Initialization compatibility.** While the global event ledger is empty, the previously deployed D-031 client may continue operating long enough to roll out the updated client. Once any global manual event exists, the global manual guard is considered initialized and missing/unconfirmed/stale health fails closed.
13. **No fabricated migration of the old checkpoint.** Historical per-installation confirmations are evidence of their original flow only. They are not silently converted into global events. The first global checkpoint must come from a fresh real export + explicit confirmation on the updated candidate.
14. **D-030 precedence.** If the automated D-030 recovery guard is enabled later, its stronger verified off-site/retention predicate takes precedence over D-032 manual health.
15. **Not final durability.** D-032 does not prove filesystem destination, off-site durability, seven retained generations or restore drills. It does not satisfy D-030 and does not authorize definitive cutover.
16. **Deployment governance unchanged.** `main` remains untouched, Vercel publication remains manual/candidate, and canonical final URL switching remains separately gated.

### Acceptance evidence

Production migration `20260825191150_global_manual_recovery_checkpoint` was applied. Transactional synthetic proof showed non-allow-listed denial, confirmation-without-export denial, successful approved export+confirmation, fresh-write allowance and exact-24h write blocking with SQLSTATE `55000`; all synthetic events/business rows were rolled back. Implementation-tree D-019 passed in run/job `32889131712` / `97936610378`. Final exact-tree D-019 after canonical-document updates is recorded in PR #80 metadata before integration.

---

# Open decisions

- when/how D-030 unattended off-site recovery proof will be resumed after early-use learning;
- whether a later paid durability mechanism replaces the zero-cost D-030 path;
- whether legacy stable data is ever worth importing after clean-start early use;
- final `main`/stable publication, canonical URL, rollback and decommission policy.