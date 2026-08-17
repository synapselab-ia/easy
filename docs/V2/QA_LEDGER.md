# Easy V2 — QA Ledger

**Updated:** 2026-08-17

This ledger records targeted phase evidence separately from repository-wide QA health.

## P0

State/governance established; no runtime QA claim.

## P1 — Referential integrity and safe lifecycle

**Status:** PASS / DONE.

- P1-S1: `32037965651`.
- P1-S2: `32038951903`.
- P1-S3: `32039763539`.

## P2 — Correction/reversal

**Status:** PASS / DONE.

- P2-S1 audited reversal: `32041280504`.
- P2-S2 linked/guided replacement: `32042373332`.

## P3 — Dates, statements and aging

**Status:** PASS / DONE.

- P3-S1 occurrence-date model: `32052076684`.
- P3-S2 formal statements/FIFO debt aging: `32053837309`.

P3 verifies backward-safe financial occurrence, formal opening → movements → closing statements, per-reseller total-debt semantics and FIFO-derived outstanding debt aging while preserving P1/P2 invariants.

## P4 — Persistence architecture decision

**Runtime changed:** No.  
**Schema changed:** No; remains Dexie V4.  
**UI changed:** No.  
**Decision changed:** Yes; D-016 accepts local-first/single-user persistence.

### Evidence inventory verified

P4 reviewed:

- `tasks/prd-gestao-revendedores/prd.md` — administrator/business-owner persona; IndexedDB/Dexie; single-user local; no auth/backend/cloud sync;
- `prompts/prompt1.md` — local browser persistence and JSON backup/computer portability;
- `README.md` — 100% client-side/static portability model;
- `src/db/database.ts` — authoritative Dexie V4 dataset;
- `src/services/backupService.ts` — user-managed JSON recovery/portability and shallow restore validation;
- `src/hooks/useSearch.ts` — browser-local auxiliary state;
- `package.json` — no auth/cloud persistence client;
- `.github/workflows/deploy.yml` — static GitHub Pages delivery.

### Architecture gate verified

- [x] only evidenced operator is one administrator/business owner;
- [x] browser-local dataset/manual computer handoff is evidenced; live shared multi-device state is not;
- [x] no simultaneous multi-writer/conflict requirement is evidenced;
- [x] person-level auth/access-control requirement is not evidenced;
- [x] future local actor source is defined as opaque installation identity, not human identity;
- [x] data/security trust boundary is the local browser/device plus explicit exported backup;
- [x] local data operations are backend-independent; offline startup is not claimed;
- [x] user-managed backup/recovery limitations are assigned to P5;
- [x] local vs cloud benefits/costs/failure modes are documented;
- [x] objective D-016 cloud-reopen triggers are documented;
- [x] future cloud migration invariants and ID/conflict concerns are documented;
- [x] no backend/auth/cloud code was introduced.

### P4 result

**PASS / DONE.** The decision gate is satisfied by repository evidence and D-016. No runtime test run is claimed because P4 changes canonical architecture documentation only.

## Global baseline caveat

Targeted phase gates do **not** claim repository-wide lint/unit/integration/E2E health is green. Global reconciliation and deployment gating remain P6.

## Known baseline QA gaps

- **QG-001 reseller referential integrity:** RESOLVED / P1.
- **QG-002 historical item references:** RESOLVED / P1.
- **QG-003 financial correction flow:** RESOLVED / P2.
- **QG-004 date semantics:** RESOLVED / P3-S1.
- **QG-005 period statement/aging semantics:** RESOLVED / P3-S2.
- **QG-006 backup validation depth:** OPEN / P5.
- **QG-007 stale/global test expectations:** OPEN / P6.
- **QG-008 deployment does not require full QA:** OPEN / P6.
- **QG-009 remaining reference validation/migration:** RESOLVED / P1.
- **QG-010 persistence architecture:** RESOLVED / P4. Local-first/single-user Dexie V4 accepted until a D-016 reopen trigger is proven.

## QA policy

For each functional phase: define acceptance first, add targeted tests with behavior changes, verify cross-surface consistency, record evidence/unresolved gaps, and distinguish the phase gate from global repository QA. Decision-only phases must record their evidence and must not fabricate runtime validation.
