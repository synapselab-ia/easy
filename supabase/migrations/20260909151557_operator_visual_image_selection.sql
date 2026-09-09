insert into storage.buckets (
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
)
values (
    'operator-visual-personalization',
    'operator-visual-personalization',
    false,
    5242880,
    array['image/png', 'image/jpeg', 'image/webp']::text[]
)
on conflict (id) do update
set
    name = excluded.name,
    public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy operator_visual_image_select_self
on storage.objects
for select
to authenticated
using (
    bucket_id = 'operator-visual-personalization'
    and array_length(storage.foldername(name), 1) = 1
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and storage.filename(name) = 'decoration'
    and exists (
        select 1
        from public.easy_operators operator_row
        where operator_row.user_id = (select auth.uid())
          and operator_row.is_active
          and operator_row.visual_personalization_allowed
    )
);

create policy operator_visual_image_insert_self
on storage.objects
for insert
to authenticated
with check (
    bucket_id = 'operator-visual-personalization'
    and array_length(storage.foldername(name), 1) = 1
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and storage.filename(name) = 'decoration'
    and exists (
        select 1
        from public.easy_operators operator_row
        where operator_row.user_id = (select auth.uid())
          and operator_row.is_active
          and operator_row.visual_personalization_allowed
    )
);

create policy operator_visual_image_update_self
on storage.objects
for update
to authenticated
using (
    bucket_id = 'operator-visual-personalization'
    and array_length(storage.foldername(name), 1) = 1
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and storage.filename(name) = 'decoration'
    and exists (
        select 1
        from public.easy_operators operator_row
        where operator_row.user_id = (select auth.uid())
          and operator_row.is_active
          and operator_row.visual_personalization_allowed
    )
)
with check (
    bucket_id = 'operator-visual-personalization'
    and array_length(storage.foldername(name), 1) = 1
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and storage.filename(name) = 'decoration'
    and exists (
        select 1
        from public.easy_operators operator_row
        where operator_row.user_id = (select auth.uid())
          and operator_row.is_active
          and operator_row.visual_personalization_allowed
    )
);

create policy operator_visual_image_delete_self
on storage.objects
for delete
to authenticated
using (
    bucket_id = 'operator-visual-personalization'
    and array_length(storage.foldername(name), 1) = 1
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and storage.filename(name) = 'decoration'
    and exists (
        select 1
        from public.easy_operators operator_row
        where operator_row.user_id = (select auth.uid())
          and operator_row.is_active
          and operator_row.visual_personalization_allowed
    )
);