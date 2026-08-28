alter table public.transactions
    add column created_by_user_id uuid null,
    add column created_by_email text null,
    add column reversed_by_user_id uuid null,
    add column reversed_by_email text null;

alter table public.transactions
    add constraint transactions_created_actor_shape_valid check (
        created_by_email is null or created_by_user_id is not null
    ),
    add constraint transactions_reversed_actor_shape_valid check (
        (reversed_by_user_id is null and reversed_by_email is null)
        or (reversed_by_user_id is not null and reversed_at is not null)
    );

create index transactions_created_by_user_id_idx
    on public.transactions(created_by_user_id);

create index transactions_reversed_by_user_id_idx
    on public.transactions(reversed_by_user_id);

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
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_transaction_id bigint;
    v_created_at timestamptz := clock_timestamp();
    v_occurred_at timestamptz := coalesce(p_occurred_at, v_created_at);
    v_actor_user_id uuid;
    v_actor_email text;
    v_item_name text;
    v_category_id bigint;
    v_category_name text;
    v_subcategory_id bigint;
    v_subcategory_name text;
    v_total numeric;
begin
    perform private.assert_easy_operator();

    v_actor_user_id := (select auth.uid());
    v_actor_email := nullif(btrim(coalesce((select auth.jwt()->>'email'), '')), '');

    if p_type not in ('order', 'payment', 'signal') then
        raise exception using errcode = '22023', message = 'Tipo de movimentação inválido.';
    end if;

    if not exists (
        select 1 from public.resellers r
         where r.id = p_reseller_id
           and r.is_active
    ) then
        raise exception using errcode = '23503', message = 'Revendedor inexistente ou inativo.';
    end if;

    if p_type = 'order' then
        if p_item_id is null or p_quantity is null or p_quantity <= 0
           or p_unit_price is null or p_unit_price < 0
        then
            raise exception using errcode = '22023', message = 'Pedido requer item, quantidade positiva e preço unitário não negativo.';
        end if;

        if p_total_price is not null then
            raise exception using errcode = '22023', message = 'O total do pedido é calculado pelo servidor.';
        end if;

        select i.name, i.category_id, c.name, i.subcategory_id, s.name
          into v_item_name, v_category_id, v_category_name, v_subcategory_id, v_subcategory_name
          from public.items i
          join public.categories c on c.id = i.category_id
          left join public.subcategories s
            on s.id = i.subcategory_id
           and s.category_id = i.category_id
         where i.id = p_item_id
           and i.is_active
           and c.is_active
           and (i.subcategory_id is null or s.is_active);

        if not found then
            raise exception using errcode = '23503', message = 'Item inexistente, inativo ou com classificação inativa.';
        end if;

        v_total := p_quantity * p_unit_price;

        insert into public.transactions (
            reseller_id, type, item_id, item_name, quantity, unit_price,
            category_id, category_name, subcategory_id, subcategory_name,
            total_price, observation, occurred_at, created_at,
            created_by_user_id, created_by_email
        )
        values (
            p_reseller_id, p_type, p_item_id, v_item_name, p_quantity, p_unit_price,
            v_category_id, v_category_name, v_subcategory_id, v_subcategory_name,
            v_total, p_observation, v_occurred_at, v_created_at,
            v_actor_user_id, v_actor_email
        )
        returning id into v_transaction_id;
    else
        if p_item_id is not null or p_quantity is not null or p_unit_price is not null then
            raise exception using errcode = '22023', message = 'Pagamentos e sinais não podem carregar campos de pedido.';
        end if;

        if p_total_price is null or p_total_price <= 0 then
            raise exception using errcode = '22023', message = 'Pagamento ou sinal requer valor positivo.';
        end if;

        insert into public.transactions (
            reseller_id, type, total_price, observation, occurred_at, created_at,
            created_by_user_id, created_by_email
        )
        values (
            p_reseller_id, p_type, p_total_price, p_observation, v_occurred_at, v_created_at,
            v_actor_user_id, v_actor_email
        )
        returning id into v_transaction_id;
    end if;

    return v_transaction_id;
end;
$$;

create or replace function private.reverse_transaction_impl(
    p_transaction_id bigint,
    p_reason text
)
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_reversed_at timestamptz := clock_timestamp();
    v_existing_reversed_at timestamptz;
    v_actor_user_id uuid;
    v_actor_email text;
