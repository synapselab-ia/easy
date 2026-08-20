create or replace function private.guard_business_write_recovery_health()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    perform private.assert_recovery_backup_fresh();
    return case when tg_op = 'DELETE' then old else new end;
end;
$$;

revoke all on function private.guard_business_write_recovery_health() from public, anon, authenticated, service_role;

comment on function private.guard_business_write_recovery_health() is 'Private trigger-only SECURITY DEFINER wrapper. It exists solely so API roles cannot bypass the D-030 freshness assertion through missing helper EXECUTE grants; JWT claims still prevent the direct-maintenance bypass.';
