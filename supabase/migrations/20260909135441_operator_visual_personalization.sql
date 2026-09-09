alter table public.easy_operators
    add column visual_personalization_allowed boolean not null default false,
    add column visual_personalization_enabled boolean not null default false,
    add column visual_personalization_mode text not null default 'corner',
    add column visual_personalization_intensity text not null default 'subtle';

alter table public.easy_operators
    add constraint easy_operators_visual_mode_valid
        check (visual_personalization_mode in ('corner', 'watermark')),
    add constraint easy_operators_visual_intensity_valid
        check (visual_personalization_intensity in ('subtle', 'soft'));

-- Controlled early use currently has exactly one active approved operator.
-- Designate that existing operator without embedding identity data in application code.
update public.easy_operators
set visual_personalization_allowed = true
where is_active
  and (select count(*) from public.easy_operators where is_active) = 1;

create policy easy_operators_update_visual_preferences
on public.easy_operators
for update
to authenticated
using (
    user_id = (select auth.uid())
    and is_active
    and visual_personalization_allowed
)
with check (
    user_id = (select auth.uid())
    and is_active
    and visual_personalization_allowed
);

grant update (
    visual_personalization_enabled,
    visual_personalization_mode,
    visual_personalization_intensity
) on table public.easy_operators to authenticated;
