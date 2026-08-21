create table private.recovery_enforcement_state (
    singleton boolean primary key default true,
    automated_guard_enabled boolean not null default false,
    updated_at timestamptz not null default clock_timestamp(),
    constraint recovery_enforcement_singleton check (singleton)
);

insert into private.recovery_enforcement_state (singleton, automated_guard_enabled)
values (true, false)
on conflict (singleton) do nothing;

alter table private.recovery_enforcement_state enable row level security;
revoke all on table private.recovery_enforcement_state from public, anon, authenticated, service_role;

create policy recovery_enforcement_explicit_deny
on private.recovery_enforcement_state
for all
to anon, authenticated, service_role
using (false)
with check (false);

create or replace function private.automated_recovery_guard_enabled()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select coalesce((
        select s.automated_guard_enabled
        from private.recovery_enforcement_state s
        where s.singleton
    ), true);
$$;

create or replace function private.is_authorized_logical_restore()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select
        current_setting('easy.authorized_logical_restore', true) = 'on'
        and (select auth.uid()) is not null
        and exists (
            select 1
            from public.easy_operators eo
            where eo.user_id = (select auth.uid())
              and eo.is_active
        );
$$;

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

    if private.is_authorized_logical_restore() then
        return;
    end if;

    if not private.automated_recovery_guard_enabled() then
        return;
    end if;

    if not private.recovery_backup_is_fresh_at(clock_timestamp()) then
        raise exception using
            errcode = '55000',
            message = 'Business writes are blocked because verified off-site recovery evidence is missing, older than 24 hours, or retains fewer than 7 daily generations.';
    end if;
end;
$$;

