do $$
begin
  create type public.profile_plan_status as enum ('active', 'past_due', 'cancelled');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  plan_id public.store_plan not null default 'free',
  plan_status public.profile_plan_status not null default 'active',
  plan_current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_plan_idx on public.profiles(plan_id, plan_status);

create or replace function public.get_effective_profile_plan(target_profile_id uuid)
returns public.store_plan
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when p.plan_id = 'paid_full'
      and p.plan_status = 'active'
      and (p.plan_current_period_end is null or p.plan_current_period_end > now())
    then 'paid_full'::public.store_plan
    else 'free'::public.store_plan
  end
  from public.profiles p
  where p.id = target_profile_id
$$;

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'name', '')), '')
  )
  on conflict (id) do update
    set email = excluded.email,
        display_name = coalesce(public.profiles.display_name, excluded.display_name),
        updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;

create trigger on_auth_user_created_profile
after insert on auth.users
for each row execute function public.handle_new_user_profile();

create or replace function public.handle_user_profile_email_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles
  set email = new.email,
      updated_at = now()
  where id = new.id;

  return new;
end;
$$;

drop trigger if exists on_auth_user_email_updated_profile on auth.users;

create trigger on_auth_user_email_updated_profile
after update of email on auth.users
for each row execute function public.handle_user_profile_email_update();

create or replace function public.prevent_profile_protected_self_update()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'UPDATE'
    and auth.role() = 'authenticated'
    and (
      old.email is distinct from new.email
      or old.plan_id is distinct from new.plan_id
      or old.plan_status is distinct from new.plan_status
      or old.plan_current_period_end is distinct from new.plan_current_period_end
    )
  then
    raise exception 'profile protected fields cannot be changed by client writes';
  end if;

  if tg_op = 'INSERT' and auth.role() = 'authenticated' then
    new.plan_id := 'free';
    new.plan_status := 'active';
    new.plan_current_period_end := null;
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_profile_protected_self_update on public.profiles;

create trigger prevent_profile_protected_self_update
before insert or update on public.profiles
for each row execute function public.prevent_profile_protected_self_update();

create or replace function public.sync_store_plan_from_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  effective_plan public.store_plan;
begin
  effective_plan := public.get_effective_profile_plan(new.id);

  update public.stores
  set plan_id = coalesce(effective_plan, 'free'::public.store_plan),
      updated_at = now()
  where owner_id = new.id;

  return new;
end;
$$;

drop trigger if exists sync_store_plan_from_profile on public.profiles;

create trigger sync_store_plan_from_profile
after update of plan_id, plan_status, plan_current_period_end on public.profiles
for each row execute function public.sync_store_plan_from_profile();

create or replace function public.set_store_plan_from_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.plan_id := coalesce(public.get_effective_profile_plan(new.owner_id), 'free'::public.store_plan);
  return new;
end;
$$;

drop trigger if exists set_store_plan_from_profile on public.stores;

create trigger set_store_plan_from_profile
before insert on public.stores
for each row execute function public.set_store_plan_from_profile();

create or replace function public.prevent_store_plan_self_update()
returns trigger
language plpgsql
as $$
begin
  if auth.role() = 'authenticated' and old.plan_id is distinct from new.plan_id then
    raise exception 'store plan cannot be changed by client writes';
  end if;

  return new;
end;
$$;

insert into public.profiles (id, email, display_name, created_at, updated_at)
select
  u.id,
  u.email,
  nullif(trim(coalesce(u.raw_user_meta_data ->> 'name', '')), ''),
  u.created_at,
  now()
from auth.users u
on conflict (id) do update
  set email = excluded.email,
      display_name = coalesce(public.profiles.display_name, excluded.display_name),
      updated_at = now();

update public.stores s
set plan_id = coalesce(public.get_effective_profile_plan(s.owner_id), 'free'::public.store_plan),
    updated_at = now()
where exists (select 1 from public.profiles p where p.id = s.owner_id);

alter table public.profiles enable row level security;

drop policy if exists "users can view own profile" on public.profiles;
drop policy if exists "users can update own profile" on public.profiles;

create policy "users can view own profile"
on public.profiles
for select
using (id = auth.uid());

create policy "users can update own profile"
on public.profiles
for update
using (id = auth.uid())
with check (id = auth.uid());
