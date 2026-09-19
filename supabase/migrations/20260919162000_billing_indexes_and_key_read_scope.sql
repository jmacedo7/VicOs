drop policy if exists api_keys_select on public.api_keys;
create policy api_keys_select on public.api_keys for select to authenticated using (company_id = private.current_user_company_id() and private.current_user_role() in ('admin','manager'));
create index if not exists invoices_subscription_id_idx on public.invoices(subscription_id);
create index if not exists payments_invoice_id_idx on public.payments(invoice_id);
create index if not exists payments_subscription_id_idx on public.payments(subscription_id);
