create policy recovery_backup_generations_deny_api
on private.recovery_backup_generations
for all
to anon, authenticated, service_role
using (false)
with check (false);
