alter table public.subscriptions add column if not exists provider_plan_id text;
create index if not exists subscriptions_provider_subscription_id_idx on public.subscriptions(provider_subscription_id);
create index if not exists subscriptions_provider_plan_id_idx on public.subscriptions(provider_plan_id);
