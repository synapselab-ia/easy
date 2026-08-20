create index legacy_v1_transactions_batch_reseller_idx
    on private.legacy_v1_transactions(batch_id, reseller_id);

create index legacy_v1_transactions_batch_item_idx
    on private.legacy_v1_transactions(batch_id, item_id);
