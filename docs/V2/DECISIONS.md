# Easy V2 — Decision Ledger

**Updated:** 2026-08-21

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
**Status:** ACCEPTED / RETAINED BY D-029 AND D-031.

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
It protects local/manual recovery workflows and is not the intended final cloud primary durability mechanism.

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
**Status:** ACCEPTED / REFINED BY D-030 AND D-031  
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
**Status:** ACCEPTED  
**Date:** 2026-08-21  
**Authoritative record:** `docs/V2/P10_RUNTIME_FIRST_GOVERNANCE.md`

### Trigger

The D-030 I2-I2 implementation was ready, but its remaining evidence requires the trusted operator PC, real off-site configuration and elapsed retained daily generations. A 2026-08-21 remote preflight correctly stopped fail-closed because that proof could not be produced remotely.

The operator then explicitly chose to place those backup-dependent steps on hold and continue toward a usable Supabase-backed candidate first.

### Accepted sequencing exception

1. **P10-S3-I2-I2 becomes `ON_HOLD`, not `CURRENT`.** Its missing evidence remains missing; D-030 is not declared passed.
2. **P10-S3-I2-I3 is authorized immediately** as the runtime-first early-use slice. Any older sentence saying I2-I3 is unauthorized until I2-I2 passes is superseded for sequencing.
3. Supabase/Postgres may become canonical business persistence in the early-use candidate when browser-safe configuration is present.
4. Supabase Auth + RLS + `easy_operators` remain mandatory. No privileged key may enter the browser.
5. During early use, the logical JSON backup is the active operator recovery mechanism. Normal browser writes remain fail-closed when the last confirmed manual JSON recovery copy exceeds the accepted exact 24-hour freshness boundary.
6. The stronger automated D-030 server recovery-health requirement remains implemented/pending but may be disabled for this temporary early-use mode. This is not equivalent to accepting the D-030 durability proof.
7. JSON restore in cloud mode must be checkpointed, approved-operator-only, database/server atomic and post-restore verified.
8. **Clean-start early use is accepted.** Legacy real-store data migration is not required or authorized merely to begin using the candidate.
9. `main` remains untouched; Vercel deployment stays manual/candidate; no canonical URL/definitive cutover is implied.
10. Definitive production/canonical cutover still requires a later explicit gate. Before that gate, D-030 durability must be completed or replaced by another explicitly accepted durability mechanism/decision.

### Execution outcome

The repository implementation authorized by D-031 has now completed its integration gate:

- PR #72 was synchronized to current `develop`;
- D-019 passed on exact merge ref `77cef2b9125a204a1b564c44cfb4ebc0b9da55d8` in run `32502664982` / job `96835725075`;
- the validated merge-ref tree was `4ed336e4d05dc95df1abba7a9894d1b10abcd49b`;
- PR #72 was squash-integrated into `develop` as `8650a178aa487058f6eceabbbd1e5dfde4bc3bc2`;
- the integrated tree is exactly `4ed336e4d05dc95df1abba7a9894d1b10abcd49b`, proving tree equivalence;
- `main` remained unchanged.

D-031 therefore no longer points to PR synchronization as the current action. The current action is the bounded manual Vercel candidate/operator-onboarding step defined by `STATUS.md` and `BACKLOG.md`.

---

# Open decisions

- when/how D-030 unattended off-site recovery proof will be resumed after early-use learning;
- whether a later paid durability mechanism replaces the zero-cost D-030 path;
- whether legacy stable data is ever worth importing after clean-start early use;
- final `main`/stable publication, canonical URL, rollback and decommission policy.