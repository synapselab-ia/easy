# Easy V2 — Changelog

This changelog records material V2 project-state changes rather than every code-line edit. Detailed implementation history remains available in Git/PR history, `STATUS.md`, `QA_LEDGER.md`, `DECISIONS.md` and phase-specific documents.

---

## 2026-08-18 — P9-S2-I1 recovery freshness guard implemented; P9-S2 closed

The D-024 runtime slice is implemented and P9-S2 is complete.

Implemented behavior:

- namespaced local recovery-health metadata (`easy.recoveryHealth.v1`), with no Dexie V5 or business-data migration;
- fail-safe `unknown/due` handling for missing, corrupt or unverified state;
- global health states `unknown`, `due`, `current`, `warning` and `overdue`;
- a non-contractual 20-hour warning while preserving the accepted hard **24-hour** boundary;
- centralized recovery write guard across normal item, reseller and transaction mutations;
- read-only operation and Backup/Restore remain available while normal writes are blocked;
- existing validated `easy-backup` v2 export now returns its exact filename/export timestamp for local freshness tracking without changing the backup envelope;
- one-time synchronized-folder setup guidance and explicit operator confirmation after observing the exported copy in Drive outside the local-PC-only context;
- global application-shell visibility of recovery health and last export;
- explicit UI language that Easy confirms generation/download initiation, not Google Drive/provider synchronization completion.

No Google Drive API/OAuth, backend/auth/cloud database/live synchronization, required File System Access API, provider-side sync verification, Dexie migration or backup-format version change was introduced.

The first PR #39 Critical QA run `32179815390`, job `95849949295`, failed only a newly added E2E interaction: after the recovery guard correctly rejected a reseller mutation, the form dialog remained open and covered the global banner that the test then attempted to click. Lint and all 44/183 Vitest tests had passed. The product behavior remained unchanged; only the E2E was corrected to dismiss the dialog before checking the Backup/Restore escape route.

Accepted Persistent Critical QA **`32180250834`**, job **`95851336506`** — PASS on PR #39 merge ref `2455d5528e42d58dee43fb4b0f100741a705fe6a`: 0 lint errors / 80 warnings, 44 Vitest files / 183 tests, 17/17 Playwright and production build PASS.

PR #39 was squash-merged into `develop` as `7e20d50be357d0179adf0afe4894ddfebbeb2eb9`. The validated merge ref and integrated commit share exact tree `72b26596b44f2425f9b8b2d833eee0027ea8405e`.

P9-S2 is now `DONE`. `NEXT_ACTION` advances only to **P9-S3 category data/reporting contract**. That next slice must define lifecycle, assignment, historical/report semantics, migration and D-017 backup compatibility before any category schema/UI/reporting implementation; P9-S4/P9-S5/P10 remain unstarted.

---

## 2026-08-18 — P9-S2 recovery mechanism decision accepted; D-024 keeps local-first architecture

P9-S2 executed only the recovery mechanism comparison/decision gate required by the canonical `NEXT_ACTION`. No runtime implementation was performed in that decision slice.

The accepted direct target remained unchanged: newest usable off-device recovery copy **<=24 hours**, manual operator restore on any computer acceptable, daily-use continuity without inventing a numeric RTO, Google Drive acceptable as a durable destination and local PC file acceptable for convenience.

The comparison rejected reminder-only protection because it does not create an off-device copy. It also declined to make a permission-based browser file-system handle the baseline because the actual store browser family/version is not directly evidenced. Direct Google Drive API/OAuth and backend/cloud/live synchronization were rejected as larger than the current requirement and unsupported by a D-016 reopen trigger.

**D-024** selects **Synchronized recovery-copy folder + 24-hour freshness guard**:

- retain canonical `easy-backup` v2 and D-018 restore;
- configure backup downloads to a local folder synchronized off-device by the OS/provider; Google Drive for desktop is the accepted current-store instance;
- require one setup verification that an exported backup appears in Drive outside the local-PC-only context;
- track local recovery-copy export freshness fail-safe;
- at 24 hours, require a new backup export before normal data-changing work continues while Backup/Restore remains reachable;
- explicitly distinguish Easy-confirmed backup generation/download initiation from provider-side synchronization acknowledgment.

D-016 is **KEPT**. D-017/D-018 remain unchanged. No Google OAuth/Drive API, backend/auth/cloud DB/live sync, File System Access baseline, Dexie V5 or backup-format change is authorized.

Persistent Critical QA `32177687434`, job `95843265579` passed on PR #37. PR #37 integrated as `cb873b7ee4456ed8e5c00ace90f3926337c42bf4`; validated merge ref and integrated commit share exact tree `6e7f6431c3dbdac8c58654d20873149efea2786c`.

---

## 2026-08-18 — P9-S2 direct recovery-target evidence accepted and integrated

The direct recovery-target evidence intake is canonically accepted. Store/operator evidence established an acceptable newest usable off-device recovery-copy age of **<=24 hours**, manual restoration on any computer, daily demand without an invented numeric RTO, Google Drive as an acceptable durable destination, local PC copy for convenience and no requirement for provider-operated remote recovery.

