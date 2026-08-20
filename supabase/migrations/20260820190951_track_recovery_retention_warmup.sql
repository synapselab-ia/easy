alter table private.recovery_backup_generations
    drop constraint recovery_backup_retention_minimum;

alter table private.recovery_backup_generations
    add constraint recovery_backup_retention_positive
    check (retained_generation_count >= 1);

create or replace function private.recovery_backup_is_fresh_at(p_now timestamptz)
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
    select coalesce((
        select
            r.retained_generation_count >= 7
            and p_now <= r.offsite_verified_at + interval '24 hours'
        from private.recovery_backup_generations r
        order by r.offsite_verified_at desc, r.id desc
        limit 1
    ), false);
$$;

comment on function private.recovery_backup_is_fresh_at(timestamptz) is 'D-030 recovery-health predicate. The newest objectively verified off-site generation must report >=7 retained generations; exactly 24h is fresh, any later instant is stale.';
