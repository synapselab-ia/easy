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
    set constraints public.transactions_replacement_transaction_fk, public.transactions_replaces_transaction_fk deferred;

    delete from public.transactions;
    delete from public.items;
    delete from public.resellers;
    delete from public.categories;

    insert into public.categories (id, name, is_active, created_at, updated_at)
    select x.id, x.name, x."isActive", x."createdAt"::timestamptz, x."updatedAt"::timestamptz
    from jsonb_to_recordset(v_categories) as x(
        id bigint, name text, "isActive" boolean, "createdAt" text, "updatedAt" text
    );

    insert into public.resellers (id, name, phone, email, notes, is_active, created_at, updated_at)
    select x.id, x.name, x.phone, x.email, x.notes, x."isActive", x."createdAt"::timestamptz, x."updatedAt"::timestamptz
    from jsonb_to_recordset(v_resellers) as x(
        id bigint, name text, phone text, email text, notes text, "isActive" boolean, "createdAt" text, "updatedAt" text
    );

    insert into public.items (id, name, base_price, is_active, category_id, created_at, updated_at)
    select x.id, x.name, x."basePrice", x."isActive", x."categoryId", x."createdAt"::timestamptz, x."updatedAt"::timestamptz
    from jsonb_to_recordset(v_items) as x(
        id bigint, name text, "basePrice" numeric, "isActive" boolean, "categoryId" bigint, "createdAt" text, "updatedAt" text
    );

    insert into public.transactions (
        id, reseller_id, type, item_id, item_name, quantity, unit_price,
        category_id, category_name, total_price, observation, reversal_reason,
        reversed_at, replacement_transaction_id, replaces_transaction_id,
        occurred_at, created_at
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
        join public.transactions replacement on replacement.id = original.replacement_transaction_id
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
        raise exception using errcode = '23514', message = 'Backup contém vínculo de correção/reversão inválido.';
    end if;

    if exists (
        select 1
        from public.transactions replacement
        left join public.transactions original on original.id = replacement.replaces_transaction_id
        where replacement.replaces_transaction_id is not null
          and (original.id is null or original.replacement_transaction_id is distinct from replacement.id)
    ) then
        raise exception using errcode = '23514', message = 'Backup contém correção sem vínculo bidirecional correspondente.';
    end if;

    perform setval(pg_get_serial_sequence('public.categories', 'id'), coalesce((select max(id) from public.categories), 1), exists(select 1 from public.categories));
    perform setval(pg_get_serial_sequence('public.items', 'id'), coalesce((select max(id) from public.items), 1), exists(select 1 from public.items));
    perform setval(pg_get_serial_sequence('public.resellers', 'id'), coalesce((select max(id) from public.resellers), 1), exists(select 1 from public.resellers));
    perform setval(pg_get_serial_sequence('public.transactions', 'id'), coalesce((select max(id) from public.transactions), 1), exists(select 1 from public.transactions));

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

revoke all on function public.restore_easy_backup(jsonb) from public, anon;
grant execute on function public.restore_easy_backup(jsonb) to authenticated;
