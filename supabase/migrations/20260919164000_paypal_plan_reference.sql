alter table public.plans
  add column if not exists provider_plan_id text;

create unique index if not exists plans_provider_plan_id_idx
  on public.plans(provider_plan_id)
  where provider_plan_id is not null;

create index if not exists payments_subscription_id_idx
  on public.payments(subscription_id);

create index if not exists invoices_subscription_id_idx
  on public.invoices(subscription_id);
