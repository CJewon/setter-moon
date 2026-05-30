create table public.order_change_logs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  changed_by uuid references auth.users(id) on delete set null,
  summary text not null,
  changes jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index order_change_logs_order_id_created_at_idx on public.order_change_logs(order_id, created_at desc);

alter table public.order_change_logs enable row level security;

create policy "store owners can manage order change logs"
on public.order_change_logs
for all
using (
  exists (
    select 1
    from public.orders o
    join public.stores s on s.id = o.store_id
    where o.id = order_change_logs.order_id and s.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.orders o
    join public.stores s on s.id = o.store_id
    where o.id = order_change_logs.order_id and s.owner_id = auth.uid()
  )
);
