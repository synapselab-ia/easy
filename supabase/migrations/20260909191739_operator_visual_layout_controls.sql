alter table public.easy_operators
    add column visual_personalization_position text not null default 'bottom-right',
    add column visual_personalization_size text not null default 'medium',
    add column visual_personalization_opacity smallint not null default 20,
    add column visual_personalization_layer text not null default 'behind';

-- Preserve the closest accepted PR #142 appearance while moving to the
-- explicit position / size / opacity / layer contract.
update public.easy_operators
set
    visual_personalization_position = case
        when visual_personalization_mode = 'watermark' then 'center'
        else 'bottom-right'
    end,
    visual_personalization_size = case
        when visual_personalization_mode = 'watermark' then 'large'
        else 'medium'
    end,
    visual_personalization_opacity = case
        when visual_personalization_mode = 'watermark'
            and visual_personalization_intensity = 'soft' then 10
        when visual_personalization_mode = 'watermark' then 5
        when visual_personalization_intensity = 'soft' then 35
        else 20
    end,
    visual_personalization_layer = 'behind';

alter table public.easy_operators
    add constraint easy_operators_visual_position_valid
        check (visual_personalization_position in (
            'top-left',
            'top-center',
            'top-right',
            'center-left',
            'center',
            'center-right',
            'bottom-left',
            'bottom-center',
            'bottom-right'
        )),
    add constraint easy_operators_visual_size_valid
        check (visual_personalization_size in ('small', 'medium', 'large')),
    add constraint easy_operators_visual_opacity_valid
        check (
            visual_personalization_opacity between 5 and 50
            and mod(visual_personalization_opacity, 5) = 0
        ),
    add constraint easy_operators_visual_layer_valid
        check (visual_personalization_layer in ('behind', 'over'));

grant update (
    visual_personalization_position,
    visual_personalization_size,
    visual_personalization_opacity,
    visual_personalization_layer
) on table public.easy_operators to authenticated;
