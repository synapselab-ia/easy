#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { mkdir, readdir, rename, rm, stat, unlink, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

export const SUPABASE_CLI_VERSION = '2.111.0';
export const RCLONE_VERSION = '1.75.0';
export const MIN_RETAINED_DAILY_GENERATIONS = 7;
export const DEFAULT_KEEP_DAYS = 14;

const ARTIFACT_RE = /^easy-v2-(\d{8})T(\d{6})Z\.sql$/;
const scriptDir = dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = resolve(scriptDir, '..', '..');

function fail(message) {
  throw new Error(message);
}

export function formatArtifactName(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) fail('Invalid backup date.');
  const stamp = date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  return `easy-v2-${stamp}.sql`;
}

export function parseArtifactName(name) {
  const match = ARTIFACT_RE.exec(name);
  if (!match) return null;
  const [, day, time] = match;
  const iso = `${day.slice(0, 4)}-${day.slice(4, 6)}-${day.slice(6, 8)}T${time.slice(0, 2)}:${time.slice(2, 4)}:${time.slice(4, 6)}Z`;
  const timestamp = Date.parse(iso);
  if (Number.isNaN(timestamp)) return null;
  return { name, day, timestamp };
}

export function buildRetentionPlan(names, keepDays = DEFAULT_KEEP_DAYS) {
  if (!Number.isInteger(keepDays) || keepDays < MIN_RETAINED_DAILY_GENERATIONS) {
    fail(`Retention must keep at least ${MIN_RETAINED_DAILY_GENERATIONS} daily generations.`);
  }

  const parsed = names.map(parseArtifactName).filter(Boolean);
  const byDay = new Map();
  for (const artifact of parsed) {
    const current = byDay.get(artifact.day);
    if (!current || artifact.timestamp > current.timestamp) byDay.set(artifact.day, artifact);
  }

  const dayWinners = [...byDay.values()].sort((a, b) => b.timestamp - a.timestamp);
  const retainedWinners = dayWinners.slice(0, keepDays);
  const retainedNames = new Set(retainedWinners.map((item) => item.name));
  const deleteNames = parsed
    .filter((item) => !retainedNames.has(item.name))
    .sort((a, b) => a.timestamp - b.timestamp)
    .map((item) => item.name);

  return {
    retainedDailyGenerations: retainedWinners.length,
    keepNames: retainedWinners.map((item) => item.name),
    deleteNames,
  };
}

export function joinRemote(remoteDir, filename) {
  const trimmed = String(remoteDir ?? '').replace(/\/+$/, '');
  if (!trimmed.includes(':')) fail('EASY_BACKUP_RCLONE_REMOTE must be an rclone remote path such as onedrive:EasyV2/backups.');
  return `${trimmed}/${filename}`;
}

