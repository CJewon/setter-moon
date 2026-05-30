create or replace function public.update_order_status_atomic(
  p_store_id uuid,
  p_order_id uuid,
  p_to_status public.order_status,
  p_restore_stock boolean default true,
  p_hold_reservation_policy public.hold_reservation_policy default null,
  p_memo text default null
)
returns table(order_id uuid, status public.order_status)
language plpgsql
security invoker
set search_path = public
as $$
declare
  item_record record;
  item_count integer := 0;
  next_hold_reservation_policy public.hold_reservation_policy;
  order_record public.orders%rowtype;
begin
  select *
    into order_record
  from public.orders o
  where o.id = p_order_id
    and o.store_id = p_store_id
  for update;

  if not found then
    raise exception 'ORDER_NOT_FOUND' using errcode = 'P0002';
  end if;

  if not (
    (order_record.status = 'received'::public.order_status and p_to_status in ('ready_to_ship'::public.order_status, 'cancelled'::public.order_status, 'hold'::public.order_status)) or
    (order_record.status = 'hold'::public.order_status and p_to_status in ('received'::public.order_status, 'ready_to_ship'::public.order_status, 'cancelled'::public.order_status)) or
    (order_record.status = 'ready_to_ship'::public.order_status and p_to_status in ('shipping'::public.order_status, 'cancelled'::public.order_status)) or
    (order_record.status = 'shipping'::public.order_status and p_to_status = 'delivered'::public.order_status)
  ) then
    raise exception 'INVALID_STATUS_TRANSITION' using errcode = 'P0001';
  end if;

  if p_to_status = 'hold'::public.order_status and p_hold_reservation_policy is null then
    raise exception 'HOLD_POLICY_REQUIRED' using errcode = '22023';
  end if;

  if p_to_status = 'ready_to_ship'::public.order_status then
    for item_record in
      select
        oi.product_id,
        oi.quantity,
        oi.variant_id,
        pv.current_stock
      from public.order_items oi
      join public.product_variants pv on pv.id = oi.variant_id
      where oi.order_id = p_order_id
      order by oi.id
      for update of pv
    loop
      item_count := item_count + 1;

      if item_record.current_stock < item_record.quantity then
        raise exception 'INSUFFICIENT_STOCK' using errcode = 'P0001';
      end if;

      update public.product_variants
      set
        current_stock = item_record.current_stock - item_record.quantity,
        updated_at = now()
      where id = item_record.variant_id;

      insert into public.stock_movements (
        after_stock,
        before_stock,
        memo,
        order_id,
        product_id,
        quantity,
        store_id,
        type,
        variant_id
      )
      values (
        item_record.current_stock - item_record.quantity,
        item_record.current_stock,
        '배송대기 전환 재고 차감',
        p_order_id,
        item_record.product_id,
        item_record.quantity,
        p_store_id,
        'sale_deduction',
        item_record.variant_id
      );
    end loop;

    if item_count = 0 then
      raise exception 'ORDER_ITEMS_REQUIRED' using errcode = '22023';
    end if;
  end if;

  if order_record.status = 'ready_to_ship'::public.order_status
    and p_to_status = 'cancelled'::public.order_status
    and p_restore_stock is not false then
    for item_record in
      select
        oi.product_id,
        oi.quantity,
        oi.variant_id,
        pv.current_stock
      from public.order_items oi
      join public.product_variants pv on pv.id = oi.variant_id
      where oi.order_id = p_order_id
      order by oi.id
      for update of pv
    loop
      item_count := item_count + 1;

      update public.product_variants
      set
        current_stock = item_record.current_stock + item_record.quantity,
        updated_at = now()
      where id = item_record.variant_id;

      insert into public.stock_movements (
        after_stock,
        before_stock,
        memo,
        order_id,
        product_id,
        quantity,
        store_id,
        type,
        variant_id
      )
      values (
        item_record.current_stock + item_record.quantity,
        item_record.current_stock,
        '주문 취소 재고 복구',
        p_order_id,
        item_record.product_id,
        item_record.quantity,
        p_store_id,
        'cancel_restore',
        item_record.variant_id
      );
    end loop;

    if item_count = 0 then
      raise exception 'ORDER_ITEMS_REQUIRED' using errcode = '22023';
    end if;
  end if;

  next_hold_reservation_policy :=
    case
      when p_to_status = 'hold'::public.order_status then coalesce(p_hold_reservation_policy, 'keep'::public.hold_reservation_policy)
      else order_record.hold_reservation_policy
    end;

  update public.orders
  set
    hold_reservation_policy = next_hold_reservation_policy,
    status = p_to_status,
    updated_at = now()
  where id = p_order_id
    and store_id = p_store_id;

  insert into public.order_status_logs (
    from_status,
    memo,
    order_id,
    to_status
  )
  values (
    order_record.status,
    nullif(btrim(p_memo), ''),
    p_order_id,
    p_to_status
  );

  return query
  select p_order_id, p_to_status;
end;
$$;

grant execute on function public.update_order_status_atomic(
  uuid,
  uuid,
  public.order_status,
  boolean,
  public.hold_reservation_policy,
  text
) to authenticated;
