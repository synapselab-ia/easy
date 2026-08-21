# P10-S3-I2-I3 — Runtime-first Supabase execution

**Date:** 2026-08-21  
**Branch:** `feat/p10-s3-i2-i3-runtime-first`  
**PR:** #72  
**Base:** `develop` at `d4d428e35a45af0691e80331dd8c7888a914355f`

## Operator-authorized change of order

The operator explicitly changed the prior sequencing on 2026-08-21 after confirming that the store will **not migrate/use the old stable-v1 historical dataset** for the new V2 start.

The accepted runtime-first order is now:

1. make V2 use the dedicated `easy-v2` Supabase project as the canonical data source;
2. allow controlled clean-start use after Auth/operator approval and manual JSON recovery setup;
3. keep manual `easy-backup` v2 JSON export/restore as the temporary independent recovery layer;
4. complete the unattended off-site D-030 proof in parallel/later;
5. re-enable the server automated-recovery freshness guard and only then classify the deployment as fully production-safe under D-030.

This is a sequencing change, **not** a claim that manual JSON equals the accepted D-030 unattended durability posture.

## D-031 — Runtime-first controlled use may precede D-030 automated proof

D-031 refines D-030 for the explicitly requested clean-start transition:

- P10-S3-I2-I2 automated off-site proof remains incomplete and required before final production-safety acceptance.
- P10-S3-I2-I3 implementation and controlled use no longer wait for seven retained automated generations.
- During this transition, `private.recovery_enforcement_state.automated_guard_enabled = false` is explicit and server-visible; it is not a hidden bypass.
- The browser manual JSON health guard remains fail-closed: no new application write is allowed until a JSON has been exported and confirmed, and it blocks again once the local confirmation is at least 24 hours old.
- JSON export in cloud mode reads the canonical Supabase tables, not Dexie.
- JSON restore in cloud mode is an approved-operator atomic PostgreSQL operation and downloads a checkpoint of the current cloud dataset first.
- Dexie may remain only as a local read cache/mirror for existing dashboard/search/report code. It is not authoritative and no offline write mode is introduced.
- Auth + `easy_operators` authorization remains mandatory.
- Old stable-v1 real data is not promoted or migrated for this start; `easy-v2` remains clean-start.
- `main`, canonical publication and any claim of completed D-030 durability remain unauthorized until their own gates are explicitly closed.

## Supabase migrations applied to homologation

- `20260821132225_p10_s3_i2_i3_runtime_first_recovery_mode_and_json_restore`
  - adds private explicit automated-guard state, initially `false` for runtime-first mode;
  - preserves the exact D-030 guard function for the later enabled state;
  - adds a narrow approved-operator logical-restore bypass so JSON recovery remains possible even if automated freshness is later stale;
  - adds `public.restore_easy_backup(jsonb)` for atomic v2/schema5 replacement and identity-sequence repair.
- `20260821132351_fix_runtime_first_restore_constraint_resolution`
  - qualifies the deferrable self-reference constraint names under fixed `search_path = ''`.

The first disposable restore drill exposed the unqualified-constraint defect before any persistent data changed. The second migration corrected it.

## Synthetic SQL proof

A transaction-local simulated authenticated operator was used only for synthetic validation and then rolled back.

Proven:

- `private.automated_recovery_guard_enabled()` is `false` in the explicit transition state;
- a normal business-table write is accepted while automated enforcement is pending;
- `public.restore_easy_backup(...)` restored one category, one item, one reseller and one order atomically;
- restored order total remained exactly `25` for quantity `2 × 12.5`;
- the synthetic operator/data were rolled back;
- final cloud cleanup after proof: `auth.users=0`, `easy_operators=0`, `categories=0`, `items=0`, `resellers=0`, `transactions=0`, `recovery_backup_generations=0`.

## Application implementation in PR #72

### Canonical cloud adapter

`src/services/cloudDataService.ts`:

- maps Supabase snake_case rows to the existing domain objects;
- fetches all canonical business data;
- replaces Dexie atomically as a read cache;
- routes category/item/reseller mutations to Supabase tables under RLS;
- routes create/reverse/correct financial mutations through the existing PostgreSQL RPC boundary;
- refreshes the cache after successful cloud mutations;
- exposes operator authorization and atomic JSON restore calls.

### Auth/session boundary

`src/components/auth/CloudAuthGate.tsx`:

- activates only when browser-safe Supabase env is present;
- supports email/password sign-in and first-account signup;
- requires `public.is_easy_operator()` before rendering store data;
- synchronizes cloud data to Dexie before rendering the existing application;
- blocks offline/local-authoritative use if the cloud cannot be reached;
- shows a bounded waiting-for-authorization state for a newly created but not-yet-approved account.

No Auth credentials, emails or real UUIDs are committed.

### Manual JSON recovery in cloud mode

`src/services/cloudBackupService.ts` and `ImportExport.tsx`:

- `Exportar Backup v2` reads the canonical Supabase dataset and downloads a validated v2/schema5 JSON;
- `Importar / Restaurar Backup` keeps the existing local preflight/preview contract;
- before cloud restore, a current canonical checkpoint JSON is downloaded;
- restore then calls the atomic server RPC;
- the post-restore canonical cloud dataset is fetched and logically compared to the requested normalized target;
- the UI explicitly states that this is the temporary manual layer while automated backup is still being homologated.

## Remaining before Duda can operate the hosted candidate

1. D-019 must pass on the exact PR merge-ref tree.
2. Supabase security/performance advisors must be rechecked after the new migrations.
3. The branch must be integrated to `develop` only after QA.
4. A manual Vercel candidate deployment must receive only:
   - `VITE_SUPABASE_URL=https://hrmkkhqfyfoqucwbcszq.supabase.co`
   - the current browser-safe Supabase publishable key.
5. Duda must create/sign into her Auth account.
6. After that account exists, its UUID must be added server-side to `public.easy_operators`; credentials/email must not be copied into Git/docs/chat evidence.
7. On first approved login, Duda must export an initial JSON and confirm that she stored it before the application permits business writes.

## Still pending after controlled use starts

P10-S3-I2-I2 remains incomplete until the trusted-PC unattended off-site backup proof satisfies all D-030 requirements, including >=7 retained successful UTC daily generations and the restore drill. When accepted, `private.recovery_enforcement_state.automated_guard_enabled` must be changed to `true` through a reproducible migration and the exact-24h server guard becomes mandatory again.

No statement in this execution record authorizes `main` publication or labels the runtime-first candidate as fully production-safe before that happens.
