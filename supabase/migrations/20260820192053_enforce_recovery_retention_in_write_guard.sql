create or replace function private.assert_recovery_backup_fresh()
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
    if private.is_direct_database_maintenance() then
        return;
    end if;

    if not private.recovery_backup_is_fresh_at(clock_timestamp()) then
        raise exception using
            errcode = '55000',
            message = 'Business writes are blocked because verified off-site recovery evidence is missing, older than 24 hours, or retains fewer than 7 daily generations.';
    end if;
end;
$$;

comment on function private.assert_recovery_backup_fresh() is 'D-030 fail-closed business-write guard. The newest verified off-site generation must retain >=7 daily generations and be no older than exactly 24h; direct database maintenance without PostgREST JWT claims is the narrow restore/import bypass.';
