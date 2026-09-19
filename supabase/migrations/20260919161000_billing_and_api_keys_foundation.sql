create extension if not exists pgcrypto;

create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text not null default '',
  price_cents integer not null default 0 check (price_cents >= 0),
  currency text not null default 'BRL',
  interval text not null default 'month' check (interval in ('month','year')),
  features jsonb not null default '{}'::jsonb,
  limits jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null unique references public.companies(id) on delete cascade,
  plan_id uuid not null references public.plans(id),
  provider text,
  provider_customer_id text,
  provider_subscription_id text,
  provider_plan_id text,
  status text not null default 'trialing' check (status in ('trialing','active','past_due','canceled','incomplete','paused')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  provider text,
  provider_invoice_id text,
  amount_cents integer not null check (amount_cents >= 0),
  currency text not null default 'BRL',
  status text not null default 'open' check (status in ('draft','open','paid','void','uncollectible')),
  due_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(provider, provider_invoice_id)
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  invoice_id uuid references public.invoices(id) on delete set null,
  provider text,
  provider_payment_id text,
  amount_cents integer not null check (amount_cents >= 0),
  currency text not null default 'BRL',
  status text not null default 'pending' check (status in ('pending','authorized','paid','failed','refunded','canceled')),
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(provider, provider_payment_id)
);

create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  provider_event_id text not null,
  event_type text not null,
  company_id uuid references public.companies(id) on delete set null,
  status text not null default 'received' check (status in ('received','processed','ignored','failed')),
  payload jsonb not null default '{}'::jsonb,
  error_message text,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  unique(provider, provider_event_id)
);

create table if not exists public.api_keys (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  prefix text not null,
  secret_hash text not null unique,
  scopes text[] not null default '{}'::text[],
  expires_at timestamptz,
  last_used_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists subscriptions_plan_id_idx on public.subscriptions(plan_id);
create index if not exists invoices_company_id_idx on public.invoices(company_id);
create index if not exists payments_company_id_idx on public.payments(company_id);
create index if not exists payment_events_company_id_idx on public.payment_events(company_id);
create index if not exists api_keys_company_id_idx on public.api_keys(company_id);
create index if not exists api_keys_user_id_idx on public.api_keys(user_id);
create index if not exists api_keys_prefix_idx on public.api_keys(prefix);

alter table public.plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.invoices enable row level security;
alter table public.payments enable row level security;
alter table public.payment_events enable row level security;
alter table public.api_keys enable row level security;

drop policy if exists plans_select on public.plans;
create policy plans_select on public.plans for select to authenticated using (active = true);
drop policy if exists subscriptions_select on public.subscriptions;
create policy subscriptions_select on public.subscriptions for select to authenticated using (company_id = private.current_user_company_id());
drop policy if exists invoices_select on public.invoices;
create policy invoices_select on public.invoices for select to authenticated using (company_id = private.current_user_company_id());
drop policy if exists payments_select on public.payments;
create policy payments_select on public.payments for select to authenticated using (company_id = private.current_user_company_id());
drop policy if exists payment_events_select on public.payment_events;
create policy payment_events_select on public.payment_events for select to authenticated using (company_id = private.current_user_company_id());
drop policy if exists api_keys_select on public.api_keys;
create policy api_keys_select on public.api_keys for select to authenticated using (company_id = private.current_user_company_id());
drop policy if exists api_keys_insert on public.api_keys;
create policy api_keys_insert on public.api_keys for insert to authenticated with check (company_id = private.current_user_company_id() and user_id = (select auth.uid()) and private.current_user_role() in ('admin','manager'));
drop policy if exists api_keys_update on public.api_keys;
create policy api_keys_update on public.api_keys for update to authenticated using (company_id = private.current_user_company_id() and private.current_user_role() in ('admin','manager')) with check (company_id = private.current_user_company_id() and private.current_user_role() in ('admin','manager'));
drop policy if exists api_keys_delete on public.api_keys;
create policy api_keys_delete on public.api_keys for delete to authenticated using (company_id = private.current_user_company_id() and private.current_user_role() in ('admin','manager'));

insert into public.plans (code,name,description,price_cents,currency,interval,features,limits)
values
('free','Free','Essencial para começar',0,'BRL','month','{"contacts":true,"accounts":true,"finance":true,"tasks":true,"documents":true,"messages":true,"history":true,"email_integration":false,"excel_integration":false,"api_keys":false,"advanced_sync":false}'::jsonb,'{"users":2,"contacts":1000,"api_requests":0}'::jsonb),
('pro','Pro','Gestão completa com integrações e automações',4990,'BRL','month','{"contacts":true,"accounts":true,"finance":true,"tasks":true,"documents":true,"messages":true,"history":true,"email_integration":true,"excel_integration":true,"api_keys":true,"advanced_sync":true}'::jsonb,'{"users":10,"contacts":10000,"api_requests":50000}'::jsonb)
on conflict (code) do update set name=excluded.name,description=excluded.description,price_cents=excluded.price_cents,currency=excluded.currency,interval=excluded.interval,features=excluded.features,limits=excluded.limits,active=true,updated_at=now();

create or replace function private.ensure_free_subscription()
returns trigger language plpgsql set search_path = private, public, pg_temp as $$
begin
  insert into public.subscriptions(company_id,plan_id,status)
  select new.id,p.id,'active' from public.plans p where p.code='free'
  on conflict (company_id) do nothing;
  return new;
end;
$$;
drop trigger if exists companies_create_free_subscription on public.companies;
create trigger companies_create_free_subscription after insert on public.companies for each row execute function private.ensure_free_subscription();
revoke execute on function private.ensure_free_subscription() from public, anon, authenticated;
