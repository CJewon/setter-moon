create or replace function public.enforce_free_monthly_order_limit()
returns trigger
language plpgsql
as $$
declare
  target_store public.stores%rowtype;
  current_monthly_order_count integer;
  month_starts_at timestamptz;
  month_ends_at timestamptz;
begin
  new.created_at = now();

  select * into target_store
  from public.stores s
  where s.id = new.store_id
  for update;

  if target_store.plan_id = 'free' then
    select starts_at, ends_at
      into month_starts_at, month_ends_at
    from public.get_kst_month_range(now());

    select count(*)::integer into current_monthly_order_count
    from public.orders o
    where o.store_id = new.store_id
      and o.created_at >= month_starts_at
      and o.created_at < month_ends_at;

    if current_monthly_order_count >= 300 then
      raise exception 'free plan monthly order limit exceeded';
    end if;
  end if;

  return new;
end;
$$;
