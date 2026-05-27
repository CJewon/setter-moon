create extension if not exists "pgcrypto";

create type public.product_status as enum ('active', 'sold_out', 'hidden');
create type public.order_status as enum ('received', 'ready_to_ship', 'shipping', 'delivered', 'cancelled', 'hold');
create type public.stock_movement_type as enum ('inbound', 'sale_deduction', 'cancel_restore', 'manual_adjust');
create type public.hold_reservation_policy as enum ('keep', 'release');
create type public.store_plan as enum ('free', 'paid_full');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.stores (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  business_type text,
  plan_id public.store_plan not null default 'free',
  memo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id)
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (store_id, name)
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  description text,
  image_url text,
  base_price integer not null default 0 check (base_price >= 0),
  base_cost integer not null default 0 check (base_cost >= 0),
  status public.product_status not null default 'active',
  memo text,
  has_options boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_option_groups (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (product_id, name)
);

create table public.product_option_values (
  id uuid primary key default gen_random_uuid(),
  option_group_id uuid not null references public.product_option_groups(id) on delete cascade,
  value text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (option_group_id, value)
);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  sku_name text not null,
  sku_code text,
  price integer not null default 0 check (price >= 0),
  cost integer not null default 0 check (cost >= 0),
  current_stock integer not null default 0 check (current_stock >= 0),
  safety_stock integer not null default 0 check (safety_stock >= 0),
  is_active boolean not null default true,
  memo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, sku_name)
);

create table public.product_variant_options (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references public.product_variants(id) on delete cascade,
  option_value_id uuid not null references public.product_option_values(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (variant_id, option_value_id)
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  order_no text not null,
  customer_name text not null,
  customer_phone text,
  status public.order_status not null default 'received',
  hold_reservation_policy public.hold_reservation_policy,
  total_amount integer not null default 0 check (total_amount >= 0),
  memo text,
  ordered_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (store_id, order_no)
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  variant_id uuid not null references public.product_variants(id),
  product_name_snapshot text not null,
  variant_name_snapshot text not null,
  quantity integer not null check (quantity > 0),
  unit_price integer not null default 0 check (unit_price >= 0),
  total_price integer not null default 0 check (total_price >= 0),
  created_at timestamptz not null default now()
);

create table public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  product_id uuid not null references public.products(id),
  variant_id uuid not null references public.product_variants(id),
  type public.stock_movement_type not null,
  quantity integer not null,
  before_stock integer not null check (before_stock >= 0),
  after_stock integer not null check (after_stock >= 0),
  order_id uuid references public.orders(id),
  memo text,
  created_at timestamptz not null default now()
);

create table public.order_status_logs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  from_status public.order_status,
  to_status public.order_status not null,
  memo text,
  created_at timestamptz not null default now()
);

create index stores_owner_id_idx on public.stores(owner_id);
create index categories_store_id_idx on public.categories(store_id);
create index products_store_id_idx on public.products(store_id);
create index products_category_id_idx on public.products(category_id);
create index product_variants_product_id_idx on public.product_variants(product_id);
create index orders_store_id_status_idx on public.orders(store_id, status);
create index orders_ordered_at_idx on public.orders(ordered_at);
create index order_items_order_id_idx on public.order_items(order_id);
create index order_items_variant_id_idx on public.order_items(variant_id);
create index stock_movements_variant_id_idx on public.stock_movements(variant_id);
create index stock_movements_store_id_created_at_idx on public.stock_movements(store_id, created_at desc);
create index order_status_logs_order_id_idx on public.order_status_logs(order_id);

create trigger set_stores_updated_at
before update on public.stores
for each row execute function public.set_updated_at();

create trigger set_categories_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

create trigger set_products_updated_at
before update on public.products
for each row execute function public.set_updated_at();

create trigger set_product_variants_updated_at
before update on public.product_variants
for each row execute function public.set_updated_at();

create trigger set_orders_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

create or replace function public.prevent_store_plan_self_update()
returns trigger
language plpgsql
as $$
begin
  if old.plan_id is distinct from new.plan_id then
    raise exception 'store plan cannot be changed by client writes';
  end if;

  return new;
end;
$$;

create trigger prevent_store_plan_self_update
before update on public.stores
for each row execute function public.prevent_store_plan_self_update();

create or replace function public.validate_product_category_store()
returns trigger
language plpgsql
as $$
begin
  if new.category_id is not null and not exists (
    select 1
    from public.categories c
    where c.id = new.category_id
      and c.store_id = new.store_id
  ) then
    raise exception 'category_id must belong to the same store as product';
  end if;

  return new;
