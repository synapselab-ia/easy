# P10 Runtime-First Early-Use Governance — D-031

**Status:** `ACCEPTED`  
**Date:** 2026-08-21  
**Canonical governance PR:** #74  
**Scope:** sequencing and risk boundary for P10-S3-I2-I3 controlled early use

## 1. Why this decision exists

D-030 intentionally required objective operator-local recovery evidence before the cloud runtime/cutover sequence could advance: trusted-PC unattended dumps, verified off-site storage, at least seven retained successful daily generations and a restore drill.

The repository/database prerequisites were implemented and synthetically proven. A remote preflight on 2026-08-21 correctly stopped because the remaining evidence belongs to the trusted operator environment and cannot be manufactured from GitHub/chat/cloud tooling.

The operator then explicitly chose to place those backup-dependent steps on hold and continue building/testing the system first.

Without a new canonical decision, old docs would continue forcing every new conversation back to I2-I2. D-031 exists to remove that ambiguity.

## 2. What D-031 changes

D-031 changes **sequencing**, not historical truth:

- I2-I2 did not pass;
- its implementation remains useful;
- its operator-local proof is deferred;
- I2-I3 may proceed now as controlled early use.

Prior text saying `I2-I3 NOT_AUTHORIZED UNTIL I2-I2 PASSES` is superseded for sequencing.

## 3. Current early-use architecture

The intended candidate is:

```text
Approved operator browser
        |
        | Supabase Auth session
        v
RLS + easy_operators
        |
        v
Supabase Postgres  <-- canonical business data
        |
        +--> controlled financial RPCs

Dexie
  read cache/mirror only

Manual Easy JSON
  independent recovery/portability checkpoint
```

Vercel remains candidate hosting.

## 4. Temporary recovery acceptance

For controlled early use, the operator accepts the following temporary posture:

1. logical JSON export is the active operator recovery copy;
2. the application keeps the exact 24-hour manual-backup freshness guard for normal browser writes;
3. JSON restore must download a checkpoint first, apply atomically through the approved server/database boundary and verify afterward;
4. automated D-030 server recovery-health enforcement may remain disabled/pending in this temporary mode;
5. the unattended dump/rclone/retention/restore implementation is preserved for later completion.

This is **not** a declaration that Supabase Free alone has adequate final backups.

## 5. Data scope

Early use is a clean start.

- no stable-v1 real-store export/import is required;
- no legacy real business payload enters GitHub/chat/CI/docs;
- the accepted private migration path remains dormant unless the operator later explicitly requests historical migration.

## 6. Security boundary

Mandatory even during early use:

- Supabase Auth;
- RLS on exposed business tables;
- server-managed approved-operator allow-list;
- URL + publishable key only in browser configuration;
- no service/database secrets in client/Git/public Vercel environment;
- financial correction/reversal remains transactional on the database/server boundary;
- connectivity/server failures block writes rather than creating offline-authoritative mutations.

## 7. Publication boundary

D-031 authorizes candidate/early use, not definitive cutover.

- `main` stays untouched;
- Git-triggered Vercel deploy remains disabled;
- deployment is manual;
- canonical production URL is not switched by D-031;
- stable decommission is not authorized.

## 8. Current implementation vehicle

PR #72 — `feat(v2): enable runtime-first Supabase candidate`.

Previously passing evidence on the then-current base:

- head `385e59b22ac83ff43097cefeeb4551d28f606dbf`;
- merge ref `1e746bb2dd133f5bfcaac7818b27996f802476ed`;
- D-019 run `32492337376` / job `96802676149`;
- 0 lint errors / 82 warnings;
- 57 files / 240 Vitest PASS;
- 17/17 Playwright PASS;
- production build PASS.

Because `develop` advanced after that run, PR #72 must be synchronized and revalidated on the newly generated exact merge ref before integration.

## 9. Immediate authorized sequence

1. integrate D-031 canonical docs into `develop`;
2. synchronize PR #72 with that `develop`;
3. rerun D-019 on the exact new PR merge ref;
4. squash-integrate PR #72 only if green;
5. verify integrated tree and unchanged `main`;
6. manually deploy the accepted V2 candidate to Vercel;
7. configure only browser-safe Supabase environment values;
8. create/login the intended Auth account and add it to `easy_operators` through a trusted admin/database path;
9. create and confirm the first manual JSON recovery checkpoint;
10. begin controlled clean-start early use and collect actual operational feedback.

## 10. Deferred sequence

Do not automatically resume the following merely because a new conversation starts:

- trusted-PC unattended backup proof;
- seven-day retention warmup;
- Docker/local restore drill;
- legacy stable-data migration;
- `main` publication/canonical URL cutover.

These require an explicit later `NEXT_ACTION` or operator instruction.

## 11. Exit from D-031 early-use mode

Definitive cutover requires a later accepted gate that addresses durability explicitly. That gate may:

- complete D-030 as designed; or
- accept a different paid/managed durability mechanism; or
- make another explicit decision with equivalent risk treatment.

Until then, describe the system as a controlled early-use/candidate runtime, not final cutover.