begin
    perform private.assert_easy_operator();

    v_actor_user_id := (select auth.uid());
    v_actor_email := nullif(btrim(coalesce((select auth.jwt()->>'email'), '')), '');

    if btrim(coalesce(p_reason, '')) = '' then
        raise exception using errcode = '22023', message = 'Informe o motivo do estorno.';
    end if;

    select t.reversed_at
      into v_existing_reversed_at
      from public.transactions t
     where t.id = p_transaction_id
     for update;

    if not found then
        raise exception using errcode = 'P0002', message = 'Lançamento não encontrado.';
    end if;

    if v_existing_reversed_at is not null then
        raise exception using errcode = '23514', message = 'Este lançamento já foi estornado.';
    end if;

    update public.transactions
       set reversal_reason = btrim(p_reason),
           reversed_at = v_reversed_at,
           reversed_by_user_id = v_actor_user_id,
           reversed_by_email = v_actor_email
     where id = p_transaction_id;

    return v_reversed_at;
end;
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
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_original public.transactions%rowtype;
    v_replacement_id bigint;
    v_created_at timestamptz := clock_timestamp();
    v_actor_user_id uuid;
    v_actor_email text;
    v_item_name text;
    v_category_id bigint;
    v_category_name text;
    v_subcategory_id bigint;
    v_subcategory_name text;
    v_total numeric;
begin
    perform private.assert_easy_operator();

    v_actor_user_id := (select auth.uid());
    v_actor_email := nullif(btrim(coalesce((select auth.jwt()->>'email'), '')), '');

    if btrim(coalesce(p_reason, '')) = '' then
        raise exception using errcode = '22023', message = 'Informe o motivo da correção.';
    end if;

    if p_type not in ('order', 'payment', 'signal') then
        raise exception using errcode = '22023', message = 'Tipo de movimentação inválido.';
    end if;

    if p_occurred_at is null then
        raise exception using errcode = '22023', message = 'Informe uma data de ocorrência válida.';
    end if;

    select t.*
      into v_original
      from public.transactions t
     where t.id = p_original_id
     for update;

    if not found then
        raise exception using errcode = 'P0002', message = 'Lançamento não encontrado.';
    end if;

    if v_original.reversed_at is not null then
        raise exception using errcode = '23514', message = 'Este lançamento já foi estornado.';
    end if;

    if not exists (
        select 1 from public.resellers r
         where r.id = p_reseller_id
           and r.is_active
    ) then
        raise exception using errcode = '23503', message = 'Revendedor inexistente ou inativo.';
    end if;

    if p_type = 'order' then
        if p_item_id is null or p_quantity is null or p_quantity <= 0
           or p_unit_price is null or p_unit_price < 0
        then
            raise exception using errcode = '22023', message = 'Pedido corrigido requer item, quantidade positiva e preço unitário não negativo.';
        end if;

        if p_total_price is not null then
            raise exception using errcode = '22023', message = 'O total do pedido corrigido é calculado pelo servidor.';
        end if;

        if v_original.type = 'order' and v_original.item_id = p_item_id then
            if not exists (
                select 1 from public.items i
                 where i.id = p_item_id
                   and i.is_active
            ) then
                raise exception using errcode = '23503', message = 'Item inexistente ou inativo.';
            end if;

            v_item_name := v_original.item_name;
            v_category_id := v_original.category_id;
            v_category_name := v_original.category_name;
            v_subcategory_id := v_original.subcategory_id;
            v_subcategory_name := v_original.subcategory_name;
        else
            select i.name, i.category_id, c.name, i.subcategory_id, s.name
              into v_item_name, v_category_id, v_category_name, v_subcategory_id, v_subcategory_name
              from public.items i
              join public.categories c on c.id = i.category_id
              left join public.subcategories s
                on s.id = i.subcategory_id
               and s.category_id = i.category_id
             where i.id = p_item_id
               and i.is_active
               and c.is_active
               and (i.subcategory_id is null or s.is_active);

            if not found then
                raise exception using errcode = '23503', message = 'Item inexistente, inativo ou com classificação inativa.';
            end if;
        end if;

        v_total := p_quantity * p_unit_price;

        insert into public.transactions (
            reseller_id, type, item_id, item_name, quantity, unit_price,
            category_id, category_name, subcategory_id, subcategory_name,
            total_price, observation, replaces_transaction_id, occurred_at, created_at,
            created_by_user_id, created_by_email
        )
        values (
            p_reseller_id, p_type, p_item_id, v_item_name, p_quantity, p_unit_price,
            v_category_id, v_category_name, v_subcategory_id, v_subcategory_name,
            v_total, p_observation, p_original_id, p_occurred_at, v_created_at,
            v_actor_user_id, v_actor_email
        )
        returning id into v_replacement_id;
    else
        if p_item_id is not null or p_quantity is not null or p_unit_price is not null then
            raise exception using errcode = '22023', message = 'Pagamentos e sinais corrigidos não podem carregar campos de pedido.';
        end if;

        if p_total_price is null or p_total_price <= 0 then
            raise exception using errcode = '22023', message = 'Pagamento ou sinal corrigido requer valor positivo.';
        end if;

        insert into public.transactions (
            reseller_id, type, total_price, observation,
            replaces_transaction_id, occurred_at, created_at,
            created_by_user_id, created_by_email
        )
        values (
            p_reseller_id, p_type, p_total_price, p_observation,
            p_original_id, p_occurred_at, v_created_at,
            v_actor_user_id, v_actor_email
        )
        returning id into v_replacement_id;
    end if;

    update public.transactions
       set reversal_reason = btrim(p_reason),
           reversed_at = v_created_at,
           replacement_transaction_id = v_replacement_id,
           reversed_by_user_id = v_actor_user_id,
           reversed_by_email = v_actor_email
     where id = p_original_id;

    return v_replacement_id;