function sqlLiteral(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

export function buildRecordSuccessSql({ artifactName, sha256, byteSize, verifiedAt, retainedDailyGenerations }) {
  if (!ARTIFACT_RE.test(artifactName)) fail('Invalid recovery artifact filename.');
  if (!/^[0-9a-f]{64}$/.test(sha256)) fail('Invalid SHA-256 digest.');
  if (!Number.isSafeInteger(byteSize) || byteSize <= 0) fail('Invalid artifact byte size.');
  if (!(verifiedAt instanceof Date) || Number.isNaN(verifiedAt.getTime())) fail('Invalid verification time.');
  if (!Number.isInteger(retainedDailyGenerations) || retainedDailyGenerations < 1) fail('Invalid retained generation count.');

  return `select private.record_recovery_backup_success(\n  ${sqlLiteral(artifactName)},\n  ${sqlLiteral(sha256)},\n  ${byteSize},\n  ${sqlLiteral(verifiedAt.toISOString())}::timestamptz,\n  ${retainedDailyGenerations}\n);\n`;
}

function pathIsInside(parent, candidate) {
  const rel = relative(resolve(parent), resolve(candidate));
  return rel === '' || (!rel.startsWith('..') && !isAbsolute(rel));
}

export function readConfig(env = process.env) {
  const localDir = env.EASY_BACKUP_LOCAL_DIR;
  const remoteDir = env.EASY_BACKUP_RCLONE_REMOTE;
  const supabaseWorkdir = env.EASY_SUPABASE_WORKDIR;
  const rcloneConfig = env.EASY_RCLONE_CONFIG;
  const keepDays = Number(env.EASY_BACKUP_KEEP_DAYS ?? DEFAULT_KEEP_DAYS);

  if (!localDir || !remoteDir || !supabaseWorkdir || !rcloneConfig) {
    fail('Set EASY_BACKUP_LOCAL_DIR, EASY_BACKUP_RCLONE_REMOTE, EASY_SUPABASE_WORKDIR and EASY_RCLONE_CONFIG in the trusted operator profile.');
  }
  if (!Number.isInteger(keepDays) || keepDays < MIN_RETAINED_DAILY_GENERATIONS) {
    fail(`EASY_BACKUP_KEEP_DAYS must be an integer >= ${MIN_RETAINED_DAILY_GENERATIONS}.`);
  }

  const resolvedLocalDir = resolve(localDir);
  const resolvedWorkdir = resolve(supabaseWorkdir);
  const resolvedRcloneConfig = resolve(rcloneConfig);

  for (const [label, value] of [
    ['EASY_BACKUP_LOCAL_DIR', resolvedLocalDir],
    ['EASY_SUPABASE_WORKDIR', resolvedWorkdir],
    ['EASY_RCLONE_CONFIG', resolvedRcloneConfig],
  ]) {
    if (pathIsInside(REPO_ROOT, value)) fail(`${label} must live outside the Git checkout.`);
  }
  if (pathIsInside(resolvedLocalDir, resolvedWorkdir) || pathIsInside(resolvedWorkdir, resolvedLocalDir)) {
    fail('Supabase CLI state and backup artifacts must use separate operator-local directories.');
  }
  if (pathIsInside(resolvedLocalDir, resolvedRcloneConfig)) {
    fail('rclone credential/config state must not live inside the synchronized backup directory.');
  }
  if (env.SUPABASE_DB_PASSWORD || env.EASY_SUPABASE_DB_URL) {
    fail('Do not inject database passwords/URLs into the scheduled job; use the linked Supabase CLI native credential boundary.');
  }

  return { localDir: resolvedLocalDir, remoteDir, supabaseWorkdir: resolvedWorkdir, rcloneConfig: resolvedRcloneConfig, keepDays };
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? REPO_ROOT,
    env: options.env ?? process.env,
    encoding: 'utf8',
    stdio: options.capture === false ? 'inherit' : 'pipe',
    windowsHide: true,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    const stderr = (result.stderr ?? '').trim();
    fail(`${command} ${args.slice(0, 3).join(' ')} failed with exit ${result.status}${stderr ? `: ${stderr}` : ''}`);
  }
  return { stdout: result.stdout ?? '', stderr: result.stderr ?? '' };
}

function assertToolVersions(config) {
  const supabase = run('supabase', ['--version']).stdout.trim();
  const supabaseMatch = supabase.match(/(\d+\.\d+\.\d+)/);
  if (!supabaseMatch || supabaseMatch[1] !== SUPABASE_CLI_VERSION) {
    fail(`Expected Supabase CLI ${SUPABASE_CLI_VERSION}; got ${supabase || 'unknown'}.`);
  }

  const rclone = run('rclone', ['version', '--config', config.rcloneConfig]).stdout;
  const rcloneMatch = rclone.match(/rclone v(\d+\.\d+\.\d+)/);
  if (!rcloneMatch || rcloneMatch[1] !== RCLONE_VERSION) {
    fail(`Expected rclone ${RCLONE_VERSION}; got ${rcloneMatch?.[1] ?? 'unknown'}.`);
  }
}

async function sha256File(filePath) {
  const hash = createHash('sha256');
  await new Promise((resolvePromise, rejectPromise) => {
    const stream = createReadStream(filePath);
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('error', rejectPromise);
    stream.on('end', resolvePromise);
  });
  return hash.digest('hex');
}

