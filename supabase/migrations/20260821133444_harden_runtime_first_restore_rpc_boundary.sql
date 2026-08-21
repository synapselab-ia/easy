alter function public.restore_easy_backup(jsonb) set schema private;
alter function private.restore_easy_backup(jsonb) rename to restore_easy_backup_impl;

revoke all on function private.restore_easy_backup_impl(jsonb) from public, anon, authenticated, service_role;
grant usage on schema private to authenticated;
grant execute on function private.restore_easy_backup_impl(jsonb) to authenticated;

create or replace function public.restore_easy_backup(p_payload jsonb)
returns jsonb
language sql
security invoker
set search_path = ''
as $$
    select private.restore_easy_backup_impl(p_payload);
$$;

revoke all on function public.restore_easy_backup(jsonb) from public, anon;
grant execute on function public.restore_easy_backup(jsonb) to authenticated;

comment on function public.restore_easy_backup(jsonb) is 'Public SECURITY INVOKER logical-restore RPC. The non-exposed private SECURITY DEFINER implementation performs approved-operator atomic v2/schema5 replacement.';
