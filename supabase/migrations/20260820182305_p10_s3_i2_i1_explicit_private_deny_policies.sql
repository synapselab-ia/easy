create policy legacy_v1_import_batches_deny_api
on private.legacy_v1_import_batches
for all to anon, authenticated, service_role
using (false) with check (false);

create policy legacy_v1_items_deny_api
on private.legacy_v1_items
for all to anon, authenticated, service_role
using (false) with check (false);

create policy legacy_v1_resellers_deny_api
on private.legacy_v1_resellers
for all to anon, authenticated, service_role
using (false) with check (false);

create policy legacy_v1_transactions_deny_api
on private.legacy_v1_transactions
for all to anon, authenticated, service_role
using (false) with check (false);

create policy legacy_v1_item_classifications_deny_api
on private.legacy_v1_item_classifications
for all to anon, authenticated, service_role
using (false) with check (false);
