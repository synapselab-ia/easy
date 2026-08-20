# Easy V2 — D-030 trusted-PC recovery automation

This directory implements the **P10-S3-I2-I2 synthetic-only** zero-cost recovery boundary. It is intentionally outside the browser runtime and outside GitHub Actions.

## Pinned tools

The automation fails closed unless these exact versions are installed on the trusted operator PC:

- Supabase CLI `2.111.0`;
- rclone `1.75.0`;
- Node.js capable of running the repository (the current project baseline is Node 22).

Verify with `supabase --version` and `rclone version`.

## Secret / credential boundary

Do **not** place database passwords, Postgres URLs, Supabase access tokens, rclone tokens, backup artifacts or rclone config files in this repository, GitHub Actions, Vercel client variables, chat or canonical docs.

Use two operator-local paths outside the Git checkout and outside the synchronized backup folder:

1. `EASY_SUPABASE_WORKDIR` — private Supabase CLI workdir/state;
2. `EASY_RCLONE_CONFIG` — private rclone config file protected by the OS user ACL.

One-time Supabase setup from a trusted terminal:

```powershell
supabase init --workdir <PRIVATE_SUPABASE_WORKDIR>
supabase login
supabase link --workdir <PRIVATE_SUPABASE_WORKDIR> --project-ref hrmkkhqfyfoqucwbcszq
```

When the CLI asks for the database password, use the native credential storage offered by the CLI. The scheduled job deliberately refuses `SUPABASE_DB_PASSWORD` and database-URL injection.

Configure the off-site provider with rclone using a private config path, for example:

```powershell
rclone config --config <PRIVATE_RCLONE_CONFIG>
```

The actual provider/remote can be OneDrive, Google Drive or another rclone-supported off-site target. The canonical contract requires objective remote verification; merely placing a file in a locally synchronized folder is insufficient.

## Non-secret user configuration

Set these as **user** environment variables on the trusted PC (values are paths/remote names, not credentials):

```powershell
[Environment]::SetEnvironmentVariable('EASY_BACKUP_LOCAL_DIR', '<LOCAL_RECOVERY_DIR>', 'User')
[Environment]::SetEnvironmentVariable('EASY_BACKUP_RCLONE_REMOTE', '<REMOTE_NAME>:<REMOTE_PATH>', 'User')
[Environment]::SetEnvironmentVariable('EASY_SUPABASE_WORKDIR', '<PRIVATE_SUPABASE_WORKDIR>', 'User')
[Environment]::SetEnvironmentVariable('EASY_RCLONE_CONFIG', '<PRIVATE_RCLONE_CONFIG>', 'User')
[Environment]::SetEnvironmentVariable('EASY_BACKUP_KEEP_DAYS', '14', 'User')
```

`EASY_BACKUP_KEEP_DAYS` may be greater than 14, but never below 7.

## Backup job

Run manually once from the repository root:

```powershell
node scripts/recovery/easy-v2-backup.mjs
```

The job:

1. verifies the pinned CLI/rclone versions;
2. runs a linked Supabase **data-only** dump of schema `public`, excluding `public.easy_operators`;
3. writes to a `.partial` file first;
4. requires a successful dump, positive byte size and SHA-256;
5. atomically renames the local artifact to `easy-v2-YYYYMMDDTHHMMSSZ.sql`;
6. uploads that exact file with `rclone copyto`;
7. verifies the remote copy with `rclone check --download --one-way`;
8. rotates by **distinct UTC day**, keeping the newest generation for each retained day and at least 7 daily generations;
9. re-lists the remote after rotation;
10. only then records sanitized success metadata in `private.recovery_backup_generations` through the linked direct-database boundary.

During the first six distinct successful days the script exits with code `3`: the backup itself was copied/verified and its sanitized metadata is recorded, but D-030 retention is still warming up and canonical cloud writes remain blocked. Once the newest verified generation reports at least 7 retained distinct days and is no older than 24 hours, the database freshness predicate becomes healthy.

No backup job writes to `easy_operators`; Auth/operator onboarding remains independent from business-data recovery.

## Windows Task Scheduler

After the manual job is configured correctly, register the daily task for the current user:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/recovery/install-windows-task.ps1 -At '03:00'
```

The task uses `StartWhenAvailable` and ignores overlapping invocations. Its environment inherits the current user's non-secret configuration above. The Supabase/rclone credentials remain in their operator-local credential/config boundaries.

## Exact 24-hour database guard

The committed database migrations create a private recovery-health ledger and BEFORE-write triggers on:

- `public.categories`;
- `public.items`;
- `public.resellers`;
- `public.transactions`.

The newest objectively verified generation must both:

- report at least 7 retained daily generations; and
- satisfy `now <= offsite_verified_at + interval '24 hours'`.

Therefore exactly 24 hours remains writable; one microsecond later is stale. Missing evidence, stale evidence or retention below 7 fails business writes closed. The trigger also protects `service_role` calls coming through the API despite that role's normal RLS bypass.

A narrow direct-database maintenance bypass exists only when the session has PostgreSQL admin membership **and no PostgREST JWT claims**. This is required so a clean disaster-recovery database can load the data-only dump before recovery-health metadata is re-established. Browser/API RPCs carry JWT claims and do not receive this bypass.

## Synthetic restore drill

The restore drill requires Docker/local Supabase support and must be run only while the linked homologation dataset is synthetic:

```powershell
node scripts/recovery/easy-v2-restore-drill.mjs
```

It:

1. fingerprints the linked synthetic source using counts, full-row digests, orphan counts and exact-cent financial aggregates;
2. creates a fresh data-only linked dump;
3. fingerprints the source again and aborts if it changed across the dump window;
4. creates a brand-new disposable Supabase workdir;
5. rebuilds schema/RLS/functions from the repository migrations;
6. restores only the data dump through the direct local database boundary;
7. fingerprints the restored database and requires exact equality;
8. destroys the disposable local stack/workdir.

The recovery-health ledger itself is intentionally absent from the business-data dump. After a real disaster restore, writes remain blocked until a new objectively verified off-site generation is recorded.

## Current I2-I2 acceptance boundary

Repository/database implementation can be validated remotely, but **real off-site arrival/retention and the Docker restore drill cannot be claimed without running these commands on the trusted operator PC with the actual rclone remote**. Until that objective evidence is recorded, P10-S3-I2-I2 remains fail-closed and P10-S3-I2-I3 is not authorized.
