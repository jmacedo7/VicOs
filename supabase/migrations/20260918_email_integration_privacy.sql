drop policy if exists email_integrations_select on public.email_integrations;
create policy email_integrations_select on public.email_integrations
for select to authenticated
using (user_id = (select auth.uid()));