end;
$$;

create trigger validate_product_category_store
before insert or update on public.products
for each row execute function public.validate_product_category_store();

create or replace function public.validate_variant_option_product()
returns trigger
language plpgsql
as $$
begin
  if not exists (
    select 1
    from public.product_variants pv
    join public.product_option_values pov on pov.id = new.option_value_id
    join public.product_option_groups pog on pog.id = pov.option_group_id
    where pv.id = new.variant_id
      and pog.product_id = pv.product_id
  ) then
    raise exception 'option_value_id must belong to the same product as variant';
  end if;

  return new;
end;
$$;

create trigger validate_variant_option_product
before insert or update on public.product_variant_options
for each row execute function public.validate_variant_option_product();

create or replace function public.validate_order_item_store()
returns trigger
language plpgsql
as $$
begin
  if not exists (
    select 1
    from public.orders o
    join public.products p on p.id = new.product_id and p.store_id = o.store_id
    join public.product_variants pv on pv.id = new.variant_id and pv.product_id = p.id
    where o.id = new.order_id
  ) then
    raise exception 'order item product and variant must belong to the order store';
  end if;

  return new;
end;
$$;

create trigger validate_order_item_store
before insert or update on public.order_items
for each row execute function public.validate_order_item_store();

create or replace function public.validate_stock_movement_store()
returns trigger
language plpgsql
as $$
begin
  if not exists (
    select 1
    from public.products p
    join public.product_variants pv on pv.id = new.variant_id and pv.product_id = p.id
    where p.id = new.product_id
      and p.store_id = new.store_id
  ) then
    raise exception 'stock movement product and variant must belong to the movement store';
  end if;

  if new.order_id is not null and not exists (
    select 1
    from public.orders o
    where o.id = new.order_id
      and o.store_id = new.store_id
  ) then
    raise exception 'stock movement order must belong to the movement store';
  end if;

  return new;
end;
$$;

create trigger validate_stock_movement_store
before insert or update on public.stock_movements
for each row execute function public.validate_stock_movement_store();

create or replace function public.get_kst_month_range(
  reference_time timestamptz default now(),
  out starts_at timestamptz,
  out ends_at timestamptz
)
language sql
stable
as $$
  select
    date_trunc('month', timezone('Asia/Seoul', reference_time)) at time zone 'Asia/Seoul',
    (date_trunc('month', timezone('Asia/Seoul', reference_time)) + interval '1 month') at time zone 'Asia/Seoul'
$$;

create or replace function public.get_store_usage_counts(
  target_store_id uuid,
  reference_time timestamptz default now()
)
returns table (
  product_count integer,
  sku_count integer,
  monthly_order_count integer
)
language sql
stable
as $$
  with month_range as (
    select *
    from public.get_kst_month_range(reference_time)
  )
  select
    (
      select count(*)::integer
      from public.products p
      where p.store_id = target_store_id
    ) as product_count,
    (
      select count(*)::integer
      from public.product_variants pv
      join public.products p on p.id = pv.product_id
      where p.store_id = target_store_id
    ) as sku_count,
    (
      select count(*)::integer
      from public.orders o
      cross join month_range mr
      where o.store_id = target_store_id
        and o.created_at >= mr.starts_at
        and o.created_at < mr.ends_at
    ) as monthly_order_count
$$;

create or replace function public.enforce_free_product_limit()
returns trigger
language plpgsql
as $$
declare
  target_store public.stores%rowtype;
  current_product_count integer;
begin
  select * into target_store
  from public.stores s
  where s.id = new.store_id
  for update;

  if target_store.plan_id = 'free' then
    select count(*)::integer into current_product_count
    from public.products p
    where p.store_id = new.store_id;

    if current_product_count >= 10 then
      raise exception 'free plan product limit exceeded';
    end if;
  end if;

  return new;
end;
$$;

create trigger enforce_free_product_limit
before insert on public.products
for each row execute function public.enforce_free_product_limit();

create or replace function public.enforce_free_sku_limit()
returns trigger
language plpgsql
as $$
declare
  target_store_id uuid;
  target_store public.stores%rowtype;
  current_sku_count integer;
