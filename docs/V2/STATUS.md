# Easy V2 — Canonical Status

**Updated:** 2026-08-18  
**Repository:** `synapselab-ia/easy`  
**Stable baseline:** `main`  
**Integration branch:** `develop`

## Current phase

**P8 — Real store requirements discovery: `DONE`.**  
**P9 — Prioritized evidence-backed improvements: `IN_PROGRESS`.**

Phase state:

- P1 — Referential integrity and safe entity lifecycle: `DONE`.
- P2 — Correction, reversal and audit trail: `DONE`.
- P3 — Dates, balances and financial statements: `DONE`.
- P4 — Persistence architecture decision: `DONE`.
- P5 — Backup, restore and migration: `DONE`.
- P6 — Tests, CI and deployment safety: `DONE`.
- P7 — Incomplete UX flows / operational refinement: `DONE`.
- P8-S1 — Repository-evidence discovery and D-016 trigger assessment: `DONE`.
- P8-S2 — Direct real-store validation and D-016 keep/reopen decision: `DONE`.
- P9-S1 — Evidence-backed prioritization: `DONE`.
- P9-S2 — Recovery durability: `IN_PROGRESS`; evidence target `DONE`; mechanism comparison/decision `DONE`; P9-S2-I1 implementation `NOT_STARTED`.
- P9-S3 — Category data/reporting contract: `NOT_STARTED`.
- P9-S4 — Confirmed correction microflows: `NOT_STARTED`.
- P9-S5 — Occurrence-date usability verification: `NOT_STARTED`.
- P10 — Controlled beta, migration and cutover: `NOT_STARTED`.

## Startup protocol for a new conversation

Read in order:

1. `docs/V2/STATUS.md`
2. `docs/V2/PROJECT_SPEC.md`
3. `docs/V2/ARCHITECTURE.md`
4. `docs/V2/BACKLOG.md`
5. `docs/V2/DECISIONS.md`
6. `docs/V2/QA_LEDGER.md`
7. `docs/V2/CHANGELOG.md`

Then inspect only source/evidence required by `NEXT_ACTION`. `docs/V2/P8_DISCOVERY.md` and `docs/V2/P8_EVIDENCE_REQUEST.md` preserve P8 evidence. `docs/V2/P9_PRIORITIZATION.md` preserves P9-S1 scoring. `docs/V2/P9_RECOVERY_EVIDENCE_REQUEST.md` preserves the accepted P9-S2 target. `docs/V2/P9_RECOVERY_DECISION.md` is the authoritative mechanism comparison, D-016 disposition and P9-S2-I1 scope.

## Current technical baseline

Easy remains a browser-only React/TypeScript/Vite SPA using TanStack Query and local-first Dexie/IndexedDB. The live database remains Dexie **V4**.

Authoritative contracts include:

- P1 entity lifecycle and reference integrity;
- P2 audited reversal/correction history;
- P3 `occurredAt` financial occurrence, formal statement and FIFO debt semantics;
- D-016 local-first/single-user persistence until an explicit reopen trigger is proven;
- D-017 canonical `easy-backup` v2 logical backup contract;
- D-018 checkpointed verified atomic restore;
- D-019 repository-wide `npm run qa:critical` integration/publication gate;
- D-020 evidence-first operational UX prioritization;
- D-021 repository evidence alone cannot reopen D-016;
- D-022 direct store validation keeps D-016 for the current operating mode;
- D-023 P9 prioritization order;
- **D-024 synchronized recovery-copy folder + 24-hour freshness guard; D-016 remains local-first.**

No backend, authentication, cloud database, live synchronization, Google Drive API/OAuth, Dexie migration or backup-envelope version change is authorized by D-024.

## Accepted recovery target

Direct store/operator evidence establishes:

- newest usable off-device recovery copy must be **no more than 24 hours old**;
- manual restoration on **any computer** is acceptable;
- Easy has **daily demand** and multi-day recovery is incompatible, but no numeric hour-based RTO is invented;
- **Google Drive** is an acceptable durable destination;
- a **local PC file** is acceptable for day-to-day convenience;
- provider-operated remote recovery is not mandatory;
- the Google account connected to ChatGPT is not an Easy credential or authorization path.

