#!/usr/bin/env node
import { cp, mkdtemp, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { REPO_ROOT, SUPABASE_CLI_VERSION } from './easy-v2-backup.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const fingerprintSql = resolve(scriptDir, 'recovery-fingerprint.sql');

function fail(message) {
  throw new Error(message);
}

function run(command, args, { env = process.env, capture = true } = {}) {
  const result = spawnSync(command, args, {
    cwd: REPO_ROOT,
    env,
    encoding: 'utf8',
    stdio: capture ? 'pipe' : 'inherit',
    windowsHide: true,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    const stderr = (result.stderr ?? '').trim();
    fail(`${command} ${args.slice(0, 3).join(' ')} failed with exit ${result.status}${stderr ? `: ${stderr}` : ''}`);
  }
  return result.stdout ?? '';
}

export function extractSingleQueryRow(stdout) {
  const trimmed = stdout.trim();
  const candidates = [trimmed];
  const firstBrace = trimmed.indexOf('{');
  if (firstBrace > 0) candidates.push(trimmed.slice(firstBrace));

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate);
      if (Array.isArray(parsed) && parsed.length === 1) return parsed[0];
      if (Array.isArray(parsed?.rows) && parsed.rows.length === 1) return parsed.rows[0];
      if (Array.isArray(parsed?.result?.rows) && parsed.result.rows.length === 1) return parsed.result.rows[0];
    } catch {
      // Try the next shape.
    }
  }
  fail('Could not parse a single-row JSON result from supabase db query.');
}

function queryFingerprint(mode, env) {
  const stdout = run('supabase', [
    'db', 'query', mode, '--output-format', 'json', '--agent', 'yes', '-f', fingerprintSql,
  ], { env });
  return extractSingleQueryRow(stdout);
}

function assertSameFingerprint(before, after, label) {
  if (JSON.stringify(before) !== JSON.stringify(after)) {
    fail(`${label} fingerprint mismatch.`);
  }
  for (const key of ['orphan_reseller_refs', 'orphan_item_refs', 'orphan_category_refs']) {
    if (Number(after[key]) !== 0) fail(`${label} contains orphan references (${key}).`);
  }
}

async function executeRestoreDrill() {
  const sourceWorkdir = process.env.EASY_SUPABASE_WORKDIR;
  if (!sourceWorkdir) fail('Set EASY_SUPABASE_WORKDIR to the trusted linked Supabase CLI workdir.');
  if (process.env.SUPABASE_DB_PASSWORD || process.env.EASY_SUPABASE_DB_URL) {
    fail('Do not inject database passwords/URLs into the restore drill; use the linked native credential boundary.');
  }

  const versionOutput = run('supabase', ['--version']).trim();
  const version = versionOutput.match(/(\d+\.\d+\.\d+)/)?.[1];
  if (version !== SUPABASE_CLI_VERSION) fail(`Expected Supabase CLI ${SUPABASE_CLI_VERSION}; got ${version ?? 'unknown'}.`);

  const disposableRoot = await mkdtemp(resolve(tmpdir(), 'easy-v2-restore-drill-'));
  const dumpPath = resolve(disposableRoot, 'synthetic-drill.sql');
  const sourceEnv = { ...process.env, SUPABASE_WORKDIR: resolve(sourceWorkdir) };
  const localEnv = { ...process.env, SUPABASE_WORKDIR: disposableRoot };
  let localStarted = false;

  try {
    const sourceBefore = queryFingerprint('--linked', sourceEnv);
    run('supabase', [
      'db', 'dump', '--linked', '--data-only', '--schema', 'public',
      '--exclude', 'public.easy_operators', '--use-copy', '--file', dumpPath,
    ], { env: sourceEnv, capture: false });
    const dumpStat = await stat(dumpPath);
    if (!dumpStat.isFile() || dumpStat.size <= 0) fail('Synthetic restore drill dump is empty.');
    const sourceAfter = queryFingerprint('--linked', sourceEnv);
    assertSameFingerprint(sourceBefore, sourceAfter, 'Source-before/source-after');

    run('supabase', ['init'], { env: localEnv, capture: false });
    await cp(resolve(REPO_ROOT, 'supabase', 'migrations'), resolve(disposableRoot, 'supabase', 'migrations'), {
      recursive: true,
      force: true,
    });
    run('supabase', ['start'], { env: localEnv, capture: false });
    localStarted = true;
    run('supabase', ['db', 'reset', '--local', '--no-seed'], { env: localEnv, capture: false });
    run('supabase', ['db', 'query', '--local', '-f', dumpPath], { env: localEnv, capture: false });

    const restored = queryFingerprint('--local', localEnv);
    assertSameFingerprint(sourceBefore, restored, 'Source/restored');

    console.log(JSON.stringify({
      status: 'pass',
      dumpBytes: dumpStat.size,
      fingerprint: restored,
      recoveryHealthIncludedInDump: false,
      note: 'Disposable local database was rebuilt from repository migrations before the data-only restore.',
    }));
  } finally {
    if (localStarted) {
      try {
        run('supabase', ['stop', '--no-backup'], { env: localEnv, capture: false });
      } catch (error) {
        console.error(`Could not stop disposable Supabase stack cleanly: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    await rm(disposableRoot, { recursive: true, force: true });
  }
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  executeRestoreDrill().catch((error) => {
    console.error(`Easy V2 synthetic restore drill failed: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  });
}