begin
  select p.store_id into target_store_id
  from public.products p
  where p.id = new.product_id;

  select * into target_store
  from public.stores s
  where s.id = target_store_id
  for update;

  if target_store.plan_id = 'free' then
    select count(*)::integer into current_sku_count
    from public.product_variants pv
    join public.products p on p.id = pv.product_id
    where p.store_id = target_store_id;

    if current_sku_count >= 100 then
      raise exception 'free plan SKU limit exceeded';
    end if;
  end if;

  return new;
end;
$$;

create trigger enforce_free_sku_limit
before insert on public.product_variants
for each row execute function public.enforce_free_sku_limit();

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

    if current_monthly_order_count >= 100 then
      raise exception 'free plan monthly order limit exceeded';
    end if;
  end if;

  return new;
end;
$$;

create trigger enforce_free_monthly_order_limit
before insert on public.orders
for each row execute function public.enforce_free_monthly_order_limit();

alter table public.stores enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_option_groups enable row level security;
alter table public.product_option_values enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_variant_options enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.stock_movements enable row level security;
alter table public.order_status_logs enable row level security;

create policy "store owners can manage stores"
on public.stores
for all
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy "store owners can manage categories"
on public.categories
for all
using (exists (select 1 from public.stores s where s.id = categories.store_id and s.owner_id = auth.uid()))
with check (exists (select 1 from public.stores s where s.id = categories.store_id and s.owner_id = auth.uid()));

create policy "store owners can manage products"
on public.products
for all
using (exists (select 1 from public.stores s where s.id = products.store_id and s.owner_id = auth.uid()))
with check (exists (select 1 from public.stores s where s.id = products.store_id and s.owner_id = auth.uid()));

create policy "store owners can manage option groups"
on public.product_option_groups
for all
using (
  exists (
    select 1
    from public.products p
    join public.stores s on s.id = p.store_id
    where p.id = product_option_groups.product_id and s.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.products p
    join public.stores s on s.id = p.store_id
    where p.id = product_option_groups.product_id and s.owner_id = auth.uid()
  )
);

create policy "store owners can manage option values"
on public.product_option_values
for all
using (
  exists (
    select 1
    from public.product_option_groups pog
    join public.products p on p.id = pog.product_id
    join public.stores s on s.id = p.store_id
    where pog.id = product_option_values.option_group_id and s.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.product_option_groups pog
    join public.products p on p.id = pog.product_id
    join public.stores s on s.id = p.store_id
    where pog.id = product_option_values.option_group_id and s.owner_id = auth.uid()
  )
);

create policy "store owners can manage variants"
on public.product_variants
for all
using (
  exists (
    select 1
    from public.products p
    join public.stores s on s.id = p.store_id
    where p.id = product_variants.product_id and s.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.products p
    join public.stores s on s.id = p.store_id
    where p.id = product_variants.product_id and s.owner_id = auth.uid()
  )
);

create policy "store owners can manage variant options"
on public.product_variant_options
for all
using (
  exists (
    select 1
    from public.product_variants pv
    join public.products p on p.id = pv.product_id
    join public.stores s on s.id = p.store_id
    where pv.id = product_variant_options.variant_id and s.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.product_variants pv
    join public.products p on p.id = pv.product_id
    join public.stores s on s.id = p.store_id
    where pv.id = product_variant_options.variant_id and s.owner_id = auth.uid()
  )
);

create policy "store owners can manage orders"
on public.orders
for all
using (exists (select 1 from public.stores s where s.id = orders.store_id and s.owner_id = auth.uid()))
with check (exists (select 1 from public.stores s where s.id = orders.store_id and s.owner_id = auth.uid()));

create policy "store owners can manage order items"
on public.order_items
for all
using (
  exists (
    select 1
    from public.orders o
    join public.stores s on s.id = o.store_id
    where o.id = order_items.order_id and s.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.orders o
    join public.stores s on s.id = o.store_id
    where o.id = order_items.order_id and s.owner_id = auth.uid()
  )
);

create policy "store owners can manage stock movements"
on public.stock_movements
for all
using (exists (select 1 from public.stores s where s.id = stock_movements.store_id and s.owner_id = auth.uid()))
with check (exists (select 1 from public.stores s where s.id = stock_movements.store_id and s.owner_id = auth.uid()));

create policy "store owners can manage order status logs"
on public.order_status_logs
for all
using (
  exists (
    select 1
    from public.orders o
    join public.stores s on s.id = o.store_id
    where o.id = order_status_logs.order_id and s.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.orders o
    join public.stores s on s.id = o.store_id
    where o.id = order_status_logs.order_id and s.owner_id = auth.uid()
  )
);