Evidence-intake Critical QA `32175718073`, job `95837062983`, passed on PR #35. PR #35 integrated as `5bf83b6cc8b078858dcd26e5144285a7dd389d73`; validated merge ref and integration share tree `e1c32464b8260ae3b45094f20464ff3e5745687e`.

## P9-S2 accepted mechanism decision

D-024 selects **Synchronized recovery-copy folder + 24-hour freshness guard** as the smallest fit-for-purpose mechanism and explicitly **KEEPS D-016**.

Accepted operating model:

1. retain canonical `easy-backup` v2 and D-018 manual restore;
2. configure browser backup downloads to a local folder synchronized off-device by the operating system/provider; Google Drive for desktop is the accepted current-store instance;
3. perform one setup verification that an exported backup is visible in Drive outside the local-PC-only context;
4. track local recovery-copy export freshness fail-safe;
5. at 24 hours, require a fresh backup export before normal data-changing work continues, while keeping Backup/Restore reachable;
6. distinguish Easy-confirmed backup generation/download initiation from provider-side synchronization acknowledgment.

Reminder-only was rejected as insufficient. A required File System Access API path was not selected because the actual store browser family/version is not directly evidenced. Direct Drive API/OAuth and backend/cloud/live synchronization were rejected as larger than the accepted requirement and unsupported by a D-016 trigger.

Persistent Critical QA run **`32177687434`**, job **`95843265579`** — **PASS** on PR #37 merge ref `79552f7912307db88272e075b2320cade02f6f17`:

- ESLint: 0 errors / 80 warnings;
- Vitest: 43 files / 176 tests PASS;
- Playwright Chromium: 15/15 PASS;
- production build: PASS.

PR #37 was squash-merged into `develop` as `cb873b7ee4456ed8e5c00ace90f3926337c42bf4`. The validated merge ref and integrated commit share exact tree `6e7f6431c3dbdac8c58654d20873149efea2786c`.

The mechanism comparison/decision slice changed documentation only. No runtime mechanism has been implemented yet.

## P9-S2-I1 bounded implementation contract

Only the following runtime work is authorized next:

- backup/recovery UI and copy for one-time synchronized-folder setup;
- local recovery-health metadata only; no Dexie V5;
- missing/cleared metadata => `unknown/due`, never fresh;
- global last-copy health and due/overdue visibility;
- a hard 24-hour gate for normal data-changing operation while Backup/Restore remains reachable;
- minimal reuse/refactor of `exportData()` to expose generated filename/time and update local health after validated download initiation;
- tests covering first-run/unknown, warning/24h boundary, export refresh, recovery escape path and D-017/D-018 preservation;
- full D-019 validation.

Explicitly excluded from P9-S2-I1:

- Google Drive API/OAuth or provider-side sync-status verification;
- backend/auth/cloud database/live synchronization;
- File System Access API as a required baseline path;
- Dexie schema or `easy-backup` version changes;
- P9-S3/P9-S4/P9-S5 work.

## Active constraints

- do not work directly on `main`;
- preserve P1–P9-S1 and D-016/D-017/D-018/D-019/D-024;
- preserve the direct **<=24-hour** boundary without silently tightening or loosening it;
- do not invent a numeric RTO;
- do not treat local-only storage on a failed PC as off-device durability;
- do not claim Easy verified Drive synchronization when it only verified backup generation/download initiation;
- keep Backup/Restore reachable even when recovery health is unknown or overdue;
- do not start P9-S3/P9-S4/P9-S5 while P9-S2-I1 is active;
- run full `npm run qa:critical` before integration.

## NEXT_ACTION

**Execute only P9-S2-I1 — Recovery-copy freshness guard and synchronized-folder workflow — within D-024. Implement the one-time synchronized-folder setup guidance and verification state, fail-safe local recovery-health metadata, global recovery-copy freshness visibility, and the 24-hour overdue gate for normal data-changing operation while preserving unrestricted access to Backup/Restore. Reuse the existing validated `easy-backup` v2 export/restore path and refactor `exportData()` only as needed to expose export metadata and refresh local recovery health after download initiation. Add focused tests for first-run/unknown state, freshness boundaries, export refresh and recovery escape behavior. Do not add Google Drive API/OAuth, backend/auth/cloud/live synchronization, File System Access API as a required path, Dexie V5, backup-format changes, provider-side sync verification, or P9-S3/P9-S4/P9-S5 work. Run the full D-019 gate before integration.**