create or replace function public.restore_easy_backup(p_payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_categories jsonb;
    v_items jsonb;
    v_resellers jsonb;
    v_transactions jsonb;
begin
    perform private.assert_easy_operator();

    if p_payload is null
       or jsonb_typeof(p_payload) <> 'object'
       or p_payload->>'format' <> 'easy-backup'
       or p_payload->>'version' <> '2'
       or p_payload#>>'{source,database}' <> 'ResellerManagerDB'
       or p_payload#>>'{source,schemaVersion}' <> '5'
    then
        raise exception using
            errcode = '22023',
            message = 'A restauração em nuvem aceita somente Backup v2/schema5 validado.';
    end if;

    v_categories := p_payload#>'{data,categories}';
    v_items := p_payload#>'{data,items}';
    v_resellers := p_payload#>'{data,resellers}';
    v_transactions := p_payload#>'{data,transactions}';

    if jsonb_typeof(v_categories) <> 'array'
       or jsonb_typeof(v_items) <> 'array'
       or jsonb_typeof(v_resellers) <> 'array'
       or jsonb_typeof(v_transactions) <> 'array'
    then
        raise exception using
            errcode = '22023',
            message = 'Backup v2/schema5 sem as quatro coleções obrigatórias.';
    end if;

    perform set_config('easy.authorized_logical_restore', 'on', true);
    set constraints transactions_replacement_transaction_fk, transactions_replaces_transaction_fk deferred;

    delete from public.transactions;
    delete from public.items;
    delete from public.resellers;
    delete from public.categories;

    insert into public.categories (id, name, is_active, created_at, updated_at)
    select
        x.id,
        x.name,
        x."isActive",
        x."createdAt"::timestamptz,
        x."updatedAt"::timestamptz
    from jsonb_to_recordset(v_categories) as x(
        id bigint,
        name text,
        "isActive" boolean,
        "createdAt" text,
        "updatedAt" text
    );

    insert into public.resellers (id, name, phone, email, notes, is_active, created_at, updated_at)
    select
        x.id,
        x.name,
        x.phone,
        x.email,
        x.notes,
        x."isActive",
        x."createdAt"::timestamptz,
        x."updatedAt"::timestamptz
    from jsonb_to_recordset(v_resellers) as x(
        id bigint,
        name text,
        phone text,
        email text,
        notes text,
        "isActive" boolean,
        "createdAt" text,
        "updatedAt" text
    );

    insert into public.items (id, name, base_price, is_active, category_id, created_at, updated_at)
    select
        x.id,
        x.name,
        x."basePrice",
        x."isActive",
        x."categoryId",
        x."createdAt"::timestamptz,
        x."updatedAt"::timestamptz
    from jsonb_to_recordset(v_items) as x(
        id bigint,
        name text,
        "basePrice" numeric,
        "isActive" boolean,
        "categoryId" bigint,
        "createdAt" text,
        "updatedAt" text
    );

    insert into public.transactions (
        id,
        reseller_id,
        type,
        item_id,
        item_name,
        quantity,
        unit_price,
        category_id,
        category_name,
        total_price,
        observation,
        reversal_reason,
        reversed_at,
        replacement_transaction_id,
        replaces_transaction_id,
        occurred_at,
        created_at
    )
    select
        x.id,
        x."resellerId",
        x.type,
        x."itemId",
        x."itemName",
        x.quantity,
        x."unitPrice",
        x."categoryId",
        x."categoryName",
        x."totalPrice",
        x.observation,
        nullif(x.reversal->>'reason', ''),
        case when x.reversal ? 'reversedAt' then (x.reversal->>'reversedAt')::timestamptz else null end,
        case when x.reversal ? 'replacementTransactionId' then (x.reversal->>'replacementTransactionId')::bigint else null end,
        case when x.correction ? 'replacesTransactionId' then (x.correction->>'replacesTransactionId')::bigint else null end,
        x."occurredAt"::timestamptz,
        x."createdAt"::timestamptz
    from jsonb_to_recordset(v_transactions) as x(
        id bigint,
        "resellerId" bigint,
        type text,
        "itemId" bigint,
        "itemName" text,
        quantity integer,
        "unitPrice" numeric,
        "categoryId" bigint,
        "categoryName" text,
        "totalPrice" numeric,
        observation text,
        reversal jsonb,
        correction jsonb,
        "occurredAt" text,
        "createdAt" text
    );

    if exists (
        select 1
        from public.transactions original
        join public.transactions replacement
          on replacement.id = original.replacement_transaction_id
        where replacement.replaces_transaction_id is distinct from original.id
           or replacement.created_at < original.created_at
           or (
                original.type = 'order'
                and replacement.type = 'order'
                and replacement.item_id = original.item_id
                and (
                    replacement.category_id is distinct from original.category_id
                    or replacement.category_name is distinct from original.category_name
                )
           )
    ) then
        raise exception using
            errcode = '23514',
            message = 'Backup contém vínculo de correção/reversão inválido.';
    end if;

    if exists (
        select 1
        from public.transactions replacement
        left join public.transactions original
          on original.id = replacement.replaces_transaction_id
        where replacement.replaces_transaction_id is not null
          and (
              original.id is null
              or original.replacement_transaction_id is distinct from replacement.id
          )
    ) then
        raise exception using
            errcode = '23514',
            message = 'Backup contém correção sem vínculo bidirecional correspondente.';
    end if;

    perform setval(
        pg_get_serial_sequence('public.categories', 'id'),
        coalesce((select max(id) from public.categories), 1),
        exists(select 1 from public.categories)
    );
    perform setval(
        pg_get_serial_sequence('public.items', 'id'),
        coalesce((select max(id) from public.items), 1),
        exists(select 1 from public.items)
    );
    perform setval(
        pg_get_serial_sequence('public.resellers', 'id'),
        coalesce((select max(id) from public.resellers), 1),
        exists(select 1 from public.resellers)
    );
    perform setval(
        pg_get_serial_sequence('public.transactions', 'id'),
        coalesce((select max(id) from public.transactions), 1),
        exists(select 1 from public.transactions)
    );

    perform set_config('easy.authorized_logical_restore', 'off', true);

    return jsonb_build_object(
        'categories', (select count(*) from public.categories),
        'items', (select count(*) from public.items),
        'resellers', (select count(*) from public.resellers),
        'transactions', (select count(*) from public.transactions)
    );
exception
    when others then
        perform set_config('easy.authorized_logical_restore', 'off', true);
        raise;
end;
$$;

revoke all on function private.automated_recovery_guard_enabled() from public, anon, authenticated, service_role;
revoke all on function private.is_authorized_logical_restore() from public, anon, authenticated, service_role;
revoke all on function public.restore_easy_backup(jsonb) from public, anon;
grant execute on function public.restore_easy_backup(jsonb) to authenticated;

comment on table private.recovery_enforcement_state is 'Runtime-first transition switch. automated_guard_enabled stays false during explicitly accepted early-use/manual-JSON mode and must become true before D-030 automated durability acceptance.';
comment on function public.restore_easy_backup(jsonb) is 'Approved-operator atomic logical restore for validated easy-backup v2/schema5. It is allowed even when automated recovery freshness would otherwise block normal writes.';
