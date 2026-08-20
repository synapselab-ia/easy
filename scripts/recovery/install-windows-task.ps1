param(
    [string]$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path,
    [string]$At = '03:00',
    [string]$TaskName = 'EasyV2-OffsiteBackup'
)

$ErrorActionPreference = 'Stop'
$node = (Get-Command node -ErrorAction Stop).Source
$script = Join-Path $RepoRoot 'scripts\recovery\easy-v2-backup.mjs'
if (-not (Test-Path $script -PathType Leaf)) {
    throw "Backup script not found: $script"
}

foreach ($name in @('EASY_BACKUP_LOCAL_DIR', 'EASY_BACKUP_RCLONE_REMOTE', 'EASY_SUPABASE_WORKDIR', 'EASY_RCLONE_CONFIG')) {
    $value = [Environment]::GetEnvironmentVariable($name, 'User')
    if ([string]::IsNullOrWhiteSpace($value)) {
        throw "User environment variable $name is not configured. See scripts/recovery/README.md."
    }
}

$action = New-ScheduledTaskAction -Execute $node -Argument "`"$script`"" -WorkingDirectory $RepoRoot
$trigger = New-ScheduledTaskTrigger -Daily -At $At
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -MultipleInstances IgnoreNew

Register-ScheduledTask `
    -TaskName $TaskName `
    -Action $action `
    -Trigger $trigger `
    -Settings $settings `
    -Description 'Easy V2 D-030 unattended logical dump + objectively verified off-site copy.' `
    -RunLevel Limited `
    -Force | Out-Null

Write-Host "Registered $TaskName daily at $At for the current Windows user."
