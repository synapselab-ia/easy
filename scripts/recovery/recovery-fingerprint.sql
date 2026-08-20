with effective as (
  select * from public.transactions where reversed_at is null
), balances as (
  select r.id as reseller_id,
         coalesce(sum(case when e.type = 'order'
             then round(e.total_price * 100)::bigint
             else -round(e.total_price * 100)::bigint end), 0)::bigint as balance_cents
  from public.resellers r
  left join effective e on e.reseller_id = r.id
  group by r.id
)
select
  (select count(*) from public.categories)::bigint as categories_count,
  (select count(*) from public.items)::bigint as items_count,
  (select count(*) from public.resellers)::bigint as resellers_count,
  (select count(*) from public.transactions)::bigint as transactions_count,
  (select count(*) from public.transactions where type = 'order')::bigint as orders_count,
  (select count(*) from public.transactions where type = 'payment')::bigint as payments_count,
  (select count(*) from public.transactions where type = 'signal')::bigint as signals_count,
  md5(coalesce((select jsonb_agg(to_jsonb(c) order by c.id)::text from public.categories c), '[]')) as categories_digest,
  md5(coalesce((select jsonb_agg(to_jsonb(i) order by i.id)::text from public.items i), '[]')) as items_digest,
  md5(coalesce((select jsonb_agg(to_jsonb(r) order by r.id)::text from public.resellers r), '[]')) as resellers_digest,
  md5(coalesce((select jsonb_agg(to_jsonb(t) order by t.id)::text from public.transactions t), '[]')) as transactions_digest,
  (select count(*) from public.transactions t left join public.resellers r on r.id = t.reseller_id where r.id is null)::bigint as orphan_reseller_refs,
  (select count(*) from public.transactions t left join public.items i on i.id = t.item_id where t.item_id is not null and i.id is null)::bigint as orphan_item_refs,
  (select count(*) from public.transactions t left join public.categories c on c.id = t.category_id where t.category_id is not null and c.id is null)::bigint as orphan_category_refs,
  coalesce((select sum(round(total_price * 100)::bigint) from effective where type = 'order'), 0)::bigint as gross_order_cents,
  coalesce((select sum(round(total_price * 100)::bigint) from effective where type = 'payment'), 0)::bigint as payment_cents,
  coalesce((select sum(round(total_price * 100)::bigint) from effective where type = 'signal'), 0)::bigint as signal_cents,
  coalesce((select sum(case when type = 'order'
      then round(total_price * 100)::bigint
      else -round(total_price * 100)::bigint end) from effective), 0)::bigint as net_movement_cents,
  coalesce((select sum(greatest(balance_cents, 0)) from balances), 0)::bigint as aggregate_positive_debt_cents,
  md5(coalesce((select jsonb_agg(jsonb_build_array(reseller_id, balance_cents) order by reseller_id)::text from balances), '[]')) as reseller_balances_digest;
