alter function public.create_transaction(bigint, text, timestamptz, text, bigint, integer, numeric, numeric)
    set schema private;
alter function private.create_transaction(bigint, text, timestamptz, text, bigint, integer, numeric, numeric)
    rename to create_transaction_impl;

alter function public.reverse_transaction(bigint, text)
    set schema private;
alter function private.reverse_transaction(bigint, text)
    rename to reverse_transaction_impl;

alter function public.correct_transaction(bigint, text, bigint, text, timestamptz, text, bigint, integer, numeric, numeric)
    set schema private;
alter function private.correct_transaction(bigint, text, bigint, text, timestamptz, text, bigint, integer, numeric, numeric)
    rename to correct_transaction_impl;

revoke all on function private.create_transaction_impl(bigint, text, timestamptz, text, bigint, integer, numeric, numeric)
    from public, anon, authenticated;
revoke all on function private.reverse_transaction_impl(bigint, text)
    from public, anon, authenticated;
revoke all on function private.correct_transaction_impl(bigint, text, bigint, text, timestamptz, text, bigint, integer, numeric, numeric)
    from public, anon, authenticated;

grant usage on schema private to authenticated;
grant execute on function private.create_transaction_impl(bigint, text, timestamptz, text, bigint, integer, numeric, numeric)
    to authenticated;
grant execute on function private.reverse_transaction_impl(bigint, text)
    to authenticated;
grant execute on function private.correct_transaction_impl(bigint, text, bigint, text, timestamptz, text, bigint, integer, numeric, numeric)
    to authenticated;

create or replace function public.create_transaction(
    p_reseller_id bigint,
    p_type text,
    p_occurred_at timestamptz default null,
    p_observation text default null,
    p_item_id bigint default null,
    p_quantity integer default null,
    p_unit_price numeric default null,
    p_total_price numeric default null
)
returns bigint
language sql
security invoker
set search_path = ''
as $$
    select private.create_transaction_impl(
        p_reseller_id,
        p_type,
        p_occurred_at,
        p_observation,
        p_item_id,
        p_quantity,
        p_unit_price,
        p_total_price
    );
$$;

create or replace function public.reverse_transaction(
    p_transaction_id bigint,
    p_reason text
)
returns timestamptz
language sql
security invoker
set search_path = ''
as $$
    select private.reverse_transaction_impl(
        p_transaction_id,
        p_reason
    );
$$;

create or replace function public.correct_transaction(
    p_original_id bigint,
    p_reason text,
    p_reseller_id bigint,
    p_type text,
    p_occurred_at timestamptz,
    p_observation text default null,
    p_item_id bigint default null,
    p_quantity integer default null,
    p_unit_price numeric default null,
    p_total_price numeric default null
)
returns bigint
language sql
security invoker
set search_path = ''
as $$
    select private.correct_transaction_impl(
        p_original_id,
        p_reason,
        p_reseller_id,
        p_type,
        p_occurred_at,
        p_observation,
        p_item_id,
        p_quantity,
        p_unit_price,
        p_total_price
    );
$$;

revoke all on function public.create_transaction(bigint, text, timestamptz, text, bigint, integer, numeric, numeric)
    from public, anon;
revoke all on function public.reverse_transaction(bigint, text)
    from public, anon;
revoke all on function public.correct_transaction(bigint, text, bigint, text, timestamptz, text, bigint, integer, numeric, numeric)
    from public, anon;

grant execute on function public.create_transaction(bigint, text, timestamptz, text, bigint, integer, numeric, numeric)
    to authenticated;
grant execute on function public.reverse_transaction(bigint, text)
    to authenticated;
grant execute on function public.correct_transaction(bigint, text, bigint, text, timestamptz, text, bigint, integer, numeric, numeric)
    to authenticated;

comment on function public.correct_transaction(bigint, text, bigint, text, timestamptz, text, bigint, integer, numeric, numeric)
is 'Public SECURITY INVOKER D-013/D-026 RPC. The non-exposed private implementation performs the privileged atomic insert+reversal after explicit operator authorization.';