end;
$$;

create or replace function public.restore_easy_backup(p_payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_schema_version text;
    v_categories jsonb;
    v_subcategories jsonb;
    v_items jsonb;
    v_resellers jsonb;
    v_transactions jsonb;
begin
    perform private.assert_easy_operator();

    v_schema_version := p_payload#>>'{source,schemaVersion}';

    if p_payload is null
       or jsonb_typeof(p_payload) <> 'object'
       or p_payload->>'format' <> 'easy-backup'
       or p_payload->>'version' <> '2'
       or p_payload#>>'{source,database}' <> 'ResellerManagerDB'
       or v_schema_version not in ('5', '6', '7')
    then
        raise exception using
            errcode = '22023',
            message = 'A restauração em nuvem aceita somente Backup v2/schema5, schema6 ou schema7 validado.';
    end if;

    v_categories := p_payload#>'{data,categories}';
    v_subcategories := case
        when v_schema_version in ('6', '7') then p_payload#>'{data,subcategories}'
        else '[]'::jsonb
    end;
    v_items := p_payload#>'{data,items}';
    v_resellers := p_payload#>'{data,resellers}';
    v_transactions := p_payload#>'{data,transactions}';

    if jsonb_typeof(v_categories) <> 'array'
       or jsonb_typeof(v_subcategories) <> 'array'
       or jsonb_typeof(v_items) <> 'array'
       or jsonb_typeof(v_resellers) <> 'array'
       or jsonb_typeof(v_transactions) <> 'array'
    then
        raise exception using
            errcode = '22023',
            message = 'Backup sem as coleções obrigatórias para a versão informada.';
    end if;

    perform set_config('easy.authorized_logical_restore', 'on', true);
    set constraints transactions_replacement_transaction_fk, transactions_replaces_transaction_fk deferred;

    delete from public.transactions;
    delete from public.items;
    delete from public.resellers;
    delete from public.subcategories;
    delete from public.categories;

    insert into public.categories (id, name, is_active, created_at, updated_at)
    select x.id, x.name, x."isActive", x."createdAt"::timestamptz, x."updatedAt"::timestamptz
    from jsonb_to_recordset(v_categories) as x(
        id bigint, name text, "isActive" boolean, "createdAt" text, "updatedAt" text
    );

    insert into public.subcategories (id, category_id, name, is_active, created_at, updated_at)
    select x.id, x."categoryId", x.name, x."isActive", x."createdAt"::timestamptz, x."updatedAt"::timestamptz
    from jsonb_to_recordset(v_subcategories) as x(
        id bigint, "categoryId" bigint, name text, "isActive" boolean, "createdAt" text, "updatedAt" text
    );

    insert into public.resellers (id, name, phone, email, notes, is_active, created_at, updated_at)
    select x.id, x.name, x.phone, x.email, x.notes, x."isActive", x."createdAt"::timestamptz, x."updatedAt"::timestamptz
    from jsonb_to_recordset(v_resellers) as x(
        id bigint, name text, phone text, email text, notes text, "isActive" boolean, "createdAt" text, "updatedAt" text
    );

    insert into public.items (id, name, base_price, is_active, category_id, subcategory_id, created_at, updated_at)
    select x.id, x.name, x."basePrice", x."isActive", x."categoryId", x."subcategoryId", x."createdAt"::timestamptz, x."updatedAt"::timestamptz
    from jsonb_to_recordset(v_items) as x(
        id bigint, name text, "basePrice" numeric, "isActive" boolean, "categoryId" bigint, "subcategoryId" bigint, "createdAt" text, "updatedAt" text
    );

    insert into public.transactions (
        id, reseller_id, type, item_id, item_name, quantity, unit_price,
        category_id, category_name, subcategory_id, subcategory_name,
        total_price, observation, reversal_reason, reversed_at,
        replacement_transaction_id, replaces_transaction_id, occurred_at, created_at,
        created_by_user_id, created_by_email, reversed_by_user_id, reversed_by_email
    )
    select
        x.id, x."resellerId", x.type, x."itemId", x."itemName", x.quantity, x."unitPrice",
        x."categoryId", x."categoryName", x."subcategoryId", x."subcategoryName",
        x."totalPrice", x.observation,
        nullif(x.reversal->>'reason', ''),
        case when x.reversal ? 'reversedAt' then (x.reversal->>'reversedAt')::timestamptz else null end,
        case when x.reversal ? 'replacementTransactionId' then (x.reversal->>'replacementTransactionId')::bigint else null end,
        case when x.correction ? 'replacesTransactionId' then (x.correction->>'replacesTransactionId')::bigint else null end,
        x."occurredAt"::timestamptz, x."createdAt"::timestamptz,
        case
            when v_schema_version = '7' and x."createdBy" ? 'userId'
                then nullif(x."createdBy"->>'userId', '')::uuid
            else null
        end,
        case
            when v_schema_version = '7'
                then nullif(x."createdBy"->>'email', '')
            else null
        end,
        case
            when v_schema_version = '7' and x.reversal->'reversedBy' ? 'userId'
                then nullif(x.reversal->'reversedBy'->>'userId', '')::uuid
            else null
        end,
        case
            when v_schema_version = '7'
                then nullif(x.reversal->'reversedBy'->>'email', '')
            else null
        end
    from jsonb_to_recordset(v_transactions) as x(
        id bigint, "resellerId" bigint, type text, "itemId" bigint, "itemName" text,
        quantity integer, "unitPrice" numeric, "categoryId" bigint, "categoryName" text,
        "subcategoryId" bigint, "subcategoryName" text, "totalPrice" numeric,
        observation text, reversal jsonb, correction jsonb, "occurredAt" text, "createdAt" text,
        "createdBy" jsonb
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
                    or replacement.subcategory_id is distinct from original.subcategory_id
                    or replacement.subcategory_name is distinct from original.subcategory_name
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
    perform setval(pg_get_serial_sequence('public.subcategories', 'id'), coalesce((select max(id) from public.subcategories), 1), exists(select 1 from public.subcategories));
    perform setval(pg_get_serial_sequence('public.items', 'id'), coalesce((select max(id) from public.items), 1), exists(select 1 from public.items));
    perform setval(pg_get_serial_sequence('public.resellers', 'id'), coalesce((select max(id) from public.resellers), 1), exists(select 1 from public.resellers));
    perform setval(pg_get_serial_sequence('public.transactions', 'id'), coalesce((select max(id) from public.transactions), 1), exists(select 1 from public.transactions));

    perform set_config('easy.authorized_logical_restore', 'off', true);

    return jsonb_build_object(
        'categories', (select count(*) from public.categories),
        'subcategories', (select count(*) from public.subcategories),
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

revoke all on function public.create_transaction(bigint, text, timestamptz, text, bigint, integer, numeric, numeric)
    from public, anon;
revoke all on function public.correct_transaction(bigint, text, bigint, text, timestamptz, text, bigint, integer, numeric, numeric)
    from public, anon;
revoke all on function public.restore_easy_backup(jsonb)
    from public, anon;
revoke all on function private.reverse_transaction_impl(bigint, text)
    from public, anon;

grant execute on function public.create_transaction(bigint, text, timestamptz, text, bigint, integer, numeric, numeric)
    to authenticated, service_role;
grant execute on function public.correct_transaction(bigint, text, bigint, text, timestamptz, text, bigint, integer, numeric, numeric)
    to authenticated, service_role;
grant execute on function public.restore_easy_backup(jsonb)
    to authenticated, service_role;
grant execute on function private.reverse_transaction_impl(bigint, text)
    to authenticated, service_role;

comment on column public.transactions.created_by_user_id is
    'Authenticated Easy operator that registered this financial transaction. Null only for historical rows/restores without actor data.';
comment on column public.transactions.created_by_email is
    'Display-only email snapshot from the authenticated JWT at registration time; never used for authorization.';
comment on column public.transactions.reversed_by_user_id is
    'Authenticated Easy operator that reversed/corrected this financial transaction. Null for effective or legacy rows.';
comment on column public.transactions.reversed_by_email is
    'Display-only email snapshot from the authenticated JWT at reversal/correction time; never used for authorization.';
comment on function public.restore_easy_backup(jsonb) is
    'Approved-operator atomic logical restore for validated easy-backup v2/schema5, schema6 or schema7. Schema7 preserves financial operator attribution.';