function listRemoteArtifactNames(config) {
  const { stdout } = run('rclone', [
    'lsf', config.remoteDir,
    '--files-only', '--max-depth', '1', '--include', 'easy-v2-*.sql',
    '--config', config.rcloneConfig,
  ]);
  return stdout.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}

async function listLocalArtifactNames(localDir) {
  const names = await readdir(localDir);
  return names.filter((name) => ARTIFACT_RE.test(name));
}

async function executeBackup() {
  const config = readConfig();
  assertToolVersions(config);
  await mkdir(config.localDir, { recursive: true });

  const artifactName = formatArtifactName(new Date());
  const finalPath = resolve(config.localDir, artifactName);
  const temporaryPath = `${finalPath}.partial`;
  const healthSqlPath = `${finalPath}.health.partial.sql`;
  const supabaseEnv = { ...process.env, SUPABASE_WORKDIR: config.supabaseWorkdir };

  await rm(temporaryPath, { force: true });
  await rm(healthSqlPath, { force: true });

  try {
    run('supabase', [
      'db', 'dump', '--linked', '--data-only', '--schema', 'public',
      '--exclude', 'public.easy_operators', '--use-copy', '--file', temporaryPath,
    ], { env: supabaseEnv, capture: false });

    const fileStat = await stat(temporaryPath);
    if (!fileStat.isFile() || fileStat.size <= 0) fail('Supabase dump produced no usable artifact.');
    const digest = await sha256File(temporaryPath);
    await rename(temporaryPath, finalPath);

    const remoteFile = joinRemote(config.remoteDir, artifactName);
    run('rclone', ['copyto', finalPath, remoteFile, '--config', config.rcloneConfig], { capture: false });
    run('rclone', [
      'check', config.localDir, config.remoteDir,
      '--download', '--one-way', '--include', artifactName, '--max-depth', '1',
      '--config', config.rcloneConfig,
    ], { capture: false });

    const initialRemoteNames = listRemoteArtifactNames(config);
    if (!initialRemoteNames.includes(artifactName)) fail('Current artifact is absent from the verified off-site listing.');

    const rotation = buildRetentionPlan(initialRemoteNames, config.keepDays);
    for (const oldName of rotation.deleteNames) {
      run('rclone', ['deletefile', joinRemote(config.remoteDir, oldName), '--config', config.rcloneConfig], { capture: false });
      await unlink(resolve(config.localDir, oldName)).catch((error) => {
        if (error?.code !== 'ENOENT') throw error;
      });
    }

    const finalRemoteNames = listRemoteArtifactNames(config);
    const finalRetention = buildRetentionPlan(finalRemoteNames, config.keepDays);
    if (!finalRemoteNames.includes(artifactName)) fail('Current artifact disappeared during retention verification.');

    const verifiedAt = new Date();
    const sql = buildRecordSuccessSql({
      artifactName,
      sha256: digest,
      byteSize: fileStat.size,
      verifiedAt,
      retainedDailyGenerations: finalRetention.retainedDailyGenerations,
    });
    await writeFile(healthSqlPath, sql, { encoding: 'utf8', flag: 'wx' });
    run('supabase', ['db', 'query', '--linked', '-f', healthSqlPath], { env: supabaseEnv, capture: false });
    await rm(healthSqlPath, { force: true });

    const localNames = await listLocalArtifactNames(config.localDir);
    console.log(JSON.stringify({
      status: finalRetention.retainedDailyGenerations >= MIN_RETAINED_DAILY_GENERATIONS ? 'healthy' : 'retention-warmup',
      artifact: artifactName,
      bytes: fileStat.size,
      sha256: digest,
      offsiteVerifiedAt: verifiedAt.toISOString(),
      retainedDailyGenerations: finalRetention.retainedDailyGenerations,
      localArtifactCount: localNames.length,
    }));

    if (finalRetention.retainedDailyGenerations < MIN_RETAINED_DAILY_GENERATIONS) {
      process.exitCode = 3;
    }
  } finally {
    await rm(temporaryPath, { force: true });
    await rm(healthSqlPath, { force: true });
  }
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  executeBackup().catch((error) => {
    console.error(`Easy V2 recovery backup failed: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  });
}