The Google account connected to ChatGPT is not an Easy credential or Drive API authorization. Drive being an acceptable destination does not itself authorize direct Google API/OAuth integration.

Persistent Critical QA `32175718073`, job `95837062983` passed on PR #35. PR #35 integrated as `5bf83b6cc8b078858dcd26e5144285a7dd389d73`; validated merge ref and integration share tree `e1c32464b8260ae3b45094f20464ff3e5745687e`.

---

## 2026-08-18 — P9-S2 recovery decision gate blocked on missing measurable store target

The first P9-S2 attempt executed evidence intake only. Existing direct evidence proved severe operating-PC-loss/manual-backup exposure but did not yet define acceptable copy age, recovery procedure, interruption expectation or destination/process constraints.

Missing evidence was treated as a blocker rather than permission to invent SLA/RPO/RTO or cloud requirements. Blocked-state Critical QA `32168368086`, job `95813314347` passed on PR #33. PR #33 integrated as `0017538b93c438f4374b1b2427222f27b9ef357d`; validated merge ref and integration share tree `bf7165121ec08cd91f38db05d887a505dba3dbee`.

---

## 2026-08-18 — P9-S1 evidence-backed prioritization completed

P9-S1 executed documentation/decision work only. D-023 accepted ranking: recovery durability 94/100, categories/reporting 83/100, exact correction microflows 70/100 and occurrence-date usability 69/100.

Persistent Critical QA `32166330198`, job `95806665221` passed on PR #31. PR #31 integrated as `3d99814c0f97dce640a91721fc68d33e79575cc3`; validated merge ref and integration share tree `15854ffa8b19395db3b255e056af6df4ce66f6ed`.

---

## 2026-08-18 — P8-S2 direct real-store validation completed; P8 closed

Direct stakeholder evidence established current non-concurrent PC-based operation, PDF/extract reseller sharing, manual JSON backup/portability, no mandatory trusted server integration and modest scale. It also confirmed severe device-loss/manual-backup exposure, item categories/category reporting needs and edit/correction friction. Delayed financial entry is already supported by `occurredAt`.

D-022 keeps D-016. Persistent Critical QA `32158395391`, job `95781056589` passed on PR #27. PR #27 integrated as `e05d5cb1b4b4c4d143afbad3677bb9a472088cfe`; canonical P8 closure integrated as `5bf1e44fed38909c2d5a5cf49b6ef985a1a45442`.

---

## 2026-08-18 — Initial P8-S2 validation blocked on missing evidence

The first P8-S2 attempt found no direct operator/interview/observation/SLA/security evidence. Missing evidence was treated as a blocker, not negative proof. `P8_EVIDENCE_REQUEST.md` was added; Critical QA `32152466007` passed.

---

## 2026-08-18 — P8-S1 repository-evidence discovery

P8-S1 inspected canonical documents, original prompts, historical PRDs, README and repository issues. Repository evidence did not prove a D-016 reopen trigger. D-021 was accepted. Critical QA `32149199373` and canonical closure `32150004427` passed.

---

## 2026-08-18 — P7 completed operational UX refinement

P7 resolved QG-011 through QG-015 under D-020. Final P7-S6 functional validation `32145620210` passed with 43/176 Vitest and 15/15 Playwright.

---

## 2026-08-17 — P6 repository-wide QA/deployment gate

P6 established `npm run qa:critical`, persistent CI and `quality -> build -> deploy` before GitHub Pages publication from `main`. D-019 accepted; functional validation `32064801009` and post-merge `32065713920` passed.

---

## 2026-08-17 — P5 backup/recovery foundation completed

P5-S1 established canonical logical `easy-backup` v2 with deep preflight and v1 normalization (`32058028793`). P5-S2 added validated checkpoint download plus verified atomic Dexie restore with rollback and migration/financial round-trip proof (`32060729538`). D-017/D-018 accepted.

---

## 2026-08-17 — P4 persistence architecture decision

D-016 accepted: keep V2 local-first/single-user on Dexie V4 unless direct requirements later prove a reopen trigger.

---

## 2026-08-17 — P3 financial dates/statements/aging completed

P3-S1 separated financial occurrence (`occurredAt`) from registration/audit time (`createdAt`) and migrated Dexie to V4 (`32052076684`). P3-S2 formalized opening → movements → closing statements, positive-reseller total debt and FIFO outstanding-debt aging (`32053837309`). D-014/D-015 accepted.

---

## 2026-08-17 — P2 audited correction/reversal completed

P2 preserved original financial history through audited reversal and atomic linked replacement correction. D-012/D-013 accepted; validations `32041280504` and `32042373332` passed.

---

## 2026-08-17 — P1 referential integrity and safe lifecycle completed

P1 introduced reversible reseller/item archival, strict active references for new activity and guarded destructive deletion while preserving historical rows. Validations `32037965651`, `32038951903` and `32039763539` passed.

---

## 2026-08-17 — P0 canonical V2 governance established

The V2 laboratory repository, branch roles, canonical document precedence and incremental/no-default-rewrite discipline were established. `main` is the stable reference; `develop` is the V2 integration branch.