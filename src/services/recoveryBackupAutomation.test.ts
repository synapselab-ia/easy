import { describe, expect, it } from 'vitest'
import {
  MIN_RETAINED_DAILY_GENERATIONS,
  buildRecordSuccessSql,
  buildRetentionPlan,
  formatArtifactName,
  joinRemote,
  parseArtifactName,
} from '../../scripts/recovery/easy-v2-backup.mjs'
import { extractSingleQueryRow } from '../../scripts/recovery/easy-v2-restore-drill.mjs'

describe('P10-S3-I2-I2 recovery backup automation', () => {
  it('uses deterministic UTC timestamped artifact names', () => {
    expect(formatArtifactName(new Date('2026-08-20T19:10:11.123Z'))).toBe('easy-v2-20260820T191011Z.sql')
    expect(parseArtifactName('easy-v2-20260820T191011Z.sql')).toMatchObject({ day: '20260820' })
  })

  it('retains daily generations rather than counting same-day retries', () => {
    const names = [
      'easy-v2-20260820T030000Z.sql',
      'easy-v2-20260820T040000Z.sql',
      'easy-v2-20260819T030000Z.sql',
      'easy-v2-20260818T030000Z.sql',
      'easy-v2-20260817T030000Z.sql',
      'easy-v2-20260816T030000Z.sql',
      'easy-v2-20260815T030000Z.sql',
      'easy-v2-20260814T030000Z.sql',
    ]

    const plan = buildRetentionPlan(names, MIN_RETAINED_DAILY_GENERATIONS)
    expect(plan.retainedDailyGenerations).toBe(7)
    expect(plan.keepNames).toContain('easy-v2-20260820T040000Z.sql')
    expect(plan.deleteNames).toContain('easy-v2-20260820T030000Z.sql')
    expect(plan.deleteNames).not.toContain('easy-v2-20260814T030000Z.sql')
  })

  it('rejects retention policies below the D-030 minimum', () => {
    expect(() => buildRetentionPlan([], 6)).toThrow('at least 7')
  })

  it('builds a sanitized recovery-health write with no credential material', () => {
    const sql = buildRecordSuccessSql({
      artifactName: 'easy-v2-20260820T191011Z.sql',
      sha256: 'a'.repeat(64),
      byteSize: 12345,
      verifiedAt: new Date('2026-08-20T19:12:00Z'),
      retainedDailyGenerations: 7,
    })

    expect(sql).toContain('private.record_recovery_backup_success')
    expect(sql).toContain("'easy-v2-20260820T191011Z.sql'")
    expect(sql).toContain('12345')
    expect(sql).not.toMatch(/password|service_role|postgresql:\/\//i)
  })

  it('parses the pinned CLI JSON query envelope used by the restore drill', () => {
    expect(extractSingleQueryRow(JSON.stringify({ rows: [{ transactions_count: 3 }] }))).toEqual({ transactions_count: 3 })
  })

  it('requires a named rclone remote instead of a local path', () => {
    expect(joinRemote('onedrive:EasyV2/backups/', 'easy-v2-20260820T191011Z.sql')).toBe(
      'onedrive:EasyV2/backups/easy-v2-20260820T191011Z.sql',
    )
    expect(() => joinRemote('C:\\Backups', 'easy-v2-20260820T191011Z.sql')).toThrow('rclone remote')
  })
})
